<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <section class="home">
    <div class="hero mx-panel">
      <span class="mx-tag">Line 1 · VDNKh — Exhibition</span>
      <h1>Life goes on,<br />even at the end of the world.</h1>
      <p class="lede">
        The surface is dead. Below, in the tunnels of the Moscow Metro, the last survivors
        huddle around their fires — trading, fighting, praying that whatever is left up there
        never finds a way down here.
      </p>
      <div class="hero-actions">
        <RouterLink to="/map" class="btn btn-primary">Open Metro Map</RouterLink>
        <RouterLink to="/stations" class="btn btn-ghost">Browse Stations</RouterLink>
      </div>
    </div>

    <div class="grid">
      <article class="mx-panel card">
        <span class="card-code">02</span>
        <h3>Cartography</h3>
        <p>
          A living map of the tunnels — line by line, station by station — charted from
          survivor reports and Ranger patrol logs.
        </p>
      </article>
      <article class="mx-panel card">
        <span class="card-code">04</span>
        <h3>Factions</h3>
        <p>
          Rangers, Hansa merchants, Red Line zealots, Reich patrols — know who holds each
          station before you step off the platform.
        </p>
      </article>
      <article class="mx-panel card">
        <span class="card-code">05</span>
        <h3>Chronicles</h3>
        <p>
          Field notes, rumors and diary pages collected from the tunnels — the unofficial
          record of life underground.
        </p>
      </article>
    </div>
  </section>
</template>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.hero {
  position: relative;
  padding: 2.5rem;
  overflow: hidden;
}

.hero::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 85% 20%, rgba(232, 149, 42, 0.12), transparent 55%);
  pointer-events: none;
}

.hero h1 {
  font-size: clamp(1.6rem, 4vw, 2.6rem);
  margin: 0.9rem 0 1rem;
  color: var(--color-text);
  max-width: 20ch;
}

.lede {
  max-width: 60ch;
  color: var(--color-text-dim);
}

.hero-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1.5rem;
  flex-wrap: wrap;
}

.btn {
  font-family: var(--font-display);
  font-size: 0.85rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 0.75rem 1.4rem;
  border-radius: 2px;
  border: 1px solid var(--color-border-strong);
  transition: all 0.15s ease;
}

.btn-primary {
  background: var(--color-rust);
  border-color: var(--color-rust);
  color: var(--color-bg);
}

.btn-primary:hover {
  background: var(--color-amber);
  border-color: var(--color-amber);
  color: var(--color-bg);
  box-shadow: var(--glow-amber);
}

.btn-ghost {
  color: var(--color-text);
  background: transparent;
}

.btn-ghost:hover {
  border-color: var(--color-amber);
  color: var(--color-amber-bright);
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.25rem;
}

.card {
  position: relative;
  padding: 1.5rem;
}

.card-code {
  position: absolute;
  top: 1rem;
  right: 1.1rem;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--color-text-faint);
}

.card h3 {
  font-size: 1rem;
  margin-bottom: 0.5rem;
}

.card p {
  font-size: 0.9rem;
  margin: 0;
}
</style>
