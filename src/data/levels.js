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
 *   brief: One or two sentences shown in the map tooltip.
 *   ---
 *   # Full article body in Markdown…
 */

const files = import.meta.glob('../content/levels/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})

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
      brief: meta.brief || '',
      body,
    }
  })
  .filter((level) => level.id)
  .sort((a, b) => {
    if (a.game !== b.game) return a.game === 'metro-2033' ? -1 : 1
    return a.order - b.order
  })

export const levelsById = Object.fromEntries(levels.map((level) => [level.id, level]))

export function levelsForGame(game) {
  return levels.filter((level) => level.game === game)
}
