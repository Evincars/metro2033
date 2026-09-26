import { levelsById } from '../data/levels'
import { locationsById, metroLineById } from '../data/locations'
import { factionsById } from '../data/factions'
import { charactersById } from '../data/characters'
import { mutantsById } from '../data/mutants'
import { equipmentById } from '../data/equipment'
import { weaponsById } from '../data/weapons'
import { ammunitionById } from '../data/ammunition'
import { vehiclesById } from '../data/vehicles'
import { achievementsById } from '../data/achievements'
import { endingsById } from '../data/endings'
import { realMetroById } from '../data/realMetro'
import { eventArticlesById } from '../data/eventArticles'
import { booksById } from '../data/books'
import { gamesById } from '../data/games'
import { t } from '../i18n'

const SECTION = {
  vdnh: { label: t('nav.vdnh'), to: '/' },
  map: { label: t('nav.metroMap'), to: '/map' },
  stations: { label: t('nav.stations'), to: '/stations' },
  factions: { label: t('nav.factions'), to: '/factions' },
  events: { label: t('nav.events'), to: '/events' },
  levels: { label: t('nav.levels'), to: '/levels' },
  locations: { label: t('nav.locations'), to: '/locations' },
  characters: { label: t('nav.characters'), to: '/characters' },
  mutants: { label: t('nav.mutants'), to: '/mutants' },
  equipment: { label: t('nav.equipment'), to: '/equipment' },
  weapons: { label: t('nav.weapons'), to: '/weapons' },
  ammunition: { label: t('nav.ammunition'), to: '/ammunition' },
  vehicles: { label: t('nav.vehicles'), to: '/vehicles' },
  achievements: { label: t('nav.achievements'), to: '/achievements' },
  endings: { label: t('nav.endings'), to: '/endings' },
  games: { label: t('nav.games'), to: '/games' },
  books: { label: t('nav.books'), to: '/books' },
  about: { label: t('nav.about'), to: '/about' },
}

/**
 * Finite breadcrumb trail: the section, plus the current detail (if any).
 * Never grows beyond two levels regardless of navigation history.
 */
export function getBreadcrumbs(route) {
  const id = route.params.id
  switch (route.name) {
    case 'map':
      return []
    case 'level-detail':
      return [SECTION.levels, { label: levelsById[id]?.title ?? t('breadcrumb.level') }]
    case 'location-detail':
      return [SECTION.locations, { label: locationsById[id]?.title ?? t('breadcrumb.location') }]
    case 'metro-line':
      return [SECTION.locations, { label: metroLineById[String(id)]?.label ?? t('breadcrumb.metroLine') }]
    case 'faction-detail':
      return [SECTION.factions, { label: factionsById[id]?.title ?? t('breadcrumb.faction') }]
    case 'character-detail':
      return [SECTION.characters, { label: charactersById[id]?.title ?? t('breadcrumb.character') }]
    case 'mutant-detail':
      return [SECTION.mutants, { label: mutantsById[id]?.title ?? t('breadcrumb.mutant') }]
    case 'equipment-detail':
      return [SECTION.equipment, { label: equipmentById[id]?.title ?? t('breadcrumb.equipment') }]
    case 'weapon-detail':
      return [SECTION.weapons, { label: weaponsById[id]?.title ?? t('breadcrumb.weapon') }]
    case 'ammo-detail':
      return [SECTION.ammunition, { label: ammunitionById[id]?.title ?? t('breadcrumb.ammo') }]
    case 'vehicle-detail':
      return [SECTION.vehicles, { label: vehiclesById[id]?.title ?? t('breadcrumb.vehicle') }]
    case 'achievement-detail':
      return [SECTION.achievements, { label: achievementsById[id]?.title ?? t('breadcrumb.achievement') }]
    case 'ending-detail':
      return [SECTION.endings, { label: endingsById[id]?.title ?? t('breadcrumb.ending') }]
    case 'event-detail':
      return [SECTION.events, { label: eventArticlesById[id]?.title ?? t('breadcrumb.event') }]
    case 'book-detail':
      return [SECTION.books, { label: booksById[id]?.title ?? t('breadcrumb.book') }]
    case 'game-detail':
      return [SECTION.games, { label: gamesById[id]?.title ?? t('breadcrumb.game') }]
    case 'real-metro-detail':
      return [SECTION.stations, { label: realMetroById[id]?.title ?? 'Station' }]
    default:
      return SECTION[route.name] ? [SECTION[route.name]] : []
  }
}

/** The list-route path of the section the current route belongs to. */
export function sectionPath(route) {
  return getBreadcrumbs(route)[0]?.to
}
