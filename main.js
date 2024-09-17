/**
 * FAST TRAVEL
 * Looking for a specific part of the code? Ctrl-F these fast travel indicators:
 * Add/change a background image:           [fast-travel-background-images]
 * Change the font:                         [fast-travel-font]
 * Change the width/height of the image:    [fast-travel-image-dimensions]
 * Change the image drawing procedure:      [fast-travel-image-drawing]
 */

// Alpine.js is used for interactive elements of the UI.
import Alpine from 'https://cdn.skypack.dev/alpinejs@3.14.1';
import persist from 'https://cdn.skypack.dev/@alpinejs/persist@3.14.1';

// parse is used to parse the CSV data from the constants sheet.
import { parse } from 'https://cdn.skypack.dev/@vanillaes/csv@3.0.4';

// Konva is used to draw the b30 image.
import Konva from 'https://cdn.skypack.dev/konva@9.3.15';

// https://alpinejs.dev/plugins/persist
window.Alpine = Alpine;  // required for Alpine.js devtools to work
Alpine.plugin(persist);

// constants sheet in CSV format
const API_URL_CSV = 'https://docs.google.com/spreadsheets/d/1B8tX9VL2PcSJKyuHFVd2UT_8kYlY4ZdwHwg9MfWOPug/export?format=csv&gid=610789839';

// dimensions of final image [fast-travel-image-dimensions]
const WIDTH = 1000;
const HEIGHT = 1500;
const HEADER_HEIGHT = 32;

// [fast-travel-font]
const FONT = 'Itim';

// [fast-travel-background-images]
// note that if an image is added from an external URL, the image host must include CORS headers, or
// else we will not be able to export the final image. See https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_enabled_image
const BG_URLS = [
    "/assets/backgrounds/profile1.png",
    "/assets/backgrounds/canary.png",
    "/assets/backgrounds/retie.png",
    "/assets/backgrounds/wanderer.png",
    "/assets/backgrounds/regret.png",
    "/assets/backgrounds/hug.png",
    "/assets/backgrounds/nsnf.png",
    "/assets/backgrounds/kitty.png",
    "/assets/backgrounds/secret.png",
    "/assets/backgrounds/dream.png",
    "/assets/backgrounds/faith.png"
];

const STICKERS = {
    "Airi: Aim for the top!": "/assets/stickers/airi_aim_for_the_top.png",
    "Airi: Piece of cake!": "/assets/stickers/airi_piece_of_cake.png",
    "Akito: Interesting...": "/assets/stickers/akito_interesting.png",
    "An: Perfect Score!": "/assets/stickers/an_perfect_score.png",
    "Emu: Wonderhoy!": "/assets/stickers/emu_wonderhoy.png",
    "Ena: Not bad": "/assets/stickers/ena_not_bad.png",
    "Haruka: Mission accomplished": "/assets/stickers/haruka_mission.png",
    "Honami: Good job": "/assets/stickers/honami_good_job.png",
    "Ichika: I want to keep singing":  "/assets/stickers/ichika_i_want.png",
    "KAITO: Let's raise the roof!": "/assets/stickers/kaito_roof.png",
    "Kanade: Oh, I get it": "/assets/stickers/kanade_oh_i_get_it.png",
    "Kanade: ... (slurps ramen)": "/assets/stickers/kanade_ramen.png",
    "Kohane: My heart is pounding": "/assets/stickers/kohane_my_heart.png",
    "Len: It's time to grind!": "/assets/stickers/len_grind.png",
    "Luka: Music has no right or wrong": "/assets/stickers/luka_music_has_no.png",
    "Mafuyu: ...": "/assets/stickers/mafuyu_glare.png",
    "Mafuyu: Pain, pain go away": "/assets/stickers/mafuyu_pain.png",
    "MEIKO: Thanks for the help": "/assets/stickers/meiko_help.png",
    "Miku: Welcome to SEKAI": "/assets/stickers/miku_welcome_to_sekai.png",
    "Minori: I've never seen that before...!": "/assets/stickers/minori_ive_never.png",
    "Mizuki: This is super fun": "/assets/stickers/mizuki_this_is_super_fun.png",
    "Nene: <Nenedayo>": "/assets/stickers/nene_nenedayo.png",
    "Rin: I was so moved!": "/assets/stickers/rin_i_was_so_moved.png",
    "Rui: It's just a miracle...": "/assets/stickers/rui_miracle.png",
    "Saki: I got it!": "/assets/stickers/saki_i_got_it.png",
    "Shiho: I got a bunch": "/assets/stickers/shiho_i_got_a_bunch.png",
    "Shizuku: Did I do well?": "/assets/stickers/shizuku_did_i.png",
    "Toya: I like to sing": "/assets/stickers/toya_i_like_to_sing.png",
    "Tsukasa: A full combo, of course!": "/assets/stickers/tsukasa_a_full_combo.png",
    "Tsukasa: How informative!": "/assets/stickers/tsukasa_how_informative.png"
}

