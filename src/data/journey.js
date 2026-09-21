/**
 * Artyom's journey nodes for both games, in story order.
 *
 * Each node places a level on the metro map. Coordinates are in the ORIGINAL
 * image pixel space (see MAP_IMAGE in `stations.js`): `x` from the left edge,
 * `y` from the top edge. Nodes that sit on a real metro station reuse that
 * station's exact coordinates so the journey marker lands on the printed circle
 * (e.g. Exhibition → VDNKh). Surface / tunnel / ruined levels use approximate
 * positions traced from the in-game journey maps in `public/`.
 *
 * `station` (optional) links the node to a circle in `stations.js`; clicking
 * that circle on the map opens the level dossier.
 *
 * Tuning tip: MapView has a dev-only "pick coords" button to read pixel
 * coordinates straight off the map.
 */

export const journeys = {
  'metro-2033': [
    { id: 'prologue', x: 1330, y: 250 },
    { id: 'hunter', x: 1408, y: 510, station: 'vdnkh' },
    { id: 'exhibition', x: 1440, y: 486, station: 'vdnkh' },
    { id: 'chase', x: 1500, y: 600 },
    { id: 'riga', x: 1408, y: 664, station: 'rizhskaya' },
    { id: 'lost-tunnels', x: 1360, y: 716 },
    { id: 'bridge', x: 1318, y: 772 },
    { id: 'lost-catacombs', x: 1338, y: 820 },
    { id: 'market', x: 1408, y: 736, station: 'prospekt-mira' },
    { id: 'dead-city-1', x: 1112, y: 902 },
    { id: 'dead-city-2', x: 1184, y: 946 },
    { id: 'dry', x: 1366, y: 846, station: 'sukharevskaya' },
    { id: 'ghosts', x: 1322, y: 902 },
    { id: 'anomaly', x: 1300, y: 946 },
    { id: 'cursed', x: 1360, y: 986 },
    { id: 'armory', x: 1364, y: 1028, station: 'turgenevskaya' },
    { id: 'front-line', x: 1244, y: 1120 },
    { id: 'trolley-combat', x: 1274, y: 1152, station: 'kuznetsky-most' },
    { id: 'depot', x: 1206, y: 1182 },
    { id: 'defense', x: 1160, y: 1214 },
    { id: 'child', x: 1136, y: 1202, station: 'okhotny-ryad' },
    { id: 'outpost', x: 1178, y: 1244, station: 'teatralnaya' },
    { id: 'black-station', x: 1226, y: 1288, station: 'ploshchad-revolyutsii' },
    { id: 'polis', x: 916, y: 1248, station: 'arbatskaya' },
    { id: 'alley', x: 958, y: 1290, station: 'aleksandrovsky-sad' },
    { id: 'library', x: 892, y: 1332 },
    { id: 'depository', x: 858, y: 1364 },
    { id: 'archives', x: 902, y: 1300 },
    { id: 'driving-to-sparta', x: 836, y: 1290, station: 'arbatskaya-3' },
    { id: 'dark-star', x: 700, y: 1440 },
    { id: 'dungeon', x: 668, y: 1520 },
    { id: 'caves', x: 648, y: 1600 },
    { id: 'd6', x: 644, y: 1696, station: 'sportivnaya' },
    { id: 'biomass', x: 612, y: 1636 },
    { id: 'separation', x: 588, y: 1576 },
    { id: 'tower', x: 1300, y: 300 },
    { id: 'top', x: 1312, y: 246 },
    { id: 'ethereal', x: 1322, y: 206 },
    { id: 'endings', x: 1332, y: 172 },
  ],
  'last-light': [
    { id: 'introduction', x: 644, y: 1696, station: 'sportivnaya' },
    { id: 'sparta', x: 712, y: 1626, station: 'frunzenskaya' },
    { id: 'ashes', x: 828, y: 1512, station: 'park-kultury' },
    { id: 'pavel', x: 796, y: 1252, station: 'smolenskaya' },
    { id: 'reich', x: 916, y: 1248, station: 'arbatskaya' },
    { id: 'separation-ll', x: 958, y: 1290, station: 'aleksandrovsky-sad' },
    { id: 'facility', x: 1002, y: 1246, station: 'arbatskaya-2' },
    { id: 'torchlight', x: 1046, y: 1292, station: 'biblioteka-imeni-lenina' },
    { id: 'echoes', x: 1002, y: 1332, station: 'borovitskaya' },
    { id: 'bolshoi', x: 1178, y: 1244, station: 'teatralnaya' },
    { id: 'korbut', x: 1136, y: 1202, station: 'okhotny-ryad' },
    { id: 'revolution', x: 1226, y: 1288, station: 'ploshchad-revolyutsii' },
    { id: 'regina', x: 1234, y: 1106, station: 'lubyanka' },
    { id: 'bandits', x: 1364, y: 1028, station: 'turgenevskaya' },
    { id: 'dark-water', x: 1310, y: 1682, station: 'paveletskaya' },
    { id: 'venice', x: 1216, y: 1708, station: 'dobryninskaya' },
    { id: 'sundown', x: 1216, y: 1768, station: 'serpukhovskaya' },
    { id: 'nightfall', x: 1216, y: 1844, station: 'tulskaya' },
    { id: 'undercity', x: 1160, y: 1900 },
    { id: 'contagion', x: 1216, y: 1912, station: 'nagatinskaya' },
    { id: 'quarantine', x: 1310, y: 1740 },
    { id: 'khan', x: 1226, y: 1288, station: 'ploshchad-revolyutsii' },
    { id: 'the-chase', x: 1178, y: 1244, station: 'teatralnaya' },
    { id: 'the-crossing', x: 1136, y: 1202, station: 'okhotny-ryad' },
    { id: 'bridge-ll', x: 1100, y: 1150 },
    { id: 'depot-ll', x: 1030, y: 1098, station: 'tverskaya' },
    { id: 'the-dead-city', x: 1112, y: 902 },
    { id: 'red-square', x: 1180, y: 1040 },
    { id: 'the-garden', x: 1408, y: 510, station: 'vdnkh' },
    { id: 'polis-ll', x: 916, y: 1248, station: 'arbatskaya' },
    { id: 'd6-ll', x: 644, y: 1696, station: 'sportivnaya' },
    { id: 'endings-ll', x: 700, y: 1576 },
  ],
}

/** Map a real station id → level id, so clicking a printed circle opens a dossier. */
export const stationToLevel = (() => {
  const map = {}
  // Metro 2033 takes priority for shared circles; Last Light fills the rest.
  for (const node of journeys['metro-2033']) {
    if (node.station && !map[node.station]) map[node.station] = node.id
  }
  for (const node of journeys['last-light']) {
    if (node.station && !map[node.station]) map[node.station] = node.id
  }
  return map
})()
