import { signal, effect } from '@preact/signals';


export function localStorageSignal<T>(initialValue: T, lsKey: string) {
    let value;
    const lsValue = localStorage.getItem(lsKey);
    if (lsValue == null) {
        value = initialValue;
    } else {
        try {
            value = JSON.parse(lsValue) as T;
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