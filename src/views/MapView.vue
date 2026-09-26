<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { t } from '../i18n'
import { MAP_IMAGE, STATION_RADIUS, stations } from '../data/stations'
import { journeys, stationToLevel } from '../data/journey'
import { levelsById } from '../data/levels'
import { locationsById, stationToLocation } from '../data/locations'
import { charactersById } from '../data/characters'
import { realMetroById, gameStationToRealMetro } from '../data/realMetro'

const route = useRoute()
const router = useRouter()

const mapContainer = ref(null)
const mapFrame = ref(null)
const tooltipEl = ref(null)
const selected = ref(null)
const tooltipPos = ref({ x: 0, y: 0 })
const tooltipImageBroken = ref(false)
const tooltipTab = ref('game')

const galleryOpen = ref(false)
const galleryIndex = ref(0)
const galleryImages = computed(() => selected.value?.realMetro?.gallery || [])

const showJourney = ref({ 'metro-2033': false, 'last-light': false })
const JOURNEY_STYLE = {
  'metro-2033': { color: '#e8952a', label: t('map.journey2033') },
  'last-light': { color: '#4fb0d6', label: t('map.journeyLL') },
}

const LEVEL_CHARACTERS = {
  'hunter': ['hunter'],
  'exhibition': ['alex', 'artyom'],
  'riga': ['bourbon'],
  'market': ['nikki'],
  'armory': ['andrew'],
  'front-line': ['andrew'],
  'child': ['khan'],
  'outpost': ['miller'],
  'black-station': ['ulman', 'miller'],
  'polis': ['miller'],
  'library': ['danila', 'miller'],
  'd6': ['miller', 'ulman'],
  'separation': ['miller'],
  'tower': ['artyom'],
  'introduction': ['artyom', 'miller'],
  'sparta': ['miller', 'anna'],
  'pavel': ['pavel-morozov'],
  'reich': ['pavel-morozov'],
  'facility': ['anna'],
  'bolshoi': ['pavel-morozov'],
  'korbut': ['czeslav-korbut'],
  'revolution': ['pavel-morozov'],
  'regina': ['anna'],
  'bandits': ['anna'],
  'venice': ['pavel-morozov', 'khan'],
  'khan': ['khan'],
  'd6-ll': ['miller'],
}

let map = null
let resizeObserver = null
const markers = shallowRef([])
const journeyLayers = {}
const stationMarkerMap = {}

const imageBounds = L.latLngBounds([0, 0], [MAP_IMAGE.height, MAP_IMAGE.width])
const toLatLng = (point) => L.latLng(MAP_IMAGE.height - point.y, point.x)

function stationsOnJourney(game) {
  const ids = new Set()
  for (const node of (journeys[game] || [])) {
    if (node.station) ids.add(node.station)
  }
  return ids
}

function journeyNodesForStation(stationId) {
  const result = []
  for (const [game, nodes] of Object.entries(journeys)) {
    for (const node of nodes) {
      if (node.station === stationId) {
        const level = levelsById[node.id]
        if (level) result.push({ game, node, level })
      }
    }
  }
  return result
}

function levelForStation(station) {
  const levelId = stationToLevel[station.id]
  return levelId ? levelsById[levelId] : null
}

function locationForStation(station) {
  const locationId = stationToLocation[station.id]
  return locationId ? locationsById[locationId] : null
}

function realMetroForStation(station) {
  const realId = gameStationToRealMetro[station.id]
  return realId ? realMetroById[realId] : null
}

const tooltipStyle = computed(() => ({
  transform: `translate(${tooltipPos.value.x}px, ${tooltipPos.value.y}px)`,
}))

function currentScale() {
  return map ? map.getZoomScale(map.getZoom(), 0) : 1
}

function scaleMarkers() {
  const radius = STATION_RADIUS * currentScale()
  markers.value.forEach((marker) => marker.setRadius(radius))
}

