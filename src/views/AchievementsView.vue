<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { marked } from 'marked'
import { ACHIEVEMENT_GROUPS, achievements, achievementsById } from '../data/achievements'
import { fuzzyMatch } from '../utils/search'
import { handleInternalClick, linkify } from '../utils/wikiLinks'
import { t } from '../i18n'

const base = import.meta.env.BASE_URL
const route = useRoute()
const router = useRouter()
marked.setOptions({ breaks: false, gfm: true })

const GROUP_LABELS = {
  'Metro 2033': t('achievements.groupM2033'),
  'Metro Last Light': t('achievements.groupMLL'),
  'Metro 2033 Redux': t('achievements.groupM2033R'),
  'Metro Last Light Redux': t('achievements.groupMLLR'),
  'Metro Exodus': t('achievements.groupME'),
}

const activeId = computed(() => route.params.id ?? '')
const activeItem = computed(() => (activeId.value ? achievementsById[activeId.value] : null))

const renderedBody = computed(() =>
  activeItem.value ? linkify(marked.parse(activeItem.value.body || '')) : '',
)

const brokenImages = ref(new Set())
function markBroken(id) {
  const next = new Set(brokenImages.value)
  next.add(id)
  brokenImages.value = next
}

function onBodyClick(event) {
  handleInternalClick(event, router)
}

const search = ref('')
const searchInput = ref(null)

const filtered = computed(() =>
  search.value ? achievements.filter((e) => fuzzyMatch(search.value, e.title) || fuzzyMatch(search.value, e.brief)) : achievements,
)

const grouped = computed(() =>
  ACHIEVEMENT_GROUPS.map((group) => ({
    group,
    label: GROUP_LABELS[group],
    items: filtered.value.filter((e) => e.group === group),
  })).filter((g) => g.items.length),
)

function onKeydown(event) {
  if (event.key !== '/' || activeItem.value) return
  const tag = document.activeElement?.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA') return
  event.preventDefault()
  searchInput.value?.focus()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))

function openItem(id) {
  router.push({ name: 'achievement-detail', params: { id } })
}
function backToList() {
  router.push({ name: 'achievements' })
}

function imgSrc(item) {
  if (!item.image) return ''
  return `${base}achievement-imgs/${item.image}`
}

function scoreClass(score) {
  if (!score) return ''
  const s = score.toLowerCase()
  if (s.includes('gold') || s.includes('platinum')) return 'score-gold'
  if (s.includes('silver')) return 'score-silver'
  if (s.includes('bronze')) return 'score-bronze'
  return 'score-gs'
}
</script>

<template>
  <section class="achievements-view">
    <!-- Detail -->
    <template v-if="activeItem">
      <button class="back-link" type="button" @click="backToList">{{ t('achievements.backToList') }}</button>

      <article class="mx-panel detail">
        <header class="detail-header">
          <span class="mx-tag">{{ GROUP_LABELS[activeItem.group] }} · {{ activeItem.category }}</span>
          <h1>{{ activeItem.title }}</h1>
          <p v-if="activeItem.brief" class="detail-brief">{{ activeItem.brief }}</p>
          <p v-if="activeItem.score" class="detail-score">
            <span class="score-badge" :class="scoreClass(activeItem.score)">{{ activeItem.score }}</span>
          </p>
        </header>

        <figure v-if="imgSrc(activeItem) && !brokenImages.has(activeItem.id)" class="detail-figure">
          <img
            :src="imgSrc(activeItem)"
            :alt="activeItem.title"
            loading="lazy"
            referrerpolicy="no-referrer"
            @error="markBroken(activeItem.id)"
          />
        </figure>

        <div class="markdown-body" v-html="renderedBody" @click="onBodyClick" />

        <a
          class="fandom-link"
          :href="`https://metrovideogame.fandom.com/wiki/${activeItem.wiki}`"
          target="_blank"
          rel="noopener"
        >{{ t('achievements.fandomLink') }}</a>
      </article>
    </template>

    <!-- List -->
    <template v-else>
      <header class="mx-panel view-header">
        <span class="mx-tag">{{ t('achievements.tag') }}</span>
        <h1>{{ t('achievements.title') }}</h1>
        <p>{{ t('achievements.description') }}</p>
      </header>

      <div class="mx-panel toolbar">
        <input
          ref="searchInput"
          v-model="search"
          type="search"
          class="search-input"
          :placeholder="t('achievements.searchPlaceholder')"
          aria-label="Filter achievements"
        />
      </div>

      <div v-for="g in grouped" :key="g.group" class="game-block">
        <div class="game-header">
          <span class="game-title">{{ g.label }}</span>
          <span class="game-count">[ {{ g.items.length }} ]</span>
        </div>

        <table class="ach-table">
          <tbody>
            <tr
              v-for="item in g.items"
              :key="item.id"
              class="ach-row"
              @click="openItem(item.id)"
            >
              <td class="ach-icon-cell">
                <img
                  v-if="imgSrc(item) && !brokenImages.has(item.id)"
                  class="ach-icon"
                  :src="imgSrc(item)"
                  :alt="item.title"
                  loading="lazy"
                  referrerpolicy="no-referrer"
                  @error="markBroken(item.id)"
                />
                <span v-else class="ach-icon placeholder" aria-hidden="true">&#x1F3C6;</span>
              </td>
              <td class="ach-info">
                <span class="ach-name">{{ item.title }}</span>
                <span class="ach-brief">{{ item.brief }}</span>
              </td>
              <td class="ach-category-cell">
                <span class="ach-category">{{ item.category }}</span>
              </td>
              <td class="ach-score-cell">
                <span v-if="item.score" class="score-badge" :class="scoreClass(item.score)">{{ item.score }}</span>
              </td>
              <td class="ach-go" aria-hidden="true">&#x203A;</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="!grouped.length" class="mx-panel empty-state">
        <h2>{{ t('achievements.noMatches') }}</h2>
        <p>{{ t('achievements.noMatchesText') }} "{{ search }}".</p>
      </div>
    </template>
  </section>
