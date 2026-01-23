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
export const isDifficulty = (s: string): s is Difficulty => ["Expert", "Master", "Append"].includes(s);

export type Region = "en" | "jp" | "kr" | "tc" | "cn";
export const REGION_FALLBACK_ORDER: Region[] = ["en", "jp", "kr", "tc", "cn"];

export type Song = {
    songNameEnCommunity: string;
    songNameOriginal: string;
    songNameEn: string;
    songNameJp: string;
    songNameKr: string;
    songNameTc: string;
    songNameCn: string;

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
        state: "loading";data: null;error: null
    } |
    {
        state: "loaded";data: T;error: null
    } |
    {
        state: "error";data: null;error: Error
    };

export const $chartConstantData = signal < LoadingState < SongMap >> ({
    state: "loading",
    data: null,
    error: null,
});

export const $sortedIds = computed(() => {
    const songData = $chartConstantData.value;
    if (!songData.data) throw new Error("chart constants are not loaded");

    return Object.values(songData.data)
        .toSorted((a, b) => b.diffConstant - a.diffConstant)
        .map((song) => song.uid);
});

let officialSongNames: Record < Region, Record < string, string >> = {
    en: {},
    jp: {},
    kr: {},
    tc: {},
    cn: {},
};


async function loadOfficialSongNames() {
    const res = await fetch("/song_names_official.json");
    officialSongNames = await res.json();
}

// Normalize empty string
const normalize = (v ? : string) => (v && v.trim() ? v : "");

// song name official, but fall back to different regions in order (then the community en name)
function resolveSongNames(songId: string, songNameEnCommunity: string): Record < Region, string > {
    const result: Record < Region, string > = {
        en: songNameEnCommunity,
        jp: songNameEnCommunity,
        kr: songNameEnCommunity,
        tc: songNameEnCommunity,
        cn: songNameEnCommunity,
    };

    for (const region of REGION_FALLBACK_ORDER) {
        const name = officialSongNames?.[region]?.[songId];
        if (name && name.trim()) {
            for (const r of REGION_FALLBACK_ORDER) {
                if (result[r] === songNameEnCommunity) {
                    result[r] = officialSongNames[r]?.[songId] || result[r];
                }
            }
            break;
        }
    }

    return result;
}

export async function fetchData() {
    try {
        await loadOfficialSongNames();

        const baseText = await fetch(API_URL_CSV).then((r) => r.text());
        const overrideText = await fetch(API_URL_CSV2).then((r) => r.text());

        const newSongData: SongMap = {};

        const applyCsv = (text: string) => {
            const data: string[][] = parse(text);
            const rows = data.slice(1); // delete header

            rows.forEach((row) => {
                const songId = row[6];
                const diffConstant = parseFloat(row[2]);

                if (!songId || songId === "" || Number.isNaN(diffConstant)) {
                    // skip this row, we don't have enough information to use this chart
                    console.log("skipping row", row);
                    return;
                }

                const songNameEnCommunity = normalize(row[0]);
                const songNameOriginal = normalize(row[1]);
                const diffLevel = row[3];
                const noteCount = parseInt(row[4]);
                const difficulty = isDifficulty(row[5]) ? row[5] : "Master";

                if (!isDifficulty(row[5])) {
                    // 39s is more likely to update master than expert
                    console.warn(
                        `Song ${songNameOriginal} has unknown difficulty, falling back to Master`
                    );
                }

                const uid = songId + difficulty;

                const resolvedNames = resolveSongNames(songId, songNameEnCommunity);

                newSongData[uid] = {
                    songNameEnCommunity,
                    songNameOriginal,
                    songNameEn: resolvedNames.en,
                    songNameJp: resolvedNames.jp,
                    songNameKr: resolvedNames.kr,
                    songNameTc: resolvedNames.tc,
                    songNameCn: resolvedNames.cn,
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