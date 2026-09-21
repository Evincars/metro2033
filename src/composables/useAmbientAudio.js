import { ref, watch } from 'vue'

/**
 * Background ambient-audio controller (module-level singleton so the header
 * settings dialog and the app shell share one <audio> element and its state).
 *
 * Drop your own tracks into `public/audio/` using the filenames below. Missing
 * files are skipped gracefully. Browsers block autoplay with sound until the
 * first user gesture, so playback is also armed on the first click / keypress.
 */

const STORAGE_KEY = 'metro2033.audio'

export const tracks = [
  { title: 'Moscow Metro — Tunnel Ambience', src: `${import.meta.env.BASE_URL}audio/metro-ambient.mp3` },
  { title: 'Metro 2033 — Anthem (Genso)', src: `${import.meta.env.BASE_URL}audio/metro-2033-anthem.mp3` },
]

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* ignore malformed / unavailable storage */
  }
  return {}
}

const saved = loadSaved()

export const enabled = ref(saved.enabled ?? true)
export const volume = ref(typeof saved.volume === 'number' ? saved.volume : 0.35)
export const playing = ref(false)
export const blocked = ref(false)
export const currentIndex = ref(0)
export const currentTitle = ref(tracks[0]?.title ?? '')

let audio = null
let initialized = false
let errorStreak = 0

function persist() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ enabled: enabled.value, volume: volume.value }),
    )
  } catch {
    /* storage may be unavailable (private mode) — non-fatal */
  }
}

function applyTrack() {
  if (!audio) return
  const t = tracks[currentIndex.value]
  if (!t) return
  currentTitle.value = t.title
  audio.src = t.src
  audio.load()
}

function tryPlay() {
  if (!audio) return
  const p = audio.play()
  if (p && typeof p.then === 'function') {
    p.then(() => {
      playing.value = true
      blocked.value = false
    }).catch(() => {
      playing.value = false
      blocked.value = true
    })
  }
}

export function nextTrack() {
  if (!tracks.length) return
  currentIndex.value = (currentIndex.value + 1) % tracks.length
  applyTrack()
  if (enabled.value) tryPlay()
}

function armAutoplayFallback() {
  const start = () => {
    if (enabled.value) tryPlay()
    window.removeEventListener('pointerdown', start)
    window.removeEventListener('keydown', start)
  }
  window.addEventListener('pointerdown', start)
  window.addEventListener('keydown', start)
}

export function initAmbientAudio() {
  if (initialized) return
  initialized = true

  audio = new Audio()
  audio.preload = 'auto'
  audio.loop = false
  audio.volume = volume.value

  audio.addEventListener('playing', () => {
    playing.value = true
    blocked.value = false
    errorStreak = 0
  })
  audio.addEventListener('pause', () => {
    playing.value = false
  })
  audio.addEventListener('ended', () => {
    errorStreak = 0
    nextTrack()
  })
  audio.addEventListener('error', () => {
    // Missing/unsupported file: hop to the next until we've tried them all.
    playing.value = false
    errorStreak += 1
    if (errorStreak < tracks.length) nextTrack()
  })

  applyTrack()
  if (enabled.value) {
    tryPlay()
    armAutoplayFallback()
  }
}

watch(volume, (v) => {
  if (audio) audio.volume = v
  persist()
})

watch(enabled, (on) => {
  persist()
  if (!audio) return
  if (on) {
    errorStreak = 0
    tryPlay()
  } else {
    audio.pause()
    playing.value = false
  }
})

export function useAmbientAudio() {
  return {
    enabled,
    volume,
    playing,
    blocked,
    currentTitle,
    currentIndex,
    tracks,
    nextTrack,
  }
}
