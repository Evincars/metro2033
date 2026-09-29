import { slugEntries, titleEntries } from '../data/linkIndex'

function normalize(str) {
  return String(str ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

function normalizeSlug(str) {
  return String(str ?? '').replace(/[-_]/g, ' ').toLowerCase().replace(/#.*$/, '')
}

const slugToHref = {}
function addSlug(wiki, href) {
  const key = normalizeSlug(decodeURIComponent(wiki))
  slugToHref[key] = href
}
for (const [wiki, href] of slugEntries) addSlug(wiki, href)

const SLUG_ALIASES = {
  'Metro 2033 (Videogame)': '/games/metro-2033',
  'Metro 2033 (Video Game)': '/games/metro-2033',
  'Metro: Last Light': '/games/metro-last-light',
  'Metro Last Light': '/games/metro-last-light',
  'Metro: Last Light Redux': '/games/metro-redux',
  'Metro Last Light Redux': '/games/metro-redux',
  'Metro 2033 Redux': '/games/metro-redux',
  'Metro Video Game Series': '/games',
  'Metro Series': '/games',
  'Achievements and Trophies': '/achievements',
  'Achievements': '/achievements',
  'Endings': '/endings',
  'Moral Points': '/events/moral-points',
  'Moral Point': '/events/moral-points',
  'moral points': '/events/moral-points',
  'Spartan Rangers': '/factions/rangers',
  'The Rangers': '/factions/rangers',
  'Rangers': '/factions/rangers',
  'Spartan': '/factions/rangers',
  'The Rangers of the Order': '/factions/rangers',
  'Great War of 2013': '/events/world-war-iii',
  'World War III': '/events/world-war-iii',
  'Battle of D6': '/events/battle-for-d6',
  'Battle for D6': '/events/battle-for-d6',
  'Hansa': '/factions/hanza',
  'Nosalises': '/mutants/nosalis',
  'nosalises': '/mutants/nosalis',
  'nosalis': '/mutants/nosalis',
  'Shrimps': '/mutants/shrimp',
  'shrimps': '/mutants/shrimp',
  'Demons': '/mutants/demon',
  'demons': '/mutants/demon',
  'Spiderbugs': '/mutants/spiderbug',
  'spiderbugs': '/mutants/spiderbug',
  'Librarians': '/mutants/librarian',
  'librarians': '/mutants/librarian',
  'Lurkers': '/mutants/lurker',
  'lurkers': '/mutants/lurker',
  'Watchers': '/mutants/watcher',
  'watchers': '/mutants/watcher',
  'Watchmen': '/mutants/watcher',
  'watchmen': '/mutants/watcher',
  'The Blind Ones': '/mutants/blind-ones',
  'Blind Ones': '/mutants/blind-ones',
  'Tsar Fish': '/mutants/tsar-fish',
  'worm': '/mutants/worm',
  'humanimal': '/mutants/humanimal',
  'Dark One': '/factions/dark-ones',
  'Dark Ones': '/factions/dark-ones',
  'Nazis': '/factions/fourth-reich',
  'Nazi': '/factions/fourth-reich',
  'Communists': '/factions/red-line',
  'Communist': '/factions/red-line',
  'Kalash (AK-74M)': '/weapons/kalash',
  'Kalash (AK-74)': '/weapons/kalash',
  'AKSU (AKS-74U)': '/weapons/aksu',
  'RPK-74': '/weapons/rpk',
  'Saiga (Saiga-12)': '/weapons/saiga',
  'MGR': '/weapons/mgr',
  'Volt Driver': '/weapons/volt-driver',
  'Uboinik (Shambler)': '/weapons/shambler',
  'Tihar': '/weapons/tikhar',
  'VDNKh': '/locations/exhibition',
  'VDNKh Station (Location)': '/locations/vdnkh',
  'Weapons': '/weapons',
  'Factions': '/factions',
  'Levels': '/levels',
  'Mutants': '/mutants',

  'Armour': '/equipment/armor',
  'Armour#Upgrades': '/equipment/armor',
  'backpack': '/equipment/backpack',
  'equipment': '/equipment',
  'Gas Mask#Upgrades': '/equipment/gas-mask',
  'gas mask': '/equipment/gas-mask',
  'flashlight': '/equipment/flashlight',
  'flamethrower': '/weapons/flamethrower',
  'Electrical Equipment#Upgrades': '/equipment/electrical-equipment',
  "Artyom's Bracer#Upgrades": '/equipment/artyoms-bracer',
  'Incendiary 5.45x39mm': '/ammunition/incendiary-5-45x39mm',
  'postcards': '/equipment',
  'Difficulties': '/games/metro-exodus',
  'Downloadable Content': '/games/metro-exodus',

  'Moscow Metro': '/map',
  'Post-Apocalyptic Metro System': '/map',
  'the Surface': '/locations',
  'Library (Disambiguation)': '/locations/great-library',
  ':Category:Assault Rifles': '/weapons',
  ':Category:Handguns': '/weapons',

  "Sam's Story": '/levels/sams-story',
  'Savage Cannibals of the Great Worm Cult': '/factions/great-worm-cult',
  'cannibals': '/factions/great-worm-cult',
  'Cannibals': '/factions/great-worm-cult',

  'Anna Miller': '/characters/anna',
  'Stepan (Metro 2035)': '/characters/stepan',
  'Stepan': '/characters/stepan',
  'motorboat': '/vehicles/motorboat',
  'Metro': '/games',
  'Moscow': '/levels/moscow',
  'Anti-rad': '/equipment/radioprotector',
  'Renergan-F': '/levels/the-dead-city',
  'Armored Train': '/vehicles/red-line-armoured-train',
  'Russian Armed Forces': '/factions/rangers',
  'VDNKh Station (Location)': '/locations/vdnkh',
  'Great Owl': '/mutants/demon',
  'Kaspik-1': '/vehicles/cruiser',
  'Caspian-1': '/vehicles/cruiser',
  'Heavy Trooper': '/factions/rangers',
  'Master of the Forest': '/mutants/bear',
  'Forest Child': '/characters/olga',
  'Novosibirsk Satellite Communications Center': '/levels/the-dead-city',
  'Institute (Novosibirsk)': '/levels/the-dead-city',
  'Volga Storage Facility': '/levels/the-volga',
  'Sibirskaya': '/levels/the-dead-city',
  'Danila (Vladivostok)': '/characters/danila',
  'Saul': '/levels/sams-story',
  'The Doctor': '/levels/the-two-colonels',
  'The Hermit': '/levels/the-volga',
  'The Admiral': '/levels/sams-story',
  'The Teacher (Metro Exodus)': '/levels/the-taiga',
  'Petrovich (Exodus)': '/levels/the-volga',
  'Kirill (Exodus)': '/characters/kirill',
  'Korzh': '/levels/the-volga',
  'Klim': '/levels/the-two-colonels',
  'Tolya': '/levels/the-dead-city',
  'Tom': '/levels/sams-story',
  'Mirsky': '/levels/the-dead-city',
  'Eduard Baranov': '/levels/the-two-colonels',
  'Khakimova': '/levels/the-two-colonels',
  'Silantius': '/levels/the-volga',

  'Moscow (Metro Exodus Level)': '/levels/moscow',
  'Winter (Metro Exodus Level)': '/levels/winter',
  'Spring (Metro Exodus Level)': '/levels/spring',
  'The Volga (Metro Exodus Level)': '/levels/the-volga',
  'Yamantau (Metro Exodus Level)': '/levels/yamantau',
  'Summer (Metro Exodus Level)': '/levels/summer',
  'The Caspian (Metro Exodus Level)': '/levels/the-caspian',
  'Autumn (Metro Exodus Level)': '/levels/autumn',
  'The Taiga (Metro Exodus Level)': '/levels/the-taiga',
  'The Dead City (Metro Exodus Level)': '/levels/the-dead-city',
  'Sparta (Metro Last Light Level)': '/levels/sparta',

  'Volga': '/levels/the-volga',
  'the Ark': '/levels/yamantau',
  'The Ark': '/levels/yamantau',
  'the Baron': '/characters/baron',
  'The Baron': '/characters/baron',
  'The False Baron': '/characters/baron',
  'Valley': '/levels/the-taiga',
  'Railway museum': '/levels/autumn',
  'Akademgorodok': '/levels/the-dead-city',
  'Kazakhstan': '/levels/the-caspian',
  'Lake Baikal': '/levels/autumn',
  'the valley': '/levels/the-taiga',
}
for (const [key, href] of Object.entries(SLUG_ALIASES)) slugToHref[normalizeSlug(key)] = href

const textToHref = {}
function addAlias(text, href) {
  const key = normalize(text)
  if (key) textToHref[key] = href
}
for (const [title, href] of titleEntries) addAlias(title, href)

function resolveBySlug(slug) {
  const key = normalizeSlug(decodeURIComponent(slug))
  if (slugToHref[key]) return slugToHref[key]
  if (key.endsWith('s') && slugToHref[key.slice(0, -1)]) return slugToHref[key.slice(0, -1)]
  const base = key.replace(/\s*\([^)]*\)\s*$/, '')
  if (base !== key && slugToHref[base]) return slugToHref[base]
  return null
}

function resolveByText(text) {
  const n = normalize(text)
  for (const candidate of [n, n.replace(/station$/, ''), n.replace(/location$/, '')]) {
    if (candidate && textToHref[candidate]) return textToHref[candidate]
  }
  return null
}

function decodeHtmlEntities(str) {
  return str.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(code)).replace(/&amp;/g, '&')
}

export function linkify(html) {
  const internal = html.replace(
    /<a href="https:\/\/metrovideogame\.fandom\.com\/wiki\/([^"]*)"([^>]*)>([^<]+)<\/a>/g,
    (match, slug, attrs, text) => {
      const decodedSlug = decodeHtmlEntities(slug)
      const decodedText = decodeHtmlEntities(text)
      const href = resolveBySlug(decodedSlug) || resolveByText(decodedText)
      return href ? `<a href="${href}" data-internal>${text}</a>` : match
    },
  )
  return internal.replace(/<a (?![^>]*data-internal)href="https?:\/\/[^>]*>/g, (tag) =>
    /target=/.test(tag) ? tag : tag.replace(/^<a /, '<a target="_blank" rel="noopener" '),
  )
}

export function handleInternalClick(event, router) {
  const anchor = event.target.closest('a[data-internal]')
  if (!anchor) return
  event.preventDefault()
  router.push(anchor.getAttribute('href'))
}
