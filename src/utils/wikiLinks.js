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

function normalize(str) {
  return String(str ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

function normalizeSlug(str) {
  return String(str ?? '').replace(/_/g, ' ').toLowerCase().replace(/#.*$/, '')
}

const slugToHref = {}
function addSlug(wiki, href) {
  const key = normalizeSlug(decodeURIComponent(wiki))
  slugToHref[key] = href
}
for (const f of factions) if (f.wiki) addSlug(f.wiki, `/factions/${f.id}`)
for (const loc of locations) if (loc.wiki) addSlug(loc.wiki, `/locations/${loc.id}`)
for (const c of characters) if (c.wiki) addSlug(c.wiki, `/characters/${c.id}`)
for (const m of mutants) if (m.wiki) addSlug(m.wiki, `/mutants/${m.id}`)
for (const e of equipment) if (e.wiki) addSlug(e.wiki, `/equipment/${e.id}`)
for (const w of weapons) if (w.wiki) addSlug(w.wiki, `/weapons/${w.id}`)
for (const a of ammunition) if (a.wiki) addSlug(a.wiki, `/ammunition/${a.id}`)
for (const v of vehicles) if (v.wiki) addSlug(v.wiki, `/vehicles/${v.id}`)
for (const ach of achievements) if (ach.wiki) addSlug(ach.wiki, `/achievements/${ach.id}`)
for (const end of endings) if (end.wiki) addSlug(end.wiki, `/endings/${end.id}`)
for (const ev of eventArticles) if (ev.wiki) addSlug(ev.wiki, `/events/${ev.id}`)
for (const b of books) if (b.wiki) addSlug(b.wiki, `/books/${b.id}`)
for (const g of games) if (g.wiki) addSlug(g.wiki, `/games/${g.id}`)
const SLUG_ALIASES = {
  'Metro 2033 (Videogame)': '/games/metro-2033',
  'Metro 2033 (Video Game)': '/games/metro-2033',
  'Metro: Last Light': '/games/metro-last-light',
  'Metro Last Light': '/games/metro-last-light',
  'Metro: Last Light Redux': '/games/metro-redux',
  'Metro Last Light Redux': '/games/metro-redux',
  'Metro 2033 Redux': '/games/metro-redux',
  'Metro Video Game Series': '/games',
  'Metro Series': '/games',
  'Achievements and Trophies': '/achievements',
  'Achievements': '/achievements',
  'Endings': '/endings',
  'Moral Points': '/events/moral-points',
  'Moral Point': '/events/moral-points',
  'Spartan Rangers': '/factions/rangers',
  'The Rangers': '/factions/rangers',
  'Rangers': '/factions/rangers',
  'Great War of 2013': '/events/world-war-iii',
  'World War III': '/events/world-war-iii',
  'Battle of D6': '/events/battle-for-d6',
  'Hansa': '/factions/hanza',
  'Nosalises': '/mutants/nosalis',
  'Shrimps': '/mutants/shrimp',
  'shrimps': '/mutants/shrimp',
  'Demons': '/mutants/demon',
  'demons': '/mutants/demon',
  'Spiderbugs': '/mutants/spiderbug',
  'spiderbugs': '/mutants/spiderbug',
  'Librarians': '/mutants/librarian',
  'librarians': '/mutants/librarian',
  'Lurkers': '/mutants/lurker',
  'lurkers': '/mutants/lurker',
  'Watchers': '/mutants/watcher',
  'watchers': '/mutants/watcher',
  'Watchmen': '/mutants/watcher',
  'Dark One': '/factions/dark-ones',
  'Nazis': '/factions/fourth-reich',
  'Nazi': '/factions/fourth-reich',
  'Communists': '/factions/red-line',
  'Communist': '/factions/red-line',
  'Kalash (AK-74M)': '/weapons/kalash',
  'Kalash (AK-74)': '/weapons/kalash',
  'AKSU (AKS-74U)': '/weapons/aksu',
  'RPK-74': '/weapons/rpk',
  'Saiga (Saiga-12)': '/weapons/saiga',
  'MGR': '/weapons/mgr',
  'Volt Driver': '/weapons/volt-driver',
  'VDNKh': '/locations/exhibition',
  'Weapons': '/weapons',
  'Factions': '/factions',
}
for (const [key, href] of Object.entries(SLUG_ALIASES)) slugToHref[normalizeSlug(key)] = href

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
for (const g of games) if (g.id !== 'metro-2033') addAlias(g.title, `/games/${g.id}`)
for (const loc of locations) {
  const href = `/locations/${loc.id}`
  addAlias(loc.title, href)
  const paren = /^(.*?)\s*\((.*?)\)\s*$/.exec(loc.title)
  if (paren) {
    addAlias(paren[1], href)
    addAlias(paren[2], href)
  }
}
for (const level of levels) addAlias(level.title, `/levels/${level.id}`)

function resolveBySlug(slug) {
  const key = normalizeSlug(decodeURIComponent(slug))
  if (slugToHref[key]) return slugToHref[key]
  // Try stripping trailing 's' for plurals
  if (key.endsWith('s') && slugToHref[key.slice(0, -1)]) return slugToHref[key.slice(0, -1)]
  // Try stripping parenthetical suffix: "Anna (Character)" -> "Anna"
  const base = key.replace(/\s*\([^)]*\)\s*$/, '')
  if (base !== key && slugToHref[base]) return slugToHref[base]
  return null
}

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
      const href = resolveBySlug(slug) || resolveByText(text)
      return href ? `<a href="${href}" data-internal>${text}</a>` : match
    },
  )
  return internal.replace(/<a (?![^>]*data-internal)href="https?:\/\/[^>]*>/g, (tag) =>
    /target=/.test(tag) ? tag : tag.replace(/^<a /, '<a target="_blank" rel="noopener" '),
  )
}

export function handleInternalClick(event, router) {
  const anchor = event.target.closest('a[data-internal]')
  if (!anchor) return
  event.preventDefault()
  router.push(anchor.getAttribute('href'))
}
