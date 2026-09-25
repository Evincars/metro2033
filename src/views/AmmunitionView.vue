<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { marked } from 'marked'
import { AMMO_CATEGORIES, AMMO_GROUPS, ammunition, ammunitionById } from '../data/ammunition'
import galleryManifest from '../data/ammoGalleryManifest.json'
import { fuzzyMatch } from '../utils/search'
import { handleInternalClick, linkify } from '../utils/wikiLinks'
import { t } from '../i18n'

const route = useRoute()
const router = useRouter()
marked.setOptions({ breaks: false, gfm: true })

const GROUP_LABELS = {
  'Rifle Rounds': t('ammo.groupRifle'),
  'Pistol Rounds': t('ammo.groupPistol'),
  'Shotgun Shells': t('ammo.groupShotgun'),
  'Pneumatic Ammo': t('ammo.groupPneumatic'),
  'Special Ammo': t('ammo.groupSpecial'),
}

const CATEGORY_LABELS = {
  rifleRounds: t('ammo.groupRifle'),
  pistolRounds: t('ammo.groupPistol'),
  shotgunShells: t('ammo.groupShotgun'),
  pneumaticAmmo: t('ammo.groupPneumatic'),
  specialAmmo: t('ammo.groupSpecial'),
}

const GROUP_ICONS = {
  'Rifle Rounds': '🔩',
  'Pistol Rounds': '🔫',
  'Shotgun Shells': '💥',
  'Pneumatic Ammo': '🎯',
  'Special Ammo': '⚡',
}

const activeId = computed(() => route.params.id ?? '')
const activeItem = computed(() => (activeId.value ? ammunitionById[activeId.value] : null))

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
  search.value ? ammunition.filter((e) => fuzzyMatch(search.value, e.title)) : ammunition,
)

const grouped = computed(() =>
  AMMO_GROUPS.map((group) => ({
    group,
    label: GROUP_LABELS[group],
    icon: GROUP_ICONS[group],
    items: filtered.value.filter((e) => e.group === group),
  })).filter((g) => g.items.length),
)

