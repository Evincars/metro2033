<script setup>
import { onMounted } from 'vue'

/**
 * Disqus comment thread (shortname `metro-universe`), staged as a metro trader's
 * counter: `shop_back.jpg` (lamp, shelves, counter) is the header scene, its
 * right edge fading into darkness, with the old computer, helmet and toy on the
 * counter (lit less the further they are from the lamp). The lamp's warm light
 * spills over the thread below, flickering faintly.
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
      <span class="lamp-halo" aria-hidden="true" />
      <img
        class="counter-item item-computer"
        :src="`${base}book-art/computer.png`"
        alt=""
        aria-hidden="true"
        width="191"
        height="159"
      />
      <img
        class="counter-item item-helmet"
        :src="`${base}book-art/helmet.png`"
        alt=""
        aria-hidden="true"
        width="193"
        height="123"
      />
      <img
        class="counter-item item-toy"
        :src="`${base}book-art/toy.png`"
        alt=""
        aria-hidden="true"
        width="192"
        height="124"
      />
      <div class="comments-heading">
        <span class="mx-tag">Trader's counter</span>
        <h2 class="comments-title">Radio chatter</h2>
        <p class="comments-sub">Leave a word for the next traveller.</p>
      </div>
    </div>

    <div class="comments-body">
      <span class="lamp-spill" aria-hidden="true" />
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

/* Counter top spans ~73–89% of the artwork's height; the items stand on it.
   The lamp hangs at ~0.6 × scene height from the left, so each item is lit a
   little less the further it sits from it. */
.counter-item {
  position: absolute;
  z-index: 1;
  height: auto;
  pointer-events: none;
}

.item-computer {
  left: calc(var(--scene-h) * 0.42);
  bottom: calc(var(--scene-h) * 0.17);
  width: calc(var(--scene-h) * 0.46);
  filter: drop-shadow(8px 10px 8px rgba(0, 0, 0, 0.85)) brightness(0.95) sepia(0.2);
}

.item-helmet {
  left: calc(var(--scene-h) * 1.02);
  bottom: calc(var(--scene-h) * 0.15);
  width: calc(var(--scene-h) * 0.5);
  filter: drop-shadow(10px 10px 8px rgba(0, 0, 0, 0.85)) brightness(0.85) sepia(0.2);
}

.item-toy {
  left: calc(var(--scene-h) * 1.58);
  bottom: calc(var(--scene-h) * 0.14);
  width: calc(var(--scene-h) * 0.44);
  filter: drop-shadow(12px 10px 8px rgba(0, 0, 0, 0.85)) brightness(0.62) sepia(0.25);
}

/* ---- lamp light ---- */
.lamp-halo,
.lamp-spill {
  position: absolute;
  pointer-events: none;
  mix-blend-mode: screen;
  animation: lamp-flicker 6s infinite steps(1, end);
}

/* soft glow around the bulb and over the counter */
.lamp-halo {
  z-index: 2;
  left: 0;
  top: 0;
  width: calc(var(--scene-h) * 1.6);
  height: 100%;
  background:
    radial-gradient(circle at 37.5% 20%, rgba(255, 200, 130, 0.22) 0%, rgba(255, 170, 90, 0) 28%),
    radial-gradient(ellipse 70% 55% at 45% 85%, rgba(255, 180, 100, 0.12) 0%, rgba(255, 170, 90, 0) 70%);
}

/* the light falling past the counter onto the thread, fading downwards */
.lamp-spill {
  z-index: 1;
  left: 0;
  top: 0;
  width: 100%;
  height: min(100%, 900px);
  background: radial-gradient(
    ellipse 55% 100% at calc(var(--scene-h) * 0.7) 0%,
    rgba(255, 180, 100, 0.13) 0%,
    rgba(255, 160, 80, 0.05) 45%,
    rgba(255, 160, 80, 0) 100%
  );
}

@keyframes lamp-flicker {
  0%, 31%, 33%, 71%, 74%, 100% { opacity: 1; }
  32% { opacity: 0.7; }
  72% { opacity: 0.82; }
  73% { opacity: 0.6; }
}

@media (prefers-reduced-motion: reduce) {
  .lamp-halo,
  .lamp-spill {
    animation: none;
  }
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
  position: relative;
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

/* phones: no room for the toy at the far end of the counter */
@media (max-width: 520px) {
  .item-toy {
    display: none;
  }
}
</style>