function updateTooltipPosition() {
  if (!map || !selected.value) return
  const point = map.latLngToContainerPoint(toLatLng(selected.value.point))
  const frame = mapFrame.value
  const margin = 12
  const width = tooltipEl.value?.offsetWidth ?? 300
  const height = tooltipEl.value?.offsetHeight ?? 200
  const offset = STATION_RADIUS * currentScale() + 10

  let x = point.x - width / 2
  let y = point.y + offset
  if (frame && y + height > frame.clientHeight - margin) y = point.y - offset - height
  if (frame) {
    x = Math.min(Math.max(x, margin), Math.max(margin, frame.clientWidth - width - margin))
    y = Math.min(Math.max(y, margin), Math.max(margin, frame.clientHeight - height - margin))
  }
  tooltipPos.value = { x: Math.round(x), y: Math.round(y) }
}

function resolveCharacters(levelId) {
  const charIds = LEVEL_CHARACTERS[levelId] || []
  return charIds
    .map((id) => charactersById[id])
    .filter(Boolean)
    .map((c) => ({ id: c.id, title: c.title }))
}

async function selectStation(station) {
  const level = levelForStation(station)
  const location = level ? null : locationForStation(station)
  const entry = level || location
  const realMetro = realMetroForStation(station)

  const journeyNodes = journeyNodesForStation(station.id)
    .filter(({ game }) => showJourney.value[game])

  const hasGameInfo = !!(entry || journeyNodes.length)

  tooltipImageBroken.value = false
  tooltipTab.value = hasGameInfo ? 'game' : (realMetro ? 'real' : 'game')

  selected.value = {
    stationName: station.name,
    hasGameInfo,
    hasRealInfo: !!realMetro,
    name: entry ? entry.title : station.name,
    subtitle: level
      ? station.name
      : location
        ? `${station.name} · ${t('map.locationSuffix')}`
        : t('map.stationDossier'),
    brief: entry?.brief ?? '',
    image: entry?.image ?? '',
    chapter: level?.chapter ?? '',
    detailName: level ? 'level-detail' : location ? 'location-detail' : null,
    detailId: entry?.id ?? null,
    characters: level ? resolveCharacters(level.id) : [],
    journeyLevels: journeyNodes.map(({ game, level: lv }) => ({
      id: lv.id,
      title: lv.title,
      chapter: lv.chapter || '',
      game: JOURNEY_STYLE[game]?.label ?? game,
      gameColor: JOURNEY_STYLE[game]?.color ?? '#e8952a',
      characters: resolveCharacters(lv.id),
    })),
    realMetro: realMetro
      ? {
          id: realMetro.id,
          title: realMetro.title,
          lineName: realMetro.lineName,
          opened: realMetro.opened,
          architects: realMetro.architects,
          image: realMetro.image,
          brief: realMetro.brief,
          gallery: realMetro.gallery || [],
        }
      : null,
    point: station,
  }
  await nextTick()
  updateTooltipPosition()
}

async function selectNode(node, game) {
  const level = levelsById[node.id]
  if (!level) return
  tooltipImageBroken.value = false
  tooltipTab.value = 'game'
  selected.value = {
    stationName: level.title,
    hasGameInfo: true,
    hasRealInfo: false,
    name: level.title,
    subtitle: `${JOURNEY_STYLE[game]?.label ?? ''} · ${level.chapter || ''}`,
    brief: level.brief,
    image: level.image ?? '',
    chapter: level.chapter ?? '',
    detailName: 'level-detail',
    detailId: level.id,
    characters: resolveCharacters(level.id),
    journeyLevels: [],
    realMetro: null,
    point: node,
  }
  await nextTick()
  updateTooltipPosition()
}

function openDetail() {
  if (selected.value?.detailName && selected.value?.detailId) {
    router.push({ name: selected.value.detailName, params: { id: selected.value.detailId } })
  }
}

function openRealMetroDetail() {
  if (selected.value?.realMetro?.id) {
    router.push({ name: 'real-metro-detail', params: { id: selected.value.realMetro.id } })
  }
}

