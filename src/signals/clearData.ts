import { computed } from '@preact/signals';

import { $chartConstantData, Song } from './chartConstants.js';
import { localStorageSignal } from './utils.js';

const CLEAR_DATA_LS_KEY = '_x_kizuClearData';
const PINNED_CHART_LS_KEY = '_x_kizuPinnedChart';

const NOT_AP_SCORE_REDUCTION = 1;

type ClearData = Record<string, 'fc' | 'ap' | null>;

export const $clearData = localStorageSignal<ClearData>({}, CLEAR_DATA_LS_KEY);

export const $pinnedChart = localStorageSignal('', PINNED_CHART_LS_KEY);

export const $finalDataList = computed(() => {
    const clearData = $clearData.value;
    const { data: songs } = $chartConstantData.value;
    if (songs == null) {
        throw new Error("Chart constants not loaded");
    }
    const pinnedChart = $pinnedChart.value;
    const final: Song[] = [];
    for (const uid in clearData) {
        if (clearData[uid] === 'fc') {
            final.push({
                ...songs[uid],
                diffConstant: songs[uid].diffConstant - NOT_AP_SCORE_REDUCTION,
            });
        }
        if (clearData[uid] === 'ap') {
            final.push(songs[uid]);
        }
    }
    return final.toSorted((a, b) => {
        if (a.uid === pinnedChart) {
            return -1;
        };
        if (b.uid === pinnedChart) {
            return 1;
        }
        return b.diffConstant - a.diffConstant
    });
});

export const $ranking = computed(() => {
    const dataList = $finalDataList.value.slice(0, 30);
    const sum = dataList.reduce((sum, song) => sum + song.diffConstant, 0);
    const avg = sum / dataList.length;
    return avg;
})

export const $lowestInBest30 = computed(() => {
    if ($finalDataList.value.length < 30) {
        return 0;
    }
    const lastInB30 = $finalDataList.value.slice(0, 30).at(-1);
    return lastInB30 !== undefined ? lastInB30.diffConstant : 0;
});