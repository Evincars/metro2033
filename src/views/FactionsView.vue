<script setup>
const factions = [
  { name: 'Order of the Rangers', tag: 'Polis', desc: 'Guardians of the old world\'s remaining knowledge and technology.' },
  { name: 'Hanseatic League', tag: 'Ring Line', desc: 'Merchant alliance controlling trade along the circle line stations.' },
  { name: 'Red Line', tag: 'Sokolnicheskaya', desc: 'Communist remnant enforcing order through ideology and numbers.' },
  { name: 'Fourth Reich', tag: 'Belorusskaya', desc: 'Fascist faction guarding the western tunnels with an iron fist.' },
  { name: 'Polis', tag: 'Neutral', desc: 'Independent city-state and last bastion of pre-war culture.' },
  { name: 'D6', tag: 'Classified', desc: 'A secret military facility whispered about in every station.' },
]
</script>

<template>
  <section class="factions-view">
    <header class="mx-panel view-header">
      <span class="mx-tag">Faction dossier</span>
      <h1>Factions</h1>
      <p>The powers that carved up the tunnels. Know their colors before you cross a border.</p>
    </header>

    <div class="grid">
      <article v-for="f in factions" :key="f.name" class="mx-panel faction-card">
        <span class="mx-tag">{{ f.tag }}</span>
        <h3>{{ f.name }}</h3>
        <p>{{ f.desc }}</p>
      </article>
    </div>
  </section>
</template>

<style scoped>
.factions-view {
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

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.25rem;
}

.faction-card {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.faction-card h3 {
  margin: 0.2rem 0;
  font-size: 1rem;
}

.faction-card p {
  margin: 0;
  font-size: 0.9rem;
}
</style>
