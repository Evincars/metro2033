import { levels } from '../data/levels'
import { locations } from '../data/locations'

/**
 * Rewrites in-article Fandom wiki links to internal routes when they resolve to
 * a level dossier or a location page. Locations are matched primarily by their
 * source wiki slug (stored in frontmatter), and both are matched by link text.
 */

function normalize(str) {
  return String(str ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

// Wiki slug (decoded) → internal href, for confident location matching.
const slugToHref = {}
for (const loc of locations) {
  if (loc.wiki) slugToHref[decodeURIComponent(loc.wiki)] = `/locations/${loc.id}`
}

// Normalized link text → internal href. Levels are added last so they win ties.
const textToHref = {}
function addAlias(text, href) {
  const key = normalize(text)
  if (key) textToHref[key] = href
}
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
