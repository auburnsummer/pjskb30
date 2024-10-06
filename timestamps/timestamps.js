
import Alpine from 'https://cdn.skypack.dev/alpinejs@3.14.1';

const formatter = new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'short',
    timeStyle: 'short'
});

const state = {
    now: Date.now(),
    nearest15Minutes() {
        const copiedNow = new Date(this.now);
        copiedNow.setMinutes(Math.floor(copiedNow.getMinutes() / 15) * 15);
        copiedNow.setSeconds(0);
        copiedNow.setMilliseconds(0);
        return copiedNow;
    },
    window15Minutes(count) {
        const minutesToAdd = count * 15;
        const nearest = this.nearest15Minutes();
        nearest.setMinutes(nearest.getMinutes() + minutesToAdd);
        return nearest;
    },
    formatterWindow15Minutes(count) {
        const date = new Date(this.window15Minutes(count));
        return formatter.format(date);
    },
    copyShortTime(count) {
        const date = this.window15Minutes(count);
        const time = Math.floor(date.getTime() / 1000);
        const toCopy = `<t:${time}:t>`;
        navigator.clipboard.writeText(toCopy);
    },
    copyLongTime(count) {
        const date = this.window15Minutes(count);
        const time = Math.floor(date.getTime() / 1000);
        const toCopy = `<t:${time}:f>`;
        navigator.clipboard.writeText(toCopy);
    },
    formattedNow() {
        return formatter.format(this.now);
    },
    init() {
        console.log("init");
        setInterval(() => {
            console.log('updating timestamp');
            this.now = Date.now();
        }, 1000);
    }
};

window.state = state;

// register the data so it can be used in the HTML
Alpine.data('state', () => state)
Alpine.start()