const categoryNav = computed(() =>
  AMMO_CATEGORIES.map((cat) => ({
    label: CATEGORY_LABELS[cat.key],
    items: cat.ids.map((id) => ammunitionById[id]).filter(Boolean),
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
  router.push({ name: 'ammo-detail', params: { id } })
}
function backToList() {
  router.push({ name: 'ammunition' })
}
</script>

<template>
  <section class="ammo-view">
    <!-- Detail -->
    <template v-if="activeItem">
      <button class="back-link" type="button" @click="backToList">{{ t('ammo.backToList') }}</button>

      <article class="mx-panel ammo-detail">
        <header class="detail-header">
          <span class="mx-tag">{{ GROUP_LABELS[activeItem.group] }}</span>
          <h1>{{ activeItem.title }}</h1>
          <p v-if="activeItem.brief" class="detail-brief">{{ activeItem.brief }}</p>
          <p v-if="activeItem.appearances" class="detail-appearances">
            <strong>{{ t('ammo.appearances') }}:</strong> {{ activeItem.appearances }}
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
        >{{ t('ammo.fandomLink') }}</a>
      </article>
    </template>

    <!-- List — Metro tactical table -->
    <template v-else>
      <header class="mx-panel view-header">
        <span class="mx-tag">{{ t('ammo.tag') }}</span>
        <h1>{{ t('ammo.title') }}</h1>
        <p>{{ t('ammo.description') }}</p>
      </header>

      <div class="mx-panel toolbar">
        <input
          ref="searchInput"
          v-model="search"
          type="search"
          class="search-input"
          :placeholder="t('ammo.searchPlaceholder')"
          aria-label="Filter ammunition"
        />
      </div>

      <!-- Tactical ammo table per group -->
      <div v-for="group in grouped" :key="group.group" class="ammo-group">
        <h2 class="group-header">
          <span class="group-icon">{{ group.icon }}</span>
          <span class="group-label">{{ group.label }}</span>
          <span class="group-count">[ {{ group.items.length }} ]</span>
        </h2>

        <div class="table-wrap">
          <table class="ammo-table">
            <thead>
              <tr>
                <th class="th-designation">{{ t('ammo.colDesignation') }}</th>
                <th class="th-type">{{ t('ammo.colType') }}</th>
                <th class="th-games">{{ t('ammo.colGames') }}</th>
                <th class="th-action"></th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in group.items"
                :key="item.id"
                class="ammo-row"
                @click="openItem(item.id)"
              >
                <td class="td-designation">
                  <span class="ammo-indicator" />
                  <img
                    v-if="item.image && !brokenImages.has(item.id)"
                    class="ammo-thumb"
                    :src="item.image"
                    :alt="item.title"
                    loading="lazy"
                    referrerpolicy="no-referrer"
                    @error="markBroken(item.id)"
                  />
                  <span v-else class="ammo-thumb placeholder">●</span>
                  <span class="ammo-name-col">
                    <span class="ammo-name">{{ item.title }}</span>
                    <span v-if="item.brief" class="ammo-brief">{{ item.brief }}</span>
                  </span>
                </td>
                <td class="td-type">
                  <span class="type-badge">{{ item.group }}</span>
                </td>
                <td class="td-games">
                  <span
                    v-for="game in (item.appearances || '').split(', ').filter(Boolean)"
                    :key="game"
                    class="game-pip"
                    :class="{
                      'pip-2033': game.includes('2033') && !game.includes('Redux'),
                      'pip-ll': game.includes('Last Light') && !game.includes('Redux'),
                      'pip-exodus': game.includes('Exodus'),
                      'pip-redux': game.includes('Redux'),
                    }"
                    :title="game"
                  >{{ game.includes('2033') && !game.includes('Redux') ? '2033' : game.includes('Last Light') && !game.includes('Redux') ? 'LL' : game.includes('Exodus') ? 'EX' : 'RDX' }}</span>
                </td>
                <td class="td-action">
                  <span class="action-arrow">▸</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="!grouped.length" class="mx-panel empty-state">
        <span class="empty-icon">🔩</span>
        <h2>{{ t('ammo.noMatches') }}</h2>
        <p>{{ t('ammo.noMatchesText') }} "{{ search }}".</p>
      </div>

      <!-- Navbox -->
      <div class="mx-panel ammo-navbox">
        <h2 class="navbox-title">{{ t('ammo.navboxTitle') }}</h2>
        <div v-for="cat in categoryNav" :key="cat.label" class="navbox-row">
          <span class="navbox-group">{{ cat.label }}</span>
          <span class="navbox-items">
            <template v-for="(item, i) in cat.items" :key="item.id">
              <template v-if="i > 0"> · </template>
              <RouterLink :to="`/ammunition/${item.id}`" class="navbox-link">{{ item.title }}</RouterLink>
            </template>
          </span>
        </div>
      </div>
    </template>
  </section>
</template>

<style scoped>
.ammo-view {
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

/* ── Group headers ── */
.ammo-group {
  display: flex;
  flex-direction: column;
}

.group-header {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-family: var(--font-display);
  font-size: 1.05rem;
  color: var(--color-amber-bright);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin: 0;
  padding: 0.65rem 1rem;
  background: linear-gradient(90deg, rgba(232, 149, 42, 0.12) 0%, transparent 100%);
  border-left: 3px solid var(--color-amber);
  border-bottom: 1px solid var(--color-border);
}

.group-icon {
  font-size: 1.1rem;
}

.group-count {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  color: var(--color-text-faint);
  letter-spacing: 0.1em;
}

/* ── Tactical table ── */
.table-wrap {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.ammo-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
  table-layout: fixed;
}

.ammo-table thead {
  position: sticky;
  top: 0;
  z-index: 1;
}

.ammo-table th {
  font-family: var(--font-mono);
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-text-faint);
  text-align: left;
  padding: 0.5rem 0.8rem;
  background: var(--color-bg-alt);
  border-bottom: 2px solid var(--color-border-strong);
  white-space: nowrap;
}

.th-designation { width: 50%; }
.th-type { width: 18%; }
.th-games { width: 26%; }
.th-action { width: 6%; text-align: center; }

.ammo-row {
  cursor: pointer;
  transition: background-color 0.12s ease, box-shadow 0.12s ease;
  border-bottom: 1px solid var(--color-border);
}

.ammo-row:hover {
  background: rgba(232, 149, 42, 0.07);
  box-shadow: inset 3px 0 0 var(--color-amber);
}

.ammo-row:hover .ammo-name {
  color: var(--color-amber-bright);
}

.ammo-row:hover .action-arrow {
  color: var(--color-amber-bright);
  transform: translateX(2px);
}

.ammo-row:hover .ammo-indicator {
  background: var(--color-amber);
  box-shadow: 0 0 6px rgba(232, 149, 42, 0.8);
}

.ammo-table td {
  padding: 0.65rem 0.8rem;
  vertical-align: middle;
}

.td-designation {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.ammo-indicator {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--color-border-strong);
  flex-shrink: 0;
  transition: background 0.15s ease, box-shadow 0.15s ease;
}

.ammo-thumb {
  width: 36px;
  height: 36px;
  object-fit: cover;
  flex-shrink: 0;
  border: 1px solid var(--color-border);
  background: rgba(0, 0, 0, 0.3);
}

.ammo-thumb.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  color: var(--color-toxic-bright);
}

.ammo-name-col {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  min-width: 0;
}

.ammo-name {
  font-family: var(--font-display);
  font-size: 0.92rem;
  color: var(--color-amber);
  transition: color 0.12s ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ammo-brief {
  font-size: 0.72rem;
  line-height: 1.3;
  color: var(--color-text-faint);
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.td-type {
  white-space: nowrap;
}

.type-badge {
  display: inline-block;
  font-family: var(--font-mono);
  font-size: 0.65rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-dim);
  padding: 0.15rem 0.45rem;
  border: 1px solid var(--color-border);
  border-radius: 2px;
  background: rgba(0, 0, 0, 0.2);
}

.td-games {
  white-space: nowrap;
}

.game-pip {
  display: inline-block;
  font-family: var(--font-mono);
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  padding: 0.12rem 0.35rem;
  border-radius: 2px;
  margin-right: 0.25rem;
  border: 1px solid;
}

.pip-2033 {
  color: #e89a2a;
  border-color: rgba(232, 154, 42, 0.4);
  background: rgba(232, 154, 42, 0.1);
}

.pip-ll {
  color: #4fc3f7;
  border-color: rgba(79, 195, 247, 0.4);
  background: rgba(79, 195, 247, 0.1);
}

.pip-exodus {
  color: #86d16a;
  border-color: rgba(134, 209, 106, 0.4);
  background: rgba(134, 209, 106, 0.1);
}

.pip-redux {
  color: #ce93d8;
  border-color: rgba(206, 147, 216, 0.4);
  background: rgba(206, 147, 216, 0.1);
}

.td-action {
  text-align: center;
}

.action-arrow {
  color: var(--color-text-faint);
  font-size: 1rem;
  transition: color 0.12s ease, transform 0.12s ease;
  display: inline-block;
}

/* ── Detail view ── */
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

.ammo-detail {
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
.ammo-navbox {
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

@media (max-width: 700px) {
  .th-type,
  .td-type {
    display: none;
  }

  .th-designation { width: 60%; }
  .th-games { width: 34%; }

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

@media (max-width: 480px) {
  .ammo-thumb {
    display: none;
  }

  .game-pip {
    font-size: 0.55rem;
    padding: 0.08rem 0.25rem;
  }
}
</style>
