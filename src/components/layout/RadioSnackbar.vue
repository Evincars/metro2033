<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { getRadioMessages } from '../../data/radioMessages'
import { t } from '../../i18n'

const visible = ref(false)
const entering = ref(false)
const currentMsg = ref(null)
let timeout = null
let pool = []
let lastIndex = -1

function shufflePool() {
  pool = getRadioMessages().map((_, i) => i)
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]]
  }
}

function showNext() {
  if (!pool.length) shufflePool()
  const messages = getRadioMessages()
  let idx = pool.pop()
  if (idx === lastIndex && pool.length) idx = pool.pop()
  lastIndex = idx
  currentMsg.value = messages[idx]
  entering.value = true
  visible.value = true

  timeout = setTimeout(() => {
    entering.value = false
  }, 1800)

  timeout = setTimeout(() => {
    visible.value = false
    currentMsg.value = null
    scheduleNext()
  }, 7000)
}

function scheduleNext() {
  const delay = 15000 + Math.random() * 35000
  timeout = setTimeout(showNext, delay)
}

function dismiss() {
  visible.value = false
  currentMsg.value = null
  clearTimeout(timeout)
  scheduleNext()
}

onMounted(() => {
  shufflePool()
  const initial = 8000 + Math.random() * 12000
  timeout = setTimeout(showNext, initial)
})

onBeforeUnmount(() => clearTimeout(timeout))
</script>

<template>
  <Teleport to="body">
    <transition name="radio-slide">
      <div v-if="visible && currentMsg" class="radio-snackbar" :class="{ 'is-entering': entering }" @click="dismiss">
        <div class="radio-signal">
          <span class="signal-bar" />
          <span class="signal-bar" />
          <span class="signal-bar" />
        </div>
        <div class="radio-content">
          <span class="radio-label" :class="{ blink: entering }">{{ t('radio.incoming') }}</span>
          <p class="radio-message"><span class="radio-name">{{ currentMsg.name }}:</span> {{ currentMsg.text }}</p>
        </div>
        <div class="radio-noise" />
      </div>
    </transition>
  </Teleport>
</template>

<style scoped>
.radio-snackbar {
  position: fixed;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 8000;
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  max-width: min(520px, calc(100vw - 2rem));
  padding: 0.7rem 1rem 0.7rem 0.8rem;
  background: rgba(6, 8, 4, 0.94);
  border: 1px solid rgba(120, 160, 60, 0.35);
  box-shadow:
    0 0 12px rgba(100, 140, 50, 0.15),
    inset 0 0 20px rgba(0, 0, 0, 0.4);
  cursor: pointer;
  overflow: hidden;
}

.radio-snackbar.is-entering {
  border-color: rgba(140, 180, 70, 0.6);
  box-shadow:
    0 0 18px rgba(120, 160, 60, 0.3),
    inset 0 0 20px rgba(0, 0, 0, 0.4);
}

.radio-noise {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(100, 140, 50, 0.03) 2px,
    rgba(100, 140, 50, 0.03) 4px
  );
}

.radio-signal {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  padding-top: 0.2rem;
  flex-shrink: 0;
}

.signal-bar {
  width: 3px;
  background: rgba(120, 170, 60, 0.7);
  animation: signal-pulse 1.4s ease-in-out infinite;
}

.signal-bar:nth-child(1) {
  height: 6px;
  animation-delay: 0s;
}

.signal-bar:nth-child(2) {
  height: 10px;
  animation-delay: 0.2s;
}

.signal-bar:nth-child(3) {
  height: 14px;
  animation-delay: 0.4s;
}

@keyframes signal-pulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
}

.radio-content {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 0;
}

.radio-label {
  font-family: var(--font-mono);
  font-size: 0.6rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgba(140, 190, 70, 0.8);
}

.radio-label.blink {
  animation: label-blink 0.5s step-end 3;
}

@keyframes label-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.radio-message {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 0.78rem;
  line-height: 1.4;
  color: rgba(190, 210, 160, 0.9);
}

.radio-name {
  color: rgba(160, 200, 80, 1);
  font-weight: 600;
}

/* Slide transition */
.radio-slide-enter-active {
  transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.4s ease;
}

.radio-slide-leave-active {
  transition: transform 0.35s cubic-bezier(0.55, 0, 1, 0.45), opacity 0.35s ease;
}

.radio-slide-enter-from {
  transform: translateX(-50%) translateY(100%);
  opacity: 0;
}

.radio-slide-leave-to {
  transform: translateX(-50%) translateY(100%);
  opacity: 0;
}

@media (max-width: 600px) {
  .radio-snackbar {
    bottom: 1rem;
    max-width: calc(100vw - 1.5rem);
  }
}
</style>
