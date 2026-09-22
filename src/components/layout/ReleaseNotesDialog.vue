<script setup>
import { onBeforeUnmount, onMounted } from 'vue'
import { APP_VERSION, releases } from '../../data/release'

const emit = defineEmits(['close'])

function onKeydown(event) {
  if (event.key === 'Escape') emit('close')
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <Teleport to="body">
    <div class="notes-backdrop" @click.self="emit('close')">
      <div class="notes-dialog mx-panel" role="dialog" aria-modal="true" aria-label="Release notes">
        <header class="notes-head">
          <span class="mx-tag">Field log</span>
          <h2 class="notes-title">Release notes</h2>
          <span class="version-badge">version {{ APP_VERSION }}</span>
          <button class="notes-close" type="button" aria-label="Close" @click="emit('close')">×</button>
        </header>

        <div class="notes-scroll">
          <section v-for="rel in releases" :key="rel.version" class="release">
            <div class="release-head">
              <span class="release-version">v{{ rel.version }}</span>
              <span class="release-name">{{ rel.title }}</span>
              <span class="release-date">{{ rel.date }}</span>
            </div>
            <ul class="release-notes">
              <li v-for="(note, i) in rel.notes" :key="i">{{ note }}</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.notes-backdrop {
  position: fixed;
  inset: 0;
  z-index: 3000;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding: calc(var(--header-height) + 0.5rem) 1rem 1rem;
  background: rgba(4, 6, 8, 0.55);
  backdrop-filter: blur(2px);
}

.notes-dialog {
  width: min(400px, 100%);
  max-height: calc(100vh - var(--header-height) - 2rem);
  display: flex;
  flex-direction: column;
  padding: 1rem 1.1rem 1.2rem;
  background: linear-gradient(180deg, var(--color-panel) 0%, var(--color-panel-alt) 100%);
  border: 1px solid var(--color-border-strong);
  box-shadow: var(--shadow-panel), var(--glow-amber);
}

.notes-head {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.notes-title {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1.2rem;
  color: var(--color-text);
}

.version-badge {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--color-bg);
  background: var(--color-amber);
  padding: 0.15rem 0.5rem;
  border-radius: 2px;
  box-shadow: var(--glow-amber);
}

.notes-close {
  position: absolute;
  top: -0.2rem;
  right: -0.2rem;
  background: none;
  border: none;
  color: var(--color-text-faint);
  font-size: 1.3rem;
  line-height: 1;
  cursor: pointer;
}

.notes-close:hover {
  color: var(--color-amber-bright);
}

.notes-scroll {
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}

.release-head {
  display: flex;
  align-items: baseline;
  gap: 0.6rem;
  padding-bottom: 0.35rem;
  border-bottom: 1px solid var(--color-border-strong);
}

.release-version {
  font-family: var(--font-display);
  font-size: 1rem;
  color: var(--color-amber-bright);
}

.release-name {
  flex: 1;
  font-size: 0.85rem;
  color: var(--color-text-dim);
}

.release-date {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  color: var(--color-text-faint);
}

.release-notes {
  margin: 0.6rem 0 0;
  padding-left: 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.release-notes li {
  font-size: 0.85rem;
  line-height: 1.45;
  color: var(--color-text);
}
</style>
