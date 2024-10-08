// Alpine.js is used for interactive elements of the UI.
import Alpine from 'https://cdn.skypack.dev/alpinejs@3.14.1';
import persist from 'https://cdn.skypack.dev/@alpinejs/persist@3.14.1';

// https://alpinejs.dev/plugins/persist
window.Alpine = Alpine;  // required for Alpine.js devtools to work
Alpine.plugin(persist);

import { chartConstantsSlice } from './chartConstantsSlice.js';
import { clearDataSlice } from './clearDataSlice.js';
import { imageSlice } from './imageSlice.js';


const state = {
    ...chartConstantsSlice(),
    ...clearDataSlice(),
    ...imageSlice(),
    reset() {
        this.clearData = {};
        this.pinnedChart = '';
        this.stickerURLMap = {};
    },
    async init() {
        await this.fetchData();
    },
    currentLanguage: 'en', // or 'jp'
    view: 'dataEntry', // or 'image'
}

window.state = state;

// register the data so it can be used in the HTML
Alpine.data('state', () => state)
Alpine.start()
