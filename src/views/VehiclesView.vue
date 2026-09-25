<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { marked } from 'marked'
import { VEHICLE_CATEGORIES, VEHICLE_GROUPS, vehicles, vehiclesById } from '../data/vehicles'
import galleryManifest from '../data/vehicleGalleryManifest.json'
import { fuzzyMatch } from '../utils/search'
import { handleInternalClick, linkify } from '../utils/wikiLinks'
import { t } from '../i18n'

const route = useRoute()
const router = useRouter()
marked.setOptions({ breaks: false, gfm: true })

const GROUP_LABELS = {
  'Rail Vehicles': t('vehicles.groupRail'),
  'Armoured Vehicles': t('vehicles.groupArmoured'),
  'Road Vehicles': t('vehicles.groupRoad'),
  'Watercraft': t('vehicles.groupWatercraft'),
  'Aircraft': t('vehicles.groupAircraft'),
}

const CATEGORY_LABELS = {
  rail: t('vehicles.groupRail'),
  armoured: t('vehicles.groupArmoured'),
  road: t('vehicles.groupRoad'),
  watercraft: t('vehicles.groupWatercraft'),
  aircraft: t('vehicles.groupAircraft'),
}

const activeId = computed(() => route.params.id ?? '')
const activeItem = computed(() => (activeId.value ? vehiclesById[activeId.value] : null))

const renderedBody = computed(() =>
  activeItem.value ? linkify(marked.parse(activeItem.value.body || '')) : '',
)

const brokenImages = ref(new Set())
function markBroken(id) {
  const next = new Set(brokenImages.value)
  next.add(id)
  brokenImages.value = next
}
const showImage = computed(
  () => activeItem.value?.image && !brokenImages.value.has(activeItem.value.id),
)

function onBodyClick(event) {
  handleInternalClick(event, router)
}

const search = ref('')
const searchInput = ref(null)

const filtered = computed(() =>
  search.value ? vehicles.filter((e) => fuzzyMatch(search.value, e.title)) : vehicles,
)

const grouped = computed(() =>
  VEHICLE_GROUPS.map((group) => ({
    group,
    label: GROUP_LABELS[group],
    items: filtered.value.filter((e) => e.group === group),
  })).filter((g) => g.items.length),
)

const categoryNav = computed(() =>
  VEHICLE_CATEGORIES.map((cat) => ({
    label: CATEGORY_LABELS[cat.key],
    items: cat.ids.map((id) => vehiclesById[id]).filter(Boolean),
  })),
)

const galleryImages = computed(() => {
  if (!activeId.value) return []
  return galleryManifest[activeId.value] || []
})

const lightboxIdx = ref(-1)
function openLightbox(i) { lightboxIdx.value = i }
function closeLightbox() { lightboxIdx.value = -1 }
function prevImage() { if (lightboxIdx.value > 0) lightboxIdx.value-- }
function nextImage() { if (lightboxIdx.value < galleryImages.value.length - 1) lightboxIdx.value++ }

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
  router.push({ name: 'vehicle-detail', params: { id } })
}
function backToList() {
  router.push({ name: 'vehicles' })
}
</script>

