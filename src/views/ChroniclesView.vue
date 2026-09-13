<script setup>
const entries = [
  { date: 'Entry 001', title: 'The last train', body: 'Fragments of survivor testimony collected from the northern tunnels.' },
  { date: 'Entry 002', title: 'Voices in the dark', body: 'Reports of movement beyond the checkpoints remain unconfirmed.' },
  { date: 'Entry 003', title: 'Trade at the border', body: 'A record of goods, rumors, and tension exchanged between stations.' },
]
</script>

<template>
  <section class="chronicles-view">
    <header class="mx-panel view-header">
      <span class="mx-tag">Field archive</span>
      <h1>Chronicles</h1>
      <p>Notes, rumors and diary pages gathered from across the network.</p>
    </header>

    <ol class="timeline">
      <li v-for="entry in entries" :key="entry.date" class="mx-panel timeline-entry">
        <span class="entry-date">{{ entry.date }}</span>
        <h3>{{ entry.title }}</h3>
        <p>{{ entry.body }}</p>
      </li>
    </ol>
  </section>
</template>

<style scoped>
.chronicles-view {
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

.timeline {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.timeline-entry {
  padding: 1.25rem 1.5rem;
  border-left: 2px solid var(--color-amber);
}

.entry-date {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--color-text-faint);
  letter-spacing: 0.08em;
}

.timeline-entry h3 {
  margin: 0.4rem 0;
  font-size: 1rem;
}

.timeline-entry p {
  margin: 0;
  font-size: 0.9rem;
}
</style>
