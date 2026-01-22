#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.12"
# dependencies = [
#     "requests",
#     "Pillow",
# ]
# ///

import requests
import json
import os.path

from io import BytesIO
from PIL import Image

region_urls = {
    **{
        region: f"https://sekai-world.github.io/sekai-master-db-{region}-diff/musics.json"
        for region in [
            "en",
            "kr",
            "cn",
            "tc",
        ]  # NOTE: tc?? why not tw. thanks sekai.best
    },
    "jp": "https://sekai-world.github.io/sekai-master-db-diff/musics.json",
}

song_name_map = {}


def run(musics_url: str, url_template: str, region: str):
    musics_json = requests.get(musics_url).json()
    song_name_map[region] = {}
    for music in musics_json:
        song_name_map[region][music["id"]] = music["title"]
        jacket_id = music["assetbundleName"]
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


for region, region_url in region_urls.items():
    run(
        region_url,
        f"https://storage.sekai.best/sekai-{region}-assets/music/jacket/{{jacket_id}}/{{jacket_id}}.png",
        region,
    )
with open("song_names_official.json", "w+", encoding="utf8") as f:
    json.dump(song_name_map, f)
