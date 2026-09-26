<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { marked } from 'marked'
import { realMetroStations, realMetroById, REAL_METRO_LINE_COLORS } from '../data/realMetro'
import { fuzzyMatch } from '../utils/search'
import { t } from '../i18n'

const route = useRoute()
const router = useRouter()
marked.setOptions({ breaks: false, gfm: true })

const activeId = computed(() => route.params.id ?? '')
const activeStation = computed(() => (activeId.value ? realMetroById[activeId.value] : null))

const renderedBody = computed(() =>
  activeStation.value ? marked.parse(activeStation.value.body || '') : '',
)

const brokenImages = ref(new Set())
function markBroken(id) {
  const next = new Set(brokenImages.value)
  next.add(id)
  brokenImages.value = next
}

const search = ref('')
const searchInput = ref(null)
const activeLine = ref('all')

const lineChips = computed(() => {
  const lineSet = new Set(realMetroStations.map((s) => s.line))
  return [...lineSet]
    .sort((a, b) => a - b)
    .map((id) => {
      const sample = realMetroStations.find((s) => s.line === id)
      return {
        id,
        label: `${id}`,
        lineName: sample?.lineName || '',
        color: REAL_METRO_LINE_COLORS[id] || '#999',
      }
    })
})

const filtered = computed(() => {
  let list = realMetroStations
  if (activeLine.value !== 'all') {
    list = list.filter((s) => s.line === Number(activeLine.value))
  }
  if (search.value) {
    list = list.filter((s) => fuzzyMatch(search.value, s.title) || fuzzyMatch(search.value, s.titleRu))
  }
  return list
})

const grouped = computed(() => {
  const groups = {}
  for (const s of filtered.value) {
    const key = s.line
    if (!groups[key]) {
      const chip = lineChips.value.find((c) => c.id === key)
      groups[key] = { line: key, lineName: chip?.lineName || '', color: chip?.color || '#999', items: [] }
    }
    groups[key].items.push(s)
  }
  return Object.values(groups).sort((a, b) => a.line - b.line)
})

const galleryOpen = ref(false)
const galleryIndex = ref(0)
const galleryImages = computed(() => activeStation.value?.gallery || [])

function openGallery(idx) {
  galleryIndex.value = idx
  galleryOpen.value = true
}

function closeGallery() {
  galleryOpen.value = false
}

function galleryPrev() {
  galleryIndex.value = (galleryIndex.value - 1 + galleryImages.value.length) % galleryImages.value.length
}

function galleryNext() {
  galleryIndex.value = (galleryIndex.value + 1) % galleryImages.value.length
}

function onGalleryKey(e) {
  if (!galleryOpen.value) return
  if (e.key === 'Escape') closeGallery()
  else if (e.key === 'ArrowLeft') galleryPrev()
  else if (e.key === 'ArrowRight') galleryNext()
}

function onKeydown(event) {
  if (event.key !== '/' || activeStation.value) return
  const tag = document.activeElement?.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA') return
  event.preventDefault()
  searchInput.value?.focus()
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  window.addEventListener('keydown', onGalleryKey)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('keydown', onGalleryKey)
})

function openStation(id) {
  router.push({ name: 'real-metro-detail', params: { id } })
}
function backToList() {
  router.push({ name: 'real-metro' })
}
</script>

