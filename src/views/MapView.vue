<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Groundwork only: a blank CRS.Simple canvas ready to receive a custom
// metro-map image overlay and station markers/lines in a future iteration.
const mapContainer = ref(null)
let map = null

onMounted(() => {
  map = L.map(mapContainer.value, {
    crs: L.CRS.Simple,
    minZoom: -2,
    maxZoom: 3,
    zoomControl: true,
    attributionControl: false,
  })

  // Placeholder bounds until real station-map artwork/coordinates are added.
  const bounds = [
    [0, 0],
    [1000, 1000],
  ]
  map.fitBounds(bounds)

  // TODO: replace with L.imageOverlay(mapImageUrl, bounds) once map art exists.
  // TODO: plot station markers + tunnel polylines from a stations data source.
})

onBeforeUnmount(() => {
  map?.remove()
})
</script>

<template>
  <section class="map-view">
    <header class="map-header mx-panel">
      <div>
        <span class="mx-tag">Cartography module</span>
        <h1>Metro Map</h1>
        <p>
          Interactive tunnel map — station markers and line data are not deployed yet.
          This canvas is wired up and ready for them.
        </p>
      </div>
    </header>

    <div class="map-frame mx-panel">
      <div ref="mapContainer" class="map-canvas" />
      <div class="map-overlay-note">Signal weak — no cartographic data loaded</div>
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
  min-height: 480px;
  overflow: hidden;
}

.map-canvas {
  width: 100%;
  height: 100%;
  min-height: 480px;
  background: #06070a;
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
