<script setup>
import { onMounted } from 'vue'

/**
 * Disqus comment thread (shortname `metro-universe`), staged as a metro trader's
 * counter: `shop_back.jpg` (lamp, shelves, counter) is the header scene, its
 * right edge fading into darkness, with the helmet resting on the counter.
 *
 * embed.js is loaded once per page load; when the SPA remounts this component
 * (navigating away and back), the existing Disqus instance is reset instead.
 */
const props = defineProps({
  identifier: { type: String, required: true },
  title: { type: String, default: '' },
})

const SHORTNAME = 'metro-universe'
const base = import.meta.env.BASE_URL

const sceneStyle = { '--scene-img': `url('${base}book-art/shop_back.jpg')` }

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
    <div class="comments-scene" :style="sceneStyle">
      <img
        class="comments-helmet"
        :src="`${base}book-art/helmet.png`"
        alt=""
        aria-hidden="true"
        width="193"
        height="123"
      />
      <div class="comments-heading">
        <span class="mx-tag">Trader's counter</span>
        <h2 class="comments-title">Radio chatter</h2>
        <p class="comments-sub">Leave a word for the next traveller.</p>
      </div>
    </div>

    <div class="comments-body">
      <div id="disqus_thread" />
      <noscript>
        Please enable JavaScript to view the
        <a href="https://disqus.com/?ref_noscript">comments powered by Disqus.</a>
      </noscript>
    </div>
  </section>
</template>

<style scoped>
.comments {
  padding: 0;
  overflow: hidden;
}

/* The scene is sized by its height; the artwork scales with it so the helmet
   (positioned in units of --scene-h) always lands on the counter. */
.comments-scene {
  --scene-h: 300px;
  position: relative;
  height: var(--scene-h);
  background-color: #050505;
}

/* artwork: 1100×498, scaled to the scene height, right edge fading out */
.comments-scene::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: min(100%, calc(var(--scene-h) * 1100 / 498));
  background: var(--scene-img) left top / auto 100% no-repeat;
  -webkit-mask-image: linear-gradient(90deg, #000 72%, transparent 100%);
  mask-image: linear-gradient(90deg, #000 72%, transparent 100%);
}

/* fade the counter's front edge into the comments panel */
.comments-scene::after {
  content: '';
  position: absolute;
  inset: auto 0 0 0;
  height: 16%;
  background: linear-gradient(180deg, rgba(13, 12, 10, 0) 0%, #0d0c0a 100%);
  pointer-events: none;
}

/* Counter top spans ~73–89% of the artwork's height; the helmet sits on it,
   a little right of the lamp's pool of light. */
.comments-helmet {
  position: absolute;
  z-index: 1;
  left: calc(var(--scene-h) * 1.02);
  bottom: calc(var(--scene-h) * 0.15);
  width: calc(var(--scene-h) * 0.5);
  height: auto;
  filter: drop-shadow(0 10px 8px rgba(0, 0, 0, 0.85)) brightness(0.92) sepia(0.15);
  pointer-events: none;
}

.comments-heading {
  position: absolute;
  z-index: 1;
  top: 22%;
  right: 1.75rem;
  max-width: 22rem;
  text-align: right;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.95);
}

.comments-title {
  margin: 0.35rem 0 0.3rem;
  font-size: 1.35rem;
  letter-spacing: 0.12em;
}

.comments-sub {
  margin: 0;
  font-size: 0.85rem;
  color: var(--color-text);
}

/* Solid background + light text: Disqus reads these to pick its dark theme. */
.comments-body {
  padding: 0.5rem 1.4rem 1.5rem;
  background-color: #0d0c0a;
  color: #d8cfbf;
}

@media (max-width: 899px) {
  .comments-scene {
    --scene-h: 220px;
  }

  /* narrow screens: the heading moves to the top-right corner, clear of the lamp */
  .comments-heading {
    top: 0.9rem;
    right: 1rem;
    max-width: 60%;
  }

  .comments-title {
    font-size: 1.1rem;
  }

  .comments-sub {
    display: none;
  }
}
</style>
