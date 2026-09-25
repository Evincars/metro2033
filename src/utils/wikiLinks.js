import { levels } from '../data/levels'
import { locations } from '../data/locations'
import { factions } from '../data/factions'
import { characters } from '../data/characters'
import { mutants } from '../data/mutants'
import { equipment } from '../data/equipment'
import { weapons } from '../data/weapons'
import { ammunition } from '../data/ammunition'
import { vehicles } from '../data/vehicles'
import { achievements } from '../data/achievements'
import { endings } from '../data/endings'
import { eventArticles } from '../data/eventArticles'
import { books } from '../data/books'
import { games } from '../data/games'

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
for (const m of mutants) if (m.wiki) slugToHref[decodeURIComponent(m.wiki)] = `/mutants/${m.id}`
for (const e of equipment) if (e.wiki) slugToHref[decodeURIComponent(e.wiki)] = `/equipment/${e.id}`
for (const w of weapons) if (w.wiki) slugToHref[decodeURIComponent(w.wiki)] = `/weapons/${w.id}`
for (const a of ammunition) if (a.wiki) slugToHref[decodeURIComponent(a.wiki)] = `/ammunition/${a.id}`
for (const v of vehicles) if (v.wiki) slugToHref[decodeURIComponent(v.wiki)] = `/vehicles/${v.id}`
for (const ach of achievements) if (ach.wiki) slugToHref[decodeURIComponent(ach.wiki)] = `/achievements/${ach.id}`
for (const end of endings) if (end.wiki) slugToHref[decodeURIComponent(end.wiki)] = `/endings/${end.id}`
for (const ev of eventArticles) if (ev.wiki) slugToHref[decodeURIComponent(ev.wiki)] = `/events/${ev.id}`
for (const b of books) if (b.wiki) slugToHref[decodeURIComponent(b.wiki)] = `/books/${b.id}`
for (const g of games) if (g.wiki) slugToHref[decodeURIComponent(g.wiki)] = `/games/${g.id}`
// Common alternate slugs used in-article for the games.
Object.assign(slugToHref, {
  'Metro 2033 (Videogame)': '/games/metro-2033',
  'Metro 2033 (Video Game)': '/games/metro-2033',
  'Metro: Last Light': '/games/metro-last-light',
  'Metro Last Light': '/games/metro-last-light',
  'Metro 2033 Redux': '/games/metro-redux',
  'Metro Last Light Redux': '/games/metro-redux',
  'Metro Video Game Series': '/games',
  'Achievements and Trophies': '/achievements',
  'Achievements': '/achievements',
  'Endings': '/endings',
})

// Normalized link text → internal href. Later entries win ties; levels win
// last to preserve prior behaviour for shared names.
const textToHref = {}
function addAlias(text, href) {
  const key = normalize(text)
  if (key) textToHref[key] = href
}
for (const f of factions) addAlias(f.title, `/factions/${f.id}`)
for (const c of characters) addAlias(c.title, `/characters/${c.id}`)
for (const m of mutants) addAlias(m.title, `/mutants/${m.id}`)
for (const e of equipment) addAlias(e.title, `/equipment/${e.id}`)
for (const w of weapons) addAlias(w.title, `/weapons/${w.id}`)
for (const a of ammunition) addAlias(a.title, `/ammunition/${a.id}`)
for (const v of vehicles) addAlias(v.title, `/vehicles/${v.id}`)
for (const ach of achievements) addAlias(ach.title, `/achievements/${ach.id}`)
for (const end of endings) addAlias(end.title, `/endings/${end.id}`)
for (const ev of eventArticles) addAlias(ev.title, `/events/${ev.id}`)
for (const b of books) addAlias(b.title, `/books/${b.id}`)
// Game titles, except "Metro 2033" which collides with the novel (books win).
for (const g of games) if (g.id !== 'metro-2033') addAlias(g.title, `/games/${g.id}`)
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
  const internal = html.replace(
    /<a href="https:\/\/metrovideogame\.fandom\.com\/wiki\/([^"]*)"([^>]*)>([^<]+)<\/a>/g,
    (match, slug, attrs, text) => {
      const bySlug = slugToHref[decodeURIComponent(slug)]
      const href = bySlug || resolveByText(text)
      return href ? `<a href="${href}" data-internal>${text}</a>` : match
    },
  )
  // Remaining external links open in a new tab so users never leave the SPA.
  return internal.replace(/<a (?![^>]*data-internal)href="https?:\/\/[^>]*>/g, (tag) =>
    /target=/.test(tag) ? tag : tag.replace(/^<a /, '<a target="_blank" rel="noopener" '),
  )
}

/** Click handler for rendered markdown: routes internal links within the SPA. */
export function handleInternalClick(event, router) {
  const anchor = event.target.closest('a[data-internal]')
  if (!anchor) return
  event.preventDefault()
  router.push(anchor.getAttribute('href'))
}