function openCharacter(id) {
  router.push({ name: 'character-detail', params: { id } })
}

function openLevel(id) {
  router.push({ name: 'level-detail', params: { id } })
}

function closeTooltip() {
  selected.value = null
  galleryOpen.value = false
}

function openGallery(idx) {
  galleryIndex.value = idx
  galleryOpen.value = true
}

function closeGallery() {
  galleryOpen.value = false
}

function galleryPrev() {
  galleryIndex.value = (galleryIndex.value - 1 + galleryImages.value.length) % galleryImages.value.length
}

function galleryNext() {
  galleryIndex.value = (galleryIndex.value + 1) % galleryImages.value.length
}

function fitWholeMap() {
  map.setMinZoom(-8)
  map.fitBounds(imageBounds, { animate: false })
  map.setMinZoom(map.getZoom())
  scaleMarkers()
}

function onKeydown(event) {
  if (event.key === 'Escape') {
    if (galleryOpen.value) closeGallery()
    else closeTooltip()
  }
  if (galleryOpen.value) {
    if (event.key === 'ArrowLeft') galleryPrev()
    if (event.key === 'ArrowRight') galleryNext()
  }
}

async function switchTab(tab) {
  tooltipTab.value = tab
  tooltipImageBroken.value = false
  await nextTick()
  updateTooltipPosition()
}

function buildJourneyLayers() {
  for (const [game, nodes] of Object.entries(journeys)) {
    const style = JOURNEY_STYLE[game]
    const group = L.layerGroup()

    L.polyline(
      nodes.map((node) => toLatLng(node)),
      {
        color: style.color,
        weight: 5,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round',
        className: 'journey-line',
      },
    ).addTo(group)

    nodes.forEach((node) => {
      if (node.station) return
      const marker = L.circleMarker(toLatLng(node), {
        radius: 8,
        color: style.color,
        weight: 2.5,
        fillColor: style.color,
        fillOpacity: 0.85,
        className: 'journey-node',
        bubblingMouseEvents: false,
      })
      marker.on('click', (event) => {
        L.DomEvent.stopPropagation(event)
        selectNode(node, game)
      })
      marker.addTo(group)
    })

    journeyLayers[game] = group
  }
}

function updateStationHighlights() {
  for (const [stationId, marker] of Object.entries(stationMarkerMap)) {
    let onJourney = false
    let journeyColor = null
    for (const [game, visible] of Object.entries(showJourney.value)) {
      if (visible && stationsOnJourney(game).has(stationId)) {
        onJourney = true
        journeyColor = JOURNEY_STYLE[game].color
      }
    }
    if (onJourney) {
      marker.setStyle({
        fillColor: journeyColor,
        fillOpacity: 0.7,
        color: journeyColor,
        weight: 3,
      })
    } else {
      marker.setStyle({
        fillColor: '#e8952a',
        fillOpacity: 0.01,
        color: 'transparent',
        weight: 3,
      })
    }
  }
}

function applyJourneyVisibility() {
  for (const [game, group] of Object.entries(journeyLayers)) {
    if (!map || !group) continue
    if (showJourney.value[game]) group.addTo(map)
    else map.removeLayer(group)
  }
  updateStationHighlights()
}

watch(showJourney, applyJourneyVisibility, { deep: true })