const FC_COLOR = '#FE83FE';


const state = {
    loadingState: 'loading', // 'loading' | 'loaded' | 'error'
    /**
     * fields:
     *  - songNameEn: name of song in english
     *  - songNameJp: name of song in japanese
     *  - diffConstant: constant for difficulty from 39s spreadsheet
     *  - diffLevel: difficulty level in game -- this is a string as appends are marked with APD
     *  - noteCount: number of notes in song
     *  - difficulty: difficulty category in game (e.g. "Expert")
     *  - songId: id of song in game, correlates to sekai.best database
     *  - uid: unique identifier for chart, this is just a combination of songId and difficulty
     */
    songData: {},
    // Alpine.$persist causes the value of clearData to be saved into browser local storage
    clearData: Alpine.$persist({}), // mapping of songId to "fc" | "ap", or not set
    pinnedChart: Alpine.$persist(''), // uid of pinned chart if there is one -- a pinned chart is always first regardless of diff
    reset() {
        this.clearData = {};
        this.pinnedChart = '';
    },
    async fetchData() {
        try {
            const response = await fetch(API_URL_CSV);
            const text = await response.text();
            const data = parse(text);  // this is now an array of arrays
            const dataWithoutFirstRow = data.slice(1);  // first row is header

            // turning the csv data into objects
            dataWithoutFirstRow.forEach(row => {
                const newRow = {};
                newRow['songNameEn'] = row[0];
                newRow['songNameJp'] = row[1];
                newRow['diffConstant'] = parseFloat(row[2]);
                newRow['diffLevel'] = row[3];
                newRow['noteCount'] = parseInt(row[4]);
                newRow['difficulty'] = row[5];
                newRow['songId'] = row[6];  // songId remains a string!
                newRow['uid'] = newRow['songId'] + newRow['difficulty'];
                if (newRow['songId'] === '' || newRow['diffConstant'] === NaN) {
                    // skip this row, we don't have enough information to use this chart
                    console.log('skipping row', row);
                } else {
                    state.songData[newRow['uid']] = newRow;
                }
            });
            this.loadingState = 'loaded';
        } catch (error) {
            console.error(error);
            this.loadingState = 'error';
        }
    },
    async init() {
        await this.fetchData();
    },
    // sorting for data entry part -- sort by diff constant directly
    get sortedDataList() {
        return Object.values(this.songData).toSorted((a, b) => b.diffConstant - a.diffConstant);
    },
    // sorting for the final image -- sort by diff constant with FC adjustment
    get finalDataList() {
        // don't include songs that aren't in clearData
        const final = [];
        for (const uid in this.clearData) {
            if (this.clearData[uid] === 'fc' || this.clearData[uid] === 'ap') {
                final.push(this.songData[uid]);
            }
        }
        return final.toSorted((a, b) => {
            if (a.uid === this.pinnedChart) {
                return -1;
            };
            if (b.uid === this.pinnedChart) {
                return 1;
            }
            return b.diffConstant - a.diffConstant
        });
    },
    // Ranking is simply the average of the diff constants of the top 30
    ranking() {
        const dataList = this.finalDataList.slice(0, 30);
        const sum = dataList.reduce((sum, song) => sum + song.diffConstant, 0);
        const avg = sum / dataList.length;
        return avg;
    },
    currentLanguage: 'en', // or 'jp'
    view: 'dataEntry', // or 'image'
    currentBackgroundIdx: Math.floor(Math.random() * BG_URLS.length),
    switchToImage() {
        this.view = "image";
        // we need to wait until the next tick so that Alpine has time to create the element used as the stage
        this.$nextTick(() => this.drawImage());
    },
    changeBackground() {
        if (this.stage) {
            const bgLayer = this.stage.getLayers()[0];
            this.currentBackgroundIdx = (this.currentBackgroundIdx + 1) % BG_URLS.length;
            Konva.Image.fromURL(BG_URLS[this.currentBackgroundIdx], function(img) {
                bgLayer.add(img);
                bgLayer.draw();
            });
        }
    },
    getJacketURL(songId) {
        return `/assets/jackets/jacket_s_${songId.padStart(3, '0')}.png`;
    },
    stage: null,
    // draw the image -- here's where the sausage is made [fast-travel-image-drawing]
    drawImage() {
        const stage = new Konva.Stage({
            container: 'canvas-container',   // id of container <div>
            width: WIDTH,
            height: HEIGHT
        });
        this.stage = stage;
        const bgLayer = new Konva.Layer();
        const mainLayer = new Konva.Layer();

        const stickerLayer = new Konva.Layer();

        stage.add(bgLayer);
        stage.add(mainLayer);
        stage.add(stickerLayer);

        // background image
        Konva.Image.fromURL(BG_URLS[this.currentBackgroundIdx], function(img) {
            bgLayer.add(img);
        });

        // top bar
        const topBar = new Konva.Rect({
            x: 0,
            y: 0,
            width: WIDTH,
            height: HEADER_HEIGHT,
            fill: '#b4ccfa',
            opacity: 1,
            shadowColor: '#00194a',
            shadowBlur: 5,
            shadowOffset: { x: 0, y: 2 },
            shadowOpacity: 0.5,
        });

        // add some text to the top left corner
        const text = new Konva.Text({
            x: 5,
            y: 5,
            text: 'Your best 30 charts',
            fontSize: 24,
            fontFamily: FONT,
            fill: 'black',
        });

        // ...and another text to the top right corner
        const text2 = new Konva.Text({
            x: 0,
            y: 5,
            width: WIDTH - 5,
            height: HEADER_HEIGHT,
            align: 'right',
            text: `Ranking: ${this.ranking().toFixed(2)}`,
            fontSize: 24,
            fontFamily: FONT,
            fill: 'black',
        });

        mainLayer.add(topBar, text, text2);

        // each card
        for (const [idx, song] of Object.entries(this.finalDataList).slice(0, 30)) {
            // draw the base card
            const gridX = idx % 3;
            const gridY = Math.floor(idx / 3);
            const HEADER_HEIGHT = 32;
            const GUTTER_WIDTH = 30;
            const GUTTER_HEIGHT = 35;
            const CARD_WIDTH = (WIDTH - (GUTTER_WIDTH * 4)) / 3;
            const CARD_HEIGHT = (HEIGHT - HEADER_HEIGHT - (GUTTER_HEIGHT * 11)) / 10;
            const xPos = gridX * CARD_WIDTH + (GUTTER_WIDTH * (gridX + 1));
            const yPos = HEADER_HEIGHT + (gridY * CARD_HEIGHT) + (GUTTER_HEIGHT * (gridY + 1));
            const apEffect = this.clearData[song.uid] === 'ap' ? {
                // AP styling - gradient border + slight gradient background
                strokeWidth: 5,
                strokeLinearGradientStartPoint: { x: CARD_WIDTH / 2, y: 0 },
                strokeLinearGradientEndPoint: { x: CARD_WIDTH / 2, y: CARD_HEIGHT },
                strokeLinearGradientColorStops: [0, '#FF8EFF', 1, '#00E3C7'],
                fillLinearGradientStartPoint: { x: CARD_WIDTH, y: 0 },
                fillLinearGradientEndPoint: { x: 0, y: CARD_HEIGHT },
                fillLinearGradientColorStops: [0, 'white', 1, '#f2feff'],
            } : {
                // FC styling - single color border + white background
                strokeWidth: 2,
                stroke: FC_COLOR,
                fill: 'white'
            };
            const rect = new Konva.Rect({
                x: xPos,
                y: yPos,
                width: CARD_WIDTH,
                height: CARD_HEIGHT,
                opacity: 1,
                shadowColor: '#00194a',
                shadowBlur: 5,
                shadowOffset: { x: 0, y: 2 },
                shadowOpacity: 0.5,
                ...apEffect
            });
            mainLayer.add(rect);

            // image on left side of card
            const JACKET_PADDING = 15;
            const JACKET_WIDTH = CARD_HEIGHT - (JACKET_PADDING * 2);
            const jacketURL = this.getJacketURL(song.songId);
            Konva.Image.fromURL(jacketURL, function(img) {
                img.setAttrs({
                    x: xPos + JACKET_PADDING,
                    y: yPos + JACKET_PADDING,
                    width: JACKET_WIDTH,
                    height: JACKET_WIDTH
                })
                mainLayer.add(img);
            });

            // song name
            const levelText = new Konva.Text({
                x: xPos + (2 * JACKET_PADDING) + JACKET_WIDTH,
                y: yPos + JACKET_PADDING,
                width: CARD_WIDTH - (3 * JACKET_PADDING) - JACKET_WIDTH,
                height: JACKET_WIDTH,
                text: this.currentLanguage === 'en' ? song.songNameEn : song.songNameJp,
                fontSize: 20,
                fill: 'black',
                fontFamily: FONT,
                lineHeight: 1.2,
                ellipsis: true,
                wrap: 'word',
                align: 'left',
                verticalAlign: 'middle',
            });
            mainLayer.add(levelText);

            // difficulty number badge
            const BADGE_WIDTH = 37;
            const BADGE_HEIGHT = 22;
            const BADGE_X = xPos - (BADGE_WIDTH / 2);
            const BADGE_Y = yPos - (BADGE_HEIGHT / 2);
            // color of badge depends on difficulty category of chart
            // append is a bit of a gradient to match the ingame styling
            const badgeColor = {
                'Expert': { fill: '#FF457A' },
                'Master': { fill: '#781c94' },
                'Append': {
                    fillLinearGradientStartPoint: { x: 0, y: 0 },
                    fillLinearGradientEndPoint: { x: BADGE_WIDTH, y: BADGE_HEIGHT },
                    fillLinearGradientColorStops: [0, '#7857ff', 1, '#fcacf7'],
                    strokeWidth: 2,
                    stroke: 'white',
                }
            }[song.difficulty];

            const difficultyRect = new Konva.Rect({
                x: BADGE_X,
                y: BADGE_Y,
                width: BADGE_WIDTH,
                height: BADGE_HEIGHT,
                opacity: 1,
                cornerRadius: 10,
                ...badgeColor
            });
            const difficultyText = new Konva.Text({
                x: BADGE_X,
                y: BADGE_Y,
                width: BADGE_WIDTH,
                height: BADGE_HEIGHT,
                text: `${song.diffConstant.toFixed(1)}`,
                fontFamily: FONT,
                fontSize: 14,
                fill: 'white',
                lineHeight: 2,
                ellipsis: true,
                wrap: 'word',
                align: 'center',
                verticalAlign: 'middle',
            });
            mainLayer.add(difficultyRect, difficultyText);
            
            // indicator in lower right corner showing FC or AP
            // the shape is a diamond for normal charts and a weird shape for Append charts
            // the fill is a gradient for AP and a solid color for FC
            const DIAMOND_WIDTH = 36;
            const DIAMOND_HEIGHT = 36;
            const DIAMOND_X = xPos + CARD_WIDTH - (DIAMOND_WIDTH / 2);
            const DIAMOND_Y = yPos + CARD_HEIGHT - (DIAMOND_HEIGHT / 2);
            const diamondApEffect = this.clearData[song.uid] === 'ap' ? {
                // AP fill
                fillPriority: 'linear-gradient',
                fillLinearGradientStartPoint: { x: DIAMOND_WIDTH / 2, y: 0 },
                fillLinearGradientEndPoint: { x: DIAMOND_WIDTH / 2, y: DIAMOND_HEIGHT },
                fillLinearGradientColorStops: [0, '#FF8EFF', 0.3, '#FF8EFF', 0.7, '#00E3C7', 1, '#00E3C7'],
            }: {
                // FC fill
                fill: FC_COLOR
            };
            const points = song.difficulty === 'Append'
            ? [
                // Append shape
                0, 0,
                DIAMOND_WIDTH / 2, DIAMOND_HEIGHT / 7,
                DIAMOND_WIDTH, 0,
                DIAMOND_WIDTH - (DIAMOND_WIDTH / 7), DIAMOND_HEIGHT / 2,
                DIAMOND_WIDTH, DIAMOND_HEIGHT,
                DIAMOND_WIDTH / 2, DIAMOND_HEIGHT - (DIAMOND_HEIGHT / 7),
                0, DIAMOND_HEIGHT,
                DIAMOND_WIDTH / 7, DIAMOND_HEIGHT / 2,
                0, 0
            ]: [
                // FC shape
                DIAMOND_WIDTH / 2, 0,
                DIAMOND_WIDTH, DIAMOND_HEIGHT / 2,
                DIAMOND_WIDTH / 2, DIAMOND_HEIGHT,
                0, DIAMOND_HEIGHT / 2,
                DIAMOND_WIDTH / 2, 0
            ]
            const diamond = new Konva.Line({
                x: DIAMOND_X,
                y: DIAMOND_Y,
                points,
                closed: true,
                opacity: 1,
                stroke: 'black',
                strokeWidth: 2,
                shadowColor: '#00194a',
                shadowBlur: 5,
                shadowOffset: { x: 0, y: 2 },
                shadowOpacity: 0.5,
                ...diamondApEffect
            });

            const diamondText = new Konva.Text({
                x: DIAMOND_X,
                y: DIAMOND_Y,
                width: DIAMOND_WIDTH,
                height: DIAMOND_HEIGHT,
                text: this.clearData[song.uid] === 'ap' ? 'AP' : 'FC',
                fontSize: 12,
                fill: 'white',
                fontFamily: FONT,
                align: 'center',
                verticalAlign: 'middle',
            });
            mainLayer.add(diamond, diamondText);
        }

        // controls
        const tr = new Konva.Transformer({
            nodes: [],
            name: 'transformer',
            keepRatio: true,
            enabledAnchors: [
              'top-left',
              'top-right',
              'bottom-left',
              'bottom-right',
            ],
        });

        stage.on('click tap', (e) => {
            if (e.target.name() === 'sticker') {
                tr.nodes([e.target]);
                stickerLayer.add(tr);
                stickerLayer.draw();
            } else {
                tr.nodes([]);
                stickerLayer.draw();
            }
        });

        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                tr.nodes([]);
                stickerLayer.draw();
            }
            // delete selected sticker
            if (e.key === 'Backspace') {
                if (tr.nodes().length > 0) {
                    const sticker = tr.nodes()[0];
                    tr.detach();
                    sticker.destroy();
                }
            }
        });

        bgLayer.draw();
        mainLayer.draw();
        stickerLayer.draw();
    },
    STICKERS,
    currentSticker: "/assets/stickers/airi_aim_for_the_top.png",
    addSticker(sticker) {
        // stickers!!!
        const stickerLayer = this.stage.getLayers().at(-1);
        Konva.Image.fromURL(sticker, function(img) {
            img.setAttrs({
                name: 'sticker',
                draggable: true,
                scaleX: 0.5,
                scaleY: 0.5
            });
            stickerLayer.add(img);
        });
    },
    downloadImage() {
        if (this.stage) {
            const stickerLayer = this.stage.getLayers().at(-1);
            const tr = stickerLayer.findOne('.transformer');
            if (tr) {
                tr.hide();
            }
            const url = this.stage.toDataURL();
            const link = document.createElement('a');
            link.href = url;
            link.download = 'image.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            if (tr) {
                tr.show();
            }
        }
    },
    copyImageToClipboard() {
        if (this.stage) {
            const stickerLayer = this.stage.getLayers().at(-1);
            const tr = stickerLayer.findOne('.transformer');
            if (tr) {
                tr.hide();
            }
            (async () => {
                const blob = await this.stage.toBlob();
                navigator.clipboard.write([
                    new ClipboardItem({
                        'image/png': blob
                    })
                ]);
                if (tr) {
                    tr.show();
                }
                alert("Copied!");
            })();
        }
    }
}

// register the data so it can be used in the HTML
Alpine.data('state', () => state)
Alpine.start()
