<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { marked } from 'marked'
import { events } from '../data/events'
import { eventArticles, eventArticlesById } from '../data/eventArticles'
import { eventGallery } from '../data/eventGallery'
import { handleInternalClick, linkify } from '../utils/wikiLinks'

const route = useRoute()
const router = useRouter()
marked.setOptions({ breaks: false, gfm: true })

const activeId = computed(() => route.params.id ?? '')
const activeEvent = computed(() => (activeId.value ? eventArticlesById[activeId.value] : null))

// ---- Timeline (list view) ----
// Start with the two playable years open; the rest collapsed.
const expanded = ref(new Set(events.filter((e) => e.year === '2033' || e.year === '2034').map((e) => e.id)))

const rendered = computed(() =>
  Object.fromEntries(events.map((era) => [era.id, linkify(marked.parse(era.body || ''))])),
)

function isOpen(id) {
  return expanded.value.has(id)
}
function toggle(id) {
  const next = new Set(expanded.value)
  next.has(id) ? next.delete(id) : next.add(id)
  expanded.value = next
}
function expandAll() {
  expanded.value = new Set(events.map((e) => e.id))
}
function collapseAll() {
  expanded.value = new Set()
}
function onBodyClick(event) {
  handleInternalClick(event, router)
}

// ---- Event article (detail view) ----
const renderedArticle = computed(() =>
  activeEvent.value ? linkify(marked.parse(activeEvent.value.body || '')) : '',
)

const articleImageBroken = ref(false)
const showArticleImage = computed(() => activeEvent.value?.image && !articleImageBroken.value)

const gallery = computed(() => (activeEvent.value ? (eventGallery[activeEvent.value.id] ?? []) : []))
const lightbox = ref(-1)
function openLightbox(i) {
  lightbox.value = i
}
function closeLightbox() {
  lightbox.value = -1
}
function prevImg() {
  lightbox.value = lightbox.value > 0 ? lightbox.value - 1 : gallery.value.length - 1
}
function nextImg() {
  lightbox.value = lightbox.value < gallery.value.length - 1 ? lightbox.value + 1 : 0
}
function onThumbError(e) {
  e.target.closest('.thumb')?.remove()
}

function openEvent(id) {
  router.push({ name: 'event-detail', params: { id } })
}
function backToEvents() {
  router.push({ name: 'events' })
}
</script>

