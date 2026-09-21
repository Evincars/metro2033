<script setup>
import { onMounted, ref } from 'vue'
import AppHeader from './components/layout/AppHeader.vue'
import NavPanel from './components/layout/NavPanel.vue'
import { initAmbientAudio } from './composables/useAmbientAudio'

const navCollapsed = ref(false)
function toggleNav() {
  navCollapsed.value = !navCollapsed.value
}

onMounted(() => {
  initAmbientAudio()
})
</script>

<template>
  <div class="app-shell">
    <AppHeader @toggle-nav="toggleNav" />
    <div class="app-body">
      <NavPanel :collapsed="navCollapsed" />
      <main class="app-main">
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

@media (min-width: 900px) {
  .app-main {
    padding: 2rem 2.5rem;
  }
}
</style>
