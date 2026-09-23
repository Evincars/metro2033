<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { marked } from 'marked'
import { booksById, coreBooks, universeBooks } from '../data/books'
import { handleInternalClick, linkify } from '../utils/wikiLinks'
import ParchmentNote from '../components/ParchmentNote.vue'
import { t } from '../i18n'

const route = useRoute()
const router = useRouter()
marked.setOptions({ breaks: false, gfm: true })

const bgUrl = `${import.meta.env.BASE_URL}book-art/books_top.jpg`
const bookIcon = `${import.meta.env.BASE_URL}book-art/book.png`

const activeId = computed(() => route.params.id ?? '')
const activeBook = computed(() => (activeId.value ? booksById[activeId.value] : null))

const renderedBody = computed(() =>
  activeBook.value ? linkify(marked.parse(activeBook.value.body || '')) : '',
)

const brokenImages = ref(new Set())
function markBroken(id) {
  const next = new Set(brokenImages.value)
  next.add(id)
  brokenImages.value = next
}
const showImage = computed(
  () => activeBook.value?.image && !brokenImages.value.has(activeBook.value.id),
)

function onBodyClick(event) {
  handleInternalClick(event, router)
}

function openBook(id) {
  router.push({ name: 'book-detail', params: { id } })
}
function backToList() {
  router.push({ name: 'books' })
}
</script>

<template>
  <section class="books-view">
    <!-- Detail -->
    <template v-if="activeBook">
      <button class="back-link" type="button" @click="backToList">{{ t('books.backToList') }}</button>

      <article class="mx-panel book-detail">
        <header class="detail-header">
          <span class="mx-tag">{{ [activeBook.year, activeBook.author].filter(Boolean).join(' · ') }}</span>
          <h1>{{ activeBook.title }}</h1>
          <p v-if="activeBook.setIn || activeBook.country" class="detail-meta">
            <span v-if="activeBook.setIn">{{ t('books.setIn') }} {{ activeBook.setIn }}</span>
            <span v-if="activeBook.setIn && activeBook.country"> · </span>
            <span v-if="activeBook.country">{{ activeBook.country }}</span>
          </p>
          <p v-if="activeBook.brief" class="detail-brief">{{ activeBook.brief }}</p>
        </header>

        <figure v-if="showImage" class="detail-figure">
          <img
            :src="activeBook.image"
            :alt="activeBook.title"
            loading="lazy"
            referrerpolicy="no-referrer"
            @error="markBroken(activeBook.id)"
          />
        </figure>

        <div class="markdown-body" v-html="renderedBody" @click="onBodyClick" />

        <a
          v-if="activeBook.wiki"
          class="fandom-link"
          :href="`https://metrovideogame.fandom.com/wiki/${activeBook.wiki}`"
          target="_blank"
          rel="noopener"
        >{{ t('books.fandomLink') }}</a>
      </article>
    </template>

    <!-- List -->
    <template v-else>
      <header class="books-hero" :style="{ backgroundImage: `url('${bgUrl}')` }">
        <div class="books-hero-inner">
          <img class="books-emblem" :src="bookIcon" alt="" aria-hidden="true" />
          <h1 class="books-title">{{ t('books.heroTitle') }}</h1>
          <div class="ornament-hr" aria-hidden="true">
            <span class="ornament-line" />
            <span class="ornament-mark">✦</span>
            <span class="ornament-line" />
          </div>
          <p class="books-subtitle">
            {{ t('books.subtitle') }}
          </p>
        </div>
      </header>

      <ParchmentNote :label="t('books.parchmentLabel')">
        <p>
          {{ t('books.parchmentQuote') }}
        </p>
        <cite>{{ t('books.parchmentCite') }}</cite>
      </ParchmentNote>

      <ul class="books-grid">
        <li v-for="book in coreBooks" :key="book.id">
          <button class="book-card" type="button" @click="openBook(book.id)">
            <span class="book-cover-frame">
              <img
                v-if="book.image"
                class="book-cover"
                :src="book.image"
                :alt="book.title"
                loading="lazy"
                referrerpolicy="no-referrer"
              />
              <span v-else class="book-cover placeholder" aria-hidden="true">📖</span>
            </span>
            <span class="book-caption">{{ book.title }}</span>
            <span v-if="book.author" class="book-author">{{ book.author }}</span>
          </button>
        </li>
      </ul>

      <section v-if="universeBooks.length" class="universe-section">
        <div class="universe-heading">
          <h2>{{ t('books.universeTitle') }}</h2>
          <div class="ornament-hr small" aria-hidden="true">
            <span class="ornament-line" />
            <span class="ornament-mark">✦</span>
            <span class="ornament-line" />
          </div>
          <p>
            {{ t('books.universeDesc') }}
          </p>
        </div>

        <ul class="books-grid universe-grid">
          <li v-for="book in universeBooks" :key="book.id">
            <button class="book-card" type="button" @click="openBook(book.id)">
              <span class="book-cover-frame">
                <img
                  v-if="book.image"
                  class="book-cover"
                  :src="book.image"
                  :alt="book.title"
                  loading="lazy"
                  referrerpolicy="no-referrer"
                />
                <span v-else class="book-cover placeholder" aria-hidden="true">📖</span>
              </span>
              <span class="book-caption small">{{ book.title }}</span>
              <span v-if="book.author" class="book-author">{{ book.author }}</span>
            </button>
          </li>
        </ul>
      </section>
    </template>
  </section>
