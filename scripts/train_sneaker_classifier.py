from __future__ import annotations

import io
import os
import re
from collections import Counter
from pathlib import Path
from typing import Any, Dict, List, Tuple

import evaluate
import numpy as np
import pyarrow.parquet as pq
import torch
from datasets import ClassLabel, Dataset, Features, Image as HFImage, Value
from huggingface_hub import HfApi, hf_hub_download
from PIL import Image
from torchvision.transforms import (
    CenterCrop,
    ColorJitter,
    Compose,
    Normalize,
    RandomHorizontalFlip,
    RandomResizedCrop,
    Resize,
    ToTensor,
)
from transformers import (
    AutoImageProcessor,
    AutoModelForImageClassification,
    EarlyStoppingCallback,
    Trainer,
    TrainerCallback,
    TrainingArguments,
)

DATASET_REPO_ID = "ipogorelov/sneakers"
DATASET_REPO_TYPE = "dataset"
DATASET_FILE_RE = re.compile(r"dataset_batch_(\d{2})\.parquet$")
SKIP_BATCHES = {24}
MODEL_NAME = "google/vit-base-patch16-224-in21k"
OUTPUT_DIR = "./sneaker-brand-classifier"
HUB_MODEL_ID = "flen-crypto/sneaker-brand-classifier"
BATCH_SIZE = 32
GRAD_ACCUM = 2
EPOCHS = 5
LR = 2e-5
WARMUP_RATIO = 0.1
WEIGHT_DECAY = 0.01
VAL_SIZE = 0.15
MIN_SAMPLES_PER_BRAND = 2
USE_CLASS_WEIGHTS = True
SEED = 42
PUSH_TO_HUB = os.getenv("PUSH_TO_HUB", "1") == "1"
REPORT_TO_TRACKIO = os.getenv("REPORT_TO_TRACKIO", "1") == "1"


def is_trackio_available() -> bool:
    try:
        import trackio  # noqa: F401
        return True
    except ImportError:
        return False


def normalize_brand(value: Any) -> str:
    if value is None:
        return "Unknown"
    raw = str(value).strip()
    raw = re.sub(r"\s+", " ", raw)
    key = raw.lower().replace("’", "'").replace("-", " ").strip()
    aliases = {
        "new": "New Balance",
        "new balance": "New Balance",
        "dr": "Dr. Martens",
        "dr.": "Dr. Martens",
        "dr martens": "Dr. Martens",
        "dr. martens": "Dr. Martens",
        "le": "Le Coq Sportif",
        "le coq sportif": "Le Coq Sportif",
        "on": "On Running",
        "on running": "On Running",
        "off": "Off-White",
        "off white": "Off-White",
        "off-white": "Off-White",
        "alexander": "Alexander McQueen",
        "alexander mcqueen": "Alexander McQueen",
        "moon": "Moon Boot",
        "moon boot": "Moon Boot",
    }
    if key in aliases:
        return aliases[key]
    return raw.title()


def image_to_hf_record(value: Any) -> Dict[str, Any]:
    if isinstance(value, dict):
        img_bytes = value.get("bytes")
        img_path = value.get("path")
        if isinstance(img_bytes, memoryview):
            img_bytes = img_bytes.tobytes()
        elif isinstance(img_bytes, bytearray):
            img_bytes = bytes(img_bytes)
        return {"bytes": img_bytes, "path": img_path}
    if isinstance(value, memoryview):
        return {"bytes": value.tobytes(), "path": None}
    if isinstance(value, (bytes, bytearray)):
        return {"bytes": bytes(value), "path": None}
    if isinstance(value, str):
        return {"bytes": None, "path": value}
    if isinstance(value, Image.Image):
        buffer = io.BytesIO()
        value.save(buffer, format="PNG")
        return {"bytes": buffer.getvalue(), "path": None}
    if isinstance(value, np.ndarray):
        image = Image.fromarray(value.astype(np.uint8))
        buffer = io.BytesIO()
        image.save(buffer, format="PNG")
        return {"bytes": buffer.getvalue(), "path": None}
    raise TypeError(f"Unsupported image payload type: {type(value)!r}")


def decode_image(value: Any) -> Image.Image:
    if isinstance(value, Image.Image):
        return value.convert("RGB")
    if isinstance(value, dict):
        img_bytes = value.get("bytes")
        img_path = value.get("path")
        if img_bytes is not None:
            if isinstance(img_bytes, memoryview):
                img_bytes = img_bytes.tobytes()
            return Image.open(io.BytesIO(img_bytes)).convert("RGB")
        if img_path:
            return Image.open(img_path).convert("RGB")
        raise ValueError("Image record has neither bytes nor path")
    if isinstance(value, memoryview):
        return Image.open(io.BytesIO(value.tobytes())).convert("RGB")
    if isinstance(value, (bytes, bytearray)):
        return Image.open(io.BytesIO(bytes(value))).convert("RGB")
    if isinstance(value, str):
        return Image.open(value).convert("RGB")
    if isinstance(value, np.ndarray):
        return Image.fromarray(value.astype(np.uint8)).convert("RGB")
    raise TypeError(f"Cannot decode image payload type: {type(value)!r}")


