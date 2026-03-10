#!/usr/bin/env python3
"""Copy provided brand image variants into canonical locations.

This script intentionally does NOT synthesize logos. It expects maintainer-provided
PNG files to exist in `assets/brand/source/` and copies them to stable canonical
filenames consumed by adapters/docs.
"""

from __future__ import annotations

import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT / "assets" / "brand" / "source"
BRAND_DIR = ROOT / "assets" / "brand"
FAVICON_DIR = ROOT / "assets" / "favicon"

CANONICAL_SIZES = [2048, 1024, 512, 256, 128, 64, 32, 16]


def source_file_for_size(size: int) -> Path:
    return SOURCE_DIR / f"logo-{size}.png"


def main() -> None:
    BRAND_DIR.mkdir(parents=True, exist_ok=True)
    SOURCE_DIR.mkdir(parents=True, exist_ok=True)
    FAVICON_DIR.mkdir(parents=True, exist_ok=True)

    missing: list[str] = []
    for size in CANONICAL_SIZES:
        src = source_file_for_size(size)
        dst = BRAND_DIR / f"logo-{size}.png"
        if not src.exists():
            missing.append(str(src.relative_to(ROOT)))
            continue
        shutil.copy2(src, dst)

    if missing:
        missing_joined = "\n - ".join(missing)
        raise SystemExit(
            "Missing required source brand files in assets/brand/source/:\n"
            f" - {missing_joined}\n"
            "Add the provided variants, then rerun this script."
        )

    # Adapter-local copies used by runtime packaging
    (ROOT / "apps" / "extension" / "assets" / "icons").mkdir(parents=True, exist_ok=True)
    (ROOT / "apps" / "userscript" / "assets" / "icons").mkdir(parents=True, exist_ok=True)
    (ROOT / "apps" / "cli" / "assets").mkdir(parents=True, exist_ok=True)
    (ROOT / "apps" / "native-launchers" / "assets").mkdir(parents=True, exist_ok=True)

    shutil.copy2(BRAND_DIR / "logo-16.png", ROOT / "apps/extension/assets/icons/icon-16.png")
    shutil.copy2(BRAND_DIR / "logo-32.png", ROOT / "apps/extension/assets/icons/icon-32.png")
    shutil.copy2(BRAND_DIR / "logo-128.png", ROOT / "apps/extension/assets/icons/icon-128.png")
    shutil.copy2(BRAND_DIR / "logo-32.png", ROOT / "apps/userscript/assets/icons/icon-32.png")
    shutil.copy2(BRAND_DIR / "logo-64.png", ROOT / "apps/userscript/assets/icons/icon-64.png")
    shutil.copy2(BRAND_DIR / "logo-256.png", ROOT / "apps/cli/assets/logo-256.png")
    shutil.copy2(BRAND_DIR / "logo-256.png", ROOT / "apps/native-launchers/assets/logo-256.png")

    # 48 isn't canonical but required by Chrome extension manifest
    source_48 = SOURCE_DIR / "logo-48.png"
    ext_48 = ROOT / "apps/extension/assets/icons/icon-48.png"
    if source_48.exists():
        shutil.copy2(source_48, ext_48)
    else:
        shutil.copy2(BRAND_DIR / "logo-64.png", ext_48)

    # Docs/web favicon variants copied from provided canonical files
    shutil.copy2(BRAND_DIR / "logo-16.png", FAVICON_DIR / "favicon-16x16.png")
    shutil.copy2(BRAND_DIR / "logo-32.png", FAVICON_DIR / "favicon-32x32.png")
    shutil.copy2(BRAND_DIR / "logo-256.png", FAVICON_DIR / "apple-touch-icon.png")

    ico_src = SOURCE_DIR / "favicon.ico"
    if ico_src.exists():
        shutil.copy2(ico_src, FAVICON_DIR / "favicon.ico")

    print("Brand assets copied to canonical and adapter paths.")


if __name__ == "__main__":
    main()