</template>

<style scoped>
.books-view {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* ---- METRO BOOKS hero ---- */
.books-hero {
  position: relative;
  border: 1px solid var(--color-border-strong);
  background-color: #0a0d0f;
  background-size: cover;
  background-position: center 22%;
  box-shadow: var(--shadow-panel);
  padding: 3rem 1.5rem 3.25rem;
  overflow: hidden;
}

.books-hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(6, 9, 11, 0.72), rgba(6, 9, 11, 0.9));
  z-index: 0;
}

.books-hero-inner {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1rem;
}

.books-emblem {
  width: 58px;
  height: auto;
  filter: drop-shadow(0 3px 8px rgba(0, 0, 0, 0.7));
  opacity: 0.95;
}

.books-title {
  margin: 0;
  font-family: 'Cinzel', 'Times New Roman', serif;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  font-size: clamp(1.8rem, 4vw, 3rem);
  color: #ece7dc;
  text-shadow: 0 2px 14px rgba(0, 0, 0, 0.8);
}

.ornament-hr {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  width: min(420px, 80%);
}

.ornament-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    var(--color-border-strong) 25%,
    var(--color-steel) 50%,
    var(--color-border-strong) 75%,
    transparent
  );
}

.ornament-mark {
  color: var(--color-amber);
  font-size: 0.8rem;
  text-shadow: var(--glow-amber);
}

.books-subtitle {
  margin: 0;
  max-width: 60ch;
  font-size: 0.9rem;
  line-height: 1.6;
  color: var(--color-text-dim);
}

/* ---- cover grid ---- */
.books-grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
}

.book-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.7rem;
  width: 100%;
  padding: 0.5rem;
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--color-text);
}

.book-cover-frame {
  display: block;
  width: 100%;
  aspect-ratio: 3 / 4;
  border: 1px solid var(--color-border-strong);
  background: rgba(0, 0, 0, 0.4);
  box-shadow: var(--shadow-panel);
  overflow: hidden;
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
}

.book-card:hover .book-cover-frame {
  transform: translateY(-4px);
  border-color: var(--color-amber);
  box-shadow: 0 10px 26px rgba(0, 0, 0, 0.7), var(--glow-amber);
}

.book-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.book-cover.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  color: var(--color-text-faint);
}

.book-caption {
  font-family: 'Cinzel', 'Times New Roman', serif;
  font-style: italic;
  font-size: 1.05rem;
  color: var(--color-amber);
  text-align: center;
}

.book-author {
  font-family: var(--font-mono);
  font-size: 0.68rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-faint);
}

/* ---- Universe section ---- */
.universe-section {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  margin-top: 0.5rem;
}

.universe-heading {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.6rem;
}

.universe-heading h2 {
  margin: 0;
  font-family: 'Cinzel', 'Times New Roman', serif;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-size: clamp(1.2rem, 2.5vw, 1.7rem);
  color: #ece7dc;
}

.universe-heading p {
  margin: 0;
  max-width: 60ch;
  font-size: 0.85rem;
  color: var(--color-text-dim);
}

.ornament-hr.small {
  width: min(320px, 70%);
}

.universe-grid {
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 1.1rem;
}

.book-caption.small {
  font-size: 0.9rem;
  font-style: normal;
}

.detail-meta {
  margin: 0 0 0.4rem;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  color: var(--color-steel);
}

/* ---- detail ---- */
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

.book-detail {
  padding: 1.75rem 2rem;
}

.detail-header h1 {
  margin: 0.5rem 0;
  font-family: 'Cinzel', 'Times New Roman', serif;
  letter-spacing: 0.06em;
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
  max-width: 240px;
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

.markdown-body :deep(blockquote) {
  margin: 1rem 0;
  padding-left: 1rem;
  border-left: 2px solid var(--color-amber);
  color: var(--color-text-dim);
  font-style: italic;
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
</style>
