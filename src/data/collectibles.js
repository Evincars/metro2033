/**
 * Loads collectible dossiers from the markdown files in `src/content/collectibles/**`.
 *
 * One file per game, each covering that game's in-world collectibles
 * (Artyom's journal notes, postcards, and so on):
 *
 *   ---
 *   id: artyoms-journal-2033
 *   title: Artyom's Journal
 *   game: metro-2033        # metro-2033 | last-light | exodus
 *   order: 1
 *   image: /collectible-imgs/…
 *   brief: One or two sentences shown on the tile.
 *   wiki: Artyom's_Journal_(Metro_2033_Redux)
 *   ---
 *   # Full article body in Markdown…
 */

import { resolveFiles } from '../i18n/content'
import { GAMES } from './levels'

const enFiles = import.meta.glob('../content/collectibles/**/*.md', { query: '?raw', import: 'default', eager: true })
const ruFiles = import.meta.glob('../content/ru/collectibles/**/*.md', { query: '?raw', import: 'default', eager: true })
const ukFiles = import.meta.glob('../content/uk/collectibles/**/*.md', { query: '?raw', import: 'default', eager: true })

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

export const collectibles = Object.values(files)
  .map((raw) => {
    const { meta, body } = parseFrontmatter(raw)
    return {
      id: meta.id,
      title: meta.title ?? meta.id,
      game: meta.game ?? 'metro-2033',
      gameLabel: GAMES[meta.game]?.label ?? '',
      order: Number(meta.order ?? 0),
      image: meta.image || '',
      brief: meta.brief || '',
      wiki: meta.wiki || '',
      body,
    }
  })
  .filter((entry) => entry.id)
  .sort((a, b) => a.order - b.order)

export const collectiblesById = Object.fromEntries(collectibles.map((entry) => [entry.id, entry]))
