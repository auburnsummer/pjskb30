import { $view } from "../app";
import { SongTableRow } from "../components/SongTableRow";
import { goToImageView } from "../draw/draw";
import { $chartConstantData, $sortedIds } from "../signals/chartConstants";
import { $clearData, $pinnedChart } from "../signals/clearData";
import { $currentLanguage } from "../signals/settings";

export function MainView() {
    const songs = $chartConstantData.value.data;
    if (songs == null) {
        return <></>;
    }
    return (
        <div class="container">
            <h2 class="is-size-5">B30 Data Entry</h2>
            <article class="message is-info">
                <div class="message-body">
                    <p>Mark charts with either AP or FC. The charts are ordered by difficulty. Once you have marked 30 or more charts,
                    charts that would not make it into the b30 are grayed out.</p>
                    <p>You can pin a chart by clicking the "Pinned" column. A pinned chart always appears at the front.</p>
                    <p><a href="https://github.com/auburnsummer/pjskb30">View GitHub of this project</a></p>

                </div>
            </article>
            <div class="controls-toolbar pb-2 pt-2 is-flex is-flex-direction-row is-gap-1">
                <label for="language-select">Song Title Language:</label>
                <select
                    name="language"
                    id="language-select"
                    class="select is-small"
                    onChange={e => $currentLanguage.value = (e.target as HTMLSelectElement).value}
                >
                    <option value="enc">English (Community)</option>
                    <option value="nonEn">Original</option>
                    <option value="en">English Server</option>
                    <option value="jp">Japanese Server</option>
                    <option value="kr">Korean Server</option>
                    <option value="tc">Taiwan Server</option>
                    <option value="cn">China Server</option>
                </select>
                <button
                    onClick={() => {
                        $clearData.value = {};
                        $pinnedChart.value = "";
                    }}
                    class="button is-small is-danger"
                >
                    Reset Everything
                </button>
                <button
                    onClick={() => goToImageView($view, 'konva-container')}
                    class="button is-small is-primary"
                >
                    Generate Image
                </button>
            </div>
            <div class="table-container table-responsive">
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
                        {
                            $sortedIds.value.map(uid => <SongTableRow song={songs[uid]} />)
                        }
                    </tbody>
                </table>
            </div>
        </div>
    );
}