onMounted(() => {
  map = L.map(mapContainer.value, {
    crs: L.CRS.Simple,
    maxZoom: 3,
    zoomSnap: 0,
    zoomDelta: 0.5,
    zoomControl: true,
    attributionControl: false,
    maxBoundsViscosity: 0.9,
  })

  L.imageOverlay(MAP_IMAGE.url, imageBounds, { className: 'metro-map-image' }).addTo(map)
  map.setMaxBounds(imageBounds.pad(0.1))
  fitWholeMap()
  requestAnimationFrame(() => {
    if (!map) return
    map.invalidateSize({ animate: false })
    fitWholeMap()
  })

  markers.value = stations.map((station) => {
    const marker = L.circleMarker(toLatLng(station), {
      radius: STATION_RADIUS,
      className: 'station-hit',
      color: 'transparent',
      weight: 3,
      fillColor: '#e8952a',
      fillOpacity: 0.01,
      bubblingMouseEvents: false,
    })
    marker.on('click', (event) => {
      L.DomEvent.stopPropagation(event)
      selectStation(station)
    })
    stationMarkerMap[station.id] = marker
    return marker.addTo(map)
  })
  scaleMarkers()

  buildJourneyLayers()
  applyJourneyVisibility()

  map.on('zoom zoomend move', () => {
    scaleMarkers()
    updateTooltipPosition()
  })

  map.on('click', () => closeTooltip())

  resizeObserver = new ResizeObserver(() => {
    const wasFullyZoomedOut = map.getZoom() <= map.getMinZoom() + 0.01
    map.invalidateSize({ animate: false })
    if (wasFullyZoomedOut) {
      fitWholeMap()
    } else {
      map.setMinZoom(-8)
      map.setMinZoom(map.getBoundsZoom(imageBounds))
    }
    updateTooltipPosition()
  })
  resizeObserver.observe(mapFrame.value)

  window.addEventListener('keydown', onKeydown)

  const highlightId = route.query.station
  if (highlightId) {
    const station = stations.find((s) => s.id === highlightId)
    if (station) {
      const marker = stationMarkerMap[station.id]
      if (marker) {
        marker.setStyle({ fillColor: '#e8952a', fillOpacity: 0.85, color: '#e8952a', weight: 3 })
      }
      map.setView(toLatLng(station), 1, { animate: true })
      nextTick(() => selectStation(station))
    }
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  resizeObserver?.disconnect()
  map?.remove()
  map = null
})
</script>

<template>
  <section class="map-view">
    <div ref="mapFrame" class="map-frame mx-panel">
      <div ref="mapContainer" class="map-canvas" />

      <div
        v-if="selected"
        ref="tooltipEl"
        class="station-tooltip"
        :style="tooltipStyle"
        role="dialog"
        :aria-label="selected.stationName"
      >
        <button class="tooltip-close" type="button" aria-label="Close" @click="closeTooltip">×</button>

        <!-- Tab bar when both game + real info exist -->
        <div v-if="selected.hasGameInfo && selected.hasRealInfo" class="tooltip-tabs">
          <button
            class="tooltip-tab"
            :class="{ active: tooltipTab === 'game' }"
            @click="switchTab('game')"
          >{{ t('realMetro.tabGame') }}</button>
          <button
            class="tooltip-tab"
            :class="{ active: tooltipTab === 'real' }"
            @click="switchTab('real')"
          >{{ t('realMetro.tabReal') }}</button>
        </div>

        <!-- GAME tab content -->
        <template v-if="tooltipTab === 'game' && selected.hasGameInfo">
          <span class="tooltip-tag">{{ selected.subtitle }}</span>
          <h2 class="tooltip-title">{{ selected.name }}</h2>
          <span v-if="selected.chapter" class="tooltip-chapter">{{ selected.chapter }}</span>

          <img
            v-if="selected.image && !tooltipImageBroken"
            class="tooltip-image"
            :src="selected.image"
            :alt="selected.name"
            referrerpolicy="no-referrer"
            @error="tooltipImageBroken = true"
            @load="updateTooltipPosition"
          />

          <p class="tooltip-body">{{ selected.brief || t('map.noDossier') }}</p>

          <div v-if="selected.characters.length" class="tooltip-chars">
            <span class="tooltip-chars-label">{{ t('map.characters') }}:</span>
            <a
              v-for="c in selected.characters"
              :key="c.id"
              class="tooltip-char-link"
              href="#"
              @click.prevent="openCharacter(c.id)"
            >{{ c.title }}</a>
          </div>

          <div v-if="selected.journeyLevels.length" class="tooltip-journey-levels">
            <div v-for="jl in selected.journeyLevels" :key="jl.id" class="journey-level-entry">
              <span class="jl-swatch" :style="{ backgroundColor: jl.gameColor }" />
              <a class="jl-link" href="#" @click.prevent="openLevel(jl.id)">{{ jl.title }}</a>
              <span v-if="jl.chapter" class="jl-chapter">{{ jl.chapter }}</span>
              <span v-if="jl.characters.length" class="jl-chars">
                <a
                  v-for="c in jl.characters"
                  :key="c.id"
                  class="tooltip-char-link"
                  href="#"
                  @click.prevent="openCharacter(c.id)"
                >{{ c.title }}</a>
              </span>
            </div>
          </div>

          <a
            v-if="selected.detailName"
            class="tooltip-link"
            href="#"
            @click.prevent="openDetail"
          >{{ t('map.moreDetail') }}</a>
        </template>

        <!-- REAL METRO tab content -->
        <template v-if="tooltipTab === 'real' && selected.realMetro">
          <span class="tooltip-tag">{{ selected.realMetro.lineName }}</span>
          <h2 class="tooltip-title">{{ selected.realMetro.title }}</h2>
          <div class="tooltip-real-meta">
            <span v-if="selected.realMetro.opened" class="tooltip-real-date">{{ selected.realMetro.opened }}</span>
            <span v-if="selected.realMetro.architects" class="tooltip-real-arch">{{ selected.realMetro.architects }}</span>
          </div>

          <img
            v-if="selected.realMetro.image && !tooltipImageBroken"
            class="tooltip-image clickable-img"
            :src="selected.realMetro.image"
            :alt="selected.realMetro.title"
            @error="tooltipImageBroken = true"
            @load="updateTooltipPosition"
            @click="selected.realMetro.gallery.length && openGallery(0)"
          />

          <div v-if="selected.realMetro.gallery.length > 1" class="tooltip-gallery-thumbs">
            <img
              v-for="(url, idx) in selected.realMetro.gallery.slice(0, 4)"
              :key="idx"
              :src="url"
              class="gallery-mini-thumb"
              referrerpolicy="no-referrer"
              loading="lazy"
              @click="openGallery(idx)"
            />
          </div>

          <p class="tooltip-body">{{ selected.realMetro.brief }}</p>

          <a
            class="tooltip-link"
            href="#"
            @click.prevent="openRealMetroDetail"
          >{{ t('map.moreDetail') }}</a>
        </template>

        <!-- Fallback: no game info, no real info -->
        <template v-if="!selected.hasGameInfo && !selected.hasRealInfo">
          <span class="tooltip-tag">{{ t('map.stationDossier') }}</span>
          <h2 class="tooltip-title">{{ selected.stationName }}</h2>
          <p class="tooltip-body">{{ t('map.noDossier') }}</p>
        </template>
      </div>

      <!-- Fullscreen gallery overlay -->
      <Teleport to="body">
        <div v-if="galleryOpen && galleryImages.length" class="gallery-overlay" @click.self="closeGallery">
          <button class="gallery-close-btn" @click="closeGallery">×</button>
          <button v-if="galleryImages.length > 1" class="gallery-arrow gallery-arrow-left" @click="galleryPrev">‹</button>
          <img
            :src="galleryImages[galleryIndex]"
            :alt="selected?.realMetro?.title"
            class="gallery-full-img"
            referrerpolicy="no-referrer"
          />
          <button v-if="galleryImages.length > 1" class="gallery-arrow gallery-arrow-right" @click="galleryNext">›</button>
          <span class="gallery-counter">{{ galleryIndex + 1 }} / {{ galleryImages.length }}</span>
        </div>
      </Teleport>

      <div class="journey-controls mx-panel">
        <span class="journey-heading">{{ t('map.journeyHeading') }}</span>
        <label v-for="(style, game) in JOURNEY_STYLE" :key="game" class="journey-toggle">
          <input type="checkbox" v-model="showJourney[game]" />
          <span class="journey-swatch" :style="{ backgroundColor: style.color }" />
          <span class="journey-name">{{ style.label }}</span>
        </label>
      </div>

      <div class="map-overlay-note">{{ stations.length }} {{ t('map.hotspotsOnline') }}</div>
    </div>
  </section>
</template>

<style scoped>
.map-view {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  height: 100%;
}

.map-frame {
  position: relative;
  flex: 1;
  min-height: 60vh;
  overflow: hidden;
  touch-action: none;
}

.map-canvas {
  width: 100%;
  height: 100%;
  min-height: 60vh;
  background: #1a2028;
}

.station-tooltip {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 700;
  width: min(320px, calc(100% - 2rem));
  padding: 0.85rem 1rem 0.95rem;
  background: rgba(13, 12, 10, 0.96);
  border: 1px solid var(--color-border-strong);
  box-shadow: var(--shadow-panel), var(--glow-amber);
  color: var(--color-text);
}

.tooltip-close {
  position: absolute;
  top: 0.25rem;
  right: 0.4rem;
  background: none;
  border: none;
  color: var(--color-text-faint);
  font-size: 1.1rem;
  line-height: 1;
  cursor: pointer;
  z-index: 1;
}

.tooltip-close:hover {
  color: var(--color-amber-bright);
}

/* Tab bar */
.tooltip-tabs {
  display: flex;
  gap: 0;
  margin-bottom: 0.6rem;
  border-bottom: 1px solid var(--color-border-strong);
}

.tooltip-tab {
  flex: 1;
  padding: 0.35rem 0.5rem;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  font-family: var(--font-mono);
  font-size: 0.68rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-faint);
  cursor: pointer;
  text-align: center;
  transition: color 0.12s, border-color 0.12s;
}

