"""Train a production-ready baseline sneaker image classifier.

This script is intentionally a baseline for SoleLens, not the whole footwear
intelligence stack. It fine-tunes an image-classification model for brand/model
recognition and saves enough metadata for downstream services to load the model
predictably.

Example:
    python sneaker_training_script.py --dry-run
    python sneaker_training_script.py --max-samples 1000 --epochs 3
"""

from __future__ import annotations

import argparse
import json
import logging
import random
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any

import evaluate
import numpy as np
import torch
from datasets import DatasetDict, load_dataset
from torchvision.transforms import CenterCrop, Compose, Normalize, RandomResizedCrop, Resize, ToTensor
from transformers import (
    AutoConfig,
    AutoImageProcessor,
    AutoModelForImageClassification,
    Trainer,
    TrainingArguments,
    set_seed,
)


LOGGER = logging.getLogger("sole_lens_training")


@dataclass(frozen=True)
class TrainConfig:
    dataset_name: str
    checkpoint: str
    output_dir: str
    label_column: str
    image_column: str
    validation_ratio: float
    seed: int
    epochs: int
    learning_rate: float
    train_batch_size: int
    eval_batch_size: int
    gradient_accumulation_steps: int
    warmup_ratio: float
    weight_decay: float
    max_samples: int | None
    dry_run: bool
    push_to_hub: bool
    hub_model_id: str | None


def parse_args() -> TrainConfig:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dataset-name", default="ipogorelov/sneakers")
    parser.add_argument("--checkpoint", default="google/vit-base-patch16-224-in21k")
    parser.add_argument("--output-dir", default="sneaker-classifier-final")
    parser.add_argument("--label-column", default="brand")
    parser.add_argument("--image-column", default="image")
    parser.add_argument("--validation-ratio", type=float, default=0.15)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--epochs", type=int, default=5)
    parser.add_argument("--learning-rate", type=float, default=2e-5)
    parser.add_argument("--train-batch-size", type=int, default=16)
    parser.add_argument("--eval-batch-size", type=int, default=16)
    parser.add_argument("--gradient-accumulation-steps", type=int, default=2)
    parser.add_argument("--warmup-ratio", type=float, default=0.1)
    parser.add_argument("--weight-decay", type=float, default=0.01)
    parser.add_argument("--max-samples", type=int, default=None)
    parser.add_argument("--dry-run", action="store_true", help="Load data and print metadata without training.")
    parser.add_argument("--push-to-hub", action="store_true")
    parser.add_argument("--hub-model-id", default=None)
    args = parser.parse_args()

    if not 0 < args.validation_ratio < 0.5:
        raise ValueError("--validation-ratio must be between 0 and 0.5")
    if args.max_samples is not None and args.max_samples < 2:
        raise ValueError("--max-samples must be at least 2 when provided")

    return TrainConfig(**vars(args))


def configure_logging() -> None:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s - %(message)s",
    )


def precision_flags() -> dict[str, bool]:
    """Choose a safe mixed-precision mode for the current machine."""
    if not torch.cuda.is_available():
        return {"bf16": False, "fp16": False}

    major, _minor = torch.cuda.get_device_capability()
    if major >= 8:
        return {"bf16": True, "fp16": False}
    return {"bf16": False, "fp16": True}


def load_and_prepare_dataset(config: TrainConfig) -> DatasetDict:
    dataset = load_dataset(config.dataset_name, split="train")

    missing = {config.image_column, config.label_column} - set(dataset.column_names)
    if missing:
        raise KeyError(f"Dataset is missing required columns: {sorted(missing)}")

    if config.max_samples:
        sample_count = min(config.max_samples, len(dataset))
        dataset = dataset.shuffle(seed=config.seed).select(range(sample_count))

    split = dataset.train_test_split(test_size=config.validation_ratio, seed=config.seed)
    return DatasetDict(train=split["train"], validation=split["test"])


def label_maps(dataset: DatasetDict, label_column: str) -> tuple[dict[str, int], dict[int, str]]:
    labels = sorted({str(label) for label in dataset["train"][label_column]})
    label2id = {label: index for index, label in enumerate(labels)}
    id2label = {index: label for label, index in label2id.items()}
    return label2id, id2label


def image_size(image_processor: AutoImageProcessor) -> int | tuple[int, int]:
    size = image_processor.size
    if isinstance(size, dict):
        if "shortest_edge" in size:
            return int(size["shortest_edge"])
        if "height" in size and "width" in size:
            return int(size["height"]), int(size["width"])
    if isinstance(size, int):
        return size
    return 224


def prepare_transforms(image_processor: AutoImageProcessor) -> tuple[Compose, Compose]:
    normalize = Normalize(mean=image_processor.image_mean, std=image_processor.image_std)
    size = image_size(image_processor)
    return (
        Compose([RandomResizedCrop(size), ToTensor(), normalize]),
        Compose([Resize(size), CenterCrop(size), ToTensor(), normalize]),
    )


