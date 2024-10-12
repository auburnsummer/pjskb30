import { render } from 'preact';
import { html } from 'htm/preact';

import { useComputed, signal, useSignal } from '@preact/signals';
import { useLayoutEffect, useEffect } from 'preact/hooks';

import { $songData, $loadingState, $error, $sortedIds } from './chartConstants.js';
import { $clearData, $lowestInBest30, $pinnedChart } from './clearData.js';

import { $currentLanguage } from './settings.js';
import { addSticker, changeBackground, copyImageToClipboard, downloadImage, drawImage, removeAllStickers, STICKERS, updateStickerState, backToMainView, goToImageView } from './draw.js';

const $view = signal('main');

function App() {
    if ($loadingState.value === 'loading') {
        return html`<div>Downloading chart constants from the spreadsheet, please wait...</div>`;
    }
    if ($loadingState.value === 'error') {
        return html`<div>Error: ${error.value.message}</div>`;
    }
    if ($view.value === 'main') {
        return html`<${MainView} />`;
    }
    if ($view.value === 'image') {
        return html`<${ImageView} />`;
    }
}

function TableRow({song}) {
    const clearData = $clearData.value;
    const $clear = useComputed(() => $clearData.value[song.uid]);

    const isIrrelevant = song.diffConstant < $lowestInBest30.value;

    return html`
        <tr>
            <td
                class=${isIrrelevant && 'has-text-grey-light'}
            >
                ${$currentLanguage.value === 'en' ? song.songNameEn : song.songNameJp}
            </td>
            <td>
                <span class="tag ${song.difficulty}">
                    ${song.difficulty}
                </span>
            </td>
            <td>${song.diffLevel}</td>
            <td>
                <fieldset>
                    <input
                        type="radio"
                        name=${song.uid + 'status'}
                        value="fc"
                        id=${'fc' + song.uid}
                        checked=${$clear.value === 'fc'}
                        onChange=${() => $clearData.value = {...clearData, [song.uid]: 'fc'}}
                    />
                    <label for=${'fc' + song.uid}>FC</label>
                    <input
                        type="radio"
                        class="radio ml-2"
                        name=${song.uid + 'status'}
                        value="ap"
                        id=${'ap' + song.uid}
                        checked=${$clear.value === 'ap'}
                        onChange=${() => $clearData.value = {...clearData, [song.uid]: 'ap'}}
                    />
                    <label for=${'ap' + song.uid}>AP</label>  
                    ${
                        clearData[song.uid] != null && html`
                            <button
                                class="button is-small"
                                disabled=${clearData[song.uid] == null}
                                onClick=${() => $clearData.value = {...clearData, [song.uid]: null}}
                            >
                                Clear
                            </button> 
                        `
                    }
                </fieldset>
            </td>
            <td>
                ${
                    $pinnedChart.value === song.uid
                        ? html`
                            <button
                                class="button is-small"
                                onClick=${() => $pinnedChart.value = null}
                            >
                                Clear pin
                            </button>
                        `
                        : html`
                            <input
                                type="radio"
                                class="radio"
                                name="pinnedChart"
                                value=${song.uid}
                                disabled=${clearData[song.uid] == null}
                                onClick=${() => $pinnedChart.value = song.uid}
                            />
                        `
                }
            </td>
        </tr>
    `
}

function MainView() {
    return html`
        <div class="container">
            <h2 class="is-size-5">B30 Data Entry</h2>
            <article class="message">
                <div class="message-body">
                    <p>Mark charts with either AP or FC. The charts are ordered by difficulty. Once you have marked 30 or more charts,
                    charts that would not make it into the b30 are grayed out.</p>
                    <p>You can pin a chart by clicking the "Pinned" column. A pinned chart always appears at the front.</p>
                    <p><a href="https://github.com/auburnsummer/pjskb30">View GitHub of this project</a></p>
                </div>
            </article>
            <div class="pb-2 pt-2 is-flex is-flex-direction-row is-gap-1">
                <label for="language-select">Song Language (not server):</label>
                <select
                    name="language"
                    id="language-select"
                    class="select is-small"
                    onChange=${e => $currentLanguage.value = e.target.value}
                >
                    <option value="en">English</option>
                    <option value="jp">Japanese</option>
                </select>
                <button
                    onClick=${() => {
                        $clearData.value = {};
                        $pinnedChart.value = "";
                    }}
                    class="button is-small is-danger"
                >
                    Reset Everything
                </button>
                <button
                    onClick=${() => goToImageView($view, 'konva-container')}
                    class="button is-small is-primary"
                >
                    Generate Image
                </button>
            </div>
            <table class="table">
                <thead>
                    <tr>
                        <th>Song</th>
                        <th>Difficulty</th>
                        <th>In-Game Difficulty</th>
                        <th>AP/FC</th>
                        <th>Pinned</th>
                    </tr>
                </thead>
                <tbody>
                    ${
                        $sortedIds.value.map(uid => html`
                            <${TableRow}
                                song=${$songData.value[uid]}
                            />
                        `)
                    }
                </tbody>
            </table>
        </div>
    `;
}

function ImageView() {
    useEffect(() => {
        const id = setInterval(() => {
            updateStickerState();
        }, 5000);
        return () => {
            clearInterval(id);
        }
    }, []);

    const $currSticker = useSignal('/assets/stickers/airi_aim_for_the_top.png');

    return html`
        <div class="container is-flex is-flex-direction-column is-align-items-center">
            <div class="pb-2 pt-2 is-flex is-flex-direction-row is-justify-content-space-between is-gap-1">
                <div class="is-flex is-flex-direction-row">
                    <select
                        class="select is-small"
                        onChange=${e => $currSticker.value = e.target.value}
                    >
                    ${
                        Object.keys(STICKERS).map(key => html`
                            <option value=${STICKERS[key]}>${key}</option>
                        `)
                    }
                    </select>
                    <button class="button is-small" onClick=${() => addSticker($currSticker.value)}>Add sticker</button>
                </div>
                <button class="button is-small" onClick=${removeAllStickers}>Remove all stickers</button>
                <button class="button is-small" onClick=${changeBackground}>Change background</button>
                <button class="button is-small is-primary" onClick=${downloadImage}>Download image</button>
                <button class="button is-small is-primary" onClick=${copyImageToClipboard}>Copy image to clipboard</button>
                <button class="button is-small" onClick=${() => backToMainView($view)}>Back to main view</button>
            </div>
            <div
                id="konva-container"
                onContextMenu=${e => {
                    e.preventDefault();
                    alert('Use the Download Image or Copy Image to Clipboard buttons instead of right clicking. The reason is because this isn\'t actually a real image, it\'s three canvases in a trenchcoat');
                }}
            >
            </div>
        </div>
    `
}

render(html`<${App} />`, document.getElementById('root'));