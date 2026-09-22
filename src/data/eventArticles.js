import { parseFrontmatter } from '../utils/frontmatter'

/**
 * Named event articles (Battle for D6, World War III, …) from
 * `src/content/event-articles/*.md`. These are distinct from the year-by-year
 * timeline eras in `events.js`. Frontmatter: id, title, order, image, brief, wiki.
 */

const files = import.meta.glob('../content/event-articles/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})

export const eventArticles = Object.values(files)
  .map((raw) => {
    const { meta, body } = parseFrontmatter(raw)
    return {
      id: meta.id,
      title: meta.title ?? meta.id,
      order: Number(meta.order ?? 0),
      image: meta.image || '',
      brief: meta.brief || '',
      wiki: meta.wiki || '',
      body,
    }
  })
  .filter((e) => e.id)
  .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title))

export const eventArticlesById = Object.fromEntries(eventArticles.map((e) => [e.id, e]))