<template>
  <section class="real-metro-view">
    <!-- Detail -->
    <template v-if="activeStation">
      <button class="back-link" type="button" @click="backToList">{{ t('realMetro.backToList') }}</button>

      <article class="mx-panel station-detail">
        <header class="detail-header">
          <span class="mx-tag">
            <span class="line-dot" :style="{ backgroundColor: REAL_METRO_LINE_COLORS[activeStation.line] }" />
            {{ activeStation.lineName }}
          </span>
          <h1>{{ activeStation.title }}</h1>
          <span v-if="activeStation.titleRu && activeStation.titleRu !== activeStation.title" class="detail-title-ru">{{ activeStation.titleRu }}</span>
          <div class="detail-meta" v-if="activeStation.opened || activeStation.architects">
            <span v-if="activeStation.opened" class="meta-item">{{ activeStation.opened }}</span>
            <span v-if="activeStation.architects" class="meta-item">{{ activeStation.architects }}</span>
          </div>
        </header>

        <figure v-if="activeStation.image && !brokenImages.has(activeStation.id)" class="detail-figure">
          <img
            :src="activeStation.image"
            :alt="activeStation.title"
            loading="lazy"
            @error="markBroken(activeStation.id)"
            @click="openGallery(0)"
            class="clickable-img"
          />
        </figure>

        <div v-if="galleryImages.length > 1" class="gallery-thumbs">
          <img
            v-for="(url, idx) in galleryImages"
            :key="idx"
            :src="url"
            :alt="`${activeStation.title} ${idx + 1}`"
            class="gallery-thumb"
            referrerpolicy="no-referrer"
            loading="lazy"
            @click="openGallery(idx)"
          />
        </div>

        <div class="markdown-body" v-html="renderedBody" />

        <a
          v-if="activeStation.source"
          class="fandom-link"
          :href="activeStation.source"
          target="_blank"
          rel="noopener"
        >{{ t('realMetro.sourceLink') }}</a>
      </article>

      <!-- Fullscreen gallery overlay -->
      <Teleport to="body">
        <div v-if="galleryOpen" class="gallery-overlay" @click.self="closeGallery">
          <button class="gallery-close" @click="closeGallery">×</button>
          <button v-if="galleryImages.length > 1" class="gallery-arrow gallery-arrow-left" @click="galleryPrev">‹</button>
          <img
            :src="galleryImages[galleryIndex]"
            :alt="activeStation?.title"
            class="gallery-full-img"
            referrerpolicy="no-referrer"
          />
          <button v-if="galleryImages.length > 1" class="gallery-arrow gallery-arrow-right" @click="galleryNext">›</button>
          <span class="gallery-counter">{{ galleryIndex + 1 }} / {{ galleryImages.length }}</span>
        </div>
      </Teleport>
    </template>

    <!-- List -->
    <template v-else>
      <header class="mx-panel view-header">
        <span class="mx-tag">{{ t('realMetro.tag') }}</span>
        <h1>{{ t('realMetro.title') }}</h1>
        <p>{{ t('realMetro.description') }}</p>
      </header>

      <div class="mx-panel toolbar">
        <input
          ref="searchInput"
          v-model="search"
          type="search"
          class="search-input"
          :placeholder="t('realMetro.searchPlaceholder')"
          aria-label="Filter stations"
        />
        <div class="line-chips">
          <button
            class="line-chip"
            :class="{ active: activeLine === 'all' }"
            @click="activeLine = 'all'"
          >{{ t('realMetro.allLines') }}</button>
          <button
            v-for="chip in lineChips"
            :key="chip.id"
            class="line-chip"
            :class="{ active: activeLine === String(chip.id) }"
            :style="activeLine === String(chip.id) ? { borderColor: chip.color, color: chip.color } : {}"
            @click="activeLine = String(chip.id)"
          >
            <span class="line-dot" :style="{ backgroundColor: chip.color }" />
            {{ chip.id }}
          </button>
        </div>
      </div>

      <div v-for="group in grouped" :key="group.line" class="cat-block">
        <h2 class="cat-title">
          <span class="line-dot" :style="{ backgroundColor: group.color }" />
          {{ group.lineName }}
        </h2>
        <ul class="station-grid">
          <li v-for="s in group.items" :key="s.id">
            <button class="station-card mx-panel" type="button" @click="openStation(s.id)">
              <img
                v-if="s.image && !brokenImages.has(s.id)"
                class="station-thumb"
                :src="s.image"
                :alt="s.title"
                loading="lazy"
                @error="markBroken(s.id)"
              />
              <span v-else class="station-thumb placeholder" aria-hidden="true">M</span>
              <span class="station-meta">
                <span class="station-name">{{ s.title }}</span>
                <span v-if="s.opened" class="station-year">{{ s.opened }}</span>
              </span>
            </button>
          </li>
        </ul>
      </div>

      <div v-if="!grouped.length" class="mx-panel empty-state">
        <h2>{{ t('realMetro.noMatches') }}</h2>
        <p>{{ t('realMetro.noMatchesText') }} "{{ search }}".</p>
      </div>
    </template>
  </section>
