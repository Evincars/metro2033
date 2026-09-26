<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { stations } from '../data/stations'
import { lines, stationLines } from '../data/stationLines'
import { stationToLevel } from '../data/journey'
import { realMetroById, gameStationToRealMetro } from '../data/realMetro'
import { levelsById } from '../data/levels'
import { locationsById, stationToLocation } from '../data/locations'
import { fuzzyMatch } from '../utils/search'
import { t } from '../i18n'

const router = useRouter()

const search = ref('')
const searchInput = ref(null)
const activeLine = ref('all')
const mention = ref('all')
const expandedId = ref(null)
const detailTab = ref('game')
const brokenImg = ref(false)

const lineById = Object.fromEntries(lines.map((l) => [l.id, l]))

const rows = stations.map((station) => {
  const levelId = stationToLevel[station.id] ?? null
  const realMetroId = gameStationToRealMetro[station.id] ?? null
  const realMetro = realMetroId ? realMetroById[realMetroId] : null
  const level = levelId ? levelsById[levelId] : null
  const locationId = stationToLocation[station.id] ?? null
  const location = locationId ? locationsById[locationId] : null
  return {
    ...station,
    line: stationLines[station.id] ?? null,
    levelId,
    level,
    location,
    inGame: !!(levelId || locationId),
    realMetro,
    hasRealMetro: !!realMetro,
  }
})

const lineChips = computed(() => lines.filter((line) => rows.some((row) => row.line === line.id)))

const filtered = computed(() =>
  rows
    .filter((row) => (activeLine.value === 'all' ? true : row.line === activeLine.value))
    .filter((row) => {
      if (mention.value === 'in') return row.inGame
      if (mention.value === 'out') return !row.inGame
      return true
    })
    .filter((row) => fuzzyMatch(search.value, row.name) || (row.realMetro && fuzzyMatch(search.value, row.realMetro.title)))
    .sort((a, b) => (a.line ?? 99) - (b.line ?? 99) || a.name.localeCompare(b.name)),
)

const inGameCount = rows.filter((row) => row.inGame).length

function toggleStation(row) {
  if (expandedId.value === row.id) {
    expandedId.value = null
  } else {
    expandedId.value = row.id
    brokenImg.value = false
    detailTab.value = row.inGame ? 'game' : (row.hasRealMetro ? 'real' : 'game')
  }
}

function showOnMap(stationId) {
  router.push({ name: 'map', query: { station: stationId } })
}

function openLevel(levelId) {
  router.push({ name: 'level-detail', params: { id: levelId } })
}

function openLocation(locationId) {
  router.push({ name: 'location-detail', params: { id: locationId } })
}

function openRealMetroDetail(realId) {
  router.push({ name: 'real-metro-detail', params: { id: realId } })
}

