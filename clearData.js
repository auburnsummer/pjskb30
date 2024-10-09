import { signal, computed } from '@preact/signals';

import { $songData } from './chartConstants.js';
import { localStorageSignal } from './utils.js';

const CLEAR_DATA_LS_KEY = '_x_clearData';
const PINNED_CHART_LS_KEY = '_x_pinnedChart';

export const $clearData = localStorageSignal({}, CLEAR_DATA_LS_KEY);

export const $pinnedChart = localStorageSignal('', PINNED_CHART_LS_KEY);

export const $finalDataList = computed(() => {
    const clearData = $clearData.value;
    const songData = $songData.value;
    const pinnedChart = $pinnedChart.value;
    const final = [];
    for (const uid in clearData) {
        if (clearData[uid] === 'fc') {
            final.push({
                ...songData[uid],
                diffConstant: songData[uid].diffConstant - 1,
            });
        }
        if (clearData[uid] === 'ap') {
            final.push(songData[uid]);
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
        return null;
    }
    return $finalDataList.value.slice(0, 30).at(-1).diffConstant;
});

