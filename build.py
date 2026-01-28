import os
import shutil
import subprocess
import json
import datetime
import time
from pathlib import Path

SEVEN_ZIP = r"C:\Program Files\7-Zip\7z.exe"

SOURCE_DIR = Path("PatPatWeb")
TOOLS_DIR = Path("tools")
OUTPUT = Path("output")
TIMESTAMP = datetime.datetime.now().strftime("%H.%M.%S")
CHROMIUM_DIR = TOOLS_DIR / "build.PatPatWeb.Chromium"
FIREFOX_DIR  = TOOLS_DIR / "build.PatPatWeb.FireFox"

BuildVersion = json.loads(open(f"{SOURCE_DIR}/manifest.json").read()).get("version")


CHROMIUM_ZIP = Path(OUTPUT / f"PatPatWeb(Chromium, {BuildVersion})_{TIMESTAMP}.zip")
FIREFOX_ZIP  = Path(OUTPUT / f"PatPatWeb(FireFox, {BuildVersion})_{TIMESTAMP}.zip")


def copy_folder(src: Path, dst: Path):
    if dst.exists():
        shutil.rmtree(dst)
    shutil.copytree(src, dst)


def packZip(folder: Path, output_zip: Path, current_dir: Path):
    os.chdir(folder)
    print("getcwd:", os.getcwd())
    if output_zip.exists():
        output_zip.unlink()


    cmd = [
        SEVEN_ZIP,
        "a",
        str(output_zip),
        str("*")
    ]
    print(cmd)

    subprocess.run(cmd, check=True)
    os.chdir(current_dir)
    print("getcwd:", os.getcwd())


def patch_firefox_manifest(manifest_path: Path):
    with manifest_path.open("r", encoding="utf-8") as f:
        data = json.load(f)

    data["icons"] = {
        "16": "/etc/icon.nano.png",
        "64": "/etc/icon.firefox.x64.png",
        "128": "/etc/icon.firefox.png"
    }

    with manifest_path.open("w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def cls():
    time.sleep(1)
    os.system("cls")

def main():
    TOOLS_DIR.mkdir(exist_ok=True)
    if OUTPUT.exists(): shutil.rmtree(OUTPUT) # Cleaning all old files
    OUTPUT.mkdir(exist_ok=True)


    print("Working with tmp files...")
    copy_folder(SOURCE_DIR, CHROMIUM_DIR)
    copy_folder(SOURCE_DIR, FIREFOX_DIR)
    print("Patching FireFox...")
    patch_firefox_manifest(FIREFOX_DIR / "manifest.json")

    print("Building Chromium...")
    packZip(CHROMIUM_DIR, CHROMIUM_ZIP.absolute(), Path('.').absolute())
    print("Building FireFox...")
    packZip(FIREFOX_DIR, FIREFOX_ZIP.absolute(), Path('.').absolute())

    print("Cleaning tmp files...")
    shutil.rmtree(CHROMIUM_DIR)
    shutil.rmtree(FIREFOX_DIR)
    cls()


if __name__ == "__main__":
    main()
