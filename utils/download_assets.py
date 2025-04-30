#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.12"
# dependencies = [
#     "requests",
#     "Pillow",
# ]
# ///

import requests
import os.path
import csv

from io import BytesIO
from PIL import Image

# this should be the same as in src/signals/chartConstants.ts
csv_url = 'https://docs.google.com/spreadsheets/d/1AxdRCh55cuaXY_yDnAGmxS9m2rtt_DsKutUyeLPNf6k/export?format=csv&gid=1855810409'

# download the csv file.
resp = requests.get(csv_url, allow_redirects=True)
# the encoding is not set correctly on Google Sheet's side, so we need to set it manually
resp.encoding = resp.apparent_encoding
content = resp.text
csv_data = csv.reader(content.splitlines(), delimiter=',', dialect=csv.QUOTE_NONE)
# skip the first row
next(csv_data)

id_column = 7

for row in csv_data:
    if len(row) < id_column:
        print("Row is too short, skipping")
        continue
    chart_id = row[id_column].strip()
    if chart_id == '':
        print("Chart ID is empty, skipping")
        continue
    target_file_name = f"../assets/jackets/{chart_id}.png"
    if os.path.exists(target_file_name):
        print(f"Jacket for {chart_id} already exists")
        continue
    # call the cyanvas API to find the URL of the jacket
    # the API URL is https://cc.sevenc7c.com/api/charts/{chart_id}
    # e.g. https://cc.sevenc7c.com/api/charts/Asc67jEMRNRyQLVXgdQprSG
    api_url = f"https://cc.sevenc7c.com/api/charts/{chart_id}"
    response = requests.get(api_url)
    if response.status_code != 200:
        print(f"Failed to download chart {chart_id}: {response.status_code}")
        print(row)
        continue
    # then get the image URL from the response
    data = response.json()
    try:
        chart_img = data['chart']['cover']
        if chart_img is None:
            print(f"Chart {chart_id} has no image")
            continue
        print(f"Downloading chart {chart_id} from {chart_img}")
        # and finally download the image, resize it to 256x256 and save it
        image_data = requests.get(chart_img).content
        image = Image.open(BytesIO(image_data))
        image.thumbnail((256, 256))  # Resize to thumbnail size
        image.save(target_file_name, "PNG")
    except KeyError:
        print(f"Failed to find chart image for {chart_id}")
        continue