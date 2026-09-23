import { parseFrontmatter } from '../utils/frontmatter'
import { resolveFiles } from '../i18n/content'

const enFiles = import.meta.glob('../content/factions/*.md', { query: '?raw', import: 'default', eager: true })
const ruFiles = import.meta.glob('../content/ru/factions/*.md', { query: '?raw', import: 'default', eager: true })
const ukFiles = import.meta.glob('../content/uk/factions/*.md', { query: '?raw', import: 'default', eager: true })

const files = resolveFiles(enFiles, ruFiles, ukFiles)

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
