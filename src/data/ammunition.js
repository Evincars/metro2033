import { parseFrontmatter } from '../utils/frontmatter'
import { resolveFiles } from '../i18n/content'

const enFiles = import.meta.glob('../content/ammunition/*.md', { query: '?raw', import: 'default', eager: true })
const ruFiles = import.meta.glob('../content/ru/ammunition/*.md', { query: '?raw', import: 'default', eager: true })
const ukFiles = import.meta.glob('../content/uk/ammunition/*.md', { query: '?raw', import: 'default', eager: true })

const files = resolveFiles(enFiles, ruFiles, ukFiles)

export const AMMO_GROUPS = ['Rifle Rounds', 'Pistol Rounds', 'Shotgun Shells', 'Pneumatic Ammo', 'Special Ammo']

export const AMMO_CATEGORIES = [
  {
    key: 'rifleRounds',
    ids: ['dirty-5-45x39mm', 'military-grade-rounds', 'incendiary-5-45x39mm', '7-62x54mm', '12-7x108mm'],
  },
  {
    key: 'pistolRounds',
    ids: ['44-magnum', '44-magnum-ap-incendiary'],
  },
  {
    key: 'shotgunShells',
    ids: ['12x70-buckshot', '12x70-dragonbreath'],
  },
  {
    key: 'pneumaticAmmo',
    ids: ['ball-bearings', 'incendiary-capsules'],
  },
  {
    key: 'specialAmmo',
    ids: ['arrows', 'explosive-bolts', 'fuel'],
  },
]

export const ammunition = Object.values(files)
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
      body,
    }
  })
  .filter((e) => e.id)
  .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title))

export const ammunitionById = Object.fromEntries(ammunition.map((e) => [e.id, e]))
