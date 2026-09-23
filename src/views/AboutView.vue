<script setup>
import { t } from '../i18n'

const REPO = 'https://github.com/Evincars/metro2033'

const author = {
  name: 'Dmitry Glukhovsky',
  role: t('about.authorRole'),
  text: t('about.authorText'),
  href: 'https://www.glukhovsky.com/books',
  cta: t('about.authorCta'),
}

const credits = [
  {
    name: '4A Games',
    role: t('about.studioRole'),
    text: t('about.studioText'),
    href: 'https://www.4a-games.com.mt/',
    cta: '4a-games.com.mt',
  },
  {
    name: 'Metro Wiki',
    role: t('about.wikiRole'),
    text: t('about.wikiText'),
    href: 'https://metrovideogame.fandom.com/wiki/Metro_Wiki',
    cta: 'metrovideogame.fandom.com',
  },
  {
    name: 'Me',
    role: t('about.creatorRole'),
    text: t('about.creatorText'),
    href: 'https://lasak.netlify.app/',
    cta: 'lasak.netlify.app',
  },
]
</script>

<template>
  <section class="about-view">
    <header class="mx-panel view-header">
      <span class="mx-tag">{{ t('about.tag') }}</span>
      <h1>{{ t('about.title') }}</h1>
      <div class="intro">
        <p>{{ t('about.intro1') }}</p>
        <p>{{ t('about.intro2') }}</p>
        <p>{{ t('about.intro3') }}</p>
      </div>
    </header>

    <section class="credits" aria-label="Credits">
      <a class="mx-panel credit credit--author" :href="author.href" target="_blank" rel="noopener">
        <span class="credit-role">{{ author.role }}</span>
        <span class="credit-name">{{ author.name }}</span>
        <span class="credit-text">{{ author.text }}</span>
        <span class="credit-cta">{{ author.cta }} ↗</span>
      </a>

      <div class="credit-grid">
        <a
          v-for="c in credits"
          :key="c.name"
          class="mx-panel credit"
          :href="c.href"
          target="_blank"
          rel="noopener"
        >
          <span class="credit-role">{{ c.role }}</span>
          <span class="credit-name">{{ c.name }}</span>
          <span class="credit-text">{{ c.text }}</span>
          <span class="credit-cta">{{ c.cta }} ↗</span>
        </a>
      </div>
    </section>

    <div class="mx-panel stack-panel">
      <h2>{{ t('about.stackTitle') }}</h2>
      <ul>
        <li>Vue 3 + Vite</li>
        <li>Vue Router 4</li>
        <li>Leaflet (custom CRS map with station hotspots)</li>
        <li>Marked (markdown dossiers)</li>
        <li>Firebase Hosting, Disqus comments</li>
      </ul>
      <p class="contribute">{{ t('about.contribute') }}</p>
      <div class="repo-links">
        <a class="btn-metro" :href="REPO" target="_blank" rel="noopener">{{ t('about.githubRepo') }}</a>
        <a class="btn-metro" :href="`${REPO}/pulls`" target="_blank" rel="noopener">{{ t('about.createPr') }}</a>
        <a class="btn-metro" :href="`${REPO}/issues/new`" target="_blank" rel="noopener">{{ t('about.reportBug') }}</a>
      </div>
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

.intro {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  max-width: 68ch;
}

.intro p {
  margin: 0;
  line-height: 1.65;
  color: var(--color-text);
}

/* ---- credits ---- */
.credits {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.credit-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}

.credit {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 1.1rem 1.25rem 1.2rem;
  color: var(--color-text);
  text-decoration: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
}

.credit:hover {
  border-color: var(--color-border-strong);
  box-shadow: var(--glow-amber);
  transform: translateY(-1px);
}

.credit-role {
  font-family: var(--font-mono);
  font-size: 0.66rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-text-faint);
}

.credit-name {
  font-family: var(--font-display);
  font-size: 1.05rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-amber-bright);
}

.credit-text {
  flex: 1;
  font-size: 0.86rem;
  line-height: 1.55;
  color: var(--color-text-dim);
}

.credit-cta {
  margin-top: 0.3rem;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--color-amber);
}

/* Glukhovsky gets the spotlight: the whole universe starts with him. */
.credit--author {
  position: relative;
  padding: 1.6rem 1.75rem 1.7rem;
  border-color: var(--color-amber);
  box-shadow: var(--shadow-panel), var(--glow-amber);
  background:
    radial-gradient(ellipse at 0% 0%, rgba(232, 149, 42, 0.16) 0%, rgba(232, 149, 42, 0) 60%),
    var(--color-panel);
}

.credit--author .credit-name {
  font-family: 'Cinzel', 'Times New Roman', serif;
  font-size: 1.6rem;
  letter-spacing: 0.08em;
}

.credit--author .credit-text {
  max-width: 70ch;
  font-size: 0.95rem;
  color: var(--color-text);
}

/* ---- stack & contributing ---- */
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

.contribute {
  margin: 1rem 0 0;
  max-width: 68ch;
  line-height: 1.6;
  color: var(--color-text);
}

.repo-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
}
</style>
