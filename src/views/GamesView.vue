<script setup>
const games = [
  {
    year: '2010',
    title: 'Metro 2033',
    dev: '4A Games',
    blurb:
      'The original survival-horror shooter. Artyom leaves VDNKh to warn the Metro of the Dark Ones — through irradiated tunnels, mutant nests and the ruined surface above.',
  },
  {
    year: '2013',
    title: 'Metro: Last Light',
    dev: '4A Games',
    blurb:
      'A direct sequel following the Rangers as factions race for a D6 doomsday cache. Refined stealth, gunplay and the signature gas-mask surface runs.',
  },
  {
    year: '2019',
    title: 'Metro Exodus',
    dev: '4A Games',
    blurb:
      'Artyom and the Spartans leave Moscow aboard the Aurora, crossing a post-war Russia of open, seasonal sandboxes stretched across a full year.',
  },
]
</script>

<template>
  <section class="games-view">
    <header class="mx-panel view-header">
      <span class="mx-tag">Archive · Interactive</span>
      <h1>Games</h1>
      <p>
        The Metro series — 4A Games' adaptations of Dmitry Glukhovsky's novels, from the
        claustrophobic tunnels of Moscow to the open wastes beyond.
      </p>
    </header>

    <div class="entry-grid">
      <article v-for="game in games" :key="game.title" class="mx-panel entry">
        <span class="entry-year">{{ game.year }}</span>
        <h2 class="entry-title">{{ game.title }}</h2>
        <p class="entry-dev">{{ game.dev }}</p>
        <p class="entry-blurb">{{ game.blurb }}</p>
      </article>
    </div>
  </section>
</template>

<style scoped>
.games-view {
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
