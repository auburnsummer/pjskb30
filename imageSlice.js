import Konva from 'https://cdn.skypack.dev/konva@9.3.15';

// dimensions of final image [fast-travel-image-dimensions]
const WIDTH = 1000;
const HEIGHT = 1500;
const HEADER_HEIGHT = 32;

// [fast-travel-font]
const FONT = 'Itim';

const FC_COLOR = '#FE83FE';

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

async function loadImage(imageURL) {
    return new Promise((resolve, reject) => {
        Konva.Image.fromURL(
            imageURL,
            resolve,
            reject
        );
    })
}

/**
 * wait for the next animation frame
 * this helps avoid the browser freezing up
 */
function raf() {
    return new Promise(resolve => {
        requestAnimationFrame(resolve);
    });
}

/**
 * The image slice is responsible for drawing the final image.
 */
export const imageSlice = () => ({
    stage: null,
    loadingMessage: '',
    switchToImage() {
        this.view = "image";
        // we need to wait until the next tick so that Alpine has time to create the element used as the stage
        this.$nextTick(() => this.drawImage());
    },
    getJacketURL(songId) {
        return `/assets/jackets/jacket_s_${songId.padStart(3, '0')}.png`;
    },
    async drawImage() {
        const stage = new Konva.Stage({
            container: 'canvas-container',   // id of container <div>
            width: WIDTH,
            height: HEIGHT
        });
        this.stage = stage;
        const bgLayer = new Konva.Layer({id: 'bgLayer', listening: false});
        const mainLayer = new Konva.Layer({id: 'mainLayer', listening: false});

        const stickerLayer = new Konva.Layer({id: 'stickerLayer'});

        stage.add(bgLayer);
        stage.add(mainLayer);
        stage.add(stickerLayer);

        this.loadingMessage = 'Loading background image...';

        // // background image
        // Konva.Image.fromURL(BG_URLS[this.currentBackgroundIdx], function(img) {
        //     bgLayer.add(img);
        // });
        const img = await loadImage(BG_URLS[this.currentBackgroundIdx]);
        bgLayer.add(img);

        this.loadingMessage = 'Drawing top bar...';

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
            text: `Ranking: ${this.getRanking().toFixed(2)}`,
            fontSize: 24,
            fontFamily: FONT,
            fill: 'black',
        });

        mainLayer.add(topBar, text, text2);

        await raf();

        this.loadingMessage = 'Drawing cards...';

        const apFcCommonProps = {
            x: 0,
            y: 0,
            width: CARD_WIDTH,
            height: CARD_HEIGHT,
            opacity: 1,
            cornerRadius: 10,
            shadowColor: '#00194a',
            shadowBlur: 5,
            shadowOffset: { x: 0, y: 2 },
            shadowOpacity: 0.
        }

        const apBaseCard = new Konva.Rect({
            ...apFcCommonProps,
            // AP styling - gradient border + slight gradient background
            strokeWidth: 5,
            strokeLinearGradientStartPoint: { x: CARD_WIDTH / 2, y: 0 },
            strokeLinearGradientEndPoint: { x: CARD_WIDTH / 2, y: CARD_HEIGHT },
            strokeLinearGradientColorStops: [0, '#FF8EFF', 1, '#00E3C7'],
            fillLinearGradientStartPoint: { x: CARD_WIDTH, y: 0 },
            fillLinearGradientEndPoint: { x: 0, y: CARD_HEIGHT },
            fillLinearGradientColorStops: [0, 'white', 1, '#f2feff'],
        });

        const fcBaseCard = new Konva.Rect({
            ...apFcCommonProps,
                // FC styling - single color border + white background
                strokeWidth: 2,
                stroke: FC_COLOR,
                fill: 'white'
        });
        apBaseCard.cache();
        fcBaseCard.cache();

        // each card
        for (const [idx, song] of Object.entries(this.getFinalDataList()).slice(0, 30)) {
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

            const card = this.clearData[song.uid] === 'ap' ? apBaseCard : fcBaseCard;

            const clone = card.clone({
                x: xPos,
                y: yPos,
            });
            mainLayer.add(clone);


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

        // add any stickers that were in the saved state
        for (const [stickerId, data] of Object.entries(this.stickerURLMap)) {
            const { stickerURL, currentProps } = data;
            if (!currentProps) {
                // we only have the stickerURL but nothing else
                // we can't add it to the stage
                // this is likely because the user closed the window 
                continue;
            }
            Konva.Image.fromURL(stickerURL, img => {
                img.setAttrs({
                    ...currentProps,
                    id: stickerId,
                    name: 'sticker',
                    draggable: true
                });
                stickerLayer.add(img);
            })
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

})