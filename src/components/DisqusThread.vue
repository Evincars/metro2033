<script setup>
import { onMounted } from 'vue'

/**
 * Disqus comment thread (shortname `metro-universe`).
 *
 * embed.js is loaded once per page load; when the SPA remounts this component
 * (navigating away and back), the existing Disqus instance is reset instead.
 */
const props = defineProps({
  identifier: { type: String, required: true },
  title: { type: String, default: '' },
})

const SHORTNAME = 'metro-universe'

function pageUrl() {
  return `${window.location.origin}${window.location.pathname}`
}

function config() {
  this.page.url = pageUrl()
  this.page.identifier = props.identifier
  if (props.title) this.page.title = props.title
}

onMounted(() => {
  if (window.DISQUS) {
    window.DISQUS.reset({ reload: true, config })
    return
  }
  window.disqus_config = config
  const script = document.createElement('script')
  script.src = `https://${SHORTNAME}.disqus.com/embed.js`
  script.setAttribute('data-timestamp', String(+new Date()))
  script.async = true
  ;(document.head || document.body).appendChild(script)
})
</script>

<template>
  <section class="comments mx-panel" aria-label="Comments">
    <h2 class="comments-title">Radio chatter</h2>
    <div id="disqus_thread" />
    <noscript>
      Please enable JavaScript to view the
      <a href="https://disqus.com/?ref_noscript">comments powered by Disqus.</a>
    </noscript>
  </section>
</template>

<style scoped>
.comments {
  padding: 1.25rem 1.4rem 1.5rem;
}

.comments-title {
  margin: 0 0 1rem;
  font-size: 1rem;
  letter-spacing: 0.12em;
}
</style>
