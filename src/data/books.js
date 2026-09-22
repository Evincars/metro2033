import { parseFrontmatter } from '../utils/frontmatter'

/**
 * Book dossiers from `src/content/books/*.md`. Frontmatter:
 *   id, title, order, author, year, image, brief, wiki.
 * Local `image` paths (not starting with http) are resolved against BASE_URL.
 */

const files = import.meta.glob('../content/books/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})

function resolveImage(src) {
  if (!src) return ''
  if (/^https?:\/\//.test(src)) return src
  return `${import.meta.env.BASE_URL}${src.replace(/^\//, '')}`
}

export const books = Object.values(files)
  .map((raw) => {
    const { meta, body } = parseFrontmatter(raw)
    return {
      id: meta.id,
      title: meta.title ?? meta.id,
      order: Number(meta.order ?? 0),
      author: meta.author || '',
      year: meta.year || '',
      image: resolveImage(meta.image),
      brief: meta.brief || '',
      wiki: meta.wiki || '',
      body,
    }
  })
  .filter((b) => b.id)
  .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title))

export const booksById = Object.fromEntries(books.map((b) => [b.id, b]))
