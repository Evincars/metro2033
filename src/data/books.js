import { parseFrontmatter } from '../utils/frontmatter'
import { resolveFiles } from '../i18n/content'

const enFiles = import.meta.glob('../content/books/*.md', { query: '?raw', import: 'default', eager: true })
const ruFiles = import.meta.glob('../content/ru/books/*.md', { query: '?raw', import: 'default', eager: true })
const ukFiles = import.meta.glob('../content/uk/books/*.md', { query: '?raw', import: 'default', eager: true })

const files = resolveFiles(enFiles, ruFiles, ukFiles)

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
      category: meta.category || 'Universe',
      author: meta.author || '',
      year: meta.year || '',
      setIn: meta.setIn || '',
      country: meta.country || '',
      image: resolveImage(meta.image),
      brief: meta.brief || '',
      wiki: meta.wiki || '',
      body,
    }
  })
  .filter((b) => b.id)
  .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title))

export const booksById = Object.fromEntries(books.map((b) => [b.id, b]))

export const coreBooks = books.filter((b) => b.category === 'Core')
export const universeBooks = books.filter((b) => b.category === 'Universe')
