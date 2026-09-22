import { levelsById } from '../data/levels'
import { locationsById, metroLineById } from '../data/locations'
import { factionsById } from '../data/factions'
import { charactersById } from '../data/characters'
import { eventArticlesById } from '../data/eventArticles'
import { booksById } from '../data/books'
import { gamesById } from '../data/games'

// The left-menu section each route belongs to (label + list route).
const SECTION = {
  vdnh: { label: 'VDNH', to: '/' },
  map: { label: 'Metro Map', to: '/map' },
  stations: { label: 'Stations', to: '/stations' },
  factions: { label: 'Factions', to: '/factions' },
  events: { label: 'Events', to: '/events' },
  levels: { label: 'Levels', to: '/levels' },
  locations: { label: 'Locations', to: '/locations' },
  characters: { label: 'Characters', to: '/characters' },
  games: { label: 'Games', to: '/games' },
  books: { label: 'Books', to: '/books' },
  about: { label: 'About', to: '/about' },
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
      return [SECTION.levels, { label: levelsById[id]?.title ?? 'Level' }]
    case 'location-detail':
      return [SECTION.locations, { label: locationsById[id]?.title ?? 'Location' }]
    case 'metro-line':
      return [SECTION.locations, { label: metroLineById[String(id)]?.label ?? 'Metro line' }]
    case 'faction-detail':
      return [SECTION.factions, { label: factionsById[id]?.title ?? 'Faction' }]
    case 'character-detail':
      return [SECTION.characters, { label: charactersById[id]?.title ?? 'Character' }]
    case 'event-detail':
      return [SECTION.events, { label: eventArticlesById[id]?.title ?? 'Event' }]
    case 'book-detail':
      return [SECTION.books, { label: booksById[id]?.title ?? 'Book' }]
    case 'game-detail':
      return [SECTION.games, { label: gamesById[id]?.title ?? 'Game' }]
    default:
      return SECTION[route.name] ? [SECTION[route.name]] : []
  }
}

/** The list-route path of the section the current route belongs to. */
export function sectionPath(route) {
  return getBreadcrumbs(route)[0]?.to
}
