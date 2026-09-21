<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { marked } from 'marked'
import { events } from '../data/events'
import { handleInternalClick, linkify } from '../utils/wikiLinks'

const router = useRouter()
marked.setOptions({ breaks: false, gfm: true })

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
</script>

<template>
  <section class="events-view">
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
</style>
