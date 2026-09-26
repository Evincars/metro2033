<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from './components/layout/AppHeader.vue'
import NavPanel from './components/layout/NavPanel.vue'
import RadioSnackbar from './components/layout/RadioSnackbar.vue'
import { initAmbientAudio } from './composables/useAmbientAudio'
import { getBreadcrumbs } from './utils/breadcrumbs'

const route = useRoute()
const navCollapsed = ref(false) // desktop: collapse the sidebar to icons
const navOpen = ref(false) // mobile: slide the sidebar in as a drawer

const mobileMql = window.matchMedia('(max-width: 899px)')
const isMobile = ref(mobileMql.matches)
function onMqlChange(event) {
  isMobile.value = event.matches
  if (!event.matches) navOpen.value = false
}

function toggleNav() {
  if (isMobile.value) navOpen.value = !navOpen.value
  else navCollapsed.value = !navCollapsed.value
}

const showNav = computed(() => !!route.meta.leftMenu)
const crumbs = computed(() => getBreadcrumbs(route))

// Close the mobile drawer whenever the route changes.
watch(() => route.fullPath, () => {
  navOpen.value = false
})

onMounted(() => {
  initAmbientAudio()
  mobileMql.addEventListener('change', onMqlChange)
})
onBeforeUnmount(() => {
  mobileMql.removeEventListener('change', onMqlChange)
})
</script>

<template>
  <div class="app-shell">
    <AppHeader @toggle-nav="toggleNav" />
    <div class="app-body">
      <NavPanel v-if="showNav" :collapsed="navCollapsed" :open="navOpen" />
      <div v-if="showNav && navOpen" class="nav-backdrop" @click="navOpen = false" />
      <main class="app-main" :class="{ 'is-wide': !showNav }">
        <nav v-if="crumbs.length" class="breadcrumbs" aria-label="Breadcrumb">
          <template v-for="(crumb, i) in crumbs" :key="i">
            <RouterLink
              v-if="crumb.to && i < crumbs.length - 1"
              :to="crumb.to"
              class="crumb"
            >{{ crumb.label }}</RouterLink>
            <span v-else class="crumb is-current" aria-current="page">{{ crumb.label }}</span>
            <span v-if="i < crumbs.length - 1" class="crumb-sep" aria-hidden="true">/</span>
          </template>
        </nav>
        <RouterView :key="route.path" />
      </main>
    </div>
    <RadioSnackbar />
  </div>
</template>

<style scoped>
.app-shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-body {
  flex: 1;
  display: flex;
}

.nav-backdrop {
  position: fixed;
  inset: var(--header-height) 0 0 0;
  background: rgba(2, 3, 5, 0.6);
  backdrop-filter: blur(1px);
  z-index: 1400;
}

@media (min-width: 900px) {
  .nav-backdrop {
    display: none;
  }
}

.app-main {
  flex: 1;
  min-width: 0;
  padding: 1.5rem;
}

.breadcrumbs {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.1rem;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  letter-spacing: 0.05em;
}

.crumb {
  color: var(--color-text-dim);
  text-decoration: none;
}

.crumb:hover {
  color: var(--color-amber-bright);
}

.crumb.is-current {
  color: var(--color-amber);
}

.crumb-sep {
  color: var(--color-text-faint);
}

.app-main.is-wide {
  max-width: 1100px;
  margin: 0 auto;
  width: 100%;
}

@media (min-width: 900px) {
  .app-main {
    padding: 2rem 2.5rem;
  }
}
</style>
