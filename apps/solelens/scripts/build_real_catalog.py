import csv
import json
import re
import shutil
import zipfile
from collections import defaultdict
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
ARCHIVE_PATH = Path(r"C:\Users\benrf\Downloads\archive.zip")
PUBLIC_DATA_DIR = ROOT / "public" / "data"
CATALOG_ASSET_DIR = ROOT / "public" / "assets" / "catalog"
CATALOG_PATH = PUBLIC_DATA_DIR / "solelens-catalog.json"

BRAND_PREFIXES = {
    "adidas": "Adidas",
    "asics": "ASICS",
    "converse": "Converse",
    "new_balance": "New Balance",
    "nike": "Nike",
    "puma": "Puma",
    "reebok": "Reebok",
    "salomon": "Salomon",
    "vans": "Vans",
    "yeezy": "Yeezy",
}


def titleize_model(value: str) -> str:
    words = re.split(r"[_-]+", value)
    return " ".join(word.upper() if word in {"nmd", "xt"} else word.capitalize() for word in words if word)


def parse_brand_model(class_name: str) -> tuple[str, str]:
    for prefix, brand in sorted(BRAND_PREFIXES.items(), key=lambda item: len(item[0]), reverse=True):
        if class_name == prefix:
            return brand, brand
        if class_name.startswith(f"{prefix}_"):
            return brand, titleize_model(class_name[len(prefix) + 1 :])
    parts = class_name.split("_", 1)
    return titleize_model(parts[0]), titleize_model(parts[1] if len(parts) > 1 else class_name)


def load_stats(archive: zipfile.ZipFile) -> list[dict[str, str]]:
    with archive.open("dataset_stats.csv") as handle:
        text = handle.read().decode("utf-8-sig").splitlines()
    return list(csv.DictReader(text))


def image_members_by_class(archive: zipfile.ZipFile) -> dict[str, list[str]]:
    by_class: dict[str, list[str]] = defaultdict(list)
    for member in archive.namelist():
        lower = member.lower()
        if not lower.endswith((".jpg", ".jpeg", ".png", ".webp")):
            continue
        parts = member.split("/")
        if len(parts) < 2:
            continue
        by_class[parts[-2]].append(member)
    for members in by_class.values():
        members.sort()
    return by_class


def copy_reference_images(archive: zipfile.ZipFile, class_name: str, members: list[str], limit: int = 4) -> list[str]:
    class_dir = CATALOG_ASSET_DIR / class_name
    class_dir.mkdir(parents=True, exist_ok=True)

    for existing in class_dir.glob("*"):
        if existing.is_file():
            existing.unlink()

    output_paths: list[str] = []
    for index, member in enumerate(members[:limit], start=1):
        suffix = Path(member).suffix.lower() or ".jpg"
        output_name = f"{index:04d}{suffix}"
        output_path = class_dir / output_name
        with archive.open(member) as source, output_path.open("wb") as target:
            shutil.copyfileobj(source, target)
        output_paths.append(f"/assets/catalog/{class_name}/{output_name}")
    return output_paths


def main() -> None:
    if not ARCHIVE_PATH.exists():
        raise FileNotFoundError(f"Dataset archive not found: {ARCHIVE_PATH}")

    PUBLIC_DATA_DIR.mkdir(parents=True, exist_ok=True)
    CATALOG_ASSET_DIR.mkdir(parents=True, exist_ok=True)

    with zipfile.ZipFile(ARCHIVE_PATH) as archive:
        stats = load_stats(archive)
        members_by_class = image_members_by_class(archive)

        profiles = []
        for row in stats:
            dataset_class = row["class"]
            folder_class = dataset_class if dataset_class in members_by_class else dataset_class.replace("'", "")
            members = members_by_class.get(folder_class, [])
            brand, model = parse_brand_model(folder_class)
            sample_images = copy_reference_images(archive, folder_class, members)
            image_count = int(row["image_count"])
            profiles.append(
                {
                    "id": folder_class,
                    "className": folder_class,
                    "datasetClassName": dataset_class,
                    "brand": brand,
                    "model": model,
                    "referenceId": f"SOLE-{folder_class.upper().replace('-', '_')}",
                    "imageCount": image_count,
                    "availableImageCount": len(members),
                    "averageImage": {
                        "width": int(float(row["avg_width"])),
                        "height": int(float(row["avg_height"])),
                    },
                    "imageBounds": {
                        "minWidth": int(float(row["min_width"])),
                        "minHeight": int(float(row["min_height"])),
                        "maxWidth": int(float(row["max_width"])),
                        "maxHeight": int(float(row["max_height"])),
                    },
                    "formats": [part.strip() for part in re.split(r"[,|]", row["formats"]) if part.strip()],
                    "corruptFiles": int(row["corrupt_files"]),
                    "sampleImages": sample_images,
                    "source": {
                        "type": "local_archive",
                        "archive": ARCHIVE_PATH.name,
                        "classFolder": f"sneakers-dataset/sneakers-dataset/{folder_class}/",
                    },
                }
            )

    profiles.sort(key=lambda profile: (profile["brand"], profile["model"]))
    summary = {
        "profileCount": len(profiles),
        "imageCount": sum(profile["imageCount"] for profile in profiles),
        "availableImageCount": sum(profile["availableImageCount"] for profile in profiles),
        "sampleImageCount": sum(len(profile["sampleImages"]) for profile in profiles),
        "corruptFileCount": sum(profile["corruptFiles"] for profile in profiles),
        "brands": sorted({profile["brand"] for profile in profiles}),
        "sourceArchive": ARCHIVE_PATH.name,
        "generatedFrom": "dataset_stats.csv + sneakers-dataset image folders",
    }

    payload = {
        "schemaVersion": 1,
        "generatedAt": "2026-05-17T00:00:00Z",
        "summary": summary,
        "profiles": profiles,
        "marketplaceFeeds": {
            "enabled": False,
            "reason": "No live marketplace API credentials or feed contracts are configured yet.",
            "requiredForProductionComps": [
                "eBay Browse/Sell Analytics or Terapeak-equivalent feed",
                "StockX/GOAT/consignment partner feeds",
                "Sold-price, fee, region, size, and time-to-sell fields",
            ],
        },
    }

    CATALOG_PATH.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    print(f"Wrote {CATALOG_PATH}")
    print(f"{summary['profileCount']} profiles, {summary['imageCount']} catalog images, {summary['sampleImageCount']} extracted samples")


if __name__ == "__main__":
    main()
