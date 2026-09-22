import { parseFrontmatter } from '../utils/frontmatter'

/**
 * Faction dossiers loaded from `src/content/factions/*.md`. Frontmatter:
 *   id, title, order, tag (short territory/label), image, brief.
 */

const files = import.meta.glob('../content/factions/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})

export const factions = Object.values(files)
  .map((raw) => {
    const { meta, body } = parseFrontmatter(raw)
    return {
      id: meta.id,
      title: meta.title ?? meta.id,
      category: meta.category || 'Other',
      order: Number(meta.order ?? 0),
      tag: meta.tag || '',
      image: meta.image || '',
      brief: meta.brief || '',
      wiki: meta.wiki || '',
      body,
    }
  })
  .filter((f) => f.id)
  .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title))

export const factionsById = Object.fromEntries(factions.map((f) => [f.id, f]))
