import { parseFrontmatter } from '../utils/frontmatter'
import { resolveFiles } from '../i18n/content'

const enFiles = import.meta.glob('../content/weapons/*.md', { query: '?raw', import: 'default', eager: true })
const ruFiles = import.meta.glob('../content/ru/weapons/*.md', { query: '?raw', import: 'default', eager: true })
const ukFiles = import.meta.glob('../content/uk/weapons/*.md', { query: '?raw', import: 'default', eager: true })

const files = resolveFiles(enFiles, ruFiles, ukFiles)

export const WEAPON_GROUPS = ['Melee', 'Handguns', 'Assault Rifles', 'Sniper Rifles', 'Shotguns', 'Pneumatic Weapons', 'Heavy Weapons', 'Throwables & Explosives', 'Emplacement Weapons']

export const WEAPON_CATEGORIES = [
  {
    key: 'melee',
    ids: ['trench-knife'],
  },
  {
    key: 'handguns',
    ids: ['bastard', 'lolife', 'revolver', 'stallion'],
  },
  {
    key: 'assaultRifles',
    ids: ['aksu', 'bulldog', 'kalash', 'kalash-2012', 'rpk', 'sammy', 'vsv'],
  },
  {
    key: 'sniperRifles',
    ids: ['clapper', 'hellbreath', 'preved', 'valve'],
  },
  {
    key: 'shotguns',
    ids: ['abzats', 'ashot', 'bigun', 'duplet', 'saiga', 'shambler'],
  },
  {
    key: 'pneumatic',
    ids: ['helsing', 'tikhar'],
  },
  {
    key: 'heavy',
    ids: ['flamethrower', 'gatling', 'medved'],
  },
  {
    key: 'throwables',
    ids: ['incendiary-grenade', 'molotov-cocktail'],
  },
  {
    key: 'emplacement',
    ids: ['dshk'],
  },
]

export const weapons = Object.values(files)
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
  .filter((w) => w.id)
  .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title))

export const weaponsById = Object.fromEntries(weapons.map((w) => [w.id, w]))
