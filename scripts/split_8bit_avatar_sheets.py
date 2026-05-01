from __future__ import annotations

import json
from pathlib import Path

import cv2
import numpy as np
from PIL import Image


ROOT = Path(__file__).resolve().parent.parent
OUTPUT_DIR = ROOT / "public" / "assets" / "avatars" / "feast-haven"
MANIFEST_PATH = OUTPUT_DIR / "manifest.json"
PREVIEW_PATH = OUTPUT_DIR / "avatar-library-preview.png"
OUTPUT_SIZE = 320
THUMB_SIZE = 148
PREVIEW_COLUMNS = 5
WHITE_THRESHOLD = 245
MIN_ACTIVE_PIXELS = 20

SOURCE_SHEETS = [
    Path("/Users/josh/Downloads/ChatGPT Image Apr 30, 2026, 05_05_14 PM.png"),
    Path("/Users/josh/Downloads/ChatGPT Image Apr 30, 2026, 05_06_21 PM.png"),
    Path("/Users/josh/Downloads/ChatGPT Image Apr 30, 2026, 05_07_34 PM.png"),
    Path("/Users/josh/Downloads/ChatGPT Image Apr 30, 2026, 05_09_38 PM.png"),
    Path("/Users/josh/Downloads/ChatGPT Image Apr 30, 2026, 05_10_38 PM.png"),
]


def is_non_white(pixel: tuple[int, int, int]) -> bool:
    return any(channel < WHITE_THRESHOLD for channel in pixel)


def find_runs(counts: list[int], min_active_pixels: int) -> list[tuple[int, int]]:
    runs: list[tuple[int, int]] = []
    start = None
    for index, count in enumerate(counts):
        if count >= min_active_pixels and start is None:
            start = index
        elif count < min_active_pixels and start is not None:
            runs.append((start, index - 1))
            start = None
    if start is not None:
        runs.append((start, len(counts) - 1))
    return runs


def detect_grid_boxes(image: Image.Image) -> list[tuple[int, int, int, int]]:
    rgb = image.convert("RGB")
    image_array = np.array(rgb)
    non_white_mask = np.any(image_array < WHITE_THRESHOLD, axis=2).astype("uint8") * 255

    component_count, labels, stats, _ = cv2.connectedComponentsWithStats(non_white_mask, connectivity=8)
    del labels

    boxes: list[tuple[int, int, int, int]] = []
    for component_index in range(1, component_count):
        left, top, width, height, area = stats[component_index]
        if area < 50000 or width < 150 or height < 150:
            continue
        boxes.append((int(left), int(top), int(left + width), int(top + height)))

    if len(boxes) != 10:
        raise RuntimeError(f"Expected 10 portrait panels but found {len(boxes)}.")

    boxes.sort(key=lambda box: (box[1], box[0]))
    top_row = sorted(boxes[:5], key=lambda box: box[0])
    bottom_row = sorted(boxes[5:], key=lambda box: box[0])
    return top_row + bottom_row


def build_preview(entries: list[dict[str, str]]) -> None:
    rows = (len(entries) + PREVIEW_COLUMNS - 1) // PREVIEW_COLUMNS
    preview = Image.new("RGBA", (PREVIEW_COLUMNS * THUMB_SIZE, rows * THUMB_SIZE), (255, 255, 255, 255))
    for index, entry in enumerate(entries):
        image = Image.open(OUTPUT_DIR / entry["filename"]).convert("RGBA")
        thumb = image.resize((THUMB_SIZE, THUMB_SIZE), Image.Resampling.NEAREST)
        col = index % PREVIEW_COLUMNS
        row = index // PREVIEW_COLUMNS
        preview.paste(thumb, (col * THUMB_SIZE, row * THUMB_SIZE), thumb)
    preview.save(PREVIEW_PATH)


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    for old_avatar in OUTPUT_DIR.glob("avatar-*.png"):
        old_avatar.unlink()

    manifest_entries: list[dict[str, str]] = []
    avatar_index = 1

    for sheet_path in SOURCE_SHEETS:
        image = Image.open(sheet_path).convert("RGBA")
        boxes = detect_grid_boxes(image)

        for slot_index, box in enumerate(boxes, start=1):
            avatar = image.crop(box).resize((OUTPUT_SIZE, OUTPUT_SIZE), Image.Resampling.NEAREST)
            filename = f"avatar-{avatar_index:03d}.png"
            avatar.save(OUTPUT_DIR / filename)
            manifest_entries.append(
                {
                    "id": f"avatar-{avatar_index:03d}",
                    "filename": filename,
                    "path": f"/assets/avatars/feast-haven/{filename}",
                    "sourceSheet": sheet_path.name,
                    "sourceSlot": slot_index,
                }
            )
            avatar_index += 1

    MANIFEST_PATH.write_text(json.dumps(manifest_entries, indent=2) + "\n", encoding="utf-8")
    build_preview(manifest_entries)
    print(f"Created {len(manifest_entries)} avatars in {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
