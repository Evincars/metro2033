import { parseFrontmatter } from '../utils/frontmatter'
import { resolveFiles } from '../i18n/content'

const enFiles = import.meta.glob('../content/mutants/*.md', { query: '?raw', import: 'default', eager: true })
const ruFiles = import.meta.glob('../content/ru/mutants/*.md', { query: '?raw', import: 'default', eager: true })
const ukFiles = import.meta.glob('../content/uk/mutants/*.md', { query: '?raw', import: 'default', eager: true })

const files = resolveFiles(enFiles, ruFiles, ukFiles)

export const MUTANT_GROUPS = ['Mutant Animals', 'Plant Mutants', 'Supernatural Phenomena']

export const CREATURE_CATEGORIES = [
  {
    key: 'terrestrial',
    ids: ['bear', 'biomass', 'corpse-eaters', 'giant-amoeba', 'lurker', 'nosalis', 'nosalis-rhino', 'snake', 'spiderbug', 'slimeslug', 'watcher', 'wolf', 'nops', 'reaper', 'the-swallow'],
  },
  {
    key: 'avian',
    ids: ['demon', 'mutant-crow'],
  },
  {
    key: 'aquatic',
    ids: ['blotniak', 'shrimp', 'tsar-fish', 'worm'],
  },
  {
    key: 'plantLife',
    ids: ['liana', 'nettle', 'radioactive-mushroom', 'spore-bud'],
  },
  {
    key: 'humanoids',
    ids: ['blind-ones', 'blotniak', 'dark-ones', 'humanimal', 'librarian'],
  },
  {
    key: 'supernatural',
    ids: ['anomaly', 'darkness', 'ghosts', 'great-door', 'nagornaya-phantoms', 'river-of-fate', 'damned-souls', 'master-of-tunnels'],
  },
]

export const mutants = Object.values(files)
  .map((raw) => {
    const { meta, body } = parseFrontmatter(raw)
    return {
      id: meta.id,
      title: meta.title ?? meta.id,
      group: meta.group || 'Mutant Animals',
      order: Number(meta.order ?? 0),
      image: meta.image || '',
      brief: meta.brief || '',
      wiki: meta.wiki || '',
      appearances: meta.appearances || '',
      body,
    }
  })
  .filter((m) => m.id)
  .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title))

export const mutantsById = Object.fromEntries(mutants.map((m) => [m.id, m]))
