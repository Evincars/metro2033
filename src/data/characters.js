import { parseFrontmatter } from '../utils/frontmatter'
import { resolveFiles } from '../i18n/content'

const enFiles = import.meta.glob('../content/characters/*.md', { query: '?raw', import: 'default', eager: true })
const ruFiles = import.meta.glob('../content/ru/characters/*.md', { query: '?raw', import: 'default', eager: true })
const ukFiles = import.meta.glob('../content/uk/characters/*.md', { query: '?raw', import: 'default', eager: true })

const files = resolveFiles(enFiles, ruFiles, ukFiles)

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
