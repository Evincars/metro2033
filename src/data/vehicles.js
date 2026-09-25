import { parseFrontmatter } from '../utils/frontmatter'
import { resolveFiles } from '../i18n/content'

const enFiles = import.meta.glob('../content/vehicles/*.md', { query: '?raw', import: 'default', eager: true })
const ruFiles = import.meta.glob('../content/ru/vehicles/*.md', { query: '?raw', import: 'default', eager: true })
const ukFiles = import.meta.glob('../content/uk/vehicles/*.md', { query: '?raw', import: 'default', eager: true })

const files = resolveFiles(enFiles, ruFiles, ukFiles)

export const VEHICLE_GROUPS = ['Rail Vehicles', 'Armoured Vehicles', 'Road Vehicles', 'Watercraft', 'Aircraft']

export const VEHICLE_CATEGORIES = [
  {
    key: 'rail',
    ids: ['railcar', 'krests-railcar', 'automatic-train', 'regina', 'red-line-armoured-train', 'aurora', 'auroras-passenger-train-car'],
  },
  {
    key: 'armoured',
    ids: ['panzer', 't-90', 'red-line-tank', 'armoured-truck'],
  },
  {
    key: 'road',
    ids: ['hanza-off-road-car', 'sauls-van', 'munai-bailer-water-truck'],
  },
  {
    key: 'watercraft',
    ids: ['motorboat', 'rowboat', 'river-boat', 'cruiser', 'uss-mayflower'],
  },
  {
    key: 'aircraft',
    ids: ['flight-76715'],
  },
]

export const vehicles = Object.values(files)
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

export const vehiclesById = Object.fromEntries(vehicles.map((e) => [e.id, e]))
