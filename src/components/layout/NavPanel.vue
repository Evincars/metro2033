<script setup>
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
      <div class="status-row">
        <span class="status-dot" />
        <span class="nav-label status-text">Signal: stable</span>
      </div>
      <div class="status-row">
        <span class="status-dot status-dot--toxic" />
        <span class="nav-label status-text">Radiation: nominal</span>
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
  gap: 0.5rem;
  margin-bottom: 0.4rem;
}

.status-row:last-child {
  margin-bottom: 0;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-amber);
  box-shadow: var(--glow-amber);
  flex-shrink: 0;
}

.status-dot--toxic {
  background: var(--color-toxic-bright);
  box-shadow: var(--glow-toxic);
}

.status-text {
  font-size: 0.7rem;
  color: var(--color-text-faint);
}

@media (min-width: 900px) {
  .nav-panel {
    display: flex;
  }
}
</style>
