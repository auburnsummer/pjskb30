# HOW TO RUN
# obtain venv with requests in it
# cd into this directory
# python3 download_assets.py

import subprocess

import requests

en_musics_url = "https://sekai-world.github.io/sekai-master-db-en-diff/musics.json"

en_musics_json = requests.get(en_musics_url).json()

for music in en_musics_json:
    jacket_id = music['assetbundleName']
    url = f"https://storage.sekai.best/sekai-en-assets/music/jacket/{jacket_id}_rip/{jacket_id}.png"
    subprocess.run(f"wget {url} -O ../assets/jackets/{jacket_id}.png -nc", shell=True)

jp_musics_url = "https://sekai-world.github.io/sekai-master-db-diff/musics.json"

jp_musics_json = requests.get(jp_musics_url).json()

for music in jp_musics_json:
    jacket_id = music['assetbundleName']
    url = f"https://storage.sekai.best/sekai-jp-assets/music/jacket/{jacket_id}_rip/{jacket_id}.png"
    subprocess.run(f"wget {url} -O ../assets/jackets/{jacket_id}.png -nc", shell=True)

# other additional processing then possible, e.g. I do this
# ```sh
# cd ../assets/jackets
# mogrify -resize 50% *.png
# optipng -o7 -strip all * 
# pngquant **.png --ext .png --force
