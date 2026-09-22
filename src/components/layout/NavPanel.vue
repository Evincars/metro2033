<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { sectionPath } from '../../utils/breadcrumbs'

defineProps({
  collapsed: {
    type: Boolean,
    default: false,
  },
  open: {
    type: Boolean,
    default: false,
  },
})

const route = useRoute()

// Highlight the section the current route belongs to (detail pages included).
const activeSection = computed(() => sectionPath(route))

const navItems = [
  { to: '/', label: 'VDNH', code: '01', icon: '★' },
  { to: '/map', label: 'Metro Map', code: '02', icon: '◈' },
  { to: '/stations', label: 'Stations', code: '03', icon: '●' },
  { to: '/factions', label: 'Factions', code: '04', icon: '⚑' },
  { to: '/events', label: 'Events', code: '05', icon: '▤' },
  { to: '/levels', label: 'Levels', code: '06', icon: '◉' },
  { to: '/locations', label: 'Locations', code: '07', icon: '⌖' },
  { to: '/characters', label: 'Characters', code: '08', icon: '☻' },
]

/* ---- live gas-mask HUD: signal strength + radiation meter ---- */
// Dose-rate in mSv/h. Reference marks: 100 mSv significant dose, 800 mSv acute
// effects, 1000 mSv = 1 Sv/h (radiation sickness), 8 Sv/h lethal.
const RAD_MASK = 100 // significant dose — mask required
const RAD_IMMEDIATE = 800 // immediate health effects
const RAD_ACUTE = 1000 // 1 Sv/h — acute radiation sickness
const RAD_LETHAL = 8000 // 8 Sv/h — lethal

const signalBars = ref(3) // 0..4
const rad = ref(3.5) // mSv/h
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
  const r = rad.value
  if (r >= RAD_LETHAL) return 'lethal'
  if (r >= RAD_ACUTE) return 'critical'
  if (r >= RAD_IMMEDIATE) return 'high'
  if (r >= RAD_MASK) return 'elevated'
  return 'nominal'
})

const maskOn = computed(() => radLevel.value !== 'nominal')

const radStatus = computed(() => {
  switch (radLevel.value) {
    case 'elevated':
      return 'Mask needed'
    case 'high':
      return 'Immediate effects'
    case 'critical':
      return 'Acute radiation sickness'
    case 'lethal':
      return 'Lethal dose'
    default:
      return ''
  }
})

const radDisplay = computed(() => {
  const r = rad.value
  if (r >= 1000) return `${(r / 1000).toFixed(2)} Sv/h`
  if (r < 10) return `${r.toFixed(2)} mSv/h`
  if (r < 100) return `${r.toFixed(1)} mSv/h`
  return `${Math.round(r)} mSv/h`
})

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
  // multiplicative random walk so the meter roams the whole mSv → Sv scale,
  // with rare surges into radiation-sickness / lethal territory.
  const roll = Math.random()
  const r = rad.value
  let next
  if (roll < 0.07) next = r * (3 + Math.random() * 7) // hot-spot surge
  else if (roll < 0.2) next = r * (1.4 + Math.random()) // rising
  else if (roll > 0.62) next = r * (0.35 + Math.random() * 0.4) // decay
  else next = r + (Math.random() - 0.5) * r * 0.4 // jitter
  rad.value = clamp(next, 0.08, 9000)
  radTimer = window.setTimeout(tickRad, 1500 + Math.random() * 1100)
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
  <aside class="nav-panel" :class="{ 'is-collapsed': collapsed, 'is-open': open }">
    <nav class="nav-list" aria-label="Sections">
      <RouterLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="nav-item"
        :class="{ 'is-active': activeSection === item.to }"
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

      <div class="status-row" :title="`Radiation ${radDisplay}`">
        <span class="status-ico rad-ico" :class="`rad-${radLevel}`" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="18" height="18">
            <circle cx="12" cy="12" r="3.4" fill="currentColor" />
            <path fill="currentColor" d="M9.85 8.28 L6.7 2.82 A10.6 10.6 0 0 1 17.3 2.82 L14.15 8.28 A4.3 4.3 0 0 0 9.85 8.28 Z" />
            <path fill="currentColor" d="M9.85 8.28 L6.7 2.82 A10.6 10.6 0 0 1 17.3 2.82 L14.15 8.28 A4.3 4.3 0 0 0 9.85 8.28 Z" transform="rotate(120 12 12)" />
            <path fill="currentColor" d="M9.85 8.28 L6.7 2.82 A10.6 10.6 0 0 1 17.3 2.82 L14.15 8.28 A4.3 4.3 0 0 0 9.85 8.28 Z" transform="rotate(240 12 12)" />
          </svg>
        </span>
        <span class="nav-label status-text" :class="{ 'is-danger': maskOn }">
          Rad: {{ radDisplay }}<template v-if="radStatus"> — {{ radStatus }}</template>
        </span>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.nav-panel {
  position: fixed;
  top: var(--header-height);
  left: 0;
  height: calc(100vh - var(--header-height));
  width: var(--nav-panel-width);
  max-width: 82vw;
  z-index: 1500;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: linear-gradient(180deg, var(--color-panel) 0%, var(--color-bg-alt) 100%);
  border-right: 1px solid var(--color-border);
  box-shadow: 10px 0 28px rgba(0, 0, 0, 0.6);
  overflow-y: auto;
  transform: translateX(-100%);
  transition: transform 0.25s ease;
}

/* Mobile: slide the drawer in when opened. */
.nav-panel.is-open {
  transform: translateX(0);
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
  width: 20px;
  height: 18px;
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
  align-items: center;
  color: var(--color-rad);
  transition: color 0.3s ease, filter 0.3s ease;
  animation: rad-spin 6s linear infinite;
  overflow: visible;
}

.rad-ico svg {
  overflow: visible;
}

.rad-ico.rad-nominal { color: var(--color-rad); filter: drop-shadow(0 0 4px rgba(134, 209, 106, 0.6)); }
.rad-ico.rad-elevated { color: var(--color-rad-warn); filter: drop-shadow(0 0 5px rgba(255, 181, 74, 0.7)); }
.rad-ico.rad-high { color: var(--color-rad-high); filter: drop-shadow(0 0 6px rgba(210, 59, 47, 0.8)); }
.rad-ico.rad-critical { color: #ff5140; filter: drop-shadow(0 0 8px rgba(255, 60, 45, 0.9)); }
.rad-ico.rad-lethal { color: #ff2f1c; filter: drop-shadow(0 0 10px rgba(255, 40, 25, 1)); }

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
    position: sticky;
    max-width: none;
    z-index: auto;
    box-shadow: none;
    overflow: hidden;
    transform: none;
    transition: width 0.2s ease;
  }

  .nav-panel.is-collapsed {
    width: var(--nav-panel-width-collapsed);
  }
}
</style>
