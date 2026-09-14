/**
 * Station hotspots for `public/map-w-labels.jpeg`.
 *
 * `x` / `y` are pixel coordinates on the ORIGINAL image (see MAP_IMAGE below),
 * measured from its top-left corner. They are resolution independent: the map
 * canvas scales the image and the hotspots together, so markers stay glued to
 * their circles on phones, tablets and desktops alike.
 *
 * Coordinates below are hand-estimated. Run the app in dev mode and use the
 * "pick coords" toggle on the map to read exact pixel values for new stations.
 */

export const MAP_IMAGE = {
  url: `${import.meta.env.BASE_URL}map-w-labels.jpeg`,
  width: 2222,
  height: 2714,
}

/** Drawn radius of a station circle on the original image, in image pixels. */
export const STATION_RADIUS = 22

export const stations = [
  { id: 'altufuevo', name: 'Altufuevo', x: 961, y: 222 },
  { id: 'bibirevo', name: 'Bibirevo', x: 1002, y: 274 },
  { id: 'otradnoe', name: 'Otradnoe', x: 1002, y: 339 },
  { id: 'vladykino', name: 'Vladykino', x: 1002, y: 396 },
  { id: 'medvedkovo', name: 'Medvedkovo', x: 1507, y: 255 },
  { id: 'vdnkh', name: 'VDNKh', x: 1418, y: 521 },
  { id: 'alekseevskaya', name: 'Alekseevskaya', x: 1418, y: 594 },
  { id: 'rizhskaya', name: 'Rizhskaya', x: 1415, y: 671 },
  { id: 'prospect-mira', name: 'Prospect Mira', x: 1418, y: 744 },
  { id: 'sokol', name: 'Sokol', x: 605, y: 666 },
  { id: 'aeroport', name: 'Aeroport', x: 649, y: 716 },
  { id: 'dinamo', name: 'Dinamo', x: 695, y: 763 },
  { id: 'belorusskaya', name: 'Belorusskaya', x: 802, y: 858 },
  { id: 'komsomolskaya', name: "Komsomol'skaya", x: 1493, y: 857 },
  { id: 'chistye-prudy', name: 'Chistye Prudy', x: 1380, y: 967 },
  { id: 'kuznetskiy-most', name: 'Kuznetskiy Most', x: 1277, y: 1153 },
  { id: 'lubyanka', name: 'Lubyanka', x: 1234, y: 1105 },
  { id: 'chekhovskaya', name: 'Chekhovskaya', x: 1001, y: 1075 },
  { id: 'okhotny-ryad', name: 'Okhotny Ryad', x: 1139, y: 1206 },
  { id: 'teatralnaya', name: 'Teatralnaya', x: 1179, y: 1248 },
  { id: 'ploshchad-revolyutsii', name: 'Ploshchad Revolyutsii', x: 1227, y: 1290 },
  { id: 'polis', name: 'Polis \u2014 Biblioteka Imeni Lenina', x: 1004, y: 1275 },
  { id: 'kurskaya', name: 'Kurskaya', x: 1622, y: 1291 },
  { id: 'kitay-gorod', name: 'Kitay-Gorod', x: 1369, y: 1329 },
  { id: 'tretyakovskaya', name: "Tret'yakovskaya", x: 1187, y: 1509 },
  { id: 'taganskaya', name: 'Taganskaya', x: 1602, y: 1476 },
  { id: 'park-kultury', name: 'Park Kultury', x: 784, y: 1560 },
  { id: 'paveletskaya', name: 'Paveletskaya', x: 1309, y: 1684 },
  { id: 'sportivnaya', name: 'Sportivnaya', x: 647, y: 1699 },
  { id: 'university', name: 'University', x: 495, y: 1853 },
]
