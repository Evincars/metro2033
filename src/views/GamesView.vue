<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { marked } from 'marked'
import { games, gamesById } from '../data/games'
import { handleInternalClick, linkify } from '../utils/wikiLinks'
import { extractGallery } from '../utils/markdownGallery'
import ImageGallery from '../components/ImageGallery.vue'
import { t } from '../i18n'

const route = useRoute()
const router = useRouter()
marked.setOptions({ breaks: false, gfm: true })

const bannerUrl = `${import.meta.env.BASE_URL}book-art/map.jpg`

const activeId = computed(() => route.params.id ?? '')
const activeGame = computed(() => (activeId.value ? gamesById[activeId.value] : null))

// Split the article body: prose is rendered inline, images become a gallery.
const parsed = computed(() => {
  if (!activeGame.value) return { html: '', images: [] }
  const { body, images } = extractGallery(activeGame.value.body || '')
  return { html: linkify(marked.parse(body)), images }
})

const metaLine = computed(() => {
  const g = activeGame.value
  if (!g) return ''
  return [g.year, g.developer].filter(Boolean).join(' · ')
})

const brokenImages = ref(new Set())
function markBroken(id) {
  const next = new Set(brokenImages.value)
  next.add(id)
  brokenImages.value = next
}
const showImage = computed(
  () => activeGame.value?.image && !brokenImages.value.has(activeGame.value.id),
)

function onBodyClick(event) {
  handleInternalClick(event, router)
}

function openGame(id) {
  router.push({ name: 'game-detail', params: { id } })
}
function backToList() {
  router.push({ name: 'games' })
}
</script>

<template>
  <section class="games-view">
    <!-- Detail -->
    <template v-if="activeGame">
      <button class="back-link" type="button" @click="backToList">{{ t('games.backToList') }}</button>

      <article class="mx-panel game-detail">
        <header class="detail-header">
          <span class="mx-tag">{{ metaLine }}</span>
          <h1>{{ activeGame.title }}</h1>
          <dl class="detail-facts">
            <template v-if="activeGame.developer">
              <dt>{{ t('games.developer') }}</dt><dd>{{ activeGame.developer }}</dd>
            </template>
            <template v-if="activeGame.publisher">
              <dt>{{ t('games.publisher') }}</dt><dd>{{ activeGame.publisher }}</dd>
            </template>
            <template v-if="activeGame.genre">
              <dt>{{ t('games.genre') }}</dt><dd>{{ activeGame.genre }}</dd>
            </template>
            <template v-if="activeGame.platforms">
              <dt>{{ t('games.platforms') }}</dt><dd>{{ activeGame.platforms }}</dd>
            </template>
            <template v-if="activeGame.released">
              <dt>{{ t('games.released') }}</dt><dd>{{ activeGame.released }}</dd>
            </template>
          </dl>
        </header>

        <figure v-if="showImage" class="detail-figure">
          <img
            :src="activeGame.image"
            :alt="activeGame.title"
            loading="lazy"
            referrerpolicy="no-referrer"
            @error="markBroken(activeGame.id)"
          />
        </figure>

        <div class="markdown-body" v-html="parsed.html" @click="onBodyClick" />

        <ImageGallery :images="parsed.images" :title="t('games.screenshots')" />

        <a
          v-if="activeGame.wiki"
          class="fandom-link"
          :href="`https://metrovideogame.fandom.com/wiki/${activeGame.wiki}`"
          target="_blank"
          rel="noopener"
        >{{ t('games.fandomLink') }}</a>
      </article>
    </template>

    <!-- List -->
    <template v-else>
      <header class="games-banner" :style="{ backgroundImage: `url('${bannerUrl}')` }">
        <div class="games-banner-inner">
          <span class="mx-tag">{{ t('games.tag') }}</span>
          <h1>{{ t('games.title') }}</h1>
          <p>{{ t('games.description') }}</p>
        </div>
      </header>

      <ul class="games-grid">
        <li v-for="game in games" :key="game.id">
          <button class="game-card mx-panel" type="button" @click="openGame(game.id)">
            <span class="game-cover-frame">
              <img
                v-if="game.image"
                class="game-cover"
                :src="game.image"
                :alt="game.title"
                loading="lazy"
                referrerpolicy="no-referrer"
              />
              <span v-else class="game-cover placeholder" aria-hidden="true">🎮</span>
            </span>
            <span class="game-meta">
              <span class="game-year">{{ game.year }}</span>
              <span class="game-title">{{ game.title }}</span>
              <span v-if="game.developer" class="game-dev">{{ game.developer }}</span>
              <span v-if="game.brief" class="game-blurb">{{ game.brief }}</span>
            </span>
          </button>
        </li>
      </ul>
    </template>
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
  max-width: 72ch;
}

