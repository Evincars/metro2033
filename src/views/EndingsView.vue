<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { marked } from 'marked'
import { ENDING_GROUPS, endings, endingsById, endingsOverview } from '../data/endings'
import { handleInternalClick, linkify } from '../utils/wikiLinks'
import { t } from '../i18n'

const base = import.meta.env.BASE_URL
const route = useRoute()
const router = useRouter()
marked.setOptions({ breaks: false, gfm: true })

const GROUP_LABELS = {
  'Metro 2033': t('endings.groupM2033'),
  'Metro Last Light': t('endings.groupMLL'),
  'Metro Exodus': t('endings.groupME'),
}

const YOUTUBE_LINKS = {
  'if-its-hostile-you-kill-it': 'https://www.youtube.com/watch?v=7Ns4FHgnTWE',
  'enlightened': 'https://www.youtube.com/watch?v=PntujDyV-Fc',
  'cest-la-vie': 'https://www.youtube.com/watch?v=16-VjC98JoA',
  'redemption': 'https://www.youtube.com/watch?v=nQORxeRoiBs',
}

function youtubeEmbedUrl(watchUrl) {
  if (!watchUrl) return null
  const m = watchUrl.match(/[?&]v=([^&]+)/)
  return m ? `https://www.youtube.com/embed/${m[1]}` : null
}

const activeId = computed(() => route.params.id ?? '')
const activeItem = computed(() => (activeId.value ? endingsById[activeId.value] : null))

const renderedBody = computed(() => {
  if (!activeItem.value) return ''
  let body = activeItem.value.body || ''
  body = body.replace(/^### Video\s*$/m, '')
  body = body.replace(/- \[Watch .+?\]\(https:\/\/www\.youtube\.com\/watch\?v=[^)]+\)\s*/g, '')
  return linkify(marked.parse(body))
})

const renderedOverview = computed(() => {
  if (!endingsOverview) return ''
  return linkify(marked.parse(endingsOverview.body || ''))
})

const brokenImages = ref(new Set())
function markBroken(id) {
  const next = new Set(brokenImages.value)
  next.add(id)
  brokenImages.value = next
}

function onBodyClick(event) {
  handleInternalClick(event, router)
}

const grouped = computed(() =>
  ENDING_GROUPS.map((group) => ({
    group,
    label: GROUP_LABELS[group],
    items: endings.filter((e) => e.group === group),
  })).filter((g) => g.items.length),
)

function openItem(id) {
  router.push({ name: 'ending-detail', params: { id } })
}
function backToList() {
  router.push({ name: 'endings' })
}

function imgSrc(item) {
  if (!item.image) return ''
  return `${base}ending-imgs/${item.image}`
}

function endingType(item) {
  const title = item.title.toLowerCase()
  if (title.includes('enlightened') || title.includes('redemption') || title.includes('your destination')) {
    return 'good'
  }
  return 'bad'
}
</script>

<template>
  <section class="endings-view">
    <!-- Detail -->
    <template v-if="activeItem">
      <button class="back-link" type="button" @click="backToList">{{ t('endings.backToList') }}</button>

      <article class="mx-panel detail">
        <header class="detail-header">
          <span class="mx-tag">{{ GROUP_LABELS[activeItem.group] }}</span>
          <h1>{{ activeItem.title }}</h1>
          <p v-if="activeItem.brief" class="detail-brief">{{ activeItem.brief }}</p>
          <p v-if="activeItem.appearances" class="detail-appearances">
            <strong>{{ t('endings.appearances') }}:</strong> {{ activeItem.appearances }}
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

        <!-- YouTube Video -->
        <section v-if="YOUTUBE_LINKS[activeItem.id]" class="video-section">
          <h2 class="video-title">{{ t('endings.video') }}</h2>
          <div class="video-wrapper">
            <iframe
              :src="youtubeEmbedUrl(YOUTUBE_LINKS[activeItem.id])"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            ></iframe>
          </div>
        </section>

        <a
          class="fandom-link"
          :href="`https://metrovideogame.fandom.com/wiki/${activeItem.wiki}`"
          target="_blank"
          rel="noopener"
        >{{ t('endings.fandomLink') }}</a>
      </article>
    </template>

    <!-- List -->
    <template v-else>
      <header class="mx-panel view-header">
        <span class="mx-tag">{{ t('endings.tag') }}</span>
        <h1>{{ t('endings.title') }}</h1>
        <p>{{ t('endings.description') }}</p>
      </header>

      <div v-for="g in grouped" :key="g.group" class="game-block">
        <div class="game-header">
          <span class="game-title">{{ g.label }}</span>
        </div>

        <div class="endings-grid">
          <button
            v-for="item in g.items"
            :key="item.id"
            class="ending-card mx-panel"
            type="button"
            @click="openItem(item.id)"
          >
            <div class="card-top">
              <img
                v-if="imgSrc(item) && !brokenImages.has(item.id)"
                class="card-img"
                :src="imgSrc(item)"
                :alt="item.title"
                loading="lazy"
                referrerpolicy="no-referrer"
                @error="markBroken(item.id)"
              />
              <div v-else class="card-img placeholder" aria-hidden="true">
                <span :class="endingType(item) === 'good' ? 'ending-good' : 'ending-bad'">
                  {{ endingType(item) === 'good' ? '&#x2606;' : '&#x2620;' }}
                </span>
              </div>
              <span class="ending-type-badge" :class="`type-${endingType(item)}`">
                {{ endingType(item) === 'good' ? t('endings.good') : t('endings.bad') }}
              </span>
            </div>
            <div class="card-body">
              <span class="card-name">{{ item.title }}</span>
              <span class="card-brief">{{ item.brief }}</span>
              <span v-if="YOUTUBE_LINKS[item.id]" class="card-video-tag">&#x25B6; {{ t('endings.hasVideo') }}</span>
            </div>
          </button>
        </div>
      </div>

      <!-- Overview section -->
      <div v-if="endingsOverview" class="mx-panel overview-section">
        <h2 class="overview-title">{{ t('endings.overviewTitle') }}</h2>
        <div class="markdown-body" v-html="renderedOverview" @click="onBodyClick" />
      </div>
    </template>
  </section>
