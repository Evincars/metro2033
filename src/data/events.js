import { parseFrontmatter } from '../utils/frontmatter'
import { resolveFiles } from '../i18n/content'

const enFiles = import.meta.glob('../content/events/*.md', { query: '?raw', import: 'default', eager: true })
const ruFiles = import.meta.glob('../content/ru/events/*.md', { query: '?raw', import: 'default', eager: true })
const ukFiles = import.meta.glob('../content/uk/events/*.md', { query: '?raw', import: 'default', eager: true })

const files = resolveFiles(enFiles, ruFiles, ukFiles)

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
