<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { marked } from 'marked'
import { t } from '../i18n'
import { GAMES, levels, levelsById } from '../data/levels'
import { fuzzyMatch } from '../utils/search'
import { handleInternalClick, linkify } from '../utils/wikiLinks'

const route = useRoute()
const router = useRouter()

marked.setOptions({ breaks: false, gfm: true })

const activeId = computed(() => route.params.id ?? '')
const activeLevel = computed(() => (activeId.value ? levelsById[activeId.value] : null))

const renderedBody = computed(() =>
  activeLevel.value ? linkify(marked.parse(activeLevel.value.body || '')) : '',
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
  () => activeLevel.value?.image && !brokenImages.value.has(activeLevel.value.id),
)

// ---- List filter ----
const search = ref('')
const searchInput = ref(null)

const filteredLevels = computed(() =>
  search.value ? levels.filter((level) => fuzzyMatch(search.value, level.title)) : levels,
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

// Press "/" to jump into the filter (unless already typing in a field).
function onKeydown(event) {
  if (event.key !== '/' || activeLevel.value) return
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

function backToList() {
  router.push({ name: 'levels' })
}
</script>

<template>
  <section class="levels-view">
    <!-- Detail page -->
    <template v-if="activeLevel">
      <button class="back-link" type="button" @click="backToList">{{ t('levels.backToList') }}</button>

      <article class="mx-panel level-detail">
        <header class="detail-header">
          <span class="mx-tag">{{ GAMES[activeLevel.game]?.label }} · {{ activeLevel.chapter }}</span>
          <h1>{{ activeLevel.title }}</h1>
          <p v-if="activeLevel.brief" class="detail-brief">{{ activeLevel.brief }}</p>
        </header>

        <figure v-if="showImage" class="detail-figure">
          <img
            :src="activeLevel.image"
            :alt="activeLevel.title"
            loading="lazy"
            referrerpolicy="no-referrer"
            @error="markBroken(activeLevel.id)"
          />
        </figure>

        <div class="markdown-body" v-html="renderedBody" @click="onBodyClick" />
      </article>
    </template>

    <!-- List page -->
    <template v-else>
      <header class="mx-panel view-header">
        <span class="mx-tag">{{ t('levels.tag') }}</span>
        <h1>{{ t('levels.title') }}</h1>
        <p>{{ t('levels.description') }}</p>
      </header>

      <div class="mx-panel toolbar">
        <input
          ref="searchInput"
          v-model="search"
          type="search"
          class="search-input"
          :placeholder="t('levels.searchPlaceholder')"
          aria-label="Filter levels"
        />
      </div>

      <div v-for="game in grouped" :key="game.id" class="game-block">
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

      <div v-if="!levels.length" class="mx-panel empty-state">
        <span class="empty-icon">◉</span>
        <h2>{{ t('levels.noDataTitle') }}</h2>
        <p>{{ t('levels.noDataText') }}</p>
      </div>

      <div v-else-if="!grouped.length" class="mx-panel empty-state">
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

.markdown-body {
  font-size: 0.92rem;
  line-height: 1.6;
  color: var(--color-text);
  max-width: 78ch;
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
