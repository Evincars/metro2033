<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { marked } from 'marked'
import { t } from '../i18n'
import { GAMES, levels, levelsById } from '../data/levels'
import { collectibles, collectiblesById } from '../data/collectibles'
import { fuzzyMatch } from '../utils/search'
import { handleInternalClick, linkify } from '../utils/wikiLinks'

const route = useRoute()
const router = useRouter()

marked.setOptions({ breaks: false, gfm: true })

const activeId = computed(() => route.params.id ?? '')
const isCollectible = computed(() => route.name === 'collectible-detail')
const activeEntry = computed(() => {
  if (!activeId.value) return null
  return isCollectible.value ? collectiblesById[activeId.value] : levelsById[activeId.value]
})

const renderedBody = computed(() =>
  activeEntry.value ? linkify(marked.parse(activeEntry.value.body || '')) : '',
)

// Intercept clicks on rewritten links and route within the SPA.
function onBodyClick(event) {
  handleInternalClick(event, router)
}

// Fandom blocks hot-linked images by referer; any that still fail are hidden.
const brokenImages = ref(new Set())
function markBroken(id) {
  const next = new Set(brokenImages.value)
  next.add(id)
  brokenImages.value = next
}
const showImage = computed(
  () => activeEntry.value?.image && !brokenImages.value.has(activeEntry.value.id),
)

// ---- Interactive map lightbox ----
const mapOpen = ref(false)
function openMap() {
  mapOpen.value = true
}
function closeMap() {
  mapOpen.value = false
}
// Never carry an open map over to the next level.
watch(activeId, closeMap)

// ---- Tabs ----
// Kept in the URL so a tab survives a refresh and can be linked to.
const tab = computed(() => (route.query.tab === 'collectibles' ? 'collectibles' : 'levels'))
function selectTab(next) {
  search.value = ''
  router.push({ name: 'levels', query: next === 'collectibles' ? { tab: next } : {} })
}

// ---- List filter ----
const search = ref('')
const searchInput = ref(null)

const filteredLevels = computed(() =>
  search.value ? levels.filter((level) => fuzzyMatch(search.value, level.title)) : levels,
)

const filteredCollectibles = computed(() =>
  search.value
    ? collectibles.filter(
        (entry) => fuzzyMatch(search.value, entry.title) || fuzzyMatch(search.value, entry.gameLabel),
      )
    : collectibles,
)

// Group filtered levels by game, then by chapter, preserving story order.
const grouped = computed(() => {
  const games = {}
  for (const level of filteredLevels.value) {
    const game = (games[level.game] ??= { ...GAMES[level.game], chapters: {} })
    const chapterKey = level.chapter || 'Levels'
    ;(game.chapters[chapterKey] ??= []).push(level)
  }
  return Object.values(games).map((game) => ({
    ...game,
    chapters: Object.entries(game.chapters).map(([name, items]) => ({ name, items })),
  }))
})

const visibleGames = computed(() => (tab.value === 'collectibles' ? [] : grouped.value))
const hasData = computed(() =>
  tab.value === 'collectibles' ? collectibles.length > 0 : levels.length > 0,
)
const hasMatches = computed(() =>
  tab.value === 'collectibles' ? filteredCollectibles.value.length > 0 : grouped.value.length > 0,
)

// Press "/" to jump into the filter (unless already typing in a field).
function onKeydown(event) {
  if (event.key !== '/' || activeEntry.value) return
  const tag = document.activeElement?.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA') return
  event.preventDefault()
  searchInput.value?.focus()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))

function openLevel(id) {
  router.push({ name: 'level-detail', params: { id } })
}

function openCollectible(id) {
  router.push({ name: 'collectible-detail', params: { id } })
}

function backToList() {
  router.push({ name: 'levels', query: isCollectible.value ? { tab: 'collectibles' } : {} })
}
</script>

