<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { metroLineById } from '../data/locations'
import { t } from '../i18n'

const route = useRoute()
const router = useRouter()

const line = computed(() => metroLineById[String(route.params.id)] ?? null)

function openStation(station) {
  if (station.levelId) router.push({ name: 'level-detail', params: { id: station.levelId } })
}
function back() {
  router.push({ name: 'locations' })
}

const inGameCount = computed(() => (line.value?.stations.filter((s) => s.levelId).length ?? 0))
</script>

<template>
  <section class="line-view">
    <button class="back-link" type="button" @click="back">{{ t('locations.backToList') }}</button>

    <template v-if="line">
      <header class="mx-panel view-header">
        <span class="line-badge">
          <span class="line-dot" :style="{ backgroundColor: line.color }" />
          <span class="mx-tag">{{ t('metroLine.tag') }}</span>
        </span>
        <h1>{{ line.label }}</h1>
        <p v-if="line.blurb" class="line-blurb">{{ line.blurb }}</p>
        <p class="line-stats">
          {{ t('metroLine.statsTpl').replace('{total}', line.stations.length).replace('{inGame}', inGameCount) }}
        </p>
        <a
          v-if="line.slug"
          class="fandom-link"
          :href="`https://metrovideogame.fandom.com/wiki/${line.slug}`"
          target="_blank"
          rel="noopener"
        >{{ t('metroLine.fandomLink') }}</a>
      </header>

      <ul class="station-list mx-panel" :style="{ '--line-color': line.color }">
        <li
          v-for="station in line.stations"
          :key="station.id"
          class="station-row"
          :class="{ 'is-linked': station.levelId }"
        >
          <component
            :is="station.levelId ? 'button' : 'div'"
            class="station-inner"
            @click="openStation(station)"
          >
            <span class="node" />
            <span class="station-name">{{ station.name }}</span>
            <span v-if="station.levelId" class="station-tag">{{ t('stations.inGame') }}</span>
          </component>
        </li>
      </ul>
    </template>

    <div v-else class="mx-panel empty-state">
      <span class="empty-icon">⌖</span>
      <h2>{{ t('metroLine.unknownTitle') }}</h2>
      <p>{{ t('metroLine.unknownText') }}</p>
    </div>
  </section>
</template>

<style scoped>
.line-view {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
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

.view-header {
  padding: 1.5rem 1.75rem;
}

.line-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.line-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.4);
}

.view-header h1 {
  margin: 0.5rem 0;
}

.line-blurb {
  margin: 0 0 0.5rem;
  max-width: 74ch;
  color: var(--color-text-dim);
}

.line-stats {
  margin: 0 0 0.6rem;
  font-family: var(--font-mono);
  font-size: 0.78rem;
  color: var(--color-text-faint);
}

.fandom-link {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  color: var(--color-amber);
}

/* Stations threaded along a colored line. */
.station-list {
  list-style: none;
  margin: 0;
  padding: 0.75rem 1rem;
  position: relative;
}

.station-list::before {
  content: '';
  position: absolute;
  top: 1.4rem;
  bottom: 1.4rem;
  left: calc(1rem + 6px);
  width: 3px;
  background: var(--line-color, var(--color-amber));
  opacity: 0.7;
}

.station-row {
  position: relative;
}

.station-inner {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  width: 100%;
  text-align: left;
  background: transparent;
  border: none;
  color: var(--color-text);
  font: inherit;
  padding: 0.4rem 0.3rem;
}

.node {
  width: 13px;
  height: 13px;
  border-radius: 50%;
  flex-shrink: 0;
  background: var(--color-bg);
  border: 3px solid var(--line-color, var(--color-amber));
  z-index: 1;
}

.station-row.is-linked .station-inner {
  cursor: pointer;
}

.station-row.is-linked .node {
  background: var(--line-color, var(--color-amber));
}

.station-row.is-linked .station-name {
  color: var(--color-amber-bright);
}

.station-row.is-linked .station-inner:hover .station-name {
  text-decoration: underline;
}

.station-name {
  flex: 1;
  font-size: 0.9rem;
}

.station-tag {
  font-family: var(--font-mono);
  font-size: 0.66rem;
  letter-spacing: 0.05em;
  color: var(--color-amber);
  white-space: nowrap;
}

.empty-state {
  text-align: center;
  padding: 3rem 1.5rem;
}

.empty-icon {
  font-size: 2rem;
  color: var(--color-text-faint);
}
</style>
