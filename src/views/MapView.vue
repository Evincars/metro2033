<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MAP_IMAGE, STATION_RADIUS, stations } from '../data/stations'

const mapContainer = ref(null)
const mapFrame = ref(null)
const tooltipEl = ref(null)
const selected = ref(null)
const tooltipPos = ref({ x: 0, y: 0 })
const pickMode = ref(false)
const pickedCoords = ref('')
const isDev = import.meta.env.DEV

let map = null
let resizeObserver = null
const markers = shallowRef([])

// CRS.Simple has its origin bottom-left, the image pixel grid top-left.
const imageBounds = L.latLngBounds([0, 0], [MAP_IMAGE.height, MAP_IMAGE.width])
const toLatLng = (station) => L.latLng(MAP_IMAGE.height - station.y, station.x)

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
  const point = map.latLngToContainerPoint(toLatLng(selected.value))
  const frame = mapFrame.value
  const margin = 12
  const width = tooltipEl.value?.offsetWidth ?? 260
  const height = tooltipEl.value?.offsetHeight ?? 150
  const offset = STATION_RADIUS * currentScale() + 10

  let x = point.x - width / 2
  let y = point.y + offset
  // Flip above the station when there is no room below it.
  if (frame && y + height > frame.clientHeight - margin) y = point.y - offset - height
  if (frame) {
    x = Math.min(Math.max(x, margin), Math.max(margin, frame.clientWidth - width - margin))
    y = Math.min(Math.max(y, margin), Math.max(margin, frame.clientHeight - height - margin))
  }
  tooltipPos.value = { x: Math.round(x), y: Math.round(y) }
}

async function selectStation(station) {
  selected.value = station
  await nextTick()
  updateTooltipPosition()
}

function closeTooltip() {
  selected.value = null
}

function fitWholeMap() {
  map.setMinZoom(-8)
  map.fitBounds(imageBounds, { animate: false })
  map.setMinZoom(map.getZoom())
  scaleMarkers()
}

function onKeydown(event) {
  if (event.key === 'Escape') closeTooltip()
}

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
  // Layout can still settle after mount (fonts, flex sizing) — refit once more.
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
    return marker.addTo(map)
  })
  scaleMarkers()

  map.on('zoom zoomend move', () => {
    scaleMarkers()
    updateTooltipPosition()
  })

  map.on('click', (event) => {
    if (!pickMode.value) {
      closeTooltip()
      return
    }
    const coords = `x: ${Math.round(event.latlng.lng)}, y: ${Math.round(MAP_IMAGE.height - event.latlng.lat)}`
    pickedCoords.value = coords
    navigator.clipboard?.writeText(coords).catch(() => {})
  })

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
    <header class="map-header mx-panel">
      <div>
        <span class="mx-tag">Cartography module</span>
        <h1>Metro Map</h1>
        <p>
          Schematic guide-map of the Moscow Metro. Tap or click a station circle
          to pull its dossier from the archive.
        </p>
      </div>
    </header>

    <div ref="mapFrame" class="map-frame mx-panel">
      <div ref="mapContainer" class="map-canvas" />

      <div
        v-if="selected"
        ref="tooltipEl"
        class="station-tooltip"
        :style="tooltipStyle"
        role="dialog"
        :aria-label="selected.name"
      >
        <button class="tooltip-close" type="button" aria-label="Close" @click="closeTooltip">×</button>
        <span class="tooltip-tag">Station dossier</span>
        <h2 class="tooltip-title">{{ selected.name }}</h2>
        <p class="tooltip-body">
          Test content — intel on garrison, factions and trade routes will be
          streamed here once the station archive is wired up.
        </p>
        <a class="tooltip-link" href="#" @click.prevent>see more…</a>
      </div>

      <button
        v-if="isDev"
        class="pick-toggle"
        type="button"
        :class="{ active: pickMode }"
        @click="pickMode = !pickMode"
      >
        {{ pickMode ? `pick: ${pickedCoords || 'click the map'}` : 'pick coords' }}
      </button>

      <div class="map-overlay-note">{{ stations.length }} station hotspots online</div>
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

.map-header {
  padding: 1.5rem 1.75rem;
}

.map-header h1 {
  margin: 0.5rem 0;
}

.map-header p {
  margin: 0;
  max-width: 60ch;
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
  background: #06070a;
}

.pick-toggle {
  position: absolute;
  right: 1rem;
  bottom: 1rem;
  z-index: 600;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  color: var(--color-text-dim);
  background: rgba(10, 9, 8, 0.85);
  border: 1px solid var(--color-border);
  padding: 0.35rem 0.6rem;
  cursor: pointer;
}

.pick-toggle.active {
  color: var(--color-amber-bright);
  border-color: var(--color-border-strong);
}

.station-tooltip {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 700;
  width: min(280px, calc(100% - 2rem));
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
}

.tooltip-close:hover {
  color: var(--color-amber-bright);
}

.tooltip-tag {
  font-family: var(--font-mono);
  font-size: 0.65rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-text-faint);
}

.tooltip-title {
  margin: 0.25rem 0 0.4rem;
  font-family: var(--font-display);
  font-size: 1.05rem;
  color: var(--color-amber-bright);
}

.tooltip-body {
  margin: 0 0 0.6rem;
  font-size: 0.82rem;
  line-height: 1.45;
  color: var(--color-text-dim);
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

/* Hotspots sit on top of the printed circles: invisible by default, they only
   add a pointer cursor plus a hover ring. */
.map-frame :deep(.station-hit) {
  cursor: pointer;
  transition: stroke 0.12s ease, fill-opacity 0.12s ease;
}

.map-frame :deep(.station-hit:hover),
.map-frame :deep(.station-hit:focus) {
  stroke: var(--color-amber-bright);
  fill-opacity: 0.18;
  outline: none;
}

.map-frame :deep(.leaflet-container) {
  background: #06070a;
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
  color: var(--color-text-faint);
  background: rgba(10, 9, 8, 0.7);
  padding: 0.35rem 0.6rem;
  border: 1px solid var(--color-border);
}

/* Recolor Leaflet chrome to match the terminal aesthetic */
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
