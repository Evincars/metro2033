<script setup>
import { ref } from 'vue'

// Groundwork only: filter UI shell, wired to reactive state but with no
// station dataset behind it yet.
const search = ref('')
const activeLine = ref('all')

const lines = [
  { id: 'all', label: 'All lines' },
  { id: 'sokolnicheskaya', label: 'Line 1' },
  { id: 'zamoskvoretskaya', label: 'Line 2' },
  { id: 'arbatsko-pokrovskaya', label: 'Line 3' },
]
</script>

<template>
  <section class="stations-view">
    <header class="mx-panel view-header">
      <span class="mx-tag">Station registry</span>
      <h1>Stations</h1>
      <p>Directory of known stations. No records loaded yet — filters are ready for data.</p>
    </header>

    <div class="mx-panel toolbar">
      <input
        v-model="search"
        type="search"
        class="search-input"
        placeholder="Search stations…"
        aria-label="Search stations"
      />
      <div class="line-filters">
        <button
          v-for="line in lines"
          :key="line.id"
          type="button"
          class="chip"
          :class="{ 'is-active': activeLine === line.id }"
          @click="activeLine = line.id"
        >
          {{ line.label }}
        </button>
      </div>
    </div>

    <div class="mx-panel empty-state">
      <span class="empty-icon">●</span>
      <h2>No station data loaded</h2>
      <p>Station records will appear here once the cartography dataset is connected.</p>
    </div>
  </section>
</template>

<style scoped>
.stations-view {
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
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
  padding: 1rem 1.25rem;
}

.search-input {
  flex: 1;
  min-width: 200px;
  background: var(--color-bg-alt);
  border: 1px solid var(--color-border-strong);
  color: var(--color-text);
  font-family: var(--font-mono);
  padding: 0.55rem 0.8rem;
  border-radius: 2px;
}

.search-input:focus {
  outline: none;
  border-color: var(--color-amber);
  box-shadow: var(--glow-amber);
}

.line-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.chip {
  font-family: var(--font-display);
  font-size: 0.75rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-dim);
  background: transparent;
  border: 1px solid var(--color-border-strong);
  padding: 0.4rem 0.8rem;
  border-radius: 2px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.chip:hover {
  color: var(--color-amber-bright);
  border-color: var(--color-amber);
}

.chip.is-active {
  color: var(--color-bg);
  background: var(--color-amber);
  border-color: var(--color-amber);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 0.5rem;
  padding: 4rem 1.5rem;
  color: var(--color-text-faint);
}

.empty-icon {
  font-size: 1.75rem;
  color: var(--color-toxic-bright);
  text-shadow: var(--glow-toxic);
}

.empty-state h2 {
  font-size: 1rem;
  margin: 0;
}

.empty-state p {
  margin: 0;
  max-width: 40ch;
}
</style>