<template>
  <section class="levels-view">
    <!-- Detail page -->
    <template v-if="activeEntry">
      <button class="back-link" type="button" @click="backToList">{{ t('levels.backToList') }}</button>

      <article class="mx-panel level-detail">
        <header class="detail-header">
          <span class="mx-tag">
            {{ GAMES[activeEntry.game]?.label }}<template v-if="activeEntry.chapter"> · {{ activeEntry.chapter }}</template>
          </span>
          <h1>{{ activeEntry.title }}</h1>
          <p v-if="activeEntry.brief" class="detail-brief">{{ activeEntry.brief }}</p>
        </header>

        <figure v-if="showImage" class="detail-figure">
          <img
            :src="activeEntry.image"
            :alt="activeEntry.title"
            loading="lazy"
            referrerpolicy="no-referrer"
            @error="markBroken(activeEntry.id)"
          />
        </figure>

        <div class="markdown-body" v-html="renderedBody" @click="onBodyClick" />

        <section v-if="activeEntry.map" class="map-section">
          <h2 class="map-title">{{ t('levels.mapTitle') }}</h2>
          <button class="map-thumb" type="button" @click="openMap">
            <img :src="activeEntry.map" :alt="`${activeEntry.title} map`" loading="lazy" />
          </button>
          <p class="map-hint">{{ t('levels.mapHint') }}</p>
        </section>

        <Teleport to="body">
          <div v-if="mapOpen" class="lightbox-overlay" @click.self="closeMap">
            <button class="lightbox-close" @click="closeMap">&times;</button>
            <img class="lightbox-img" :src="activeEntry.map" :alt="`${activeEntry.title} map`" />
          </div>
        </Teleport>

        <a
          v-if="activeEntry.wiki"
          class="fandom-link"
          :href="`https://metrovideogame.fandom.com/wiki/${activeEntry.wiki}`"
          target="_blank"
          rel="noopener"
        >{{ t('levels.fandomLink') }}</a>
      </article>
    </template>

    <!-- List page -->
    <template v-else>
      <header class="mx-panel view-header">
        <span class="mx-tag">{{ t('levels.tag') }}</span>
        <h1>{{ t('levels.title') }}</h1>
        <p>{{ t('levels.description') }}</p>
      </header>

      <div class="tab-bar" role="tablist">
        <button
          class="tab"
          :class="{ 'is-active': tab === 'levels' }"
          type="button"
          role="tab"
          :aria-selected="tab === 'levels'"
          @click="selectTab('levels')"
        >{{ t('levels.tabLevels') }}</button>
        <button
          class="tab"
          :class="{ 'is-active': tab === 'collectibles' }"
          type="button"
          role="tab"
          :aria-selected="tab === 'collectibles'"
          @click="selectTab('collectibles')"
        >{{ t('levels.tabCollectibles') }}</button>
      </div>

      <div class="mx-panel toolbar">
        <input
          ref="searchInput"
          v-model="search"
          type="search"
          class="search-input"
          :placeholder="tab === 'collectibles'
            ? t('levels.searchCollectiblesPlaceholder')
            : t('levels.searchPlaceholder')"
          :aria-label="tab === 'collectibles' ? 'Filter collectibles' : 'Filter levels'"
        />
      </div>

      <ul v-if="tab === 'collectibles'" class="collectible-grid">
        <li v-for="entry in filteredCollectibles" :key="entry.id">
          <button class="collectible-card mx-panel" type="button" @click="openCollectible(entry.id)">
            <img v-if="entry.image" class="collectible-img" :src="entry.image" :alt="entry.title" loading="lazy" />
            <span class="collectible-meta">
              <span class="collectible-game">{{ entry.gameLabel }}</span>
              <span class="collectible-name">{{ entry.title }}</span>
              <span v-if="entry.brief" class="collectible-brief">{{ entry.brief }}</span>
            </span>
          </button>
        </li>
      </ul>

      <div v-for="game in visibleGames" :key="game.id" class="game-block">
        <h2 class="game-title">{{ game.label }}</h2>
        <div v-for="chapter in game.chapters" :key="chapter.name" class="chapter-block">
          <h3 class="chapter-title">{{ chapter.name }}</h3>
          <ul class="level-grid">
            <li v-for="level in chapter.items" :key="level.id">
              <button class="level-card mx-panel" type="button" @click="openLevel(level.id)">
                <span class="level-order">{{ String(level.order).padStart(2, '0') }}</span>
                <span class="level-meta">
                  <span class="level-name">{{ level.title }}</span>
                  <span v-if="level.brief" class="level-brief">{{ level.brief }}</span>
                </span>
              </button>
            </li>
          </ul>
        </div>
      </div>

      <div v-if="!hasData" class="mx-panel empty-state">
        <span class="empty-icon">◉</span>
        <h2>{{ t('levels.noDataTitle') }}</h2>
        <p>{{ t('levels.noDataText') }}</p>
      </div>

      <div v-else-if="!hasMatches" class="mx-panel empty-state">
        <span class="empty-icon">◉</span>
        <h2>{{ t('levels.noMatches') }}</h2>
        <p>{{ t('levels.noMatchesText') }} “{{ search }}”.</p>
      </div>
    </template>
  </section>
</template>

<style scoped>
.levels-view {
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
  max-width: 70ch;
}

.toolbar {
  display: flex;
  gap: 1rem;
  align-items: center;
  padding: 0.9rem 1.1rem;
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

.game-block {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.game-title {
  font-family: var(--font-display);
  font-size: 1.35rem;
  color: var(--color-amber-bright);
  letter-spacing: 0.05em;
  margin: 0.5rem 0 0;
  padding-bottom: 0.4rem;
  border-bottom: 1px solid var(--color-border-strong);
}

.chapter-block {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.chapter-title {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text-faint);
  margin: 0.4rem 0 0;
}

.tab-bar {
  display: flex;
  gap: 0.25rem;
  border-bottom: 1px solid var(--color-border);
}

.tab {
  position: relative;
  font-family: var(--font-metro);
  font-size: 0.85rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text-dim);
  background: transparent;
  border: none;
  padding: 0.65rem 1rem;
  cursor: pointer;
  transition: color 0.15s ease, background-color 0.15s ease;
}

.tab:hover {
  color: var(--color-amber-bright);
  background: rgba(232, 149, 42, 0.06);
}

.tab.is-active {
  color: var(--color-amber-bright);
}

.tab.is-active::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -1px;
  height: 2px;
  background: var(--color-amber);
  box-shadow: var(--glow-amber);
}