.tooltip-tab:hover {
  color: var(--color-text);
}

.tooltip-tab.active {
  color: var(--color-amber-bright);
  border-bottom-color: var(--color-amber);
}

.tooltip-tag {
  font-family: var(--font-mono);
  font-size: 0.65rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-text-faint);
}

.tooltip-title {
  margin: 0.25rem 0 0.15rem;
  font-family: var(--font-display);
  font-size: 1.05rem;
  color: var(--color-amber-bright);
}

.tooltip-chapter {
  display: block;
  font-family: var(--font-mono);
  font-size: 0.62rem;
  letter-spacing: 0.08em;
  color: var(--color-text-faint);
  margin-bottom: 0.35rem;
}

.tooltip-body {
  margin: 0 0 0.5rem;
  font-size: 0.82rem;
  line-height: 1.45;
  color: var(--color-text-dim);
}

.tooltip-image {
  display: block;
  width: 100%;
  height: 110px;
  object-fit: cover;
  margin: 0.5rem 0 0.6rem;
  border: 1px solid var(--color-border-strong);
}

.clickable-img {
  cursor: pointer;
}

.tooltip-real-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem 0.8rem;
  margin-bottom: 0.3rem;
}

.tooltip-real-date,
.tooltip-real-arch {
  font-family: var(--font-mono);
  font-size: 0.65rem;
  color: var(--color-text-faint);
}

