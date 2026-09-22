<script setup>
defineProps({
  texture: { type: String, default: 'book-art/metro_text_top.jpg' },
  label: { type: String, default: '' },
})
const base = import.meta.env.BASE_URL
</script>

<template>
  <aside
    class="parchment"
    :style="{ backgroundImage: `url('${base}${texture}')` }"
  >
    <span v-if="label" class="parchment-label">{{ label }}</span>
    <div class="parchment-body">
      <slot />
    </div>
  </aside>
</template>

<style scoped>
.parchment {
  position: relative;
  background-color: #cdb283;
  background-size: cover;
  background-position: center top;
  color: #241a0e;
  padding: 1.6rem 1.9rem 1.8rem;
  box-shadow: var(--shadow-panel), inset 0 0 60px rgba(60, 40, 18, 0.35);
  font-family: 'Cinzel', 'Times New Roman', serif;
}

/* Lighten the paper behind the text so the quote stays legible over the
   torn/darkened areas of the texture. */
.parchment::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(226, 210, 176, 0.62), rgba(214, 196, 158, 0.72));
  mix-blend-mode: screen;
  pointer-events: none;
}

.parchment-label {
  position: relative;
  display: inline-block;
  font-family: var(--font-mono);
  font-size: 0.66rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #5b3f1e;
  margin-bottom: 0.5rem;
}

.parchment-body {
  position: relative;
  font-size: 1.02rem;
  font-weight: 500;
  line-height: 1.7;
  color: #241a0e;
  text-shadow: 0 1px 0 rgba(255, 250, 235, 0.55);
}

/* Override the global light `p` colour — it vanishes on the paper. */
.parchment-body :deep(p) {
  margin: 0 0 0.6rem;
  color: inherit;
}

.parchment-body :deep(p:last-child) {
  margin-bottom: 0;
}

.parchment-body :deep(cite) {
  display: block;
  margin-top: 0.4rem;
  font-style: normal;
  font-size: 0.82rem;
  color: #5b3f1e;
  text-align: right;
}
</style>
