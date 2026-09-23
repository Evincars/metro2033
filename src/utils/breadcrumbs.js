import { levelsById } from '../data/levels'
import { locationsById, metroLineById } from '../data/locations'
import { factionsById } from '../data/factions'
import { charactersById } from '../data/characters'
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
    case 'event-detail':
      return [SECTION.events, { label: eventArticlesById[id]?.title ?? t('breadcrumb.event') }]
    case 'book-detail':
      return [SECTION.books, { label: booksById[id]?.title ?? t('breadcrumb.book') }]
    case 'game-detail':
      return [SECTION.games, { label: gamesById[id]?.title ?? t('breadcrumb.game') }]
    default:
      return SECTION[route.name] ? [SECTION[route.name]] : []
  }
}

/** The list-route path of the section the current route belongs to. */
export function sectionPath(route) {
  return getBreadcrumbs(route)[0]?.to
}