<template>
  <section class="vehicles-view">
    <!-- Detail -->
    <template v-if="activeItem">
      <button class="back-link" type="button" @click="backToList">{{ t('vehicles.backToList') }}</button>

      <article class="mx-panel vehicles-detail">
        <header class="detail-header">
          <span class="mx-tag">{{ GROUP_LABELS[activeItem.group] }}</span>
          <h1>{{ activeItem.title }}</h1>
          <p v-if="activeItem.brief" class="detail-brief">{{ activeItem.brief }}</p>
          <p v-if="activeItem.appearances" class="detail-appearances">
            <strong>{{ t('vehicles.appearances') }}:</strong> {{ activeItem.appearances }}
          </p>
        </header>

        <figure v-if="showImage" class="detail-figure">
          <img
            :src="activeItem.image"
            :alt="activeItem.title"
            loading="lazy"
            referrerpolicy="no-referrer"
            @error="markBroken(activeItem.id)"
          />
        </figure>

        <div class="markdown-body" v-html="renderedBody" @click="onBodyClick" />

        <section v-if="galleryImages.length" class="gallery-section">
          <h2 class="gallery-title">Gallery</h2>
          <div class="gallery-grid">
            <button
              v-for="(src, i) in galleryImages"
              :key="src"
              class="gallery-thumb"
              type="button"
              @click="openLightbox(i)"
            >
              <img :src="src" :alt="`${activeItem.title} screenshot ${i + 1}`" loading="lazy" referrerpolicy="no-referrer" />
            </button>
          </div>
        </section>

        <Teleport to="body">
          <div v-if="lightboxIdx >= 0" class="lightbox-overlay" @click.self="closeLightbox">
            <button class="lightbox-close" @click="closeLightbox">&times;</button>
            <button v-if="lightboxIdx > 0" class="lightbox-nav lightbox-prev" @click="prevImage">&lsaquo;</button>
            <img class="lightbox-img" :src="galleryImages[lightboxIdx]" :alt="activeItem.title" />
            <button v-if="lightboxIdx < galleryImages.length - 1" class="lightbox-nav lightbox-next" @click="nextImage">&rsaquo;</button>
          </div>
        </Teleport>

        <a
          v-if="activeItem.wiki"
          class="fandom-link"
          :href="`https://metrovideogame.fandom.com/wiki/${activeItem.wiki}`"
          target="_blank"
          rel="noopener"
        >{{ t('vehicles.fandomLink') }}</a>
      </article>
    </template>

    <!-- List -->
    <template v-else>
      <header class="mx-panel view-header">
        <span class="mx-tag">{{ t('vehicles.tag') }}</span>
        <h1>{{ t('vehicles.title') }}</h1>
        <p>{{ t('vehicles.description') }}</p>
      </header>

      <div class="mx-panel toolbar">
        <input
          ref="searchInput"
          v-model="search"
          type="search"
          class="search-input"
          :placeholder="t('vehicles.searchPlaceholder')"
          aria-label="Filter vehicles"
        />
      </div>

      <div v-for="group in grouped" :key="group.group" class="cat-block">
        <h2 class="cat-title">{{ group.label }}</h2>
        <ul class="vehicles-grid">
          <li v-for="e in group.items" :key="e.id">
            <button class="vehicles-card mx-panel" type="button" @click="openItem(e.id)">
              <img
                v-if="e.image && !brokenImages.has(e.id)"
                class="vehicles-portrait"
                :src="e.image"
                :alt="e.title"
                loading="lazy"
                referrerpolicy="no-referrer"
                @error="markBroken(e.id)"
              />
              <span v-else class="vehicles-portrait placeholder" aria-hidden="true">🚂</span>
              <span class="vehicles-meta">
                <span class="vehicles-name">{{ e.title }}</span>
                <span v-if="e.brief" class="vehicles-brief">{{ e.brief }}</span>
              </span>
            </button>
          </li>
        </ul>
      </div>

      <div v-if="!grouped.length" class="mx-panel empty-state">
        <span class="empty-icon">🚂</span>
        <h2>{{ t('vehicles.noMatches') }}</h2>
        <p>{{ t('vehicles.noMatchesText') }} "{{ search }}".</p>
      </div>

      <!-- Navbox -->
      <div class="mx-panel vehicles-navbox">
        <h2 class="navbox-title">{{ t('vehicles.navboxTitle') }}</h2>
        <div v-for="cat in categoryNav" :key="cat.label" class="navbox-row">
          <span class="navbox-group">{{ cat.label }}</span>
          <span class="navbox-items">
            <template v-for="(item, i) in cat.items" :key="item.id">
              <template v-if="i > 0"> · </template>
              <RouterLink :to="`/vehicles/${item.id}`" class="navbox-link">{{ item.title }}</RouterLink>
            </template>
          </span>
        </div>
      </div>
    </template>
  </section>
</template>

<style scoped>
.vehicles-view {
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

.vehicles-grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 0.7rem;
}

.vehicles-card {
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

.vehicles-card:hover {
  border-color: var(--color-border-strong);
  box-shadow: var(--glow-amber);
  transform: translateY(-1px);
}

.vehicles-portrait {
  width: 64px;
  height: 48px;
  object-fit: cover;
  flex-shrink: 0;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--color-border);
}

.vehicles-portrait.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-toxic-bright);
  font-size: 1.4rem;
}

.vehicles-meta {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
}

.vehicles-name {
  font-family: var(--font-display);
  font-size: 1rem;
  color: var(--color-amber-bright);
}

.vehicles-brief {
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

.vehicles-detail {
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
  max-width: 400px;
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

/* Gallery */
.gallery-section {
  margin-top: 1.5rem;
}

.gallery-title {
  font-family: var(--font-display);
  font-size: 1.1rem;
  color: var(--color-amber-bright);
  margin: 0 0 0.7rem;
  padding-bottom: 0.35rem;
  border-bottom: 1px solid var(--color-border-strong);
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 0.5rem;
}

.gallery-thumb {
  cursor: pointer;
  border: 1px solid var(--color-border);
  background: rgba(0, 0, 0, 0.25);
  padding: 0;
  overflow: hidden;
  aspect-ratio: 16 / 10;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.gallery-thumb:hover {
  border-color: var(--color-amber);
  box-shadow: var(--glow-amber);
}

.gallery-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
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

.lightbox-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  font-size: 3rem;
  color: var(--color-text);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  z-index: 1;
}

.lightbox-nav:hover {
  color: var(--color-amber-bright);
}

.lightbox-prev { left: 1rem; }
.lightbox-next { right: 1rem; }

/* Navbox */
.vehicles-navbox {
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
  width: 180px;
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

  .gallery-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }
}
</style>
