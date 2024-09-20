/**
 * The overall state is comprised of multiple "slices". Each slice is a function that returns an object.
 * The slices get merged together to form the overall state. 
 * Slices can refer to each other; the "state" parameter is the overall state.
 */

// parse is used to parse the CSV data from the constants sheet.
import { parse } from 'https://cdn.skypack.dev/@vanillaes/csv@3.0.4';

// constants sheet in CSV format
const API_URL_CSV = 'https://docs.google.com/spreadsheets/d/1B8tX9VL2PcSJKyuHFVd2UT_8kYlY4ZdwHwg9MfWOPug/export?format=csv&gid=610789839';

/**
 * @typedef {{
 *  songNameEn: string,
 *  songNameJp: string,
 *  diffConstant: number,
 *  diffLevel: string,
 *  noteCount: number,
 *  difficulty: string,
 *  songId: string,
 *  uid: string,
 * }} Chart
 */

/**
 * This slice is responsible for fetching and storing the chart constants data from the spreadsheet.
 */
export const chartConstantsSlice = () => ({
    /** Equals 'loaded' once the data has been fetched. */
    loadingState: 'loading', // 'loading' | 'loaded' | 'error'
    /** @type {Record<string, Chart>} */
    songData: {},
    /**
     * Fetch the data from the spreadsheet and turns it into Chart objects.
     */
    async fetchData() {
        try {
            const response = await fetch(API_URL_CSV);
            const text = await response.text();
            const data = parse(text);  // this is now an array of arrays
            const dataWithoutFirstRow = data.slice(1);  // first row is header

            // turning the csv data into objects
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
                    this.songData[newRow['uid']] = newRow;
                }
            });
            this.loadingState = 'loaded';
        } catch (error) {
            console.error(error);
            this.loadingState = 'error';
        }
    },
    /** sorting for data entry part -- sort by diff constant directly */
    getSortedDataList() {
        return Object.values(this.songData).toSorted((a, b) => b.diffConstant - a.diffConstant);
    },
});