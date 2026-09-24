<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { marked } from 'marked'
import { CREATURE_CATEGORIES, MUTANT_GROUPS, mutants, mutantsById } from '../data/mutants'
import { fuzzyMatch } from '../utils/search'
import { handleInternalClick, linkify } from '../utils/wikiLinks'
import { t } from '../i18n'

const route = useRoute()
const router = useRouter()
marked.setOptions({ breaks: false, gfm: true })

const GROUP_LABELS = {
  'Mutant Animals': t('mutants.groupMutantAnimals'),
  'Plant Mutants': t('mutants.groupPlantMutants'),
  'Supernatural Phenomena': t('mutants.groupSupernatural'),
}

const CREATURE_LABELS = {
  terrestrial: t('mutants.groupTerrestrial'),
  avian: t('mutants.groupAvian'),
  aquatic: t('mutants.groupAquatic'),
  plantLife: t('mutants.groupPlantLife'),
  humanoids: t('mutants.groupHumanoids'),
  supernatural: t('mutants.groupSupernaturalPhenomena'),
}

const activeId = computed(() => route.params.id ?? '')
const activeMutant = computed(() => (activeId.value ? mutantsById[activeId.value] : null))

const renderedBody = computed(() =>
  activeMutant.value ? linkify(marked.parse(activeMutant.value.body || '')) : '',
)

const brokenImages = ref(new Set())
function markBroken(id) {
  const next = new Set(brokenImages.value)
  next.add(id)
  brokenImages.value = next
}
const showImage = computed(
  () => activeMutant.value?.image && !brokenImages.value.has(activeMutant.value.id),
)

function onBodyClick(event) {
  handleInternalClick(event, router)
}

const search = ref('')
const searchInput = ref(null)

const filtered = computed(() =>
  search.value ? mutants.filter((m) => fuzzyMatch(search.value, m.title)) : mutants,
)

const grouped = computed(() =>
  MUTANT_GROUPS.map((group) => ({
    group,
    label: GROUP_LABELS[group],
    items: filtered.value.filter((m) => m.group === group),
  })).filter((g) => g.items.length),
)

const creatureNav = computed(() =>
  CREATURE_CATEGORIES.map((cat) => ({
    label: CREATURE_LABELS[cat.key],
    items: cat.ids.map((id) => mutantsById[id]).filter(Boolean),
  })),
)

function onKeydown(event) {
  if (event.key !== '/' || activeMutant.value) return
  const tag = document.activeElement?.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA') return
  event.preventDefault()
  searchInput.value?.focus()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))

function openMutant(id) {
  router.push({ name: 'mutant-detail', params: { id } })
}
function backToList() {
  router.push({ name: 'mutants' })
}
</script>