def list_dataset_batches() -> List[Tuple[str, int]]:
    try:
        repo_files = HfApi().list_repo_files(repo_id=DATASET_REPO_ID, repo_type=DATASET_REPO_TYPE)
        batches = []
        for filename in repo_files:
            match = DATASET_FILE_RE.search(Path(filename).name)
            if match:
                batches.append((filename, int(match.group(1))))
        if batches:
            return sorted(batches, key=lambda x: x[1])
    except Exception as exc:
        print(f"Could not list repo files via HfApi, falling back to 01-93: {exc}")
    return [(f"dataset_batch_{i:02d}.parquet", i) for i in range(1, 94)]


def load_parquet_batches() -> Tuple[List[Dict[str, Any]], List[str], List[str]]:
    all_images, all_brands, all_models = [], [], []
    failed: List[Tuple[str, str]] = []
    print("Loading dataset from Hub parquet files...")
    for filename, batch_id in list_dataset_batches():
        if batch_id in SKIP_BATCHES:
            print(f"  Skipping {filename} (configured skip)")
            continue
        try:
            local_path = hf_hub_download(repo_id=DATASET_REPO_ID, repo_type=DATASET_REPO_TYPE, filename=filename)
            table = pq.read_table(local_path, columns=["image", "brand", "model"])
            df = table.to_pandas().dropna(subset=["image", "brand"])
            all_images.extend(image_to_hf_record(x) for x in df["image"].tolist())
            all_brands.extend(normalize_brand(x) for x in df["brand"].tolist())
            all_models.extend("" if x is None else str(x) for x in df["model"].tolist())
            if batch_id == 1 or batch_id % 10 == 0:
                print(f"  Loaded {filename}: {len(df)} rows")
        except Exception as exc:
            failed.append((filename, repr(exc)))
            print(f"  Error on {filename}: {exc}")
            continue
    if not all_images:
        raise RuntimeError("No valid rows loaded. Check Hub access, filenames, and parquet schema.")
    print(f"Total loaded: {len(all_images)} images")
    if failed:
        print("Failed batches:")
        for filename, reason in failed:
            print(f"  {filename}: {reason}")
    return all_images, all_brands, all_models


def filter_rare_brands(images, brands, models):
    counts = Counter(brands)
    keep = {brand for brand, count in counts.items() if count >= MIN_SAMPLES_PER_BRAND}
    filtered = [(img, brand, model) for img, brand, model in zip(images, brands, models) if brand in keep]
    if not filtered:
        raise RuntimeError("All rows were filtered out. Lower MIN_SAMPLES_PER_BRAND.")
    f_images, f_brands, f_models = zip(*filtered)
    return list(f_images), list(f_brands), list(f_models)


def safe_test_size(n_rows: int, n_classes: int, requested: float) -> float:
    min_fraction = (n_classes + 1) / n_rows
    max_fraction = 1.0 - min_fraction
    if min_fraction >= max_fraction:
        raise ValueError(f"Not enough rows ({n_rows}) for {n_classes} classes.")
    return min(max(requested, min_fraction), max_fraction)


def processor_crop_size(processor: Any) -> Any:
    size = processor.size
    if isinstance(size, dict):
        if "shortest_edge" in size:
            return size["shortest_edge"]
        if "height" in size and "width" in size:
            return size["height"] if size["height"] == size["width"] else (size["height"], size["width"])
    if isinstance(size, int):
        return size
    return 224


def make_class_weights(labels: List[int], num_labels: int) -> torch.Tensor:
    counts = np.bincount(np.array(labels, dtype=np.int64), minlength=num_labels)
    counts = np.maximum(counts, 1)
    weights = counts.sum() / (num_labels * counts)
    weights = weights / weights.mean()
    return torch.tensor(weights, dtype=torch.float32)


images_raw, brands_raw, models_raw = load_parquet_batches()
images_raw, brand_normalized, models_raw = filter_rare_brands(images_raw, brands_raw, models_raw)
unique_brands = sorted(set(brand_normalized))
label2id = {label: idx for idx, label in enumerate(unique_brands)}
id2label = {idx: label for label, idx in label2id.items()}
num_labels = len(unique_brands)

features = Features({"image": HFImage(decode=False), "brand": ClassLabel(names=unique_brands), "brand_name": Value("string"), "model": Value("string")})
dataset = Dataset.from_dict({"image": images_raw, "brand": [label2id[b] for b in brand_normalized], "brand_name": brand_normalized, "model": models_raw}, features=features)
split_size = safe_test_size(len(dataset), num_labels, VAL_SIZE)
dataset = dataset.train_test_split(test_size=split_size, seed=SEED, stratify_by_column="brand")

