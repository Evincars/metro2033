import { parseFrontmatter } from '../utils/frontmatter'
import { resolveFiles } from '../i18n/content'

const enFiles = import.meta.glob('../content/games/*.md', { query: '?raw', import: 'default', eager: true })
const ruFiles = import.meta.glob('../content/ru/games/*.md', { query: '?raw', import: 'default', eager: true })
const ukFiles = import.meta.glob('../content/uk/games/*.md', { query: '?raw', import: 'default', eager: true })

const files = resolveFiles(enFiles, ruFiles, ukFiles)

function resolveImage(src) {
  if (!src) return ''
  if (/^https?:\/\//.test(src)) return src
  return `${import.meta.env.BASE_URL}${src.replace(/^\//, '')}`
}

export const games = Object.values(files)
  .map((raw) => {
    const { meta, body } = parseFrontmatter(raw)
    return {
      id: meta.id,
      title: meta.title ?? meta.id,
      order: Number(meta.order ?? 0),
      developer: meta.developer || '',
      publisher: meta.publisher || '',
      year: meta.year || '',
      released: meta.released || '',
      genre: meta.genre || '',
      platforms: meta.platforms || '',
      image: resolveImage(meta.image),
      brief: meta.brief || '',
      wiki: meta.wiki || '',
      body,
    }
  })
  .filter((g) => g.id)
  .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title))

export const gamesById = Object.fromEntries(games.map((g) => [g.id, g]))
