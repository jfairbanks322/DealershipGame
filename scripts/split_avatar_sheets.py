from __future__ import annotations

import json
import math
from pathlib import Path

import cv2
from PIL import Image, ImageDraw, ImageOps


ROOT = Path(__file__).resolve().parent.parent
SOURCE_DIR = ROOT / "public" / "assets" / "avatars"
OUTPUT_DIR = SOURCE_DIR / "library"
PREVIEW_PATH = OUTPUT_DIR / "avatar-library-preview.png"
MANIFEST_PATH = OUTPUT_DIR / "manifest.json"
OUTPUT_SIZE = 320
THUMB_SIZE = 148
PREVIEW_COLUMNS = 6


LAYOUTS = {
    "sheet-01.png": [(192, 290), (576, 290), (960, 290), (1344, 290), (192, 730), (576, 730), (960, 730), (1344, 730)],
    "sheet-02.png": [(192, 285), (576, 285), (960, 285), (1344, 285), (192, 730), (576, 730), (960, 730), (1344, 730)],
    "sheet-03.png": [(192, 285), (576, 285), (960, 285), (1344, 285), (192, 730), (576, 730), (960, 730), (1344, 730)],
    "sheet-04.png": [(192, 280), (576, 280), (960, 280), (1344, 280), (192, 720), (576, 720), (960, 720), (1344, 720)],
    "sheet-05.png": [(192, 285), (576, 285), (960, 285), (1344, 285), (192, 710), (576, 710), (960, 710), (1344, 710)],
    "sheet-06.png": [(192, 260), (576, 260), (960, 260), (1344, 260), (192, 705), (576, 705), (960, 705), (1344, 705)],
    "sheet-07.png": [(154, 230), (538, 230), (960, 220), (1370, 220), (154, 700), (461, 700), (768, 700), (1075, 700), (1382, 700)],
}


def detect_circles(image_path: Path) -> list[tuple[float, float, float]]:
    image = cv2.imread(str(image_path))
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    circles = cv2.HoughCircles(
        gray,
        cv2.HOUGH_GRADIENT,
        dp=1.2,
        minDist=110,
        param1=120,
        param2=32,
        minRadius=95,
        maxRadius=230,
    )
    if circles is None:
        return []
    return [tuple(map(float, circle)) for circle in circles[0]]


def match_layout(candidates: list[tuple[float, float, float]], expected_points: list[tuple[int, int]]) -> list[tuple[int, int, int]]:
    used: set[int] = set()
    matches: list[tuple[int, int, int]] = []
    for expected_x, expected_y in expected_points:
        best_index = None
        best_score = None
        for index, (x, y, radius) in enumerate(candidates):
            if index in used:
                continue
            distance = math.hypot(x - expected_x, y - expected_y)
            if distance > 140:
                continue
            score = distance + abs(radius - 175) * 0.2
            if best_score is None or score < best_score:
                best_index = index
                best_score = score

        if best_index is None:
            raise RuntimeError(f"Could not find a circle near expected point {(expected_x, expected_y)}.")

        used.add(best_index)
        x, y, radius = candidates[best_index]
        matches.append((round(x), round(y), round(radius)))

    return matches


def clamp_crop(center_x: int, center_y: int, side: int, width: int, height: int) -> tuple[int, int, int, int]:
    left = max(0, min(width - side, round(center_x - side / 2)))
    top = max(0, min(height - side, round(center_y - side / 2)))
    return (left, top, left + side, top + side)


def build_preview(entries: list[dict[str, str]]) -> None:
    rows = math.ceil(len(entries) / PREVIEW_COLUMNS)
    preview = Image.new("RGB", (PREVIEW_COLUMNS * THUMB_SIZE, rows * THUMB_SIZE), "#090909")
    for index, entry in enumerate(entries):
        image = Image.open(OUTPUT_DIR / entry["filename"]).convert("RGBA")
        thumb = ImageOps.fit(image, (THUMB_SIZE, THUMB_SIZE), Image.Resampling.LANCZOS)
        col = index % PREVIEW_COLUMNS
        row = index // PREVIEW_COLUMNS
        preview.paste(thumb, (col * THUMB_SIZE, row * THUMB_SIZE), thumb)
    preview.save(PREVIEW_PATH)


def mask_avatar(avatar: Image.Image, center_x: int, center_y: int, radius: int, crop_box: tuple[int, int, int, int]) -> Image.Image:
    crop_left, crop_top, crop_right, crop_bottom = crop_box
    crop_side = crop_right - crop_left
    scale = OUTPUT_SIZE / crop_side
    local_x = (center_x - crop_left) * scale
    local_y = (center_y - crop_top) * scale
    scaled_radius = min((radius + 10) * scale, OUTPUT_SIZE / 2 - 6)

    mask = Image.new("L", (OUTPUT_SIZE, OUTPUT_SIZE), 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse(
        (
            local_x - scaled_radius,
            local_y - scaled_radius,
            local_x + scaled_radius,
            local_y + scaled_radius,
        ),
        fill=255,
    )

    avatar.putalpha(mask)
    return avatar


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    for old_avatar in OUTPUT_DIR.glob("avatar-*.png"):
        old_avatar.unlink()

    manifest_entries: list[dict[str, str]] = []
    avatar_index = 1

    for sheet_name, expected_points in sorted(LAYOUTS.items()):
        sheet_path = SOURCE_DIR / sheet_name
        candidates = detect_circles(sheet_path)
        matches = match_layout(candidates, expected_points)
        image = Image.open(sheet_path).convert("RGBA")
        width, height = image.size

        for sheet_slot, (center_x, center_y, radius) in enumerate(matches, start=1):
            side = int(max(260, min(420, radius * 2 + 56)))
            crop_box = clamp_crop(center_x, center_y, side, width, height)
            avatar = image.crop(crop_box).resize((OUTPUT_SIZE, OUTPUT_SIZE), Image.Resampling.LANCZOS)
            avatar = mask_avatar(avatar, center_x, center_y, radius, crop_box)
            filename = f"avatar-{avatar_index:03d}.png"
            avatar.save(OUTPUT_DIR / filename)
            manifest_entries.append(
                {
                    "id": f"avatar-{avatar_index:03d}",
                    "filename": filename,
                    "path": f"/assets/avatars/library/{filename}",
                    "sourceSheet": sheet_name,
                    "sourceSlot": sheet_slot,
                }
            )
            avatar_index += 1

    MANIFEST_PATH.write_text(json.dumps(manifest_entries, indent=2) + "\n", encoding="utf-8")
    build_preview(manifest_entries)
    print(f"Created {len(manifest_entries)} avatars in {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
