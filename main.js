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


// Konva is used to draw the b30 image.
import Konva from 'https://cdn.skypack.dev/konva@9.3.15';

import { chartConstantsSlice } from './chartConstantsSlice.js';
import { clearDataSlice } from './clearDataSlice.js';
import { imageSlice } from './imageSlice.js';

// https://alpinejs.dev/plugins/persist
window.Alpine = Alpine;  // required for Alpine.js devtools to work
Alpine.plugin(persist);

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


const state = {
    ...chartConstantsSlice(),
    ...clearDataSlice(),
    ...imageSlice(),
    reset() {
        this.clearData = {};
        this.pinnedChart = '';
        this.stickerURLMap = {};
    },
    async init() {
        await this.fetchData();
    },
    currentLanguage: 'en', // or 'jp'
    view: 'dataEntry', // or 'image'
    currentBackgroundIdx: Math.floor(Math.random() * BG_URLS.length),
    changeBackground() {
        if (this.stage) {
            const bgLayer = this.stage.findOne('#bgLayer');
            this.currentBackgroundIdx = (this.currentBackgroundIdx + 1) % BG_URLS.length;
            Konva.Image.fromURL(BG_URLS[this.currentBackgroundIdx], function(img) {
                bgLayer.add(img);
                bgLayer.draw();
            });
        }
    },

    // draw the image -- here's where the sausage is made [fast-travel-image-drawing]
    STICKERS,
    currentSticker: "/assets/stickers/airi_aim_for_the_top.png",
    stickerURLMap: Alpine.$persist({}), // mapping of sticker IDs to information that can restore the sticker
    addSticker(stickerURL) {
        // stickers!!!
        const stickerLayer = this.stage.findOne('#stickerLayer');
        Konva.Image.fromURL(stickerURL, img => {
            const id = Math.random().toString(16).slice(2);
            img.setAttrs({
                id,
                name: 'sticker',
                draggable: true,
                scaleX: 0.5,
                scaleY: 0.5
            });
            this.stickerURLMap[id] = { stickerURL };
            stickerLayer.add(img);
        });
    },
    updateStickerState() {
        const stickerLayer = this.stage.findOne('#stickerLayer');
        const stickers = stickerLayer.find('.sticker');
        stickers.forEach((sticker) => {
            this.stickerURLMap[sticker.id()] = {
                ...this.stickerURLMap[sticker.id()],
                currentProps: {
                    x: sticker.x(),
                    y: sticker.y(),
                    rotation: sticker.rotation(),
                    scaleX: sticker.scaleX(),
                    scaleY: sticker.scaleY(),
                }
            }
        });
    },
    removeAllStickers() {
        const stickerLayer = this.stage.findOne('#stickerLayer');
        const stickers = stickerLayer.find('.sticker');
        stickers.forEach((sticker) => {
            sticker.destroy();
        });
        this.stickerURLMap = {};
    },
    downloadImage() {
        if (this.stage) {
            this.updateStickerState();
            const stickerLayer = this.stage.findOne('#stickerLayer');
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
            this.updateStickerState();
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
    },
    backToDataView() {
        if (this.stage) {
            this.updateStickerState();
        }
        this.view = 'dataEntry';
    }
}

window.state = state;

// register the data so it can be used in the HTML
Alpine.data('state', () => state)
Alpine.start()
