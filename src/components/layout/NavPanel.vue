<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

defineProps({
  collapsed: {
    type: Boolean,
    default: false,
  },
})

const route = useRoute()

const navItems = [
  { to: '/', label: 'Surface', code: '01', icon: '▲' },
  { to: '/map', label: 'Metro Map', code: '02', icon: '◈' },
  { to: '/stations', label: 'Stations', code: '03', icon: '●' },
  { to: '/factions', label: 'Factions', code: '04', icon: '⚑' },
  { to: '/chronicles', label: 'Chronicles', code: '05', icon: '▤' },
  { to: '/about', label: 'Dossier', code: '06', icon: '✎' },
]

/* ---- live gas-mask HUD: signal strength + radiation meter ---- */
// µSv/h — post-war Moscow: tunnels sit near background, surface leaks spike hard.
const RAD_WARN = 0.6 // elevated, air turning bad
const RAD_HIGH = 1.0 // gas mask required

const signalBars = ref(3) // 0..4
const rad = ref(0.18) // µSv/h
let signalTimer = null
let radTimer = null

const signalLabel = computed(() => {
  const b = signalBars.value
  if (b <= 0) return 'lost'
  if (b === 1) return 'faint'
  if (b === 2) return 'weak'
  if (b === 3) return 'stable'
  return 'strong'
})

const radLevel = computed(() => {
  if (rad.value >= RAD_HIGH) return 'high'
  if (rad.value >= RAD_WARN) return 'elevated'
  return 'nominal'
})

const maskOn = computed(() => radLevel.value === 'high')

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n))
}

function tickSignal() {
  // random walk with an occasional dropout, biased back toward full bars
  const roll = Math.random()
  let next = signalBars.value
  if (roll < 0.12) next -= 2
  else if (roll < 0.4) next -= 1
  else if (roll > 0.65) next += 1
  signalBars.value = clamp(next, 0, 4)
  signalTimer = window.setTimeout(tickSignal, 700 + Math.random() * 900)
}

function tickRad() {
  // drift around tunnel background, with rare leaks pushing into the danger zone
  const leak = Math.random() < 0.12
  const delta = leak
    ? 0.7 + Math.random() * 3.2
    : (Math.random() - 0.52) * 0.28
  rad.value = clamp(rad.value + delta, 0.09, 9.9)
  radTimer = window.setTimeout(tickRad, 1400 + Math.random() * 900)
}

onMounted(() => {
  tickSignal()
  tickRad()
})

onBeforeUnmount(() => {
  window.clearTimeout(signalTimer)
  window.clearTimeout(radTimer)
})
</script>

<template>
  <aside class="nav-panel" :class="{ 'is-collapsed': collapsed }">
    <nav class="nav-list" aria-label="Sections">
      <RouterLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="nav-item"
        :class="{ 'is-active': route.path === item.to }"
        :title="item.label"
      >
        <span class="nav-code">{{ item.code }}</span>
        <span class="nav-icon">{{ item.icon }}</span>
        <span class="nav-label">{{ item.label }}</span>
      </RouterLink>
    </nav>

    <div class="nav-status">
      <div class="status-row" :title="`Signal: ${signalLabel}`">
        <span class="status-ico signal-ico" :data-bars="signalBars" aria-hidden="true">
          <i /><i /><i /><i />
        </span>
        <span class="nav-label status-text">Signal: {{ signalLabel }}</span>
      </div>

      <div class="status-row" :title="`Radiation ${rad.toFixed(2)} µSv/h`">
        <span class="status-ico rad-ico" :class="`rad-${radLevel}`" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="16" height="16">
            <circle cx="12" cy="12" r="2.4" fill="currentColor" />
            <path
              fill="currentColor"
              d="M12 1.5a10.5 10.5 0 0 1 9.09 5.25l-6.06 3.5a3.5 3.5 0 0 0-3.03-1.75V1.5z"
            />
            <path
              fill="currentColor"
              d="M21.09 18.75A10.5 10.5 0 0 1 12 24v-7a3.5 3.5 0 0 0 3.03-1.75l6.06 3.5z"
            />
            <path
              fill="currentColor"
              d="M2.91 18.75 8.97 15.25A3.5 3.5 0 0 0 12 17v7a10.5 10.5 0 0 1-9.09-5.25z"
            />
          </svg>
        </span>
        <span class="nav-label status-text" :class="{ 'is-danger': maskOn }">
          Rad: {{ rad.toFixed(2) }} µSv/h<template v-if="maskOn"> — Mask needed</template>
        </span>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.nav-panel {
  position: sticky;
  top: var(--header-height);
  height: calc(100vh - var(--header-height));
  width: var(--nav-panel-width);
  flex-shrink: 0;
  display: none;
  flex-direction: column;
  justify-content: space-between;
  background: linear-gradient(180deg, var(--color-panel) 0%, var(--color-bg-alt) 100%);
  border-right: 1px solid var(--color-border);
  transition: width 0.2s ease;
  overflow: hidden;
}

