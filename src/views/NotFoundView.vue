<script setup>
import { RouterLink } from 'vue-router'
import { t } from '../i18n'
</script>

<template>
  <section class="not-found mx-panel">
    <span class="mx-tag">{{ t('notFound.tag') }}</span>
    <h1>{{ t('notFound.title') }}</h1>
    <p>{{ t('notFound.text') }}</p>
    <RouterLink to="/" class="btn-back">{{ t('notFound.back') }}</RouterLink>
  </section>
</template>

<style scoped>
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 0.75rem;
  padding: 5rem 1.5rem;
  min-height: 60vh;
}

.not-found h1 {
  font-size: 1.8rem;
}

.not-found p {
  max-width: 40ch;
}

.btn-back {
  margin-top: 0.5rem;
  font-family: var(--font-display);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-bg);
  background: var(--color-amber);
  padding: 0.7rem 1.4rem;
  border-radius: 2px;
}

.btn-back:hover {
  background: var(--color-amber-bright);
}
</style>
