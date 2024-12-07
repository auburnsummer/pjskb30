import { signal, computed } from "@preact/signals";

import { parse } from '@vanillaes/csv';

const API_URL_CSV = 'https://docs.google.com/spreadsheets/d/1B8tX9VL2PcSJKyuHFVd2UT_8kYlY4ZdwHwg9MfWOPug/export?format=csv&gid=610789839';

export type Difficulty = "Expert" | "Master" | "Append";

export const isDifficulty = (s: string): s is Difficulty => {
    return ["Expert", "Master", "Append"].includes(s);
}

export type Song = {
    songNameEn: string;
    songNameJp: string;
    diffConstant: number;
    diffLevel: string;  // e.g. can be "APD 30"
    noteCount: number;
    difficulty: Difficulty;
    songId: string;
    uid: string;
}

type SongMap = Record<string, Song>;

type LoadingState<T> = {
    state: "loading",
    data: null;
    error: null;
} | {
    state: "loaded"
    data: T;
    error: null;
} | {
    state: "error"
    data: null;
    error: Error;
}

export const $chartConstantData = signal<LoadingState<SongMap>>({
    state: 'loading',
    data: null,
    error: null,
});

export const $sortedIds = computed(() => {
    const songData = $chartConstantData.value;
    if (songData.data == null) {
        throw Error("chart contants are not loaded");
    }
    return Object.values(songData.data)
        .toSorted((a, b) => b.diffConstant - a.diffConstant)
        .map(song => song.uid);
});

async function fetchData() {
    try {
        const response = await fetch(API_URL_CSV);
        const text = await response.text();
        const data: string[][] = parse(text);  // this is now an array of arrays
        const dataWithoutFirstRow = data.slice(1);  // first row is header
        const newSongData: SongMap = {};
        dataWithoutFirstRow.forEach(row => {
            const songId = row[6];
            const diffConstant = parseFloat(row[2]);
            if (songId === '' || Number.isNaN(diffConstant)) {
                // skip this row, we don't have enough information to use this chart
                console.log('skipping row', row);
            }
            const songNameEn = row[0];
            const songNameJp = row[1];
            const diffLevel = row[3];
            const noteCount = parseInt(row[4]);
            const difficulty = isDifficulty(row[5]) ? row[5] : "Expert";
            if (!isDifficulty(row[5])) {
                console.warn(`Song ${songNameEn} has an unknown difficulty, falling back to Expert`)
            }
            const uid = songId + difficulty;
            const newRow = {
                songNameEn: songNameEn,
                songNameJp: songNameJp,
                diffConstant: diffConstant,
                diffLevel: diffLevel,
                noteCount: noteCount,
                difficulty: difficulty,
                songId: songId,
                uid: uid,
            };
            newSongData[newRow['uid']] = newRow;
        });
        $chartConstantData.value = {
            state: 'loaded',
            data: newSongData,
            error: null,
        };
    } catch (e) {
        const error = e instanceof Error ? e : new Error('Unknown error');
        $chartConstantData.value = {
            state: 'error',
            data: null,
            error,
        };
    }
}

fetchData();