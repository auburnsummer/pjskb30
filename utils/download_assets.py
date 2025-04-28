#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.12"
# dependencies = [
#     "requests",
#     "Pillow",
# ]
# ///

import subprocess
import requests
import os.path

from io import BytesIO
from PIL import Image

en_musics_url = "https://sekai-world.github.io/sekai-master-db-en-diff/musics.json"

def run(musics_url: str, url_template: str):
    musics_json = requests.get(musics_url).json()
    for music in musics_json:
        jacket_id = music['assetbundleName']
        target_file_name = f"../assets/jackets/{jacket_id}.png"
        url = url_template.format(jacket_id=jacket_id)

        # if the file already exists, skip downloading
        if os.path.exists(target_file_name):
            print(f"File {target_file_name} already exists, skipping download.")
        else:
            # download the file
            print(f"Downloading {url}")
            response = requests.get(url)
            if response.status_code == 200:
                image = Image.open(BytesIO(response.content))
                image.thumbnail((256, 256))  # Resize to thumbnail size
                image.save(target_file_name, "PNG")
            else:
                print(f"Failed to download {url}, status code: {response.status_code}")

run(en_musics_url, "https://storage.sekai.best/sekai-en-assets/music/jacket/{jacket_id}/{jacket_id}.png")

jp_musics_url = "https://sekai-world.github.io/sekai-master-db-diff/musics.json"

run(jp_musics_url, "https://storage.sekai.best/sekai-jp-assets/music/jacket/{jacket_id}/{jacket_id}.png")
