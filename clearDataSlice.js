
/**
 * This slice is responsible for storing the AP/FC data that the user has entered,
 * and for computing information about the data.
 */
export const clearDataSlice = () => ({
    /** @type {Record<string, "fc" | "ap">} */
    clearData: Alpine.$persist({}), // mapping of songId to "fc" | "ap", or not set
    /** @type {string} */
    pinnedChart: Alpine.$persist(''), // uid of pinned chart if there is one -- a pinned chart is always first regardless of diff
    // sorting for the final image -- sort by diff constant with FC adjustment
    getFinalDataList() {
        // don't include songs that aren't in clearData
        const final = [];
        for (const uid in this.clearData) {
            if (this.clearData[uid] === 'fc') {
                final.push({
                    ...this.songData[uid],
                    diffConstant: this.songData[uid].diffConstant - 1,
                });
            }
            if (this.clearData[uid] === 'ap') {
                final.push(this.songData[uid]);
            }
        }
        return final.toSorted((a, b) => {
            if (a.uid === this.pinnedChart) {
                return -1;
            };
            if (b.uid === this.pinnedChart) {
                return 1;
            }
            return b.diffConstant - a.diffConstant
        });
    },
    // Ranking is simply the average of the diff constants of the top 30
    getRanking() {
        const dataList = this.getFinalDataList().slice(0, 30);
        const sum = dataList.reduce((sum, song) => sum + song.diffConstant, 0);
        const avg = sum / dataList.length;
        return avg;
    },
})