<template>
  <section class="mutants-view">
    <!-- Detail -->
    <template v-if="activeMutant">
      <button class="back-link" type="button" @click="backToList">{{ t('mutants.backToList') }}</button>

      <article class="mx-panel mutant-detail">
        <header class="detail-header">
          <span class="mx-tag">{{ GROUP_LABELS[activeMutant.group] }}</span>
          <h1>{{ activeMutant.title }}</h1>
          <p v-if="activeMutant.brief" class="detail-brief">{{ activeMutant.brief }}</p>
          <p v-if="activeMutant.appearances" class="detail-appearances">
            <strong>{{ t('mutants.appearances') }}:</strong> {{ activeMutant.appearances }}
          </p>
        </header>

        <figure v-if="showImage" class="detail-figure">
          <img
            :src="activeMutant.image"
            :alt="activeMutant.title"
            loading="lazy"
            referrerpolicy="no-referrer"
            @error="markBroken(activeMutant.id)"
          />
        </figure>

        <div class="markdown-body" v-html="renderedBody" @click="onBodyClick" />

        <a
          v-if="activeMutant.wiki"
          class="fandom-link"
          :href="`https://metrovideogame.fandom.com/wiki/${activeMutant.wiki}`"
          target="_blank"
          rel="noopener"
        >{{ t('mutants.fandomLink') }}</a>
      </article>
    </template>

    <!-- List -->
    <template v-else>
      <header class="mx-panel view-header">
        <span class="mx-tag">{{ t('mutants.tag') }}</span>
        <h1>{{ t('mutants.title') }}</h1>
        <p>{{ t('mutants.description') }}</p>
      </header>

      <div class="mx-panel toolbar">
        <input
          ref="searchInput"
          v-model="search"
          type="search"
          class="search-input"
          :placeholder="t('mutants.searchPlaceholder')"
          aria-label="Filter mutants"
        />
      </div>

      <div v-for="group in grouped" :key="group.group" class="cat-block">
        <h2 class="cat-title">{{ group.label }}</h2>
        <ul class="mutant-grid">
          <li v-for="m in group.items" :key="m.id">
            <button class="mutant-card mx-panel" type="button" @click="openMutant(m.id)">
              <img
                v-if="m.image && !brokenImages.has(m.id)"
                class="mutant-portrait"
                :src="m.image"
                :alt="m.title"
                loading="lazy"
                referrerpolicy="no-referrer"
                @error="markBroken(m.id)"
              />
              <span v-else class="mutant-portrait placeholder" aria-hidden="true">☣</span>
              <span class="mutant-meta">
                <span class="mutant-name">{{ m.title }}</span>
                <span v-if="m.brief" class="mutant-brief">{{ m.brief }}</span>
              </span>
            </button>
          </li>
        </ul>
      </div>

      <div v-if="!grouped.length" class="mx-panel empty-state">
        <span class="empty-icon">☣</span>
        <h2>{{ t('mutants.noMatches') }}</h2>
        <p>{{ t('mutants.noMatchesText') }} "{{ search }}".</p>
      </div>

      <!-- Creatures of the Metro Series navbox -->
      <div class="mx-panel creatures-navbox">
        <h2 class="navbox-title">{{ t('mutants.creaturesTitle') }}</h2>
        <div v-for="cat in creatureNav" :key="cat.label" class="navbox-row">
          <span class="navbox-group">{{ cat.label }}</span>
          <span class="navbox-items">
            <template v-for="(item, i) in cat.items" :key="item.id">
              <template v-if="i > 0"> · </template>
              <RouterLink :to="`/mutants/${item.id}`" class="navbox-link">{{ item.title }}</RouterLink>
            </template>
          </span>
        </div>
      </div>
    </template>
  </section>
</template>

<style scoped>
.mutants-view {
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

.mutant-grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 0.7rem;
}

.mutant-card {
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

.mutant-card:hover {
  border-color: var(--color-border-strong);
  box-shadow: var(--glow-amber);
  transform: translateY(-1px);
}

.mutant-portrait {
  width: 48px;
  height: 48px;
  object-fit: cover;
  flex-shrink: 0;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--color-border);
}

.mutant-portrait.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-toxic-bright);
  font-size: 1.4rem;
}

.mutant-meta {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
}

.mutant-name {
  font-family: var(--font-display);
  font-size: 1rem;
  color: var(--color-amber-bright);
}

.mutant-brief {
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

.mutant-detail {
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

.detail-appearances {
  margin: 0.4rem 0 0;
  font-family: var(--font-mono);
  font-size: 0.78rem;
  color: var(--color-text-faint);
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

.markdown-body :deep(ul) {
  padding-left: 1.2rem;
  color: var(--color-text-dim);
}

.markdown-body :deep(li) {
  margin-bottom: 0.3rem;
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
  color: var(--color-toxic-bright);
}

/* Creatures of the Metro Series navbox */
.creatures-navbox {
  padding: 1.25rem 1.5rem;
}

.navbox-title {
  font-size: 1rem;
  margin-bottom: 0.8rem;
  padding-bottom: 0.4rem;
  border-bottom: 1px solid var(--color-border-strong);
}

.navbox-row {
  display: flex;
  gap: 1rem;
  padding: 0.45rem 0;
  border-bottom: 1px solid var(--color-border);
  align-items: baseline;
}

.navbox-row:last-child {
  border-bottom: none;
}

.navbox-group {
  flex-shrink: 0;
  width: 160px;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-faint);
  font-weight: 600;
}

.navbox-items {
  font-size: 0.82rem;
  line-height: 1.6;
  color: var(--color-text-dim);
}

.navbox-link {
  color: var(--color-amber);
}

.navbox-link:hover {
  color: var(--color-amber-bright);
}

@media (max-width: 600px) {
  .navbox-row {
    flex-direction: column;
    gap: 0.2rem;
  }

  .navbox-group {
    width: auto;
  }
}
</style>
