import { levels } from '../data/levels'
import { locations } from '../data/locations'
import { factions } from '../data/factions'
import { characters } from '../data/characters'
import { eventArticles } from '../data/eventArticles'

/**
 * Rewrites in-article Fandom wiki links to internal routes when they resolve to
 * a level, location, faction or character we host. Matching is primarily by the
 * source wiki slug (stored in frontmatter), with a link-text fallback.
 */

function normalize(str) {
  return String(str ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

// Wiki slug (decoded) → internal href. Locations override factions on shared
// slugs (e.g. Polis_(Location)); characters use their own distinct slugs.
const slugToHref = {}
for (const f of factions) if (f.wiki) slugToHref[decodeURIComponent(f.wiki)] = `/factions/${f.id}`
for (const loc of locations) if (loc.wiki) slugToHref[decodeURIComponent(loc.wiki)] = `/locations/${loc.id}`
for (const c of characters) if (c.wiki) slugToHref[decodeURIComponent(c.wiki)] = `/characters/${c.id}`
for (const ev of eventArticles) if (ev.wiki) slugToHref[decodeURIComponent(ev.wiki)] = `/events/${ev.id}`

// Normalized link text → internal href. Later entries win ties; levels win
// last to preserve prior behaviour for shared names.
const textToHref = {}
function addAlias(text, href) {
  const key = normalize(text)
  if (key) textToHref[key] = href
}
for (const f of factions) addAlias(f.title, `/factions/${f.id}`)
for (const c of characters) addAlias(c.title, `/characters/${c.id}`)
for (const ev of eventArticles) addAlias(ev.title, `/events/${ev.id}`)
for (const loc of locations) {
  const href = `/locations/${loc.id}`
  addAlias(loc.title, href)
  // "VDNKh (Exhibition)" → also alias "VDNKh" and "Exhibition".
  const paren = /^(.*?)\s*\((.*?)\)\s*$/.exec(loc.title)
  if (paren) {
    addAlias(paren[1], href)
    addAlias(paren[2], href)
  }
}
for (const level of levels) addAlias(level.title, `/levels/${level.id}`)

function resolveByText(text) {
  const n = normalize(text)
  for (const candidate of [n, n.replace(/station$/, ''), n.replace(/location$/, '')]) {
    if (candidate && textToHref[candidate]) return textToHref[candidate]
  }
  return null
}

export function linkify(html) {
  return html.replace(
    /<a href="https:\/\/metrovideogame\.fandom\.com\/wiki\/([^"]*)"([^>]*)>([^<]+)<\/a>/g,
    (match, slug, attrs, text) => {
      const bySlug = slugToHref[decodeURIComponent(slug)]
      const href = bySlug || resolveByText(text)
      return href ? `<a href="${href}" data-internal>${text}</a>` : match
    },
  )
}

/** Click handler for rendered markdown: routes internal links within the SPA. */
export function handleInternalClick(event, router) {
  const anchor = event.target.closest('a[data-internal]')
  if (!anchor) return
  event.preventDefault()
  router.push(anchor.getAttribute('href'))
}