</template>

<style scoped>
.endings-view {
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

.game-block {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
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

.endings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 0.9rem;
}

.ending-card {
  display: flex;
  flex-direction: column;
  text-align: left;
  padding: 0;
  overflow: hidden;
  cursor: pointer;
  color: var(--color-text);
  transition: border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
}

.ending-card:hover {
  border-color: var(--color-amber);
  box-shadow: var(--glow-amber);
  transform: translateY(-2px);
}

.card-top {
  position: relative;
  height: 140px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.4);
}

.card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.card-img.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
}

.ending-good {
  color: var(--color-signal);
}

.ending-bad {
  color: var(--color-rad-high);
}

.ending-type-badge {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  font-family: var(--font-mono);
  font-size: 0.6rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 0.15rem 0.5rem;
  border-radius: 2px;
}

.type-good {
  color: var(--color-signal);
  background: rgba(134, 209, 106, 0.15);
  border: 1px solid rgba(134, 209, 106, 0.3);
}

.type-bad {
  color: var(--color-rad-high);
  background: rgba(210, 59, 47, 0.15);
  border: 1px solid rgba(210, 59, 47, 0.3);
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  padding: 0.9rem 1rem;
}

.card-name {
  font-family: var(--font-display);
  font-size: 1rem;
  color: var(--color-amber-bright);
}

.card-brief {
  font-size: 0.8rem;
  line-height: 1.4;
  color: var(--color-text-dim);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-video-tag {
  font-family: var(--font-mono);
  font-size: 0.65rem;
  letter-spacing: 0.05em;
  color: var(--color-rad-high);
  margin-top: 0.2rem;
}

/* Overview */
.overview-section {
  padding: 1.5rem 1.75rem;
}

.overview-title {
  font-family: var(--font-display);
  font-size: 1.1rem;
  color: var(--color-amber-bright);
  margin: 0 0 0.7rem;
  padding-bottom: 0.35rem;
  border-bottom: 1px solid var(--color-border-strong);
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

.detail-appearances {
  margin: 0.4rem 0 0;
  font-family: var(--font-mono);
  font-size: 0.78rem;
  color: var(--color-text-faint);
}

.detail-figure {
  margin: 1.25rem 0;
  max-width: 500px;
}

.detail-figure img {
  max-width: 100%;
  border: 1px solid var(--color-border-strong);
  box-shadow: var(--shadow-panel);
  background: rgba(0, 0, 0, 0.25);
}

/* YouTube Video */
.video-section {
  margin-top: 1.5rem;
}

.video-title {
  font-family: var(--font-display);
  font-size: 1.1rem;
  color: var(--color-amber-bright);
  margin: 0 0 0.7rem;
  padding-bottom: 0.35rem;
  border-bottom: 1px solid var(--color-border-strong);
}

.video-wrapper {
  position: relative;
  width: 100%;
  max-width: 640px;
  padding-bottom: 56.25%;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid var(--color-border-strong);
}

.video-wrapper iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
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

@media (max-width: 600px) {
  .endings-grid {
    grid-template-columns: 1fr;
  }

  .card-top {
    height: 120px;
  }
}
</style>
