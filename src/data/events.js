import { parseFrontmatter } from '../utils/frontmatter'

/**
 * Timeline eras loaded from `src/content/events/*.md`. Frontmatter:
 *   id, year (display label), order, label (short caption).
 */

const files = import.meta.glob('../content/events/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})

export const events = Object.values(files)
  .map((raw) => {
    const { meta, body } = parseFrontmatter(raw)
    return {
      id: meta.id,
      year: meta.year ?? meta.id,
      order: Number(meta.order ?? 0),
      label: meta.label || '',
      body,
    }
  })
  .filter((era) => era.id)
  .sort((a, b) => a.order - b.order)
