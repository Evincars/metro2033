import { parseFrontmatter } from '../utils/frontmatter'

/**
 * Game dossiers from `src/content/games/*.md`. Frontmatter:
 *   id, title, order, developer, publisher, year, released, genre, platforms,
 *   image, brief, wiki.
 * Local `image` paths (not starting with http) are resolved against BASE_URL.
 * In-body images use absolute `/game-art/...` paths.
 */

const files = import.meta.glob('../content/games/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})

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