/* ---- map.jpg banner (list header) ----
   The old paper map sits under the header, framed on its left (western
   Russia / Moscow). A dark wash keeps the copy legible and fades the map out
   towards the right and bottom edges. */
.games-banner {
  position: relative;
  border: 1px solid var(--color-border-strong);
  background-color: #05070a;
  background-size: cover;
  background-position: 3% 35%;
  box-shadow: var(--shadow-panel);
  overflow: hidden;
  padding: 2.25rem 1.75rem 2.5rem;
}

.games-banner::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(5, 7, 10, 0) 55%, rgba(5, 7, 10, 0.75) 100%),
    linear-gradient(90deg, rgba(5, 7, 10, 0.4) 0%, rgba(5, 7, 10, 0.55) 50%, #05070a 100%);
  z-index: 0;
}

.games-banner-inner {
  position: relative;
  z-index: 1;
  max-width: 72ch;
}

.games-banner-inner h1 {
  margin: 0.5rem 0;
  font-family: 'Cinzel', 'Times New Roman', serif;
  letter-spacing: 0.08em;
}

.games-banner-inner h1,
.games-banner-inner p {
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.9);
}

.games-banner-inner p {
  margin: 0;
  color: var(--color-text);
}

/* ---- list grid ---- */
.games-grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}

.game-card {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  width: 100%;
  text-align: left;
  padding: 1rem 1.1rem;
  cursor: pointer;
  color: var(--color-text);
  transition: border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
}

.game-card:hover {
  border-color: var(--color-border-strong);
  box-shadow: var(--glow-amber);
  transform: translateY(-1px);
}

.game-cover-frame {
  flex-shrink: 0;
  width: 84px;
  aspect-ratio: 3 / 4;
  border: 1px solid var(--color-border-strong);
  background: rgba(0, 0, 0, 0.4);
  overflow: hidden;
}

.game-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.game-cover.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
  color: var(--color-text-faint);
}

.game-meta {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 0;
}

.game-year {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  color: var(--color-steel);
}

.game-title {
  font-family: var(--font-display);
  font-size: 1.1rem;
  color: var(--color-amber-bright);
}

.game-dev {
  font-family: var(--font-mono);
  font-size: 0.68rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-faint);
}

.game-blurb {
  margin-top: 0.2rem;
  font-size: 0.82rem;
  line-height: 1.45;
  color: var(--color-text-dim);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ---- detail ---- */
.back-link {
  align-self: flex-start;
  font-family: var(--font-mono);
  font-size: 0.8rem;
  letter-spacing: 0.06em;
  color: var(--color-amber);
  background: transparent;
  border: 1px solid var(--color-border-strong);
  padding: 0.4rem 0.8rem;
  border-radius: 2px;
  cursor: pointer;
}

.back-link:hover {
  color: var(--color-amber-bright);
  box-shadow: var(--glow-amber);
}

.game-detail {
  padding: 1.75rem 2rem;
}

.detail-header h1 {
  margin: 0.5rem 0 0.75rem;
  font-size: 1.7rem;
}

.detail-facts {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 0.25rem 1rem;
  margin: 0;
  font-size: 0.82rem;
}

.detail-facts dt {
  font-family: var(--font-mono);
  font-size: 0.68rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-faint);
  padding-top: 0.15rem;
}

.detail-facts dd {
  margin: 0;
  color: var(--color-text-dim);
}

.detail-figure {
  margin: 1.25rem 0;
  max-width: 260px;
}

.detail-figure img {
  max-width: 100%;
  border: 1px solid var(--color-border-strong);
  box-shadow: var(--shadow-panel);
  background: rgba(0, 0, 0, 0.25);
}

.markdown-body {
  font-size: 0.92rem;
  line-height: 1.6;
  color: var(--color-text);
  max-width: 80ch;
}

.markdown-body :deep(img) {
  max-width: 100%;
  height: auto;
  border: 1px solid var(--color-border-strong);
  box-shadow: var(--shadow-panel);
  margin: 0.75rem 0 0.25rem;
}

.markdown-body :deep(em) {
  color: var(--color-text-faint);
  font-size: 0.82rem;
}

.markdown-body :deep(blockquote) {
  margin: 1rem 0;
  padding-left: 1rem;
  border-left: 2px solid var(--color-amber);
  color: var(--color-text-dim);
  font-style: italic;
}

.markdown-body :deep(a) {
  color: var(--color-amber);
}

.markdown-body :deep(a[data-internal]) {
  color: var(--color-amber-bright);
  border-bottom: 1px dashed currentColor;
  text-decoration: none;
}

.fandom-link {
  display: inline-block;
  margin-top: 1.25rem;
  font-family: var(--font-mono);
  font-size: 0.78rem;
  color: var(--color-amber);
}
</style>
