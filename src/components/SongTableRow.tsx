import { useComputed } from "@preact/signals";
import { Song } from "../signals/chartConstants";
import { $clearData, $lowestInBest30, $pinnedChart } from "../signals/clearData";
import { $currentLanguage } from "../signals/settings";

type SongTableRowProps = {
    song: Song
}

export function SongTableRow({ song }: SongTableRowProps) {
    const clearData = $clearData.value;
    const $clear = useComputed(() => $clearData.value[song.uid]);

    const isIrrelevant = song.diffConstant < $lowestInBest30.value;

    return (
        <tr>
            <td
                class={isIrrelevant ? 'has-text-grey-light' : ''}
            >
                {$currentLanguage.value === 'en' ? song.songNameEn : song.songNameJp}
            </td>
            <td>
                <span class={`tag ${song.difficulty}`}>
                    {song.difficulty}
                </span>
            </td>
            <td>{song.diffLevel}</td>
            <td class="is-flex is-flex-direction-row is-align-content-center is-gap-1">
                <div class="radios">
                    <label for={'fc' + song.uid}>
                        <input
                            type="radio"
                            name={song.uid + 'status'}
                            value="fc"
                            id={'fc' + song.uid}
                            checked={$clear.value === 'fc'}
                            onChange={() => $clearData.value = { ...clearData, [song.uid]: 'fc' }}
                        />
                        FC
                    </label>
                    <label for={'ap' + song.uid}>
                        <input
                            type="radio"
                            class="radio ml-2"
                            name={song.uid + 'status'}
                            value="ap"
                            id={'ap' + song.uid}
                            checked={$clear.value === 'ap'}
                            onChange={() => $clearData.value = { ...clearData, [song.uid]: 'ap' }}
                        />
                        AP
                    </label>
                </div>
                {
                    <button
                        class={`button is-small ${clearData[song.uid] == null ? "is-invisible" : ''}`}
                        disabled={clearData[song.uid] == null}
                        onClick={() => $clearData.value = { ...clearData, [song.uid]: null }}
                    >
                        Clear
                    </button> 
                }
            </td>
            <td>
                {
                    $pinnedChart.value === song.uid
                        ? (
                            <button
                                class="button is-small"
                                onClick={() => $pinnedChart.value = ''}
                            >
                                Clear pin
                            </button>
                        )
                        : (
                            <input
                                type="radio"
                                class="radio"
                                name="pinnedChart"
                                value={song.uid}
                                disabled={clearData[song.uid] == null}
                                onClick={() => $pinnedChart.value = song.uid}
                            />
                        )
                }
            </td>
        </tr>
    );
}