function onKeydown(event) {
  if (event.key === 'Escape' && expandedId.value) {
    expandedId.value = null
    return
  }
  if (event.key !== '/') return
  const tag = document.activeElement?.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA') return
  event.preventDefault()
  searchInput.value?.focus()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <section class="stations-view">
    <header class="mx-panel view-header">
      <span class="mx-tag">{{ t('stations.tag') }}</span>
      <h1>{{ t('stations.title') }}</h1>
      <p>{{ t('stations.descriptionTpl').replace('{total}', rows.length).replace('{inGame}', inGameCount) }}</p>
      <RouterLink to="/map" class="map-cta">{{ t('stations.openMap') }}</RouterLink>
    </header>

    <div class="mx-panel toolbar">
      <input
        ref="searchInput"
        v-model="search"
        type="search"
        class="search-input"
        :placeholder="t('stations.searchPlaceholder')"
        aria-label="Search stations"
      />

      <div class="filter-group" aria-label="In-game filter">
        <button type="button" class="chip" :class="{ 'is-active': mention === 'all' }" @click="mention = 'all'">
          {{ t('stations.all') }}
        </button>
        <button type="button" class="chip" :class="{ 'is-active': mention === 'in' }" @click="mention = 'in'">
          {{ t('stations.inTheGames') }}
        </button>
        <button type="button" class="chip" :class="{ 'is-active': mention === 'out' }" @click="mention = 'out'">
          {{ t('stations.notFeatured') }}
        </button>
      </div>
    </div>

    <div class="mx-panel line-bar">
      <button type="button" class="chip" :class="{ 'is-active': activeLine === 'all' }" @click="activeLine = 'all'">
        {{ t('stations.allLines') }}
      </button>
      <button
        v-for="line in lineChips"
        :key="line.id"
        type="button"
        class="chip line-chip"
        :class="{ 'is-active': activeLine === line.id }"
        @click="activeLine = line.id"
      >
        <span class="line-dot" :style="{ backgroundColor: line.color }" />
        {{ line.label }}
      </button>
    </div>

    <ul v-if="filtered.length" class="station-list">
      <li v-for="row in filtered" :key="row.id" class="station-item">
        <button
          class="station-card mx-panel"
          :class="{ expanded: expandedId === row.id }"
          @click="toggleStation(row)"
        >
          <span
            class="line-dot"
            :style="{ backgroundColor: lineById[row.line]?.color ?? 'var(--color-border-strong)' }"
            :title="lineById[row.line]?.label ?? 'Unknown line'"
          />
          <span class="station-name">{{ row.name }}</span>
          <span v-if="row.realMetro" class="station-name-ru">{{ row.realMetro.title }}</span>
          <span v-if="row.inGame" class="station-tag">{{ t('stations.inGame') }}</span>
          <span v-if="row.hasRealMetro" class="station-tag real-tag">{{ t('realMetro.tabReal') }}</span>
        </button>

        <!-- Expanded detail panel -->
        <div v-if="expandedId === row.id" class="station-detail mx-panel">
          <!-- Tab bar when both exist -->
          <div v-if="row.inGame && row.hasRealMetro" class="detail-tabs">
            <button
              class="detail-tab"
              :class="{ active: detailTab === 'game' }"
              @click="detailTab = 'game'; brokenImg = false"
            >{{ t('realMetro.tabGame') }}</button>
            <button
              class="detail-tab"
              :class="{ active: detailTab === 'real' }"
              @click="detailTab = 'real'; brokenImg = false"
            >{{ t('realMetro.tabReal') }}</button>
          </div>

          <!-- Game info tab -->
          <div v-if="detailTab === 'game' && row.inGame" class="detail-content">
            <div class="detail-info">
              <h3 v-if="row.level">{{ row.level.title }}</h3>
              <h3 v-else-if="row.location">{{ row.location.title }}</h3>
              <p v-if="row.level?.chapter" class="detail-chapter">{{ row.level.chapter }}</p>
              <p class="detail-brief">{{ (row.level || row.location)?.brief || '' }}</p>
              <img
                v-if="(row.level || row.location)?.image && !brokenImg"
                class="detail-img"
                :src="(row.level || row.location).image"
                :alt="(row.level || row.location).title"
                referrerpolicy="no-referrer"
                loading="lazy"
                @error="brokenImg = true"
              />
            </div>
            <div class="detail-actions">
              <button v-if="row.levelId" class="btn-detail" @click.stop="openLevel(row.levelId)">{{ t('stations.openLevel') }}</button>
              <button v-else-if="row.location" class="btn-detail" @click.stop="openLocation(row.location.id)">{{ t('stations.openLocation') }}</button>
              <button class="btn-map" @click.stop="showOnMap(row.id)">{{ t('stations.showOnMap') }}</button>
            </div>
          </div>

          <!-- Real metro info tab -->
          <div v-if="detailTab === 'real' && row.hasRealMetro" class="detail-content">
            <div class="detail-info">
              <h3>{{ row.realMetro.title }}</h3>
              <p class="detail-line-name">{{ row.realMetro.lineName }}</p>
              <div class="detail-meta-row">
                <span v-if="row.realMetro.opened" class="detail-meta-item">{{ row.realMetro.opened }}</span>
                <span v-if="row.realMetro.architects" class="detail-meta-item">{{ row.realMetro.architects }}</span>
              </div>
              <img
                v-if="row.realMetro.image && !brokenImg"
                class="detail-img"
                :src="row.realMetro.image"
                :alt="row.realMetro.title"
                loading="lazy"
                @error="brokenImg = true"
              />
              <p class="detail-brief">{{ row.realMetro.brief }}</p>
            </div>
            <div class="detail-actions">
              <button class="btn-detail" @click.stop="openRealMetroDetail(row.realMetro.id)">{{ t('stations.openRealMetro') }}</button>
              <button class="btn-map" @click.stop="showOnMap(row.id)">{{ t('stations.showOnMap') }}</button>
            </div>
          </div>

          <!-- Only map button if no info at all -->
          <div v-if="!row.inGame && !row.hasRealMetro" class="detail-content">
            <p class="detail-brief">{{ t('map.noDossier') }}</p>
            <div class="detail-actions">
              <button class="btn-map" @click.stop="showOnMap(row.id)">{{ t('stations.showOnMap') }}</button>
            </div>
          </div>
        </div>
      </li>
    </ul>

    <div v-else class="mx-panel empty-state">
      <span class="empty-icon">●</span>
      <h2>{{ t('stations.noMatch') }}</h2>
      <p>{{ t('stations.noMatchHint') }}</p>
    </div>
  </section>
</template>

<style scoped>
.stations-view {
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
  max-width: 70ch;
}

.map-cta {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin-top: 1rem;
  font-family: var(--font-display);
  font-size: 0.85rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-bg);
  background: var(--color-amber);
  border: 1px solid var(--color-amber);
  padding: 0.55rem 1.1rem;
  border-radius: 2px;
  box-shadow: var(--glow-amber);
  transition: filter 0.15s ease, transform 0.15s ease;
}

