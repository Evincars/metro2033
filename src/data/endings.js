import { parseFrontmatter } from '../utils/frontmatter'
import { resolveFiles } from '../i18n/content'

const enFiles = import.meta.glob('../content/endings/*.md', { query: '?raw', import: 'default', eager: true })
const ruFiles = import.meta.glob('../content/ru/endings/*.md', { query: '?raw', import: 'default', eager: true })
const ukFiles = import.meta.glob('../content/uk/endings/*.md', { query: '?raw', import: 'default', eager: true })

const files = resolveFiles(enFiles, ruFiles, ukFiles)

export const ENDING_GROUPS = ['Metro 2033', 'Metro Last Light', 'Metro Exodus']

export const endings = Object.values(files)
  .map((raw) => {
    const { meta, body } = parseFrontmatter(raw)
    return {
      id: meta.id,
      title: meta.title ?? meta.id,
      group: meta.group || 'Other',
      order: Number(meta.order ?? 0),
      image: meta.image || '',
      brief: meta.brief || '',
      wiki: meta.wiki || '',
      appearances: meta.appearances || '',
      game: meta.game || '',
      body,
    }
  })
  .filter((e) => e.id && e.id !== 'endings-overview')
  .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title))

export const endingsById = Object.fromEntries(endings.map((e) => [e.id, e]))

const overviewRaw = Object.values(files).find((raw) => {
  const { meta } = parseFrontmatter(raw)
  return meta.id === 'endings-overview'
})

export const endingsOverview = overviewRaw ? parseFrontmatter(overviewRaw) : null