<template>
  <section class="events-view">
    <!-- Event article detail -->
    <template v-if="activeEvent">
      <button class="back-link" type="button" @click="backToEvents">← All events</button>

      <article class="mx-panel event-detail">
        <header class="detail-header">
          <span class="mx-tag">Notable event</span>
          <h1>{{ activeEvent.title }}</h1>
          <p v-if="activeEvent.brief" class="detail-brief">{{ activeEvent.brief }}</p>
        </header>

        <figure v-if="showArticleImage" class="detail-figure">
          <img
            :src="activeEvent.image"
            :alt="activeEvent.title"
            loading="lazy"
            referrerpolicy="no-referrer"
            @error="articleImageBroken = true"
          />
        </figure>

        <div class="markdown-body" v-html="renderedArticle" @click="onBodyClick" />

        <section v-if="gallery.length" class="gallery">
          <h2 class="gallery-title">Gallery</h2>
          <div class="thumbs">
            <button
              v-for="(src, i) in gallery"
              :key="i"
              type="button"
              class="thumb"
              @click="openLightbox(i)"
            >
              <img :src="src" :alt="`${activeEvent.title} — ${i + 1}`" loading="lazy" referrerpolicy="no-referrer" @error="onThumbError" />
            </button>
          </div>
        </section>

        <a
          v-if="activeEvent.wiki"
          class="fandom-link"
          :href="`https://metrovideogame.fandom.com/wiki/${activeEvent.wiki}`"
          target="_blank"
          rel="noopener"
        >Read the full article on Fandom ↗</a>
      </article>

      <Teleport to="body">
        <div v-if="lightbox >= 0" class="lightbox" @click.self="closeLightbox">
          <button class="lb-close" type="button" aria-label="Close" @click="closeLightbox">×</button>
          <button class="lb-nav prev" type="button" aria-label="Previous" @click="prevImg">‹</button>
          <img class="lb-img" :src="gallery[lightbox]" :alt="activeEvent.title" referrerpolicy="no-referrer" />
          <button class="lb-nav next" type="button" aria-label="Next" @click="nextImg">›</button>
          <div class="lb-count">{{ lightbox + 1 }} / {{ gallery.length }}</div>
        </div>
      </Teleport>
    </template>

    <!-- Timeline + notable events (list view) -->
    <template v-else>
      <header class="mx-panel view-header">
        <span class="mx-tag">Timeline</span>
        <h1>Events</h1>
        <p>
          A chronology of the Metro universe, from the bombs of 2013 to the world beyond. Select a
          year to expand its events; links lead to the levels and locations involved.
        </p>
        <div class="header-actions">
          <button type="button" class="ghost-btn" @click="expandAll">Expand all</button>
          <button type="button" class="ghost-btn" @click="collapseAll">Collapse all</button>
        </div>
      </header>

      <ol class="timeline">
        <li v-for="era in events" :key="era.id" class="era" :class="{ 'is-open': isOpen(era.id) }">
          <button class="era-head" type="button" :aria-expanded="isOpen(era.id)" @click="toggle(era.id)">
            <span class="era-dot" aria-hidden="true" />
            <span class="era-year">{{ era.year }}</span>
            <span class="era-label">{{ era.label }}</span>
            <span class="era-chevron" aria-hidden="true">{{ isOpen(era.id) ? '−' : '+' }}</span>
          </button>
          <div v-show="isOpen(era.id)" class="era-body markdown-body" v-html="rendered[era.id]" @click="onBodyClick" />
        </li>
      </ol>

      <div class="notable">
        <h2 class="notable-title">Notable events</h2>
        <p class="notable-sub">
          The turning points of the Metro saga, each with its own dossier.
        </p>
        <ul class="event-grid">
          <li v-for="ev in eventArticles" :key="ev.id">
            <button class="event-card mx-panel" type="button" @click="openEvent(ev.id)">
              <img
                v-if="ev.image"
                class="event-thumb"
                :src="ev.image"
                :alt="ev.title"
                loading="lazy"
                referrerpolicy="no-referrer"
              />
              <span v-else class="event-thumb placeholder" aria-hidden="true">✶</span>
              <span class="event-meta">
                <span class="event-name">{{ ev.title }}</span>
                <span v-if="ev.brief" class="event-brief">{{ ev.brief }}</span>
              </span>
            </button>
          </li>
        </ul>
      </div>
    </template>
  </section>
</template>