.tooltip-gallery-thumbs {
  display: flex;
  gap: 0.3rem;
  margin-bottom: 0.5rem;
}

.gallery-mini-thumb {
  width: 52px;
  height: 38px;
  object-fit: cover;
  border: 1px solid var(--color-border);
  cursor: pointer;
  transition: border-color 0.12s;
}

.gallery-mini-thumb:hover {
  border-color: var(--color-amber);
}

.tooltip-chars {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.25rem 0.4rem;
  margin-bottom: 0.5rem;
}

.tooltip-chars-label {
  font-family: var(--font-mono);
  font-size: 0.65rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-faint);
}

.tooltip-char-link {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  color: var(--color-amber);
  text-decoration: none;
  border-bottom: 1px dashed rgba(232, 149, 42, 0.4);
  cursor: pointer;
}

.tooltip-char-link:hover {
  color: var(--color-amber-bright);
  border-bottom-color: var(--color-amber-bright);
}

.tooltip-journey-levels {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  margin-bottom: 0.5rem;
  padding: 0.4rem 0;
  border-top: 1px solid var(--color-border-strong);
}

.journey-level-entry {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.25rem 0.4rem;
}

.jl-swatch {
  width: 10px;
  height: 3px;
  display: inline-block;
  flex-shrink: 0;
}

