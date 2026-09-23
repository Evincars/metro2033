<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import SettingsDialog from './SettingsDialog.vue'
import ReleaseNotesDialog from './ReleaseNotesDialog.vue'
import { APP_VERSION } from '../../data/release'
import { enabled as audioEnabled, playing as audioPlaying } from '../../composables/useAmbientAudio'
import { logoStyle } from '../../composables/useLogoStyle'
import { t, locale, LOCALES, setLocale } from '../../i18n'

const emit = defineEmits(['toggle-nav'])
const route = useRoute()
const base = import.meta.env.BASE_URL

const navLinks = [
  { to: '/', labelKey: 'nav.vdnh' },
  { to: '/games', labelKey: 'nav.games' },
  { to: '/books', labelKey: 'nav.books' },
  { to: '/about', labelKey: 'nav.about' },
]

// The VDNH item owns every left-menu section (Map, Stations, Levels, …), so it
// stays active across all of them; the others match their own path.
function isActive(link) {
  if (link.to === '/') return !!route.meta.leftMenu
  return route.path === link.to || route.path.startsWith(`${link.to}/`)
}

const mobileOpen = ref(false)
function toggleMobile() {
  mobileOpen.value = !mobileOpen.value
}

const settingsOpen = ref(false)
const notesOpen = ref(false)
const hasLeftMenu = computed(() => !!route.meta.leftMenu)
</script>

<template>
  <header class="app-header">
    <button
      v-if="hasLeftMenu"
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
      <span
        v-if="logoStyle === 'universe'"
        class="brand-shield"
        :style="{ backgroundImage: `url('${base}book-art/logotype_main.png')` }"
        role="img"
        aria-label="Metro 2033"
      />
      <img
        v-else
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
        :class="{ 'is-active': isActive(link) }"
      >
        {{ t(link.labelKey) }}
      </RouterLink>
    </nav>

    <div class="lang-switcher" aria-label="Language">
      <button
        v-for="loc in LOCALES"
        :key="loc.code"
        type="button"
        class="lang-btn"
        :class="{ 'is-active': locale === loc.code }"
        @click="setLocale(loc.code)"
      >{{ loc.label }}</button>
    </div>

    <button
      class="notes-toggle"
      type="button"
      aria-label="Release notes"
      title="Release notes"
      @click="notesOpen = true"
    >
      <span class="notes-badge">v{{ APP_VERSION }}</span>
    </button>

    <button
      class="settings-toggle"
      type="button"
      aria-label="Open settings"
      :class="{ 'audio-live': audioEnabled && audioPlaying }"
      @click="settingsOpen = true"
    >
      <svg class="gear" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M19.14 12.94a7.4 7.4 0 0 0 0-1.88l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96a7.03 7.03 0 0 0-1.63-.94l-.36-2.54a.5.5 0 0 0-.5-.42h-3.84a.5.5 0 0 0-.5.42l-.36 2.54c-.59.24-1.13.56-1.63.94l-2.39-.96a.5.5 0 0 0-.6.22L2.71 8.84a.5.5 0 0 0 .12.64l2.03 1.58a7.4 7.4 0 0 0 0 1.88l-2.03 1.58a.5.5 0 0 0-.12.64l1.92 3.32c.13.22.39.3.6.22l2.39-.96c.5.38 1.04.7 1.63.94l.36 2.54c.04.24.25.42.5.42h3.84c.25 0 .46-.18.5-.42l.36-2.54c.59-.24 1.13-.56 1.63-.94l2.39.96c.22.08.47 0 .6-.22l1.92-3.32a.5.5 0 0 0-.12-.64l-2.03-1.58ZM12 15.6a3.6 3.6 0 1 1 0-7.2 3.6 3.6 0 0 1 0 7.2Z"
        />
      </svg>
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
        :class="{ 'is-active': isActive(link) }"
        @click="mobileOpen = false"
      >
        {{ t(link.labelKey) }}
      </RouterLink>
      <div class="mobile-lang">
        <button
          v-for="loc in LOCALES"
          :key="loc.code"
          type="button"
          class="lang-btn"
          :class="{ 'is-active': locale === loc.code }"
          @click="setLocale(loc.code)"
        >{{ loc.label }}</button>
      </div>
    </nav>

    <SettingsDialog v-if="settingsOpen" @close="settingsOpen = false" />
    <ReleaseNotesDialog v-if="notesOpen" @close="notesOpen = false" />
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

/* On mobile/tablet both burgers show: the left one opens the section drawer,
   the right one the primary nav. */
.burger {
  display: flex;
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
  filter: drop-shadow(0 0 10px rgba(210, 59, 47, 0.55));
  opacity: 1;
  transition: filter 0.15s ease;
}

.brand:hover .brand-logo {
  filter: drop-shadow(0 0 14px rgba(210, 59, 47, 0.75));
}

/* Original shield logo: a two-frame sprite (191×142 each), the right frame is
   the hover state. It hangs below the header so its bottom edge overlaps the
   left menu. */
.brand:has(.brand-shield) {
  align-self: flex-start;
  margin-top: 6px;
  position: relative;
  z-index: 1;
}

.brand-shield {
  display: block;
  height: 92px;
  filter: drop-shadow(0 6px 10px rgba(0, 0, 0, 0.7));
  aspect-ratio: 191 / 142;
  background-repeat: no-repeat;
  background-size: 200% 100%;
  background-position: left center;
}

.brand:hover .brand-shield,
.brand:focus-visible .brand-shield {
  background-position: right center;
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

.lang-switcher {
  display: none;
  align-items: center;
  gap: 2px;
  margin-left: auto;
}

.lang-btn {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.06em;
  padding: 0.25rem 0.45rem;
  background: transparent;
  border: 1px solid var(--color-border-strong);
  border-radius: 2px;
  color: var(--color-text-dim);
  cursor: pointer;
  transition: color 0.15s ease, border-color 0.15s ease, background-color 0.15s ease;
}

.lang-btn:hover {
  color: var(--color-amber-bright);
  border-color: var(--color-amber);
  background: rgba(232, 149, 42, 0.08);
}

.lang-btn.is-active {
  color: var(--color-amber-bright);
  border-color: var(--color-amber);
  background: rgba(232, 149, 42, 0.12);
}

.mobile-lang {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid var(--color-border);
}

/* release notes + settings buttons (top-right corner) */
.notes-toggle {
  position: relative;
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  height: 34px;
  padding: 0 0.5rem;
  background: transparent;
  border: 1px solid var(--color-border-strong);
  border-radius: 2px;
  color: var(--color-amber);
  cursor: pointer;
  flex-shrink: 0;
  transition: color 0.15s ease, border-color 0.15s ease, background-color 0.15s ease;
}

.notes-toggle:hover {
  color: var(--color-amber-bright);
  border-color: var(--color-amber);
  background: rgba(232, 149, 42, 0.08);
}

.notes-badge {
  display: block;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  line-height: 1;
  letter-spacing: 0.03em;
}

.settings-toggle {
  position: relative;
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
  display: block;
  width: 18px;
  height: 18px;
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

@media (max-width: 899px) {
  .brand-shield {
    height: 70px;
  }
}

@media (min-width: 900px) {
  .primary-nav {
    display: flex;
  }
  .lang-switcher {
    display: flex;
    margin-left: 0;
  }
  .burger-mobile {
    display: none;
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
