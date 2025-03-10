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
            <article class="message is-warning">
                <div class="message-body">
                    <p>It is recommended to use the sbotga bot instead (available for JP/EN):</p>
                    <a href="https://discord.com/oauth2/authorize?client_id=1322253224799109281">Add Bot</a>
                    <p>If you are unable to access the sbotga bot due to region restrictions (KR/TW), this website will continue to be available, but updates may be sporadic. (song images may be missing. Songs that aren't community rated will not be available here.)</p>
                </div>
            </article>
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
                    onChange={e => $currentLanguage.value = (e.target as HTMLSelectElement).value}
                >
                    <option value="en">English</option>
                    <option value="jp">Japanese</option>
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
    );
}
