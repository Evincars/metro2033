<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { marked } from 'marked'
import { CHARACTER_GROUPS, characters, charactersById } from '../data/characters'
import { fuzzyMatch } from '../utils/search'
import { handleInternalClick, linkify } from '../utils/wikiLinks'
import { t } from '../i18n'

const route = useRoute()
const router = useRouter()
marked.setOptions({ breaks: false, gfm: true })

const GROUP_LABELS = {
  Rangers: t('characters.groupRangers'),
  Associated: t('characters.groupAssociated'),
  Notable: t('characters.groupNotable'),
  'Last Light': t('characters.groupLastLight'),
}

const activeId = computed(() => route.params.id ?? '')
const activeCharacter = computed(() => (activeId.value ? charactersById[activeId.value] : null))

const renderedBody = computed(() =>
  activeCharacter.value ? linkify(marked.parse(activeCharacter.value.body || '')) : '',
)

const brokenImages = ref(new Set())
function markBroken(id) {
  const next = new Set(brokenImages.value)
  next.add(id)
  brokenImages.value = next
}
const showImage = computed(
  () => activeCharacter.value?.image && !brokenImages.value.has(activeCharacter.value.id),
)

function onBodyClick(event) {
  handleInternalClick(event, router)
}

const search = ref('')
const searchInput = ref(null)

const filtered = computed(() =>
  search.value ? characters.filter((c) => fuzzyMatch(search.value, c.title)) : characters,
)

const grouped = computed(() =>
  CHARACTER_GROUPS.map((group) => ({
    group,
    label: GROUP_LABELS[group],
    items: filtered.value.filter((c) => c.group === group),
  })).filter((g) => g.items.length),
)

function onKeydown(event) {
  if (event.key !== '/' || activeCharacter.value) return
  const tag = document.activeElement?.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA') return
  event.preventDefault()
  searchInput.value?.focus()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))

function openCharacter(id) {
  router.push({ name: 'character-detail', params: { id } })
}
function backToList() {
  router.push({ name: 'characters' })
}
</script>

<template>
  <section class="characters-view">
    <!-- Detail -->
    <template v-if="activeCharacter">
      <button class="back-link" type="button" @click="backToList">{{ t('characters.backToList') }}</button>

      <article class="mx-panel character-detail">
        <header class="detail-header">
          <span class="mx-tag">{{ GROUP_LABELS[activeCharacter.group] }}</span>
          <h1>{{ activeCharacter.title }}</h1>
          <p v-if="activeCharacter.brief" class="detail-brief">{{ activeCharacter.brief }}</p>
        </header>

        <figure v-if="showImage" class="detail-figure">
          <img
            :src="activeCharacter.image"
            :alt="activeCharacter.title"
            loading="lazy"
            referrerpolicy="no-referrer"
            @error="markBroken(activeCharacter.id)"
          />
        </figure>

        <div class="markdown-body" v-html="renderedBody" @click="onBodyClick" />

        <a
          v-if="activeCharacter.wiki"
          class="fandom-link"
          :href="`https://metrovideogame.fandom.com/wiki/${activeCharacter.wiki}`"
          target="_blank"
          rel="noopener"
        >{{ t('characters.fandomLink') }}</a>
      </article>
    </template>

    <!-- List -->
    <template v-else>
      <header class="mx-panel view-header">
        <span class="mx-tag">{{ t('characters.tag') }}</span>
        <h1>{{ t('characters.title') }}</h1>
        <p>
          {{ t('characters.description') }}
        </p>
      </header>

      <div class="mx-panel toolbar">
        <input
          ref="searchInput"
          v-model="search"
          type="search"
          class="search-input"
          :placeholder="t('characters.searchPlaceholder')"
          aria-label="Filter characters"
        />
      </div>

      <div v-for="group in grouped" :key="group.group" class="cat-block">
        <h2 class="cat-title">{{ group.label }}</h2>
        <ul class="char-grid">
          <li v-for="c in group.items" :key="c.id">
            <button class="char-card mx-panel" type="button" @click="openCharacter(c.id)">
              <img
                v-if="c.image"
                class="char-portrait"
                :src="c.image"
                :alt="c.title"
                loading="lazy"
                referrerpolicy="no-referrer"
              />
              <span v-else class="char-portrait placeholder" aria-hidden="true">☻</span>
              <span class="char-meta">
                <span class="char-name">{{ c.title }}</span>
                <span v-if="c.brief" class="char-brief">{{ c.brief }}</span>
              </span>
            </button>
          </li>
        </ul>
      </div>

      <div v-if="!grouped.length" class="mx-panel empty-state">
        <span class="empty-icon">☻</span>
        <h2>{{ t('characters.noMatches') }}</h2>
        <p>{{ t('characters.noMatchesText') }} “{{ search }}”.</p>
      </div>
    </template>
  </section>
</template>

<style scoped>
.characters-view {
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

.char-grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 0.7rem;
}

.char-card {
  display: flex;
  align-items: flex-start;
  gap: 0.8rem;
  width: 100%;
  text-align: left;
  padding: 0.8rem 0.9rem;
  cursor: pointer;
  color: var(--color-text);
  transition: border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
}

.char-card:hover {
  border-color: var(--color-border-strong);
  box-shadow: var(--glow-amber);
  transform: translateY(-1px);
}

.char-portrait {
  width: 48px;
  height: 48px;
  object-fit: cover;
  flex-shrink: 0;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--color-border);
}

.char-portrait.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-faint);
  font-size: 1.4rem;
}

.char-meta {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
}

.char-name {
  font-family: var(--font-display);
  font-size: 1rem;
  color: var(--color-amber-bright);
}

.char-brief {
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

.character-detail {
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
  max-width: 300px;
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

.markdown-body :deep(blockquote) {
  border-left: 2px solid var(--color-border-strong);
  margin: 1rem 0;
  padding: 0.3rem 0 0.3rem 1rem;
  color: var(--color-text-dim);
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
