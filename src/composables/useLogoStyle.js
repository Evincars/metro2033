import { ref, watch } from 'vue'

/**
 * Header logo preference, shared by the header and the settings dialog.
 *
 * - `universe`: the original "Вселенная Метро 2033" shield (default). Its
 *   sprite holds two halves side by side — the right half is the hover state.
 * - `classic`: the wide Metro 2033 wordmark.
 */

const STORAGE_KEY = 'metro2033.logo'
export const LOGO_STYLES = ['universe', 'classic']

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (LOGO_STYLES.includes(raw)) return raw
  } catch {
    /* storage may be unavailable (private mode) — non-fatal */
  }
  return 'universe'
}

export const logoStyle = ref(loadSaved())

watch(logoStyle, (value) => {
  try {
    localStorage.setItem(STORAGE_KEY, value)
  } catch {
    /* non-fatal */
  }
})
