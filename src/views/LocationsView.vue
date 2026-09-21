<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { marked } from 'marked'
import { LOCATION_CATEGORIES, locations, locationsById, metroLines } from '../data/locations'
import { fuzzyMatch } from '../utils/search'
import { handleInternalClick, linkify } from '../utils/wikiLinks'

const route = useRoute()
const router = useRouter()
marked.setOptions({ breaks: false, gfm: true })

const activeId = computed(() => route.params.id ?? '')
const activeLocation = computed(() => (activeId.value ? locationsById[activeId.value] : null))

const renderedBody = computed(() =>
  activeLocation.value ? linkify(marked.parse(activeLocation.value.body || '')) : '',
)

const brokenImages = ref(new Set())
function markBroken(id) {
  const next = new Set(brokenImages.value)
  next.add(id)
  brokenImages.value = next
}
const showImage = computed(
  () => activeLocation.value?.image && !brokenImages.value.has(activeLocation.value.id),
)

function onBodyClick(event) {
  handleInternalClick(event, router)
}

// ---- List filter ----
const search = ref('')
const searchInput = ref(null)

const filteredLocations = computed(() =>
  search.value ? locations.filter((loc) => fuzzyMatch(search.value, loc.title)) : locations,
)

const groupedLocations = computed(() =>
  LOCATION_CATEGORIES.map((category) => ({
    category,
    items: filteredLocations.value.filter((loc) => loc.category === category),
  })).filter((group) => group.items.length),
)

const filteredLines = computed(() =>
  search.value ? metroLines.filter((line) => fuzzyMatch(search.value, line.label)) : metroLines,
)

function onKeydown(event) {
  if (event.key !== '/' || activeLocation.value) return
  const tag = document.activeElement?.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA') return
  event.preventDefault()
  searchInput.value?.focus()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))

function openLocation(id) {
  router.push({ name: 'location-detail', params: { id } })
}
function openLine(id) {
  router.push({ name: 'metro-line', params: { id } })
}
function backToList() {
  router.push({ name: 'locations' })
}
</script>

<template>
  <section class="locations-view">
    <!-- Detail -->
    <template v-if="activeLocation">
      <button class="back-link" type="button" @click="backToList">← All locations</button>

      <article class="mx-panel location-detail">
        <header class="detail-header">
          <span class="mx-tag">{{ activeLocation.category }} location</span>
          <h1>{{ activeLocation.title }}</h1>
          <p v-if="activeLocation.brief" class="detail-brief">{{ activeLocation.brief }}</p>
        </header>

        <figure v-if="showImage" class="detail-figure">
          <img
            :src="activeLocation.image"
            :alt="activeLocation.title"
            loading="lazy"
            referrerpolicy="no-referrer"
            @error="markBroken(activeLocation.id)"
          />
        </figure>

        <div class="markdown-body" v-html="renderedBody" @click="onBodyClick" />

        <a
          v-if="activeLocation.wiki"
          class="fandom-link"
          :href="`https://metrovideogame.fandom.com/wiki/${activeLocation.wiki}`"
          target="_blank"
          rel="noopener"
        >Read the full article on Fandom ↗</a>
      </article>
    </template>

    <!-- List -->
    <template v-else>
      <header class="mx-panel view-header">
        <span class="mx-tag">Cartography</span>
        <h1>Locations</h1>
        <p>
          The stations, outposts and landmarks of post-apocalyptic Moscow, plus the twelve lines of
          the Moscow Metro. Open a line to see its stations — those featured in the games link to
          their dossier.
        </p>
      </header>

      <div class="mx-panel toolbar">
        <input
          ref="searchInput"
          v-model="search"
          type="search"
          class="search-input"
          placeholder="Filter locations & lines…  (press / to focus)"
          aria-label="Filter locations"
        />
      </div>

      <div v-for="group in groupedLocations" :key="group.category" class="cat-block">
        <h2 class="cat-title">{{ group.category }} locations</h2>
        <ul class="loc-grid">
          <li v-for="loc in group.items" :key="loc.id">
            <button class="loc-card mx-panel" type="button" @click="openLocation(loc.id)">
              <span class="loc-name">{{ loc.title }}</span>
              <span v-if="loc.brief" class="loc-brief">{{ loc.brief }}</span>
            </button>
          </li>
        </ul>
      </div>

      <div v-if="filteredLines.length" class="cat-block">
        <h2 class="cat-title">Moscow Metro — lines</h2>
        <ul class="line-grid">
          <li v-for="line in filteredLines" :key="line.id">
            <button class="line-card mx-panel" type="button" @click="openLine(line.id)">
              <span class="line-dot" :style="{ backgroundColor: line.color }" />
              <span class="line-meta">
                <span class="line-name">{{ line.label }}</span>
                <span class="line-count">{{ line.stations.length }} stations</span>
              </span>
            </button>
          </li>
        </ul>
      </div>

      <div v-if="!groupedLocations.length && !filteredLines.length" class="mx-panel empty-state">
        <span class="empty-icon">⌖</span>
        <h2>No matches</h2>
        <p>No location or line matches “{{ search }}”.</p>
      </div>
    </template>
  </section>
</template>

<style scoped>
.locations-view {
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

.toolbar {
  display: flex;
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

.cat-block {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.cat-title {
  font-family: var(--font-display);
  font-size: 1.15rem;
  color: var(--color-amber-bright);
  letter-spacing: 0.04em;
  margin: 0.4rem 0 0;
  padding-bottom: 0.35rem;
  border-bottom: 1px solid var(--color-border-strong);
}

.loc-grid,
.line-grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 0.7rem;
}

.loc-card {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  width: 100%;
  text-align: left;
  padding: 0.8rem 1rem;
  cursor: pointer;
  color: var(--color-text);
  transition: border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
}

.loc-card:hover,
.line-card:hover {
  border-color: var(--color-border-strong);
  box-shadow: var(--glow-amber);
  transform: translateY(-1px);
}

.loc-name {
  font-family: var(--font-display);
  font-size: 1rem;
  color: var(--color-amber-bright);
}

.loc-brief {
  font-size: 0.8rem;
  line-height: 1.4;
  color: var(--color-text-dim);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-card {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  width: 100%;
  text-align: left;
  padding: 0.8rem 1rem;
  cursor: pointer;
  color: var(--color-text);
}

.line-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.4);
}

.line-meta {
  display: flex;
  flex-direction: column;
}

.line-name {
  font-size: 0.9rem;
  color: var(--color-text);
}

.line-count {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  color: var(--color-text-faint);
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

.location-detail {
  padding: 1.75rem 2rem;
}

.detail-header h1 {
  margin: 0.5rem 0;
  font-size: 1.7rem;
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
  margin: 1.3rem 0 0.5rem;
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

.fandom-link {
  display: inline-block;
  margin-top: 1.25rem;
  font-family: var(--font-mono);
  font-size: 0.78rem;
  color: var(--color-amber);
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
