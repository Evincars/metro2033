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
  color: #2a1f14;
  padding: 1.6rem 1.9rem 1.8rem;
  box-shadow: var(--shadow-panel), inset 0 0 60px rgba(60, 40, 18, 0.35);
  font-family: 'Cinzel', 'Times New Roman', serif;
}

.parchment-label {
  display: inline-block;
  font-family: var(--font-mono);
  font-size: 0.66rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #5b3f1e;
  margin-bottom: 0.5rem;
}

.parchment-body {
  font-size: 1.02rem;
  line-height: 1.7;
  text-shadow: 0 1px 0 rgba(255, 248, 230, 0.35);
}

.parchment-body :deep(p) {
  margin: 0 0 0.6rem;
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
