# Ancient World Traveler

A crude "Google Maps for the ancient Mediterranean". Pick a time period, choose two cities, and see how a traveller of that age could get between them, using roads, sea lanes and rivers that appear in the historical sources.

## Periods

| Period | Setting | Places | Routes |
| --- | --- | --- | --- |
| **500 BC** | Achaemenid Persia, the Greek and Phoenician cities, early Rome, Carthage | 65 | 78 |
| **0 CE** | The Roman Empire under Augustus, Parthia, Nabataea, Kush | 114 | 151 |
| **500 CE** | Ostrogothic Italy, Vandal Africa, the Visigoths and Franks, the Eastern Roman Empire, Sasanian Persia | 101 | 134 |

Cities show up only in the periods when they existed or mattered (Alexandria isn't there in 500 BC, Susa is gone by 0 CE), and their names change with the period: Byzantion, then Byzantium, then Constantinopolis.

## Features

- **Places of interest.** Cities appear as circles. Other places are drawn as diamonds: sanctuaries and pilgrimage sites (Delphi, Olympia, Siwa, Bethlehem, St Simeon Stylites), monuments (the Pyramids, Diocletian's Palace at Split, the Behistun inscription, Persepolis) and fortresses (Masada, Carnuntum). All of them can be travelled to.

- **Route planner.** Gives up to three different itineraries, with distance and estimated days. The alternatives are kept distinct, e.g. by sea versus overland.
- **Every route has a source.** Each leg has a name, a short historical note and the ancient sources behind it: Herodotus on the Royal Road, Acts 27 on Paul's voyage, Horace's trip to Brundisium, the Bordeaux Pilgrim, Pliny's record sailing times, and others.
- **Travel options:**
  - Choose which kinds of route to use: road, sea or river.
  - *Ordinary traveller* or *official courier* (Persian angarium or Roman cursus publicus relays).
  - *Sailing season* or *winter* (the *mare clausum*: open-sea routes close and only short crossings stay open).
  - Choose the fastest or the shortest route.
- **Wind and current.**
  - Sailing with the summer Etesian winds is faster than sailing against them. For example, Rome to Alexandria is much quicker than Alexandria to Rome.
  - Boats go faster downstream than upstream.
- **Map.**
  - Shows approximate political labels for each period, and clickable cities and routes.
  - Includes an offline "parchment" basemap built from Natural Earth coastlines, plus an optional online terrain layer.
- **Shareable links.** The period and journey are saved in the URL, e.g. `index.html#period=0ce&from=rome&to=jerusalem`.

## Running it

There's no build step. Open `index.html` in a browser, or serve the folder:

```sh
npm start          # serves on http://localhost:8080
```

It also works as-is on GitHub Pages.

## Project layout

```
index.html            page shell
css/styles.css        styling
js/app.js             map and UI (Leaflet)
js/router.js          graph and path finding (Dijkstra + penalty-based alternatives), no DOM
js/data/periods.js    periods, map labels, travel speed assumptions
js/data/cities.js     cities, with a name, rank and note for each period
js/data/routes.js     routes: mode, periods, drawing waypoints, description, sources
js/data/waypoints.js  named points used to draw sea lanes and roads
js/data/land.js       generated coastline data (npm run build:land)
vendor/leaflet/       Leaflet 1.9.4 (BSD-2-Clause), vendored so it works offline
tests/validate.js     data integrity and router tests (npm test)
```

### Adding a city or route

1. Add the place in `js/data/cities.js`, with an entry for each period it existed in. For a site rather than a city, pass a `kind` as the last argument: `'sanctuary'`, `'monument'` or `'fortress'`.
2. Add routes in `js/data/routes.js` with `R(from, to, mode, periods, { name, desc, sources, via })`.
   - Use `via` waypoints so sea lanes go around land.
   - Set `downwind` (sea) or `downstream` (river) when direction matters.
3. Run `npm test`. It checks for unknown cities and waypoints, routes that use a city in a period when it didn't exist, cities with no routes, and networks that aren't connected.

## Caveats

- Travel times are rough estimates. They come from distance and round-number speeds: about 30 km/day on foot, about 120 km/day for a merchant ship including waits, and faster for couriers.
- Routes are drawn schematically.
- The coastlines are modern. Ancient Miletus and Ephesus were on the sea, and the Nile delta and the Po delta were different.
- Political labels are approximate.
- For serious work, see Stanford's [ORBIS](https://orbis.stanford.edu/) model and the Barrington Atlas.