def attach_transforms(
    dataset: DatasetDict,
    config: TrainConfig,
    label2id: dict[str, int],
    train_transform: Compose,
    val_transform: Compose,
) -> DatasetDict:
    image_column = config.image_column
    label_column = config.label_column

    def transform_batch(batch: dict[str, Any], transform: Compose) -> dict[str, Any]:
        batch["pixel_values"] = [transform(image.convert("RGB")) for image in batch[image_column]]
        batch["label"] = [label2id[str(label)] for label in batch[label_column]]
        return batch

    dataset["train"].set_transform(lambda batch: transform_batch(batch, train_transform))
    dataset["validation"].set_transform(lambda batch: transform_batch(batch, val_transform))
    return dataset


def build_model(
    checkpoint: str,
    label2id: dict[str, int],
    id2label: dict[int, str],
) -> AutoModelForImageClassification:
    model_config = AutoConfig.from_pretrained(
        checkpoint,
        num_labels=len(label2id),
        label2id=label2id,
        id2label=id2label,
        finetuning_task="image-classification",
    )
    return AutoModelForImageClassification.from_pretrained(
        checkpoint,
        config=model_config,
        ignore_mismatched_sizes=True,
    )


def collate_fn(examples: list[dict[str, Any]]) -> dict[str, torch.Tensor]:
    pixel_values = torch.stack([example["pixel_values"] for example in examples])
    labels = torch.tensor([example["label"] for example in examples], dtype=torch.long)
    return {"pixel_values": pixel_values, "labels": labels}


def metric_fn() -> Any:
    accuracy = evaluate.load("accuracy")

    def compute_metrics(eval_pred: tuple[np.ndarray, np.ndarray]) -> dict[str, float]:
        logits, labels = eval_pred
        predictions = np.argmax(logits, axis=1)
        return accuracy.compute(predictions=predictions, references=labels)

    return compute_metrics


def save_run_metadata(config: TrainConfig, label2id: dict[str, int], output_dir: Path) -> None:
    output_dir.mkdir(parents=True, exist_ok=True)
    metadata = {
        "config": asdict(config),
        "label2id": label2id,
        "torch_cuda_available": torch.cuda.is_available(),
        "precision": precision_flags(),
    }
    (output_dir / "sole_lens_training_metadata.json").write_text(json.dumps(metadata, indent=2), encoding="utf-8")


def build_training_args(config: TrainConfig) -> TrainingArguments:
    output_dir = Path(config.output_dir)
    precision = precision_flags()

    return TrainingArguments(
        output_dir=str(output_dir),
        remove_unused_columns=False,
        eval_strategy="epoch",
        save_strategy="epoch",
        learning_rate=config.learning_rate,
        per_device_train_batch_size=config.train_batch_size,
        per_device_eval_batch_size=config.eval_batch_size,
        gradient_accumulation_steps=config.gradient_accumulation_steps,
        num_train_epochs=config.epochs,
        warmup_ratio=config.warmup_ratio,
        weight_decay=config.weight_decay,
        logging_steps=50,
        load_best_model_at_end=True,
        metric_for_best_model="accuracy",
        greater_is_better=True,
        save_total_limit=2,
        seed=config.seed,
        report_to="none",
        push_to_hub=config.push_to_hub,
        hub_model_id=config.hub_model_id,
        **precision,
    )


def main() -> None:
    configure_logging()
    config = parse_args()
    set_seed(config.seed)
    random.seed(config.seed)
    np.random.seed(config.seed)

    dataset = load_and_prepare_dataset(config)
    label2id, id2label = label_maps(dataset, config.label_column)

    LOGGER.info(
        "Loaded %s with %s train / %s validation rows across %s labels",
        config.dataset_name,
        len(dataset["train"]),
        len(dataset["validation"]),
        len(label2id),
    )

    output_dir = Path(config.output_dir)
    save_run_metadata(config, label2id, output_dir)

    if config.dry_run:
        LOGGER.info("Dry run complete. Metadata written to %s", output_dir)
        return

    image_processor = AutoImageProcessor.from_pretrained(config.checkpoint)
    train_transform, val_transform = prepare_transforms(image_processor)
    dataset = attach_transforms(dataset, config, label2id, train_transform, val_transform)
    model = build_model(config.checkpoint, label2id, id2label)

    trainer = Trainer(
        model=model,
        args=build_training_args(config),
        train_dataset=dataset["train"],
        eval_dataset=dataset["validation"],
        data_collator=collate_fn,
        compute_metrics=metric_fn(),
        processing_class=image_processor,
    )

    trainer.train()
    metrics = trainer.evaluate()
    LOGGER.info("Final validation metrics: %s", metrics)

    trainer.save_model(str(output_dir))
    image_processor.save_pretrained(str(output_dir))
    save_run_metadata(config, label2id, output_dir)

    if config.push_to_hub:
        trainer.push_to_hub()


if __name__ == "__main__":
    main()