</template>

<style scoped>
.real-metro-view {
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
  flex-wrap: wrap;
  gap: 0.75rem;
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

.line-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.line-chip {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  padding: 0.3rem 0.55rem;
  background: var(--color-bg-alt);
  border: 1px solid var(--color-border);
  color: var(--color-text-dim);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.line-chip.active {
  border-color: var(--color-amber);
  color: var(--color-amber);
}

.line-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;
}

.cat-block {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.cat-title {
  font-family: var(--font-display);
  font-size: 1.05rem;
  color: var(--color-text);
  letter-spacing: 0.04em;
  margin: 0.4rem 0 0;
  padding-bottom: 0.35rem;
  border-bottom: 1px solid var(--color-border-strong);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.station-grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 0.6rem;
}

.station-card {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  width: 100%;
  text-align: left;
  padding: 0.6rem 0.8rem;
  cursor: pointer;
  color: var(--color-text);
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.station-card:hover {
  border-color: var(--color-border-strong);
  box-shadow: var(--glow-amber);
}

.station-thumb {
  width: 44px;
  height: 44px;
  object-fit: cover;
  flex-shrink: 0;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--color-border);
}

.station-thumb.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-faint);
  font-size: 1.2rem;
  font-family: var(--font-display);
}

.station-meta {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  min-width: 0;
}

.station-name {
  font-family: var(--font-display);
  font-size: 0.92rem;
  color: var(--color-amber-bright);
}

.station-year {
  font-family: var(--font-mono);
  font-size: 0.68rem;
  color: var(--color-text-faint);
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

.station-detail {
  padding: 1.75rem 2rem;
}

.detail-header h1 {
  margin: 0.5rem 0;
  font-size: 1.7rem;
}

.detail-title-ru {
  display: block;
  font-family: var(--font-mono);
  font-size: 0.82rem;
  color: var(--color-text-faint);
  margin-bottom: 0.15rem;
}

.detail-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1.2rem;
  margin-top: 0.3rem;
}

.meta-item {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--color-text-dim);
}

.detail-figure {
  margin: 1.25rem 0;
  max-width: 400px;
}

.detail-figure img {
  max-width: 100%;
  border: 1px solid var(--color-border-strong);
  box-shadow: var(--shadow-panel);
  background: rgba(0, 0, 0, 0.25);
}

.clickable-img {
  cursor: pointer;
}

.gallery-thumbs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
}

.gallery-thumb {
  width: 80px;
  height: 60px;
  object-fit: cover;
  border: 1px solid var(--color-border);
  cursor: pointer;
  transition: border-color 0.15s ease;
}

.gallery-thumb:hover {
  border-color: var(--color-amber);
}

.gallery-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.92);
  display: flex;
  align-items: center;
  justify-content: center;
}

.gallery-full-img {
  max-width: 90vw;
  max-height: 85vh;
  object-fit: contain;
}

.gallery-close {
  position: absolute;
  top: 1rem;
  right: 1.5rem;
  background: none;
  border: none;
  color: #fff;
  font-size: 2rem;
  cursor: pointer;
  z-index: 10;
}

.gallery-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #fff;
  font-size: 3rem;
  cursor: pointer;
  padding: 1rem;
  z-index: 10;
}

.gallery-arrow-left {
  left: 1rem;
}

.gallery-arrow-right {
  right: 1rem;
}

.gallery-counter {
  position: absolute;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  font-family: var(--font-mono);
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
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
</style>
