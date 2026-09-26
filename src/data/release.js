export const APP_VERSION = '0.4'

/** Newest first. Shown in the release-notes dialog. */
export const releases = [
  {
    version: '0.4',
    date: '2026-09-26',
    title: 'Signals & Stone',
    notes: [
      'Real Moscow Metro integration — 210 station dossiers with photographs, architects and opening dates, scraped from metrowalks.com and merged into the Stations registry.',
      'Every station card now expands to show in-game or real-metro info with tabbed switching where both exist, plus a “Show on map” button that flies to the station on the Metro Map.',
      'Metro Map redesigned with thick journey polylines, rich tooltips showing chapters, characters and clickable level links, plus a fullscreen photo gallery for real-metro stations.',
      'Incoming radio communications — randomised radio chatter from metro citizens buying, selling and surviving, displayed as ambient snackbar messages with a radio-signal animation.',
      'Moral Points page with all story choices that affect the ending.',
      'Achievements archive — 284 trophies across all Metro titles, with icons, scores and descriptions.',
      'Endings section with video walkthroughs for every good and bad ending.',
      'Character portrait images downloaded and linked to 40 character dossiers.',
      'Internal wiki-link resolution now connects ∼75% of cross-references between dossiers.',
    ],
  },
  {
    version: '0.3',
    date: '2026-09-22',
    title: 'Paper & Steel',
    notes: [
      'New Books library — Dmitry Glukhovsky\u2019s Metro novels plus the wider Universe of Metro 2033 series.',
      'New Games archive — every Metro title with a full dossier and image gallery.',
      'Dark Metro Map redraw, with every Kievskaya platform linked to its station dossier.',
      'Original "Universe of Metro 2033" shield logo in the header, switchable back to the classic wordmark in Settings.',
      'Tunnel backdrop now fills the whole screen; parchment notes and the Games banner were reworked for legibility.',
      'The section menu can now be opened on tablets and phones.',
      'Full Russian and Ukrainian translations — every UI string and all 242 dossier pages translated, with a language switcher in the top menu.',
      'Metro 2039 visual refresh — Metrotype display font, theme-aware favicons, torn-edge gold buttons, film grain and bleed transitions from the official Metro 2039 site.',
    ],
  },
  {
    version: '0.2',
    date: '2026-09-22',
    title: 'Cartography & Chronology',
    notes: [
      'New Levels archive — every Metro 2033 and Last Light mission with full dossiers and image previews.',
      'New Events timeline — the whole Metro chronology, year by year, with expandable eras.',
      'New Locations page — post-apocalyptic Moscow landmarks plus all twelve Moscow Metro lines.',
      'New Factions and Characters archives — full dossiers for every faction and the Metro 2033 / Last Light cast, cross-linked throughout.',
      'Interactive Metro Map — station tooltips, Artyom\u2019s journey overlays, and one-click travel to level and location dossiers.',
      'Stations registry with line filters and an "in the games" toggle.',
      'Breadcrumbs, a release-notes panel, and ambient soundtrack playback.',
    ],
  },
  {
    version: '0.1',
    date: '2026-09-21',
    title: 'First descent',
    notes: [
      'Initial Metro terminal: home, map shell, navigation and settings.',
      'Firebase Hosting deployment pipeline.',
    ],
  },
]