</template>

<style scoped>
.achievements-view {
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

.game-block {
  display: flex;
  flex-direction: column;
}

.game-header {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.6rem 1rem;
  border-left: 3px solid var(--color-amber);
  background: linear-gradient(90deg, rgba(232, 149, 42, 0.10) 0%, transparent 60%);
}

.game-title {
  font-family: var(--font-display);
  font-size: 1rem;
  color: var(--color-amber-bright);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.game-count {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  color: var(--color-text-faint);
}

.ach-table {
  width: 100%;
  border-collapse: collapse;
  background: var(--color-panel);
  border: 1px solid var(--color-border);
  border-top: none;
}

.ach-row {
  cursor: pointer;
  border-bottom: 1px solid var(--color-border);
  transition: background-color 0.12s ease;
}

.ach-row:hover {
  background: rgba(232, 149, 42, 0.06);
}

.ach-row:last-child {
  border-bottom: none;
}

.ach-row td {
  padding: 0.5rem 0.6rem;
  vertical-align: middle;
}

.ach-icon-cell {
  width: 42px;
  padding-left: 0.8rem;
}

.ach-icon {
  width: 36px;
  height: 36px;
  object-fit: cover;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--color-border);
  display: block;
}

.ach-icon.placeholder {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--color-border);
  border-radius: 4px;
}

.ach-info {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.ach-name {
  font-family: var(--font-display);
  font-size: 0.88rem;
  color: var(--color-text);
}

.ach-brief {
  font-size: 0.75rem;
  line-height: 1.35;
  color: var(--color-text-dim);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.ach-category-cell {
  width: 120px;
  text-align: center;
}

.ach-category {
  font-family: var(--font-mono);
  font-size: 0.65rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-text-faint);
  padding: 0.15rem 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 2px;
  white-space: nowrap;
}

.ach-score-cell {
  width: 70px;
  text-align: center;
}

.score-badge {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.03em;
  padding: 0.15rem 0.45rem;
  border-radius: 2px;
  white-space: nowrap;
}

.score-gs {
  color: var(--color-amber-bright);
  background: rgba(232, 149, 42, 0.15);
  border: 1px solid rgba(232, 149, 42, 0.3);
}

.score-gold {
  color: #ffd700;
  background: rgba(255, 215, 0, 0.12);
  border: 1px solid rgba(255, 215, 0, 0.3);
}

.score-silver {
  color: #c0c0c0;
  background: rgba(192, 192, 192, 0.12);
  border: 1px solid rgba(192, 192, 192, 0.3);
}

.score-bronze {
  color: #cd7f32;
  background: rgba(205, 127, 50, 0.12);
  border: 1px solid rgba(205, 127, 50, 0.3);
}

.ach-go {
  width: 24px;
  font-size: 1.2rem;
  color: var(--color-text-faint);
  text-align: center;
  transition: color 0.12s ease;
}

.ach-row:hover .ach-go {
  color: var(--color-amber);
}

/* Detail */
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

.detail {
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

.detail-score {
  margin: 0.5rem 0 0;
}

.detail-figure {
  margin: 1.25rem 0;
  max-width: 80px;
}

.detail-figure img {
  max-width: 100%;
  border: 1px solid var(--color-border-strong);
  box-shadow: var(--shadow-panel);
  border-radius: 4px;
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

@media (max-width: 700px) {
  .ach-category-cell {
    display: none;
  }
}

@media (max-width: 480px) {
  .ach-icon-cell {
    display: none;
  }
  .ach-score-cell {
    width: 50px;
  }
}
</style>
