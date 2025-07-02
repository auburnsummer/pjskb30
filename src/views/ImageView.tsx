import { useEffect } from "preact/hooks";
import { addSticker, backToMainView, changeBackground, copyImageToClipboard, downloadImage, removeAllStickers, STICKERS, updateStickerState } from "../draw/draw";
import { useSignal } from "@preact/signals";
import { objectKeys } from "ts-extras";
import { $view } from "../app";

export function ImageView() {
    useEffect(() => {
        const id = setInterval(() => {
            updateStickerState();
        }, 5000);
        return () => {
            clearInterval(id);
        }
    }, []);

    const $currSticker = useSignal('/stickers/airi_aim_for_the_top.png');

    return (
        <div class="container image-view-container">
            <div class="image-controls-toolbar">
                {/* Sticker Controls */}
                <div class="sticker-controls">
                    <label for="sticker-select" class="control-label">Add Sticker:</label>
                    <div class="sticker-input-group">
                        <select
                            id="sticker-select"
                            class="select is-small"
                            onChange={e => $currSticker.value = (e.target as HTMLSelectElement).value}
                        >
                        {
                            objectKeys(STICKERS).map(key => (
                                <option value={STICKERS[key]}>{key}</option>
                            ))
                        }
                        </select>
                        <button class="button is-small" onClick={() => addSticker($currSticker.value)}>Add</button>
                    </div>
                </div>

                {/* Image Controls */}
                <div class="image-controls">
                    <button class="button is-small" onClick={removeAllStickers}>Remove all stickers</button>
                    <button class="button is-small" onClick={changeBackground}>Change background</button>
                </div>

                {/* Export Controls */}
                <div class="export-controls">
                    <button class="button is-small is-primary" onClick={downloadImage}>Download</button>
                    <button class="button is-small is-primary" onClick={copyImageToClipboard}>Copy</button>
                </div>

                {/* Navigation */}
                <div class="navigation-controls">
                    <button class="button is-small" onClick={() => backToMainView($view)}>← Back to Data Entry</button>
                </div>
            </div>

            <div class="canvas-container">
                <div
                    id="konva-container"
                    class="konva-wrapper"
                    onContextMenu={e => {
                        e.preventDefault();
                        alert('Use the Download Image or Copy Image to Clipboard buttons instead of right clicking. The reason is because this isn\'t actually a real image, it\'s three canvases in a trenchcoat');
                    }}
                >
                </div>
            </div>
        </div>
    )
}
