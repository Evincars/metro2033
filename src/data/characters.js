import { parseFrontmatter } from '../utils/frontmatter'

/**
 * Character dossiers from `src/content/characters/*.md`. Frontmatter:
 *   id, title, group, order, image, brief, wiki.
 */

const files = import.meta.glob('../content/characters/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})

export const CHARACTER_GROUPS = ['Rangers', 'Associated', 'Notable', 'Last Light']

export const characters = Object.values(files)
  .map((raw) => {
    const { meta, body } = parseFrontmatter(raw)
    return {
      id: meta.id,
      title: meta.title ?? meta.id,
      group: meta.group || 'Notable',
      order: Number(meta.order ?? 0),
      image: meta.image || '',
      brief: meta.brief || '',
      wiki: meta.wiki || '',
      body,
    }
  })
  .filter((c) => c.id)
  .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title))

export const charactersById = Object.fromEntries(characters.map((c) => [c.id, c]))
