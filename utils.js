import { signal, effect } from '@preact/signals';


export function localStorageSignal(initialValue, lsKey) {
    let value;
    const lsValue = localStorage.getItem(lsKey);
    if (lsValue == null) {
        value = initialValue;
    } else {
        try {
            value = JSON.parse(lsValue)
        } catch {
            value = initialValue;
        }
    }

    const $newSignal = signal(value);

    effect(() => {
        const lsValue = JSON.stringify($newSignal.value);
        localStorage.setItem(lsKey, lsValue);
    });

    return $newSignal;
}