.map-cta:hover {
  filter: brightness(1.12);
  transform: translateY(-1px);
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
  padding: 1rem 1.25rem;
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

.filter-group {
  display: flex;
  gap: 0.4rem;
}

.line-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.9rem 1.1rem;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-family: var(--font-display);
  font-size: 0.72rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-text-dim);
  background: transparent;
  border: 1px solid var(--color-border-strong);
  padding: 0.4rem 0.7rem;
  border-radius: 2px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.chip:hover {
  color: var(--color-amber-bright);
  border-color: var(--color-amber);
}

.chip.is-active {
  color: var(--color-bg);
  background: var(--color-amber);
  border-color: var(--color-amber);
}

.line-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.4);
}

.station-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.station-card {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  width: 100%;
  text-align: left;
  padding: 0.7rem 0.9rem;
  color: var(--color-text);
  font: inherit;
  cursor: pointer;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.station-card:hover {
  border-color: var(--color-border-strong);
  box-shadow: var(--glow-amber);
}

.station-card.expanded {
  border-color: var(--color-amber);
  box-shadow: var(--glow-amber);
}

.station-name {
  font-size: 0.9rem;
  flex: 1;
  min-width: 0;
}

.station-name-ru {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  color: var(--color-text-faint);
  flex-shrink: 0;
}

.station-tag {
  font-family: var(--font-mono);
  font-size: 0.65rem;
  letter-spacing: 0.05em;
  color: var(--color-amber);
  white-space: nowrap;
}

.real-tag {
  color: var(--color-text-faint);
}

/* Expanded detail panel */
.station-detail {
  margin-top: -0.3rem;
  padding: 1rem 1.1rem;
  border-top: none;
}

.detail-tabs {
  display: flex;
  gap: 0;
  margin-bottom: 0.75rem;
  border-bottom: 1px solid var(--color-border-strong);
}

.detail-tab {
  flex: 1;
  padding: 0.4rem 0.5rem;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-faint);
  cursor: pointer;
  text-align: center;
  transition: color 0.12s, border-color 0.12s;
}

.detail-tab:hover {
  color: var(--color-text);
}

.detail-tab.active {
  color: var(--color-amber-bright);
  border-bottom-color: var(--color-amber);
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.detail-info h3 {
  font-family: var(--font-display);
  font-size: 1.1rem;
  color: var(--color-amber-bright);
  margin: 0 0 0.25rem;
}

.detail-chapter {
  font-family: var(--font-mono);
  font-size: 0.68rem;
  color: var(--color-text-faint);
  margin: 0;
}

.detail-line-name {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  color: var(--color-text-faint);
  margin: 0 0 0.15rem;
}

.detail-meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem 1rem;
  margin-bottom: 0.4rem;
}

.detail-meta-item {
  font-family: var(--font-mono);
  font-size: 0.68rem;
  color: var(--color-text-faint);
}

.detail-brief {
  font-size: 0.85rem;
  line-height: 1.5;
  color: var(--color-text-dim);
  margin: 0;
  max-width: 72ch;
}

.detail-img {
  width: 100%;
  max-width: 320px;
  height: 160px;
  object-fit: cover;
  border: 1px solid var(--color-border-strong);
  margin: 0.3rem 0;
}

.detail-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.btn-detail,
.btn-map {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.06em;
  padding: 0.4rem 0.75rem;
  border: 1px solid var(--color-border-strong);
  background: transparent;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-detail {
  color: var(--color-amber);
  border-color: var(--color-amber);
}

.btn-detail:hover {
  background: var(--color-amber);
  color: var(--color-bg);
}

.btn-map {
  color: var(--color-text-dim);
}

.btn-map:hover {
  color: var(--color-amber-bright);
  border-color: var(--color-amber);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 0.5rem;
  padding: 4rem 1.5rem;
  color: var(--color-text-faint);
}

.empty-icon {
  font-size: 1.75rem;
  color: var(--color-toxic-bright);
  text-shadow: var(--glow-toxic);
}

.empty-state h2 {
  font-size: 1rem;
  margin: 0;
}

.empty-state p {
  margin: 0;
  max-width: 40ch;
}
</style>
