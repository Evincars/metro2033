/**
 * Loads level dossiers from the markdown files in `src/content/levels/**`.
 *
 * Each markdown file carries a small YAML-ish frontmatter block:
 *
 *   ---
 *   id: exhibition
 *   title: Exhibition
 *   game: metro-2033        # metro-2033 | last-light
 *   chapter: Chapter 1 — Let The Journey Begin
 *   order: 3
 *   image: https://…        # optional preview image
 *   map: /level-imgs/maps/… # optional in-game interactive map
 *   brief: One or two sentences shown in the map tooltip.
 *   wiki: Exhibition_(Metro_2033_Level)   # source page on the Fandom wiki
 *   ---
 *   # Full article body in Markdown…
 */

import { resolveFiles } from '../i18n/content'

const enFiles = import.meta.glob('../content/levels/**/*.md', { query: '?raw', import: 'default', eager: true })
const ruFiles = import.meta.glob('../content/ru/levels/**/*.md', { query: '?raw', import: 'default', eager: true })
const ukFiles = import.meta.glob('../content/uk/levels/**/*.md', { query: '?raw', import: 'default', eager: true })

const files = resolveFiles(enFiles, ruFiles, ukFiles)

function parseFrontmatter(raw) {
  const match = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(raw)
  if (!match) return { meta: {}, body: raw.trim() }

  const meta = {}
  for (const line of match[1].split('\n')) {
    const idx = line.indexOf(':')
    if (idx === -1) continue
    const key = line.slice(0, idx).trim()
    let value = line.slice(idx + 1).trim()
    // Strip matching wrapping quotes if present.
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    meta[key] = value
  }
  return { meta, body: match[2].trim() }
}

export const GAMES = {
  'metro-2033': { id: 'metro-2033', label: 'Metro 2033', short: '2033' },
  'last-light': { id: 'last-light', label: 'Metro: Last Light', short: 'LL' },
  'exodus': { id: 'exodus', label: 'Metro Exodus', short: 'ME' },
}

export const levels = Object.values(files)
  .map((raw) => {
    const { meta, body } = parseFrontmatter(raw)
    return {
      id: meta.id,
      title: meta.title ?? meta.id,
      game: meta.game ?? 'metro-2033',
      chapter: meta.chapter ?? '',
      order: Number(meta.order ?? 0),
      image: meta.image || '',
      map: meta.map || '',
      brief: meta.brief || '',
      wiki: meta.wiki || '',
      body,
    }
  })
  .filter((level) => level.id)
  .sort((a, b) => {
    if (a.game !== b.game) {
      const order = { 'metro-2033': 0, 'last-light': 1, 'exodus': 2 }
      return (order[a.game] ?? 9) - (order[b.game] ?? 9)
    }
    return a.order - b.order
  })

export const levelsById = Object.fromEntries(levels.map((level) => [level.id, level]))

export function levelsForGame(game) {
  return levels.filter((level) => level.game === game)
}