<style scoped>
.events-view {
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
  margin: 0 0 0.9rem;
  max-width: 72ch;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.ghost-btn {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.06em;
  color: var(--color-amber);
  background: transparent;
  border: 1px solid var(--color-border-strong);
  padding: 0.35rem 0.7rem;
  border-radius: 2px;
  cursor: pointer;
}

.ghost-btn:hover {
  color: var(--color-amber-bright);
  box-shadow: var(--glow-amber);
}

/* Vertical time rail down the left edge. */
.timeline {
  list-style: none;
  margin: 0;
  padding: 0 0 0 0.5rem;
  position: relative;
}

.timeline::before {
  content: '';
  position: absolute;
  top: 8px;
  bottom: 8px;
  left: 13px;
  width: 2px;
  background: linear-gradient(180deg, var(--color-amber) 0%, var(--color-border-strong) 100%);
  opacity: 0.5;
}

.era {
  position: relative;
  padding-left: 2.2rem;
  margin-bottom: 0.75rem;
}

.era-head {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  text-align: left;
  background: var(--color-panel);
  border: 1px solid var(--color-border);
  padding: 0.7rem 1rem;
  cursor: pointer;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.era-head:hover,
.era.is-open .era-head {
  border-color: var(--color-border-strong);
  box-shadow: var(--glow-amber);
}

.era-dot {
  position: absolute;
  left: 6px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--color-bg);
  border: 2px solid var(--color-amber);
  box-shadow: var(--glow-amber);
}

.era.is-open .era-dot {
  background: var(--color-amber);
}

.era-year {
  font-family: var(--font-display);
  font-size: 1.05rem;
  color: var(--color-amber-bright);
  min-width: 5.5ch;
}

.era-label {
  flex: 1;
  font-size: 0.82rem;
  color: var(--color-text-dim);
}

.era-chevron {
  font-family: var(--font-mono);
  color: var(--color-amber);
  font-size: 1.1rem;
  line-height: 1;
}

.era-body {
  padding: 0.9rem 1rem 0.3rem 1.1rem;
  font-size: 0.9rem;
  line-height: 1.55;
  color: var(--color-text);
}

.era-body :deep(ul) {
  padding-left: 1.1rem;
  margin: 0.3rem 0;
}

.era-body :deep(li) {
  margin: 0.25rem 0;
}

.era-body :deep(a) {
  color: var(--color-amber);
}

.era-body :deep(a[data-internal]) {
  color: var(--color-amber-bright);
  border-bottom: 1px dashed currentColor;
  text-decoration: none;
}

/* Notable events grid */
.notable {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.notable-title {
  font-family: var(--font-display);
  font-size: 1.25rem;
  color: var(--color-amber-bright);
  letter-spacing: 0.04em;
  margin: 0.6rem 0 0;
  padding-bottom: 0.35rem;
  border-bottom: 1px solid var(--color-border-strong);
}

.notable-sub {
  margin: 0 0 0.4rem;
  font-size: 0.85rem;
  color: var(--color-text-dim);
}

.event-grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 0.7rem;
}

.event-card {
  display: flex;
  align-items: stretch;
  gap: 0;
  width: 100%;
  text-align: left;
  padding: 0;
  overflow: hidden;
  cursor: pointer;
  color: var(--color-text);
  transition: border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
}

.event-card:hover {
  border-color: var(--color-border-strong);
  box-shadow: var(--glow-amber);
  transform: translateY(-1px);
}

.event-thumb {
  width: 92px;
  min-height: 92px;
  object-fit: cover;
  flex-shrink: 0;
  background: #06070a;
  border-right: 1px solid var(--color-border);
}

.event-thumb.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-faint);
  font-size: 1.5rem;
}

.event-meta {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  padding: 0.7rem 0.9rem;
  min-width: 0;
}

.event-name {
  font-family: var(--font-display);
  font-size: 1rem;
  color: var(--color-amber-bright);
}

.event-brief {
  font-size: 0.8rem;
  line-height: 1.4;
  color: var(--color-text-dim);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Event detail */
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

.event-detail {
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

/* Gallery */
.gallery {
  margin-top: 1.5rem;
}

.gallery-title {
  font-family: var(--font-display);
  font-size: 1.15rem;
  color: var(--color-amber-bright);
  margin: 0 0 0.7rem;
  padding-bottom: 0.35rem;
  border-bottom: 1px solid var(--color-border-strong);
}

.thumbs {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 0.5rem;
}

.thumb {
  padding: 0;
  border: 1px solid var(--color-border);
  background: #06070a;
  cursor: pointer;
  overflow: hidden;
  aspect-ratio: 4 / 3;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.thumb:hover {
  border-color: var(--color-amber);
  box-shadow: var(--glow-amber);
}

.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* Lightbox */
.lightbox {
  position: fixed;
  inset: 0;
  z-index: 4000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(3, 4, 6, 0.92);
  backdrop-filter: blur(3px);
}

.lb-img {
  max-width: 90vw;
  max-height: 86vh;
  object-fit: contain;
  border: 1px solid var(--color-border-strong);
  box-shadow: var(--shadow-panel), var(--glow-amber);
}

.lb-close {
  position: absolute;
  top: 1rem;
  right: 1.2rem;
  background: none;
  border: none;
  color: var(--color-text);
  font-size: 2rem;
  line-height: 1;
  cursor: pointer;
}

.lb-close:hover {
  color: var(--color-amber-bright);
}

.lb-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 48px;
  height: 64px;
  background: rgba(13, 12, 10, 0.7);
  border: 1px solid var(--color-border-strong);
  color: var(--color-amber);
  font-size: 2rem;
  line-height: 1;
  cursor: pointer;
}

.lb-nav:hover {
  color: var(--color-amber-bright);
  border-color: var(--color-amber);
}

.lb-nav.prev {
  left: 1rem;
}

.lb-nav.next {
  right: 1rem;
}

.lb-count {
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--color-text-dim);
}
</style>
