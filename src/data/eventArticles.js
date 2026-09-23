import { parseFrontmatter } from '../utils/frontmatter'
import { resolveFiles } from '../i18n/content'

const enFiles = import.meta.glob('../content/event-articles/*.md', { query: '?raw', import: 'default', eager: true })
const ruFiles = import.meta.glob('../content/ru/event-articles/*.md', { query: '?raw', import: 'default', eager: true })
const ukFiles = import.meta.glob('../content/uk/event-articles/*.md', { query: '?raw', import: 'default', eager: true })

const files = resolveFiles(enFiles, ruFiles, ukFiles)

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
