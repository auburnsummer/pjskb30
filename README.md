# PJSKB30

This is a tool for manually creating "b30" ("best 30") images for the rhythm game
Project Sekai.

A b30 image shows a player's best 30 scores. It's a quick way to summarise your
best achievements.

Previously, this was available automatically via a bot that used a publically
available API. However, that API is now no longer available.

# Running

This codebase consists of two parts:

 1. The web app itself;
 2. A script to download the chart images.

## The web app

 1. Install [node.js](https://nodejs.org/en)
 2. Install dependencies by running: `npm install`
 3. Run the app: `npm run dev`
 4. You will be able to view the app by navigating to localhost:5173

## The script

 1. Install [uv](https://docs.astral.sh/uv/getting-started/installation/)
 2. Run the script: `./download_assets.py`

