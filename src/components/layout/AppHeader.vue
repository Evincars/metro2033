<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import SettingsDialog from './SettingsDialog.vue'
import { enabled as audioEnabled, playing as audioPlaying } from '../../composables/useAmbientAudio'

const emit = defineEmits(['toggle-nav'])
const route = useRoute()
const base = import.meta.env.BASE_URL

const navLinks = [
  { to: '/', label: 'Surface' },
  { to: '/map', label: 'Metro Map' },
  { to: '/stations', label: 'Stations' },
  { to: '/factions', label: 'Factions' },
  { to: '/chronicles', label: 'Chronicles' },
  { to: '/about', label: 'Dossier' },
]

const mobileOpen = ref(false)
function toggleMobile() {
  mobileOpen.value = !mobileOpen.value
}

const settingsOpen = ref(false)
</script>

<template>
  <header class="app-header">
    <button
      class="burger"
      type="button"
      aria-label="Toggle navigation panel"
      @click="emit('toggle-nav')"
    >
      <span />
      <span />
      <span />
    </button>

    <RouterLink to="/" class="brand" aria-label="Metro 2033 — home">
      <img
        class="brand-logo"
        :src="`${base}metro2033-logo.png`"
        alt="Metro 2033"
        width="7331"
        height="2759"
      />
    </RouterLink>

    <nav class="primary-nav" aria-label="Primary">
      <RouterLink
        v-for="link in navLinks"
        :key="link.to"
        :to="link.to"
        class="nav-link"
        :class="{ 'is-active': route.path === link.to }"
      >
        {{ link.label }}
      </RouterLink>
    </nav>

    <button
      class="settings-toggle"
      type="button"
      aria-label="Open settings"
      :class="{ 'audio-live': audioEnabled && audioPlaying }"
      @click="settingsOpen = true"
    >
      <span class="gear" aria-hidden="true">⚙</span>
      <span class="audio-pip" aria-hidden="true" />
    </button>

    <button
      class="burger burger-mobile"
      type="button"
      aria-label="Toggle mobile menu"
      @click="toggleMobile"
    >
      <span />
      <span />
      <span />
    </button>

    <nav v-if="mobileOpen" class="mobile-nav" aria-label="Mobile">
      <RouterLink
        v-for="link in navLinks"
        :key="link.to"
        :to="link.to"
        class="nav-link"
        :class="{ 'is-active': route.path === link.to }"
        @click="mobileOpen = false"
      >
        {{ link.label }}
      </RouterLink>
    </nav>

    <SettingsDialog v-if="settingsOpen" @close="settingsOpen = false" />
  </header>
</template>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 30;
  height: var(--header-height);
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 0 1.25rem;
  background: linear-gradient(180deg, var(--color-panel) 0%, var(--color-bg-alt) 100%);
  border-bottom: 1px solid var(--color-border);
  box-shadow: var(--shadow-panel);
}

/* flickering emergency strip light along the top edge */
.app-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--color-amber);
  box-shadow: var(--glow-amber);
  animation: flicker 5s infinite steps(1, end);
}

@keyframes flicker {
  0%, 19%, 21%, 23%, 54%, 56%, 100% { opacity: 1; }
  20%, 22%, 55% { opacity: 0.45; }
}

.burger {
  display: none;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  width: 32px;
  height: 32px;
  background: transparent;
  border: 1px solid var(--color-border-strong);
  border-radius: 2px;
  cursor: pointer;
  flex-shrink: 0;
}

.burger span {
  display: block;
  height: 2px;
  background: var(--color-amber);
  margin: 0 6px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-shrink: 0;
}

.brand-logo {
  display: block;
  height: 34px;
  width: auto;
  object-fit: contain;
  filter: drop-shadow(0 0 6px rgba(210, 59, 47, 0.35));
  opacity: 0.95;
  transition: opacity 0.15s ease, filter 0.15s ease;
}

.brand:hover .brand-logo {
  opacity: 1;
  filter: drop-shadow(0 0 10px rgba(210, 59, 47, 0.55));
}

.primary-nav {
  display: none;
  align-items: center;
  gap: 0.25rem;
  margin-left: auto;
}

.nav-link {
  position: relative;
  font-family: var(--font-display);
  font-size: 0.85rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text-dim);
  padding: 0.6rem 0.75rem;
  border-radius: 2px;
  transition: color 0.15s ease, background-color 0.15s ease;
}

.nav-link:hover {
  color: var(--color-amber-bright);
  background: rgba(232, 149, 42, 0.08);
}

.nav-link.is-active {
  color: var(--color-amber-bright);
}

.nav-link.is-active::after {
  content: '';
  position: absolute;
  left: 0.75rem;
  right: 0.75rem;
  bottom: 0.2rem;
  height: 2px;
  background: var(--color-amber);
  box-shadow: var(--glow-amber);
}

.mobile-nav {
  position: absolute;
  top: var(--header-height);
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  background: var(--color-panel);
  border-bottom: 1px solid var(--color-border);
  box-shadow: var(--shadow-panel);
}

.mobile-nav .nav-link {
  padding: 0.9rem 1.25rem;
  border-bottom: 1px solid var(--color-border);
}

/* settings gear (top-right corner) */
.settings-toggle {
  position: relative;
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  background: transparent;
  border: 1px solid var(--color-border-strong);
  border-radius: 2px;
  color: var(--color-steel);
  cursor: pointer;
  flex-shrink: 0;
  transition: color 0.15s ease, border-color 0.15s ease, background-color 0.15s ease;
}

.settings-toggle:hover {
  color: var(--color-steel-bright);
  border-color: var(--color-steel);
  background: rgba(133, 190, 214, 0.08);
}

.gear {
  font-size: 1.05rem;
  line-height: 1;
}

.settings-toggle.audio-live .gear {
  animation: gear-turn 8s linear infinite;
}

@keyframes gear-turn {
  to { transform: rotate(360deg); }
}

.audio-pip {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: transparent;
}

.settings-toggle.audio-live .audio-pip {
  background: var(--color-signal);
  box-shadow: 0 0 6px rgba(134, 209, 106, 0.85);
}

@media (min-width: 900px) {
  .primary-nav {
    display: flex;
  }
  .burger-mobile {
    display: none;
  }
  .burger {
    display: flex;
  }
  .settings-toggle {
    margin-left: 0.35rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .settings-toggle.audio-live .gear {
    animation: none;
  }
}
</style>