.collectible-grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 0.75rem;
}

.collectible-card {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  text-align: left;
  padding: 0;
  overflow: hidden;
  cursor: pointer;
  color: var(--color-text);
  transition: border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
}

.collectible-card:hover {
  border-color: var(--color-border-strong);
  box-shadow: var(--glow-amber);
  transform: translateY(-1px);
}

.collectible-img {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  border-bottom: 1px solid var(--color-border);
}

.collectible-meta {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  padding: 0.85rem 1rem;
}

.collectible-game {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-amber);
}

.collectible-name {
  font-family: var(--font-metro);
  font-size: 0.95rem;
  letter-spacing: 0.04em;
}

.collectible-brief {
  font-size: 0.78rem;
  line-height: 1.5;
  color: var(--color-text-dim);
}

.level-grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 0.75rem;
}

.level-card {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  width: 100%;
  text-align: left;
  padding: 0.85rem 1rem;
  cursor: pointer;
  color: var(--color-text);
  transition: border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
}

.level-card:hover {
  border-color: var(--color-border-strong);
  box-shadow: var(--glow-amber);
  transform: translateY(-1px);
}

.level-order {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--color-amber);
  padding-top: 0.1rem;
}

.level-meta {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.level-name {
  font-family: var(--font-display);
  font-size: 1rem;
  color: var(--color-amber-bright);
}

.level-brief {
  font-size: 0.8rem;
  line-height: 1.4;
  color: var(--color-text-dim);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

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

.level-detail {
  padding: 1.75rem 2rem;
}

.detail-header h1 {
  margin: 0.5rem 0;
  font-size: 1.8rem;
}

.detail-brief {
  margin: 0;
  font-size: 0.95rem;
  color: var(--color-text-dim);
  max-width: 72ch;
}

.detail-figure {
  margin: 1.25rem 0;
}

.detail-figure img {
  max-width: 100%;
  border: 1px solid var(--color-border-strong);
  box-shadow: var(--shadow-panel);
}

/* Interactive map */
.map-section {
  margin-top: 1.5rem;
}

.map-title {
  font-family: var(--font-display);
  font-size: 1.1rem;
  color: var(--color-amber-bright);
  margin: 0 0 0.7rem;
  padding-bottom: 0.35rem;
  border-bottom: 1px solid var(--color-border-strong);
}

.map-thumb {
  display: block;
  width: 100%;
  max-width: 560px;
  cursor: zoom-in;
  border: 1px solid var(--color-border);
  background: rgba(0, 0, 0, 0.25);
  padding: 0;
  overflow: hidden;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.map-thumb:hover {
  border-color: var(--color-amber);
  box-shadow: var(--glow-amber);
}

.map-thumb img {
  width: 100%;
  height: auto;
  display: block;
}

.map-hint {
  margin: 0.5rem 0 0;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  color: var(--color-text-faint);
}

/* Lightbox */
.lightbox-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.92);
  display: flex;
  align-items: center;
  justify-content: center;
}

.lightbox-img {
  max-width: 90vw;
  max-height: 90vh;
  object-fit: contain;
  border: 1px solid var(--color-border-strong);
}

.lightbox-close {
  position: absolute;
  top: 1rem;
  right: 1.2rem;
  font-size: 2rem;
  color: var(--color-text);
  background: none;
  border: none;
  cursor: pointer;
  line-height: 1;
  z-index: 1;
}

.lightbox-close:hover {
  color: var(--color-amber-bright);
}

.fandom-link {
  display: inline-block;
  margin-top: 1.25rem;
  font-family: var(--font-mono);
  font-size: 0.78rem;
  color: var(--color-amber);
}

.markdown-body {
  font-size: 0.92rem;
  line-height: 1.6;
  color: var(--color-text);
  max-width: 78ch;
  overflow-wrap: break-word;
}

.markdown-body :deep(h2),
.markdown-body :deep(h3) {
  font-family: var(--font-display);
  color: var(--color-amber-bright);
  margin: 1.4rem 0 0.5rem;
}

.markdown-body :deep(a) {
  color: var(--color-amber);
}

.markdown-body :deep(a[data-internal]) {
  color: var(--color-amber-bright);
  border-bottom: 1px dashed currentColor;
  text-decoration: none;
}

.markdown-body :deep(img) {
  max-width: 100%;
  border: 1px solid var(--color-border);
}

.markdown-body :deep(ul) {
  padding-left: 1.2rem;
}

.markdown-body :deep(blockquote) {
  border-left: 2px solid var(--color-border-strong);
  margin: 1rem 0;
  padding: 0.3rem 0 0.3rem 1rem;
  color: var(--color-text-dim);
}

.empty-state {
  text-align: center;
  padding: 3rem 1.5rem;
}

.empty-icon {
  font-size: 2rem;
  color: var(--color-text-faint);
}
</style>
