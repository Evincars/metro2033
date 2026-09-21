<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from './components/layout/AppHeader.vue'
import NavPanel from './components/layout/NavPanel.vue'
import { initAmbientAudio } from './composables/useAmbientAudio'

const route = useRoute()
const navCollapsed = ref(false)
function toggleNav() {
  navCollapsed.value = !navCollapsed.value
}

const showNav = computed(() => !!route.meta.leftMenu)

onMounted(() => {
  initAmbientAudio()
})
</script>

<template>
  <div class="app-shell">
    <AppHeader @toggle-nav="toggleNav" />
    <div class="app-body">
      <NavPanel v-if="showNav" :collapsed="navCollapsed" />
      <main class="app-main" :class="{ 'is-wide': !showNav }">
        <RouterView />
      </main>
    </div>
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

.app-main {
  flex: 1;
  min-width: 0;
  padding: 1.5rem;
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