.jl-link {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  color: var(--color-amber);
  text-decoration: none;
  border-bottom: 1px dashed rgba(232, 149, 42, 0.4);
  cursor: pointer;
}

.jl-link:hover {
  color: var(--color-amber-bright);
}

.jl-chapter {
  font-family: var(--font-mono);
  font-size: 0.6rem;
  color: var(--color-text-faint);
}

.jl-chars {
  display: flex;
  gap: 0.3rem;
  flex-wrap: wrap;
}

.tooltip-link {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  letter-spacing: 0.06em;
  color: var(--color-amber);
  border-bottom: 1px dashed currentColor;
  text-decoration: none;
}

.tooltip-link:hover {
  color: var(--color-amber-bright);
}

/* Gallery overlay */
.gallery-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.92);
  display: flex;
  align-items: center;
  justify-content: center;
}

.gallery-full-img {
  max-width: 90vw;
  max-height: 85vh;
  object-fit: contain;
}

.gallery-close-btn {
  position: absolute;
  top: 1rem;
  right: 1.5rem;
  background: none;
  border: none;
  color: #fff;
  font-size: 2rem;
  cursor: pointer;
  z-index: 10;
}

.gallery-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #fff;
  font-size: 3rem;
  cursor: pointer;
  padding: 1rem;
  z-index: 10;
}

.gallery-arrow-left {
  left: 1rem;
}

.gallery-arrow-right {
  right: 1rem;
}

.gallery-counter {
  position: absolute;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  font-family: var(--font-mono);
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
}

/* Journey controls */
.journey-controls {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 600;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 0.7rem 0.85rem;
  background: rgba(13, 12, 10, 0.9);
}

.journey-heading {
  font-family: var(--font-mono);
  font-size: 0.65rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-text-faint);
}

.journey-toggle {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  color: var(--color-text-dim);
  cursor: pointer;
}

.journey-toggle input {
  accent-color: var(--color-amber);
  cursor: pointer;
}

.journey-swatch {
  width: 14px;
  height: 3px;
  display: inline-block;
}

.journey-toggle:hover .journey-name {
  color: var(--color-text);
}

.map-frame :deep(.journey-node) {
  cursor: pointer;
  transition: r 0.12s ease;
}

.map-frame :deep(.journey-node:hover) {
  fill: var(--color-amber-bright);
}

.map-frame :deep(.journey-line) {
  pointer-events: none;
}

.map-frame :deep(.station-hit) {
  cursor: pointer;
  transition: stroke 0.12s ease, fill-opacity 0.12s ease, fill 0.12s ease;
}

.map-frame :deep(.station-hit:hover),
.map-frame :deep(.station-hit:focus) {
  stroke: var(--color-amber-bright);
  fill-opacity: 0.85 !important;
  outline: none;
}

.map-frame :deep(.leaflet-container) {
  background: #1a2028;
  font-family: var(--font-mono);
}

@media (max-width: 768px) {
  .map-frame,
  .map-canvas {
    min-height: 70vh;
  }
}

.map-overlay-note {
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  z-index: 500;
  pointer-events: none;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  letter-spacing: 0.06em;
  color: var(--color-amber-bright);
  background: rgba(6, 7, 10, 0.92);
  padding: 0.4rem 0.7rem;
  border: 1px solid var(--color-border-strong);
  box-shadow: var(--glow-amber);
}

.map-frame :deep(.leaflet-control-zoom a) {
  background: var(--color-panel);
  color: var(--color-amber);
  border-color: var(--color-border-strong);
}

.map-frame :deep(.leaflet-control-zoom a:hover) {
  background: var(--color-bg-alt);
  color: var(--color-amber-bright);
}
</style>
