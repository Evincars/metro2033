<script setup>
import { onBeforeUnmount, onMounted } from 'vue'
import { useAmbientAudio } from '../../composables/useAmbientAudio'

const emit = defineEmits(['close'])
const { enabled, volume, playing, blocked, currentTitle, nextTrack } = useAmbientAudio()

const volumePercent = (val) => Math.round(val * 100)

function onVolumeInput(event) {
  volume.value = Number(event.target.value) / 100
}

function onKeydown(event) {
  if (event.key === 'Escape') emit('close')
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <Teleport to="body">
    <div class="settings-backdrop" @click.self="emit('close')">
      <div
        class="settings-dialog mx-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Settings"
      >
        <header class="settings-head">
          <span class="mx-tag">System</span>
          <h2 class="settings-title">Settings</h2>
          <button class="settings-close" type="button" aria-label="Close" @click="emit('close')">×</button>
        </header>

        <section class="settings-group">
          <div class="group-label">Ambient audio</div>

          <label class="toggle-row">
            <span class="toggle-text">Play tunnel ambience</span>
            <button
              class="switch"
              type="button"
              role="switch"
              :aria-checked="enabled"
              :class="{ 'is-on': enabled }"
              @click="enabled = !enabled"
            >
              <span class="switch-knob" />
            </button>
          </label>

          <div class="volume-row" :class="{ 'is-muted': !enabled }">
            <span class="volume-icon" aria-hidden="true">🔊</span>
            <input
              class="volume-slider"
              type="range"
              min="0"
              max="100"
              step="1"
              :value="volumePercent(volume)"
              :disabled="!enabled"
              aria-label="Volume"
              @input="onVolumeInput"
            />
            <span class="volume-value">{{ volumePercent(volume) }}%</span>
          </div>

          <div class="now-playing">
            <span class="np-dot" :class="{ 'is-live': playing }" />
            <span class="np-text">
              <template v-if="playing">Now playing — {{ currentTitle }}</template>
              <template v-else-if="blocked && enabled">Tap anywhere to start audio…</template>
              <template v-else-if="enabled">Loading…</template>
              <template v-else>Audio muted</template>
            </span>
            <button class="np-skip" type="button" :disabled="!enabled" @click="nextTrack">skip ⏭</button>
          </div>

          <p class="settings-hint">
            Place your tracks in <code>public/audio/</code> as
            <code>metro-ambient.mp3</code> and <code>metro-2033-anthem.mp3</code>.
          </p>
        </section>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.settings-backdrop {
  position: fixed;
  inset: 0;
  z-index: 3000;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding: calc(var(--header-height) + 0.5rem) 1rem 1rem;
  background: rgba(4, 6, 8, 0.55);
  backdrop-filter: blur(2px);
}

.settings-dialog {
  width: min(360px, 100%);
  padding: 1rem 1.1rem 1.2rem;
  background: linear-gradient(180deg, var(--color-panel) 0%, var(--color-panel-alt) 100%);
  border: 1px solid var(--color-border-strong);
  box-shadow: var(--shadow-panel), var(--glow-steel);
}

.settings-head {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-bottom: 1rem;
}

.settings-title {
  margin: 0;
  font-size: 1.15rem;
  color: var(--color-steel-bright);
}

.settings-close {
  position: absolute;
  top: -0.2rem;
  right: -0.2rem;
  background: none;
  border: none;
  color: var(--color-text-faint);
  font-size: 1.4rem;
  line-height: 1;
  cursor: pointer;
}

.settings-close:hover {
  color: var(--color-steel-bright);
}

.settings-group {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.group-label {
  font-family: var(--font-display);
  font-size: 0.8rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-text-dim);
}

.toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.toggle-text {
  font-size: 0.85rem;
  color: var(--color-text);
}

.switch {
  position: relative;
  width: 44px;
  height: 22px;
  border-radius: 12px;
  border: 1px solid var(--color-border-strong);
  background: var(--color-bg-alt);
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease;
  flex-shrink: 0;
}

.switch.is-on {
  background: rgba(134, 209, 106, 0.25);
  border-color: var(--color-signal);
}

.switch-knob {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--color-text-dim);
  transition: transform 0.2s ease, background-color 0.2s ease;
}

.switch.is-on .switch-knob {
  transform: translateX(22px);
  background: var(--color-signal);
  box-shadow: 0 0 6px rgba(134, 209, 106, 0.8);
}

.volume-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  transition: opacity 0.2s ease;
}

.volume-row.is-muted {
  opacity: 0.45;
}

.volume-icon {
  font-size: 0.95rem;
}

.volume-slider {
  flex: 1;
  height: 4px;
  -webkit-appearance: none;
  appearance: none;
  background: var(--color-border-strong);
  border-radius: 2px;
  outline: none;
  cursor: pointer;
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--color-steel-bright);
  box-shadow: var(--glow-steel);
  cursor: pointer;
}

.volume-slider::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border: none;
  border-radius: 50%;
  background: var(--color-steel-bright);
  box-shadow: var(--glow-steel);
  cursor: pointer;
}

.volume-value {
  width: 3ch;
  text-align: right;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--color-text-dim);
}

.now-playing {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.6rem;
  border: 1px solid var(--color-border);
  border-radius: 2px;
  background: rgba(0, 0, 0, 0.25);
}

.np-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-text-faint);
  flex-shrink: 0;
}

.np-dot.is-live {
  background: var(--color-signal);
  box-shadow: 0 0 6px rgba(134, 209, 106, 0.8);
}

.np-text {
  flex: 1;
  min-width: 0;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  color: var(--color-text-dim);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.np-skip {
  flex-shrink: 0;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  color: var(--color-steel);
  background: none;
  border: 1px solid var(--color-border-strong);
  border-radius: 2px;
  padding: 0.2rem 0.4rem;
  cursor: pointer;
}

.np-skip:hover:not(:disabled) {
  color: var(--color-steel-bright);
  border-color: var(--color-steel);
}

.np-skip:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.settings-hint {
  margin: 0;
  font-size: 0.7rem;
  line-height: 1.5;
  color: var(--color-text-faint);
}

.settings-hint code {
  font-family: var(--font-mono);
  color: var(--color-text-dim);
}
</style>
