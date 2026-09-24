import { parseFrontmatter } from '../utils/frontmatter'
import { resolveFiles } from '../i18n/content'

const enFiles = import.meta.glob('../content/equipment/*.md', { query: '?raw', import: 'default', eager: true })
const ruFiles = import.meta.glob('../content/ru/equipment/*.md', { query: '?raw', import: 'default', eager: true })
const ukFiles = import.meta.glob('../content/uk/equipment/*.md', { query: '?raw', import: 'default', eager: true })

const files = resolveFiles(enFiles, ruFiles, ukFiles)

export const EQUIPMENT_GROUPS = ['Drugs & Consumables', 'Suit & Armor', 'Tools & Gadgets', 'Throwables & Explosives', 'Other']

export const EQUIPMENT_CATEGORIES = [
  {
    key: 'drugsConsumables',
    ids: ['filters', 'medkit', 'radioprotector', 'crafting', 'military-grade-rounds'],
  },
  {
    key: 'suitArmor',
    ids: ['armor', 'artyoms-bracer', 'backpack', 'gas-mask'],
  },
  {
    key: 'toolsGadgets',
    ids: ['artyoms-map', 'binoculars', 'electrical-equipment', 'flashlight', 'geiger-counter', 'lighter', 'metro-made-watch', 'mine', 'night-vision-goggles', 'universal-charger', 'universal-detector'],
  },
  {
    key: 'throwables',
    ids: ['grenade', 'claymore-mine', 'throwing-knives', 'decoy', 'traps'],
  },
  {
    key: 'other',
    ids: ['workbench', 'ammunition', 'attachments'],
  },
]

export const equipment = Object.values(files)
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

export const equipmentById = Object.fromEntries(equipment.map((e) => [e.id, e]))
