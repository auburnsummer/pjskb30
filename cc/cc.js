import Alpine from 'https://cdn.skypack.dev/alpinejs@3.14.1';
import { parse } from 'https://cdn.skypack.dev/@vanillaes/csv@3.0.4';

import Minisearch from 'https://cdn.skypack.dev/minisearch@7.1.0';

window.Alpine = Alpine;  // required for Alpine.js devtools to work

const API_URL = 'https://docs.google.com/spreadsheets/d/1ci0ngHA3rDP_eVgdXmvbxbRK3vb7XV1UkkKHcV_px_0/export?format=csv&gid=0'

const state = {
    loadingState: 'loading', // loading, error, loaded
    searcher: null,
    chartData: [],
    searchQuery: "",
    searchResults: [],
    clearSetting: false,
    timeoutId: null,
    doSearch() {
        const results = this.searcher.search(this.searchQuery);
        this.searchResults = results;
        if (this.clearSetting) {
            if (this.timeoutId) {
                clearTimeout(this.timeoutId);
            }
            this.timeoutId = setTimeout(() => {
                this.searchQuery = "";
            }, 5000);
        } else {
            if (this.timeoutId) {
                clearTimeout(this.timeoutId);
                this.timeoutId = null;
            }
        }
    },
    async fetchData() {
        const response = await fetch(API_URL);
        const text = await response.text();
        const parsedData = parse(text);
        for (let i = 2; i < parsedData.length; i += 2) {
            const row1 = parsedData[i];
            const row2 = parsedData[i + 1];
            const chart = {
                id: `${i / 2}`,
                difficulties: []
            };
            chart['songNameJP'] = row1[0];
            chart['songNameEN'] = row2[0] || row1[0];
            for (let j = 1; j < 6; j++) {
                const diff = {};
                diff['name'] = row1[j];
                diff['percent'] = row2[j];
                chart['difficulties'].push(diff);
            }
            chart['notes'] = row1[8];
            this.chartData.push(chart);
        }
        this.searcher = new Minisearch({
            fields: ['songNameJP', 'songNameEN', 'notes'],
            storeFields: ['songNameJP', 'songNameEN', 'difficulties', 'notes'],
            searchOptions: {
                boost: {
                    songNameJP: 1.2,
                    songNameEN: 1.2,
                },
                fuzzy: 0.2,
                prefix: true
            }
        });
        this.searcher.addAll(this.chartData);
        this.loadingState = 'loaded';
        console.log(this.chartData);
    },
    init() {
        void this.fetchData();
    }
}

window.state = state;

// register the data so it can be used in the HTML
Alpine.data('state', () => state)
Alpine.start()
