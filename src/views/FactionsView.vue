<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { marked } from 'marked'
import { factions, factionsById } from '../data/factions'
import { fuzzyMatch } from '../utils/search'
import { handleInternalClick, linkify } from '../utils/wikiLinks'

const route = useRoute()
const router = useRouter()
marked.setOptions({ breaks: false, gfm: true })

const CATEGORY_LABELS = { Major: 'Major factions', Minor: 'Minor factions', Other: 'Other groups' }

const activeId = computed(() => route.params.id ?? '')
const activeFaction = computed(() => (activeId.value ? factionsById[activeId.value] : null))

const renderedBody = computed(() =>
  activeFaction.value ? linkify(marked.parse(activeFaction.value.body || '')) : '',
)

const brokenImages = ref(new Set())
function markBroken(id) {
  const next = new Set(brokenImages.value)
  next.add(id)
  brokenImages.value = next
}
const showImage = computed(
  () => activeFaction.value?.image && !brokenImages.value.has(activeFaction.value.id),
)

function onBodyClick(event) {
  handleInternalClick(event, router)
}

const search = ref('')
const searchInput = ref(null)

const filtered = computed(() =>
  search.value ? factions.filter((f) => fuzzyMatch(search.value, f.title)) : factions,
)

const grouped = computed(() =>
  ['Major', 'Minor', 'Other']
    .map((category) => ({
      category,
      label: CATEGORY_LABELS[category],
      items: filtered.value.filter((f) => f.category === category),
    }))
    .filter((group) => group.items.length),
)

function onKeydown(event) {
  if (event.key !== '/' || activeFaction.value) return
  const tag = document.activeElement?.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA') return
  event.preventDefault()
  searchInput.value?.focus()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))

function openFaction(id) {
  router.push({ name: 'faction-detail', params: { id } })
}
function backToList() {
  router.push({ name: 'factions' })
}
</script>

<template>
  <section class="factions-view">
    <!-- Detail -->
    <template v-if="activeFaction">
      <button class="back-link" type="button" @click="backToList">← All factions</button>

      <article class="mx-panel faction-detail">
        <header class="detail-header">
          <span class="mx-tag">{{ activeFaction.tag || activeFaction.category }}</span>
          <h1>{{ activeFaction.title }}</h1>
          <p v-if="activeFaction.brief" class="detail-brief">{{ activeFaction.brief }}</p>
        </header>

        <figure v-if="showImage" class="detail-figure">
          <img
            :src="activeFaction.image"
            :alt="activeFaction.title"
            loading="lazy"
            referrerpolicy="no-referrer"
            @error="markBroken(activeFaction.id)"
          />
        </figure>

        <div class="markdown-body" v-html="renderedBody" @click="onBodyClick" />

        <a
          v-if="activeFaction.wiki"
          class="fandom-link"
          :href="`https://metrovideogame.fandom.com/wiki/${activeFaction.wiki}`"
          target="_blank"
          rel="noopener"
        >Read the full article on Fandom ↗</a>
      </article>
    </template>

    <!-- List -->
    <template v-else>
      <header class="mx-panel view-header">
        <span class="mx-tag">Faction dossier</span>
        <h1>Factions</h1>
        <p>
          The powers that carved up the tunnels — from the great blocs of Hanza, the Red Line and
          the Reich to the cults and outposts between them. Select a faction for the full dossier.
        </p>
      </header>

      <div class="mx-panel toolbar">
        <input
          ref="searchInput"
          v-model="search"
          type="search"
          class="search-input"
          placeholder="Filter factions…  (press / to focus)"
          aria-label="Filter factions"
        />
      </div>

      <div v-for="group in grouped" :key="group.category" class="cat-block">
        <h2 class="cat-title">{{ group.label }}</h2>
        <ul class="faction-grid">
          <li v-for="f in group.items" :key="f.id">
            <button class="faction-card mx-panel" type="button" @click="openFaction(f.id)">
              <img
                v-if="f.image"
                class="faction-emblem"
                :src="f.image"
                :alt="f.title"
                loading="lazy"
                referrerpolicy="no-referrer"
              />
              <span v-else class="faction-emblem placeholder" aria-hidden="true">⚑</span>
              <span class="faction-meta">
                <span class="faction-name">{{ f.title }}</span>
                <span v-if="f.tag" class="faction-tag">{{ f.tag }}</span>
                <span v-if="f.brief" class="faction-brief">{{ f.brief }}</span>
              </span>
            </button>
          </li>
        </ul>
      </div>

      <div v-if="!grouped.length" class="mx-panel empty-state">
        <span class="empty-icon">⚑</span>
        <h2>No matches</h2>
        <p>No faction matches “{{ search }}”.</p>
      </div>
    </template>
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

.faction-grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 0.7rem;
}

.faction-card {
  display: flex;
  align-items: flex-start;
  gap: 0.8rem;
  width: 100%;
  text-align: left;
  padding: 0.85rem 1rem;
  cursor: pointer;
  color: var(--color-text);
  transition: border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
}

.faction-card:hover {
  border-color: var(--color-border-strong);
  box-shadow: var(--glow-amber);
  transform: translateY(-1px);
}

.faction-emblem {
  width: 44px;
  height: 44px;
  object-fit: contain;
  flex-shrink: 0;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid var(--color-border);
}

.faction-emblem.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-faint);
  font-size: 1.3rem;
}

.faction-meta {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
}

.faction-name {
  font-family: var(--font-display);
  font-size: 1rem;
  color: var(--color-amber-bright);
}

.faction-tag {
  font-family: var(--font-mono);
  font-size: 0.66rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-text-faint);
}

.faction-brief {
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

.faction-detail {
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
  max-width: 78ch;
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

.empty-state {
  text-align: center;
  padding: 3rem 1.5rem;
}

.empty-icon {
  font-size: 2rem;
  color: var(--color-text-faint);
}
</style>
