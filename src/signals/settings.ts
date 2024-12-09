import { localStorageSignal } from "./utils.js";

const CURRENT_SETTINGS_LS_KEY = '_x_currentLanguage';

export const $currentLanguage = localStorageSignal('en', CURRENT_SETTINGS_LS_KEY);