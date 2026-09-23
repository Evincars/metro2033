import { parseFrontmatter } from '../utils/frontmatter'
import { resolveFiles } from '../i18n/content'
import { lines as lineMeta, stationLines } from './stationLines'
import { stations } from './stations'
import { stationToLevel } from './journey'

const enFiles = import.meta.glob('../content/locations/*.md', { query: '?raw', import: 'default', eager: true })
const ruFiles = import.meta.glob('../content/ru/locations/*.md', { query: '?raw', import: 'default', eager: true })
const ukFiles = import.meta.glob('../content/uk/locations/*.md', { query: '?raw', import: 'default', eager: true })

const files = resolveFiles(enFiles, ruFiles, ukFiles)

export const LOCATION_CATEGORIES = ['Friendly', 'Neutral', 'Hostile', 'Other']

export const locations = Object.values(files)
  .map((raw) => {
    const { meta, body } = parseFrontmatter(raw)
    return {
      id: meta.id,
      title: meta.title ?? meta.id,
      category: meta.category || 'Other',
      order: Number(meta.order ?? 0),
      image: meta.image || '',
      brief: meta.brief || '',
      wiki: meta.wiki || '',
      body,
    }
  })
  .filter((loc) => loc.id)
  .sort((a, b) => {
    const ca = LOCATION_CATEGORIES.indexOf(a.category)
    const cb = LOCATION_CATEGORIES.indexOf(b.category)
    if (ca !== cb) return ca - cb
    return a.order - b.order || a.title.localeCompare(b.title)
  })

export const locationsById = Object.fromEntries(locations.map((loc) => [loc.id, loc]))

/* ---------------- Moscow Metro lines ---------------- */

const LINE_INFO = {
  1: {
    slug: 'Sokolnicheskaya_Line',
    blurb:
      'The oldest line, running northeast to southwest. Its central stations fall within Hanza and Polis territory, while the southern outskirts include Sportivnaya, the surface gateway down to D6.',
  },
  2: {
    slug: 'Zamoskvoretskaya_Line',
    blurb:
      'A long north–south line. Belorusskaya anchors it to Hanza, and its reach runs through the theatre district down to Avtozavodskaya and Kolomenskaya.',
  },
  3: {
    slug: 'Arbatsko-Pokrovskaya_Line',
    blurb:
      'An east–west line through the heart of the Metro, passing the Arbat Confederation stations clustered around Polis.',
  },
  4: {
    slug: 'Filyovskaya_Line',
    blurb: 'A short western line branching toward Kievskaya, running along the surface in places.',
  },
  5: {
    slug: 'Koltsevaya_Line',
    blurb:
      'The Ring Line, unified under Hanza (the Hanseatic League) — the wealthy, well-lit trade circle and the fastest way around the Metro.',
  },
  6: {
    slug: 'Kaluzhsko-Rizhskaya_Line',
    blurb:
      'A radial line running northeast to southwest, passing Rizhskaya (Riga) and Prospekt Mira (the Market).',
  },
  7: {
    slug: 'Tagansko%E2%80%93Krasnopresnenskaya_Line',
    blurb:
      'The Purple Line, cutting across the entire Metro. Several of its central stations are held by the Fourth Reich.',
  },
  8: {
    slug: 'Kalininsko-Solntsevskaya_Line',
    blurb: 'A short eastern radial line.',
  },
  9: {
    slug: 'Serpukhovsko-Timiryazevskaya_Line',
    blurb:
      'A long north–south line; its southern end reaches Sevastopolskaya, a fortress station holding back the mutants.',
  },
  10: {
    slug: 'Lyublinsko-Dmitrovskaya_Line',
    blurb: 'A newer diagonal line; parts of it are occupied by the Satanists in the lore.',
  },
  11: {
    slug: 'Kakhovskaya_Line',
    blurb: 'A very short spur line in the south of the network.',
  },
  12: { slug: 'Butovskaya_Line', blurb: 'A short line on the far southern edge of the network.' },
}

export const metroLines = lineMeta
  .map((line) => {
    const lineStations = stations
      .filter((station) => stationLines[station.id] === line.id)
      .map((station) => ({ ...station, levelId: stationToLevel[station.id] ?? null }))
      .sort((a, b) => a.y - b.y)
    return { ...line, ...(LINE_INFO[line.id] ?? {}), stations: lineStations }
  })
  .filter((line) => line.stations.length)

export const metroLineById = Object.fromEntries(metroLines.map((line) => [String(line.id), line]))

/**
 * Map a real station circle → a location dossier, so map tooltips have content
 * even where no gameplay level is tied to the station.
 */
export const stationToLocation = {
  alekseevskaya: 'alexeyevskaya',
  kievskaya: 'kievskaya',
  'kievskaya-2': 'kievskaya',
  'kievskaya-3': 'kievskaya',
  paveletskaya: 'paveletskaya',
  'paveletskaya-2': 'hole-station',
  sevastopolskaya: 'sevastopolskaya',
  smolenskaya: 'smolenskaya',
  tretyakovskaya: 'venice',
  turgenevskaya: 'cursed-station',
  vdnkh: 'vdnkh',
  'kitay-gorod': 'kitay-gorod',
  'kuznetsky-most': 'armory-station',
  oktyabrskaya: 'oktyabrskaya',
  'prospekt-mira': 'market-station',
  polezhaevskaya: 'polezhayevskaya',
  polyanka: 'polyanka',
  teatralnaya: 'theatre-station',
  timiryazevskaya: 'timiryazevskaya',
  tulskaya: 'tulskaya',
  lubyanka: 'lubyanka',
  'nakhimovsky-prospekt': 'nakhimovsky-prospekt',
  'park-pobedy': 'park-pobedy',
  'ploshchad-revolyutsii': 'ploshchad-revolutsii',
  sukharevskaya: 'dry-station',
  'vorobyovy-gory': 'vorobyovy-gory',
  rizhskaya: 'rizhskaya-riga',
  arbatskaya: 'polis',
}

