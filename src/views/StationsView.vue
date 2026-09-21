<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { stations } from '../data/stations'
import { lines, stationLines } from '../data/stationLines'
import { stationToLevel } from '../data/journey'
import { fuzzyMatch } from '../utils/search'

const router = useRouter()

const search = ref('')
const searchInput = ref(null)
const activeLine = ref('all') // 'all' | line number
const mention = ref('all') // 'all' | 'in' | 'out'

const lineById = Object.fromEntries(lines.map((l) => [l.id, l]))

// Enrich each station with its line + in-game (has a level dossier) status.
const rows = stations.map((station) => {
  const levelId = stationToLevel[station.id] ?? null
  return {
    ...station,
    line: stationLines[station.id] ?? null,
    levelId,
    inGame: !!levelId,
  }
})

// Only show line chips that actually have stations, in line order.
const lineChips = computed(() => lines.filter((line) => rows.some((row) => row.line === line.id)))

const filtered = computed(() =>
  rows
    .filter((row) => (activeLine.value === 'all' ? true : row.line === activeLine.value))
    .filter((row) => {
      if (mention.value === 'in') return row.inGame
      if (mention.value === 'out') return !row.inGame
      return true
    })
    .filter((row) => fuzzyMatch(search.value, row.name))
    .sort((a, b) => (a.line ?? 99) - (b.line ?? 99) || a.name.localeCompare(b.name)),
)

const inGameCount = rows.filter((row) => row.inGame).length

function onKeydown(event) {
  if (event.key !== '/') return
  const tag = document.activeElement?.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA') return
  event.preventDefault()
  searchInput.value?.focus()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))

function openStation(row) {
  if (row.levelId) router.push({ name: 'level-detail', params: { id: row.levelId } })
}
</script>

<template>
  <section class="stations-view">
    <header class="mx-panel view-header">
      <span class="mx-tag">Station registry</span>
      <h1>Stations</h1>
      <p>
        {{ rows.length }} stations of the Moscow Metro. {{ inGameCount }} appear in the games —
        toggle the filters below or type to search. Stations featured in a level link to their
        dossier.
      </p>
    </header>

    <div class="mx-panel toolbar">
      <input
        ref="searchInput"
        v-model="search"
        type="search"
        class="search-input"
        placeholder="Search stations…  (press / to focus)"
        aria-label="Search stations"
      />

      <div class="filter-group" aria-label="In-game filter">
        <button type="button" class="chip" :class="{ 'is-active': mention === 'all' }" @click="mention = 'all'">
          All
        </button>
        <button type="button" class="chip" :class="{ 'is-active': mention === 'in' }" @click="mention = 'in'">
          In the games
        </button>
        <button type="button" class="chip" :class="{ 'is-active': mention === 'out' }" @click="mention = 'out'">
          Not featured
        </button>
      </div>
    </div>

    <div class="mx-panel line-bar">
      <button type="button" class="chip" :class="{ 'is-active': activeLine === 'all' }" @click="activeLine = 'all'">
        All lines
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

    <ul v-if="filtered.length" class="station-grid">
      <li v-for="row in filtered" :key="row.id">
        <component
          :is="row.inGame ? 'button' : 'div'"
          class="station-card mx-panel"
          :class="{ 'is-linked': row.inGame }"
          @click="openStation(row)"
        >
          <span
            class="line-dot"
            :style="{ backgroundColor: lineById[row.line]?.color ?? 'var(--color-border-strong)' }"
            :title="lineById[row.line]?.label ?? 'Unknown line'"
          />
          <span class="station-name">{{ row.name }}</span>
          <span v-if="row.inGame" class="station-tag">In game →</span>
        </component>
      </li>
    </ul>

    <div v-else class="mx-panel empty-state">
      <span class="empty-icon">●</span>
      <h2>No stations match</h2>
      <p>Try a different search term or clear the filters.</p>
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

.station-grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 0.6rem;
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
}

.station-card.is-linked {
  cursor: pointer;
  transition: border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
}

.station-card.is-linked:hover {
  border-color: var(--color-border-strong);
  box-shadow: var(--glow-amber);
  transform: translateY(-1px);
}

.station-name {
  font-size: 0.9rem;
  flex: 1;
  min-width: 0;
}

.station-tag {
  font-family: var(--font-mono);
  font-size: 0.65rem;
  letter-spacing: 0.05em;
  color: var(--color-amber);
  white-space: nowrap;
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
