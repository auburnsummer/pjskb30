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
        <div class="container is-flex is-flex-direction-column is-align-items-center">
            <div class="pb-2 pt-2 is-flex is-flex-direction-row is-justify-content-space-between is-gap-1">
                <div class="is-flex is-flex-direction-row">
                    <select
                        class="select is-small"
                        onChange={e => $currSticker.value = (e.target as HTMLSelectElement).value}
                    >
                    {
                        objectKeys(STICKERS).map(key => (
                            <option value={STICKERS[key]}>{key}</option>
                        ))
                    }
                    </select>
                    <button class="button is-small" onClick={() => addSticker($currSticker.value)}>Add sticker</button>
                </div>
                <button class="button is-small" onClick={removeAllStickers}>Remove all stickers</button>
                <button class="button is-small" onClick={changeBackground}>Change background</button>
                <button class="button is-small is-primary" onClick={downloadImage}>Download image</button>
                <button class="button is-small is-primary" onClick={copyImageToClipboard}>Copy image to clipboard</button>
                <button class="button is-small" onClick={() => backToMainView($view)}>Back to main view</button>
            </div>
            <div
                id="konva-container"
                onContextMenu={e => {
                    e.preventDefault();
                    alert('Use the Download Image or Copy Image to Clipboard buttons instead of right clicking. The reason is because this isn\'t actually a real image, it\'s three canvases in a trenchcoat');
                }}
            >
            </div>
        </div>
    )
}