import { signal, computed } from "@preact/signals";

import { parse } from '@vanillaes/csv';

const API_URL_CSV = 'https://docs.google.com/spreadsheets/d/1B8tX9VL2PcSJKyuHFVd2UT_8kYlY4ZdwHwg9MfWOPug/export?format=csv&gid=610789839';


export const $loadingState = signal('loading');
export const $songData = signal(null);
export const $error = signal(null);

export const $sortedIds = computed(() => {
    const songData = $songData.value;
    if (songData == null) {
        return;
    }
    return Object.values(songData)
        .toSorted((a, b) => b.diffConstant - a.diffConstant)
        .map(song => song.uid);
});

async function fetchData() {
    try {
        const response = await fetch(API_URL_CSV);
        const text = await response.text();
        const data = parse(text);  // this is now an array of arrays
        const dataWithoutFirstRow = data.slice(1);  // first row is header
        const newSongData = {};
        dataWithoutFirstRow.forEach(row => {
            const newRow = {};
            newRow['songNameEn'] = row[0];
            newRow['songNameJp'] = row[1];
            newRow['diffConstant'] = parseFloat(row[2]);
            newRow['diffLevel'] = row[3];
            newRow['noteCount'] = parseInt(row[4]);
            newRow['difficulty'] = row[5];
            newRow['songId'] = row[6];  // songId remains a string!
            newRow['uid'] = newRow['songId'] + newRow['difficulty'];
            if (newRow['songId'] === '' || newRow['diffConstant'] === NaN) {
                // skip this row, we don't have enough information to use this chart
                console.log('skipping row', row);
            } else {
                newSongData[newRow['uid']] = newRow;
            }
        });
        $songData.value = newSongData;
        $loadingState.value = 'loaded';
    } catch (error) {
        $error.value = error;
        $loadingState.value = 'error';
    }
}

fetchData();