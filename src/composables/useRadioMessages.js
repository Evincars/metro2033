import { ref, watch } from 'vue'

const STORAGE_KEY = 'metro2033.radio'

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === 'off') return false
  } catch { /* non-fatal */ }
  return true
}

export const radioEnabled = ref(loadSaved())

watch(radioEnabled, (value) => {
  try {
    localStorage.setItem(STORAGE_KEY, value ? 'on' : 'off')
  } catch { /* non-fatal */ }
})
