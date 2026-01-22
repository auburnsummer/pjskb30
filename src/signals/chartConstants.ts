import {
    signal,
    computed
} from "@preact/signals";
import {
    parse
} from "@vanillaes/csv";

const API_URL_CSV =
    "https://docs.google.com/spreadsheets/d/1B8tX9VL2PcSJKyuHFVd2UT_8kYlY4ZdwHwg9MfWOPug/export?format=csv&gid=1855810409";

const API_URL_CSV2 =
    "https://docs.google.com/spreadsheets/d/1Yv3GXnCIgEIbHL72EuZ-d5q_l-auPgddWi4Efa14jq0/export?format=csv&gid=182216";

export type Difficulty = "Expert" | "Master" | "Append";

export const isDifficulty = (s: string): s is Difficulty => {
    return ["Expert", "Master", "Append"].includes(s);
};

export type Song = {
    songNameEn: string;
    songNameNonEn: string;
    diffConstant: number;
    diffLevel: string;
    noteCount: number;
    difficulty: Difficulty;
    songId: string;
    uid: string;
};

type SongMap = Record < string, Song > ;

type LoadingState < T > = |
    {
        state: "loading";
        data: null;
        error: null;
    } |
    {
        state: "loaded";
        data: T;
        error: null;
    } |
    {
        state: "error";
        data: null;
        error: Error;
    };

export const $chartConstantData = signal < LoadingState < SongMap >> ({
    state: "loading",
    data: null,
    error: null,
});

export const $sortedIds = computed(() => {
    const songData = $chartConstantData.value;
    if (songData.data == null) {
        throw Error("chart constants are not loaded");
    }

    return Object.values(songData.data)
        .toSorted((a, b) => b.diffConstant - a.diffConstant)
        .map((song) => song.uid);
});

async function fetchData() {
    try {
        const baseText = await fetch(API_URL_CSV).then((r) => r.text());
        const overrideText = await fetch(API_URL_CSV2).then((r) => r.text());

        const newSongData: SongMap = {};

        const applyCsv = (text: string) => {
            const data: string[][] = parse(text);
            const rows = data.slice(1); // first row is header
            rows.forEach((row) => {
                const songId = row[6];
                const diffConstant = parseFloat(row[2]);

                if (songId === "" || Number.isNaN(diffConstant)) {
                    // skip this row, we don't have enough information to use this chart
                    console.log("skipping row", row);
                    return;
                }

                const songNameEn = row[0];
                const songNameNonEn = row[1];
                const diffLevel = row[3];
                const noteCount = parseInt(row[4]);
                const difficulty = isDifficulty(row[5]) ? row[5] : "Expert";

                if (!isDifficulty(row[5])) {
                    console.warn(
                        `Song ${songNameEn} has an unknown difficulty, falling back to Expert`
                    );
                }

                const uid = songId + difficulty;

                newSongData[uid] = {
                    songNameEn,
                    songNameNonEn,
                    diffConstant,
                    diffLevel,
                    noteCount,
                    difficulty,
                    songId,
                    uid,
                };
            });
        };

        // base sheet
        applyCsv(baseText);

        // apply overrides
        applyCsv(overrideText);

        $chartConstantData.value = {
            state: "loaded",
            data: newSongData,
            error: null,
        };
    } catch (e) {
        const error = e instanceof Error ? e : new Error("Unknown error");
        $chartConstantData.value = {
            state: "error",
            data: null,
            error,
        };
    }
}

fetchData();