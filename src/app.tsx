import { signal } from '@preact/signals';

import { $chartConstantData } from './signals/chartConstants';
import { MainView } from './views/MainView';
import { ImageView } from './views/ImageView';

export const $view = signal('main');

export function App() {
    const { state, error } = $chartConstantData.value;
    if (state === 'loading') {
        return <div>Downloading chart constants from the spreadsheet, please wait...</div>;
    }
    if (state === 'error') {
        return <div>Error: {error.message}</div>;
    }
    if ($view.value === 'main') {
        return <MainView />;
    }
    if ($view.value === 'image') {
        return <ImageView />;
    }
    return <div>Unknown view</div>;
}