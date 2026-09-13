<script setup></script>

<template>
  <section class="about-view">
    <header class="mx-panel view-header">
      <span class="mx-tag">Dossier</span>
      <h1>About</h1>
      <p>
        This is an unofficial, fan-made interactive companion inspired by the Metro 2033
        universe. Built with Vue 3, Vue Router and Leaflet for future map exploration.
      </p>
    </header>

    <div class="mx-panel stack-panel">
      <h2>Stack</h2>
      <ul>
        <li>Vue 3 + Vite</li>
        <li>Vue Router 4</li>
        <li>Leaflet (custom CRS map, prepared for station data)</li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.about-view {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.view-header {
  padding: 1.5rem 1.75rem;
}

.view-header h1 {
  margin: 0.5rem 0;
}

.view-header p {
  margin: 0;
  max-width: 60ch;
}

.stack-panel {
  padding: 1.5rem 1.75rem;
}

.stack-panel h2 {
  font-size: 1rem;
  margin-bottom: 0.75rem;
}

.stack-panel ul {
  margin: 0;
  padding-left: 1.2rem;
  color: var(--color-text-dim);
}
</style>
