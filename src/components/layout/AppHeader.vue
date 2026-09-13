<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const emit = defineEmits(['toggle-nav'])
const route = useRoute()

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

    <RouterLink to="/" class="brand">
      <span class="brand-mark">☢</span>
      <span class="brand-text">
        <span class="brand-title">METRO</span>
        <span class="brand-year">2033</span>
      </span>
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

.brand-mark {
  font-size: 1.4rem;
  color: var(--color-toxic-bright);
  text-shadow: var(--glow-toxic);
}

.brand-text {
  display: flex;
  align-items: baseline;
  gap: 0.4rem;
  font-family: var(--font-display);
}

.brand-title {
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  color: var(--color-text);
}

.brand-year {
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  color: var(--color-amber-bright);
  text-shadow: var(--glow-amber);
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
}
</style>