.nav-panel.is-collapsed {
  width: var(--nav-panel-width-collapsed);
}

.nav-list {
  display: flex;
  flex-direction: column;
  padding: 1rem 0;
}

.nav-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.7rem 1rem;
  color: var(--color-text-dim);
  border-left: 2px solid transparent;
  white-space: nowrap;
  transition: color 0.15s ease, background-color 0.15s ease, border-color 0.15s ease;
}

.nav-item:hover {
  color: var(--color-amber-bright);
  background: rgba(232, 149, 42, 0.06);
}

.nav-item.is-active {
  color: var(--color-amber-bright);
  border-left-color: var(--color-amber);
  background: rgba(232, 149, 42, 0.09);
}

.nav-code {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  color: var(--color-text-faint);
  width: 1.4rem;
}

.nav-icon {
  font-size: 1rem;
  width: 1.2rem;
  text-align: center;
  color: var(--color-toxic-bright);
}

.nav-label {
  font-family: var(--font-display);
  font-size: 0.82rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.is-collapsed .nav-label {
  display: none;
}

.nav-status {
  padding: 1rem;
  border-top: 1px solid var(--color-border);
}

.status-row {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  margin-bottom: 0.5rem;
}

.status-row:last-child {
  margin-bottom: 0;
}

.status-ico {
  flex-shrink: 0;
  display: inline-flex;
  align-items: flex-end;
  justify-content: center;
  width: 18px;
  height: 16px;
}

/* signal bars */
.signal-ico {
  gap: 2px;
}

.signal-ico i {
  width: 3px;
  background: var(--color-border-strong);
  border-radius: 1px;
  transition: background-color 0.25s ease, box-shadow 0.25s ease;
}

.signal-ico i:nth-child(1) { height: 25%; }
.signal-ico i:nth-child(2) { height: 50%; }
.signal-ico i:nth-child(3) { height: 75%; }
.signal-ico i:nth-child(4) { height: 100%; }

.signal-ico[data-bars="1"] i:nth-child(-n + 1),
.signal-ico[data-bars="2"] i:nth-child(-n + 2),
.signal-ico[data-bars="3"] i:nth-child(-n + 3),
.signal-ico[data-bars="4"] i:nth-child(-n + 4) {
  background: var(--color-signal);
  box-shadow: 0 0 5px rgba(134, 209, 106, 0.7);
}

.signal-ico[data-bars="0"] {
  animation: signal-search 1s steps(1, end) infinite;
}

@keyframes signal-search {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.35; }
}

/* radiation trefoil */
.rad-ico {
  color: var(--color-rad);
  transition: color 0.3s ease, filter 0.3s ease;
  animation: rad-spin 6s linear infinite;
}

.rad-ico.rad-nominal { color: var(--color-rad); filter: drop-shadow(0 0 4px rgba(134, 209, 106, 0.6)); }
.rad-ico.rad-elevated { color: var(--color-rad-warn); filter: drop-shadow(0 0 5px rgba(255, 181, 74, 0.7)); }
.rad-ico.rad-high {
  color: var(--color-rad-high);
  filter: drop-shadow(0 0 7px rgba(210, 59, 47, 0.85));
}

@keyframes rad-spin {
  to { transform: rotate(360deg); }
}

.status-text {
  font-size: 0.7rem;
  color: var(--color-text-faint);
}

.status-text.is-danger {
  color: var(--color-rad-high);
  font-weight: 600;
}

.is-collapsed .status-text {
  display: none;
}

@media (prefers-reduced-motion: reduce) {
  .rad-ico,
  .signal-ico[data-bars="0"] {
    animation: none;
  }
}

@media (min-width: 900px) {
  .nav-panel {
    display: flex;
  }
}
</style>
