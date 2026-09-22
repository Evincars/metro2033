<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps({
  images: { type: Array, default: () => [] }, // [{ src, caption }]
  title: { type: String, default: 'Gallery' },
})

const lightbox = ref(-1)

function open(i) {
  lightbox.value = i
}
function close() {
  lightbox.value = -1
}
function prev() {
  lightbox.value = lightbox.value > 0 ? lightbox.value - 1 : props.images.length - 1
}
function next() {
  lightbox.value = lightbox.value < props.images.length - 1 ? lightbox.value + 1 : 0
}
function onThumbError(event) {
  event.target.closest('.thumb')?.remove()
}
function onKeydown(event) {
  if (lightbox.value < 0) return
  if (event.key === 'Escape') close()
  else if (event.key === 'ArrowLeft') prev()
  else if (event.key === 'ArrowRight') next()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <section v-if="images.length" class="gallery">
    <h2 class="gallery-title">{{ title }}</h2>
    <div class="thumbs">
      <button
        v-for="(img, i) in images"
        :key="i"
        type="button"
        class="thumb"
        @click="open(i)"
      >
        <img
          :src="img.src"
          :alt="img.caption || `${title} — ${i + 1}`"
          loading="lazy"
          referrerpolicy="no-referrer"
          @error="onThumbError"
        />
      </button>
    </div>

    <Teleport to="body">
      <div v-if="lightbox >= 0" class="lightbox" @click.self="close">
        <button class="lb-close" type="button" aria-label="Close" @click="close">×</button>
        <button
          v-if="images.length > 1"
          class="lb-nav prev"
          type="button"
          aria-label="Previous"
          @click="prev"
        >‹</button>
        <figure class="lb-figure">
          <img
            class="lb-img"
            :src="images[lightbox].src"
            :alt="images[lightbox].caption || title"
            referrerpolicy="no-referrer"
          />
          <figcaption v-if="images[lightbox].caption" class="lb-caption">
            {{ images[lightbox].caption }}
          </figcaption>
        </figure>
        <button
          v-if="images.length > 1"
          class="lb-nav next"
          type="button"
          aria-label="Next"
          @click="next"
        >›</button>
        <div class="lb-count">{{ lightbox + 1 }} / {{ images.length }}</div>
      </div>
    </Teleport>
  </section>
</template>

<style scoped>
.gallery {
  margin-top: 1.75rem;
}

.gallery-title {
  font-family: var(--font-display);
  font-size: 1.15rem;
  color: var(--color-amber-bright);
  margin: 0 0 0.7rem;
  padding-bottom: 0.35rem;
  border-bottom: 1px solid var(--color-border-strong);
}

.thumbs {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 0.5rem;
}

.thumb {
  padding: 0;
  border: 1px solid var(--color-border);
  background: #06070a;
  cursor: pointer;
  overflow: hidden;
  aspect-ratio: 16 / 10;
  transition: border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
}

.thumb:hover {
  border-color: var(--color-amber);
  box-shadow: var(--glow-amber);
  transform: translateY(-1px);
}

.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* Lightbox */
.lightbox {
  position: fixed;
  inset: 0;
  z-index: 4000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(3, 4, 6, 0.92);
  backdrop-filter: blur(3px);
}

.lb-figure {
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
  max-width: 92vw;
}

.lb-img {
  max-width: 90vw;
  max-height: 82vh;
  object-fit: contain;
  border: 1px solid var(--color-border-strong);
  box-shadow: var(--shadow-panel), var(--glow-amber);
}

.lb-caption {
  max-width: 70ch;
  text-align: center;
  font-size: 0.85rem;
  line-height: 1.5;
  color: var(--color-text-dim);
}

.lb-close {
  position: absolute;
  top: 1rem;
  right: 1.2rem;
  background: none;
  border: none;
  color: var(--color-text);
  font-size: 2rem;
  line-height: 1;
  cursor: pointer;
}

.lb-close:hover {
  color: var(--color-amber-bright);
}

.lb-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 48px;
  height: 64px;
  background: rgba(13, 12, 10, 0.7);
  border: 1px solid var(--color-border-strong);
  color: var(--color-amber);
  font-size: 2rem;
  line-height: 1;
  cursor: pointer;
}

.lb-nav:hover {
  color: var(--color-amber-bright);
  border-color: var(--color-amber);
}

.lb-nav.prev {
  left: 1rem;
}

.lb-nav.next {
  right: 1rem;
}

.lb-count {
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--color-text-dim);
}
</style>
