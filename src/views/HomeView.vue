<script setup>
import { onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import DisqusThread from '../components/DisqusThread.vue'
import { t } from '../i18n'

const base = import.meta.env.BASE_URL

// count.js (index.html) scans for #disqus_thread links once on page load; after
// an in-app navigation back here, ask it to rescan so the count fills in.
onMounted(() => {
  window.DISQUSWIDGETS?.getCount({ reset: true })
})
const heroBg = `${base}book-art/main_men_1.jpg`
const leftEdge = `${base}book-art/main_left.jpg`
const rightEdge = `${base}book-art/main_right.jpg`

const destinations = [
  { to: '/map', code: '02', icon: '◈', titleKey: 'nav.metroMap', textKey: 'home.dest.metroMap' },
  { to: '/stations', code: '03', icon: '●', titleKey: 'nav.stations', textKey: 'home.dest.stations' },
  { to: '/factions', code: '04', icon: '⚑', titleKey: 'nav.factions', textKey: 'home.dest.factions' },
  { to: '/events', code: '05', icon: '▤', titleKey: 'nav.events', textKey: 'home.dest.events' },
  { to: '/levels', code: '06', icon: '◉', titleKey: 'nav.levels', textKey: 'home.dest.levels' },
  { to: '/locations', code: '07', icon: '⌖', titleKey: 'nav.locations', textKey: 'home.dest.locations' },
  { to: '/characters', code: '08', icon: '☻', titleKey: 'nav.characters', textKey: 'home.dest.characters' },
  { to: '/games', code: '★', icon: '🎮', titleKey: 'nav.games', textKey: 'home.dest.games' },
  { to: '/books', code: '★', icon: '📖', titleKey: 'nav.books', textKey: 'home.dest.books' },
]
</script>

<template>
  <section class="home">
    <div class="hero" :style="{ backgroundImage: `url('${heroBg}')` }">
      <span class="hero-frame left" :style="{ backgroundImage: `url('${leftEdge}')` }" aria-hidden="true" />
      <span class="hero-frame right" :style="{ backgroundImage: `url('${rightEdge}')` }" aria-hidden="true" />
      <div class="hero-inner">
        <span class="mx-tag">{{ t('home.tag') }}</span>
        <h1 v-html="t('home.heading')"></h1>
        <p class="lede">{{ t('home.lede') }}</p>
        <div class="hero-actions">
          <RouterLink to="/map" class="btn-metro">{{ t('home.openMap') }}</RouterLink>
          <RouterLink to="/stations" class="btn-metro">{{ t('home.browseStations') }}</RouterLink>
          <a href="#disqus_thread" class="btn-metro" data-disqus-identifier="vdnh-home">{{ t('home.comments') }}</a>
          <a href="https://www.deepsilver.com/games/metro2039" class="btn-metro" target="_blank" rel="noopener">{{ t('home.metro2039') }}</a>
        </div>
      </div>
    </div>

    <div class="crossroad">
      <h2 class="crossroad-title">{{ t('home.crossroadTitle') }}</h2>
      <div class="grid">
        <RouterLink v-for="d in destinations" :key="d.to" :to="d.to" class="mx-panel card">
          <span class="card-code">{{ d.code }}</span>
          <span class="card-icon" aria-hidden="true">{{ d.icon }}</span>
          <h3>{{ t(d.titleKey) }}</h3>
          <p>{{ t(d.textKey) }}</p>
          <span class="card-go" aria-hidden="true">{{ t('home.enter') }}</span>
        </RouterLink>
      </div>
    </div>

    <DisqusThread identifier="vdnh-home" title="VDNKh — Metro Universe" />
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
  min-height: 400px;
  display: flex;
  align-items: flex-end;
  overflow: hidden;
  border: 1px solid var(--color-border-strong);
  background-color: #05070a;
  background-size: cover;
  background-position: center top;
  box-shadow: var(--shadow-panel);
}

/* Dark wash so the survivor art reads but the text stays legible. */
.hero::after {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 82% 28%, rgba(232, 149, 42, 0.14), transparent 52%),
    linear-gradient(0deg, rgba(4, 6, 8, 0.94) 0%, rgba(4, 6, 8, 0.55) 45%, rgba(4, 6, 8, 0.2) 100%);
  pointer-events: none;
  z-index: 1;
}

/* main_left.jpg / main_right.jpg as grungy framing columns. */
.hero-frame {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 46px;
  background-size: cover;
  background-position: center;
  opacity: 0.9;
  z-index: 2;
  pointer-events: none;
}

.hero-frame.left {
  left: 0;
  background-position: left center;
  -webkit-mask-image: linear-gradient(90deg, #000 40%, transparent);
  mask-image: linear-gradient(90deg, #000 40%, transparent);
}

.hero-frame.right {
  right: 0;
  width: 60px;
  background-position: right center;
  -webkit-mask-image: linear-gradient(270deg, #000 40%, transparent);
  mask-image: linear-gradient(270deg, #000 40%, transparent);
}

.hero-inner {
  position: relative;
  z-index: 3;
  max-width: 60ch;
}

.hero h1 {
  font-family: var(--font-metro);
  font-size: clamp(1.6rem, 4vw, 2.6rem);
  margin: 0.9rem 0 1rem;
  color: var(--color-text);
  max-width: 20ch;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.85);
}

.lede {
  max-width: 60ch;
  color: var(--color-text-dim);
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.7);
}

.hero-actions {
  display: flex;
  gap: 2.2rem;
  margin-top: 1.5rem;
  flex-wrap: wrap;
  padding-left: 2rem;
}

.crossroad {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.crossroad-title {
  font-family: var(--font-metro);
  font-size: 1.15rem;
  color: var(--color-amber-bright);
  margin: 0.25rem 0 0;
  padding-bottom: 0.4rem;
  border-bottom: 1px solid var(--color-border-strong);
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.25rem;
}

.card {
  position: relative;
  display: block;
  padding: 1.5rem;
  color: var(--color-text);
  transition: border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
}

.card:hover {
  border-color: var(--color-amber);
  box-shadow: var(--glow-amber);
  transform: translateY(-2px);
}

.card-icon {
  display: block;
  font-size: 1.4rem;
  color: var(--color-toxic-bright);
  margin-bottom: 0.4rem;
}

.card-go {
  display: inline-block;
  margin-top: 0.8rem;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-amber);
  opacity: 0;
  transition: opacity 0.15s ease;
}

.card:hover .card-go {
  opacity: 1;
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
