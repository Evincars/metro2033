<script setup>
const books = [
  {
    year: '2005',
    title: 'Metro 2033',
    author: 'Dmitry Glukhovsky',
    blurb:
      'The novel that started it all. Artyom journeys from VDNKh across the Metro to reach Polis and stop the mysterious Dark Ones threatening the last survivors.',
  },
  {
    year: '2009',
    title: 'Metro 2034',
    author: 'Dmitry Glukhovsky',
    blurb:
      'A quieter, more literary sequel set around Sevastopolskaya — a besieged station, a silent gunman, and an old man searching for hope in the dark.',
  },
  {
    year: '2015',
    title: 'Metro 2035',
    author: 'Dmitry Glukhovsky',
    blurb:
      'Artyom returns, obsessed with proving life exists beyond Moscow, in a sharp, political close to the core trilogy.',
  },
  {
    year: '2009—',
    title: 'Universe of Metro 2033',
    author: 'Various authors',
    blurb:
      'A sprawling shared-world series expanding the setting far past Moscow — dozens of novels from many writers across the ruined world.',
  },
]
</script>

<template>
  <section class="books-view">
    <header class="mx-panel view-header">
      <span class="mx-tag">Archive · Print</span>
      <h1>Books</h1>
      <p>
        Dmitry Glukhovsky's novels and the wider Universe of Metro 2033 — the source
        material the tunnels were built from.
      </p>
    </header>

    <div class="entry-grid">
      <article v-for="book in books" :key="book.title" class="mx-panel entry">
        <span class="entry-year">{{ book.year }}</span>
        <h2 class="entry-title">{{ book.title }}</h2>
        <p class="entry-dev">{{ book.author }}</p>
        <p class="entry-blurb">{{ book.blurb }}</p>
      </article>
    </div>
  </section>
</template>

<style scoped>
.books-view {
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

.entry-grid {
  display: grid;
  gap: 1.25rem;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
}

.entry {
  position: relative;
  padding: 1.5rem 1.5rem 1.4rem;
}

.entry-year {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  color: var(--color-steel);
}

.entry-title {
  margin: 0.35rem 0 0.15rem;
  font-size: 1.15rem;
}

.entry-dev {
  margin: 0 0 0.7rem;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-faint);
}

.entry-blurb {
  margin: 0;
  font-size: 0.85rem;
  line-height: 1.5;
  color: var(--color-text-dim);
}
</style>