class_weights = make_class_weights(dataset["train"]["brand"], num_labels) if USE_CLASS_WEIGHTS else None
image_processor = AutoImageProcessor.from_pretrained(MODEL_NAME)
size = processor_crop_size(image_processor)
normalize = Normalize(mean=image_processor.image_mean, std=image_processor.image_std)

train_transforms = Compose([RandomResizedCrop(size, scale=(0.75, 1.0)), RandomHorizontalFlip(), ColorJitter(brightness=0.2, contrast=0.2, saturation=0.1, hue=0.05), ToTensor(), normalize])
val_transforms = Compose([Resize(size), CenterCrop(size), ToTensor(), normalize])

def apply_transforms(examples: Dict[str, List[Any]], transform: Any) -> Dict[str, List[Any]]:
    examples["pixel_values"] = [transform(decode_image(img)) for img in examples["image"]]
    return examples

dataset["train"].set_transform(lambda e: apply_transforms(e, train_transforms))
dataset["test"].set_transform(lambda e: apply_transforms(e, val_transforms))

model = AutoModelForImageClassification.from_pretrained(MODEL_NAME, num_labels=num_labels, label2id=label2id, id2label=id2label, ignore_mismatched_sizes=True)
accuracy_metric = evaluate.load("accuracy")
f1_metric = evaluate.load("f1")

def compute_metrics(eval_pred: Any) -> Dict[str, float]:
    logits, labels = eval_pred
    predictions = np.argmax(logits, axis=-1)
    return {
        "accuracy": accuracy_metric.compute(predictions=predictions, references=labels)["accuracy"],
        "f1_macro": f1_metric.compute(predictions=predictions, references=labels, average="macro")["f1"],
        "f1_weighted": f1_metric.compute(predictions=predictions, references=labels, average="weighted")["f1"],
    }

def collate_fn(examples: List[Dict[str, Any]]) -> Dict[str, torch.Tensor]:
    return {"pixel_values": torch.stack([example["pixel_values"] for example in examples]), "labels": torch.tensor([int(example["brand"]) for example in examples], dtype=torch.long)}

class WeightedLossTrainer(Trainer):
    def __init__(self, *args: Any, class_weights: torch.Tensor | None = None, **kwargs: Any) -> None:
        super().__init__(*args, **kwargs)
        self.class_weights = class_weights
    def compute_loss(self, model: torch.nn.Module, inputs: Dict[str, torch.Tensor], return_outputs: bool = False, num_items_in_batch: Any | None = None) -> Any:
        labels = inputs.pop("labels")
        outputs = model(**inputs)
        logits = outputs.logits
        weight = self.class_weights.to(logits.device) if self.class_weights is not None else None
        loss = torch.nn.CrossEntropyLoss(weight=weight)(logits.view(-1, model.config.num_labels), labels.view(-1))
        return (loss, outputs) if return_outputs else loss

report_to = "trackio" if REPORT_TO_TRACKIO and is_trackio_available() else "none"
training_args = TrainingArguments(output_dir=OUTPUT_DIR, remove_unused_columns=False, eval_strategy="epoch", save_strategy="epoch", learning_rate=LR, per_device_train_batch_size=BATCH_SIZE, per_device_eval_batch_size=BATCH_SIZE, gradient_accumulation_steps=GRAD_ACCUM, num_train_epochs=EPOCHS, warmup_ratio=WARMUP_RATIO, weight_decay=WEIGHT_DECAY, logging_strategy="steps", logging_steps=50, logging_first_step=True, load_best_model_at_end=True, metric_for_best_model="eval_f1_macro", greater_is_better=True, save_total_limit=2, seed=SEED, data_seed=SEED, dataloader_num_workers=min(4, os.cpu_count() or 1), bf16=torch.cuda.is_available() and torch.cuda.is_bf16_supported(), fp16=torch.cuda.is_available() and not torch.cuda.is_bf16_supported(), push_to_hub=PUSH_TO_HUB, hub_model_id=HUB_MODEL_ID if PUSH_TO_HUB else None, hub_strategy="every_save" if PUSH_TO_HUB else "end", report_to=report_to, run_name="sneaker-brand-vit-base", project="sneaker-classification", disable_tqdm=True)
callbacks: List[TrainerCallback] = [EarlyStoppingCallback(early_stopping_patience=2)]
trainer = WeightedLossTrainer(model=model, args=training_args, train_dataset=dataset["train"], eval_dataset=dataset["test"], processing_class=image_processor, data_collator=collate_fn, compute_metrics=compute_metrics, callbacks=callbacks, class_weights=class_weights)
trainer.train()
metrics = trainer.evaluate()
print(f"Final metrics: {metrics}")
trainer.save_model(OUTPUT_DIR)
image_processor.save_pretrained(OUTPUT_DIR)
if PUSH_TO_HUB:
    trainer.push_to_hub()
    print(f"Model pushed to Hub: https://huggingface.co/{HUB_MODEL_ID}")
print(f"Model saved to: {OUTPUT_DIR}")
