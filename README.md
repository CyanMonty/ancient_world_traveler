# Ancient World Traveler

A crude "Google Maps for the ancient Mediterranean". Pick a time period, choose two cities, and see how a traveller of that age could get between them, using roads, sea lanes and rivers that appear in the historical sources.

## Periods

| Period | Setting | Places | Routes |
| --- | --- | --- | --- |
| **500 BC** | Achaemenid Persia, the Greek and Phoenician cities, early Rome, Carthage | 65 | 78 |
| **0 CE** | The Roman Empire under Augustus, Parthia, Nabataea, Kush | 114 | 151 |
| **300 CE** | Diocletian's Tetrarchy, from Hadrian's Wall to beyond the Tigris; Sasanian Persia | 111 | 155 |
| **500 CE** | Ostrogothic Italy, Vandal Africa, the Visigoths and Franks, the Eastern Roman Empire, Sasanian Persia | 101 | 134 |
| **565 CE** | Justinian's reconquests: only the Eastern Romans remain, holding Italy and Africa again; Frankish Gaul, Visigothic Spain | 102 | 136 |

Cities show up only in the periods when they existed or mattered (Alexandria isn't there in 500 BC, Susa is gone by 0 CE), and their names change with the period: Byzantion, then Byzantium, then Constantinopolis.

## Features

- **Territories.** Each period shades the lands of every power of the age (empires, kingdoms and client states). Hover over a territory to see who held it, or click a power in the sidebar to zoom to it. Every itinerary lists whose lands each stage passes through and how many borders it crosses. For example, Ravenna to Constantinople overland in 500 CE runs Ostrogothic Kingdom → Gepids → Eastern Roman Empire. City popups say who controlled the city.

- **Places of interest.** Cities appear as circles. Other places are drawn as diamonds: sanctuaries and pilgrimage sites (Delphi, Olympia, Siwa, Bethlehem, St Simeon Stylites), monuments (the Pyramids, Diocletian's Palace at Split, the Behistun inscription, Persepolis) and fortresses (Masada, Carnuntum). All of them can be travelled to.

- **Route planner.** Gives up to three different itineraries, with distance and estimated days. The alternatives are kept distinct, e.g. by sea versus overland.
- **Every route has a source.** Each leg has a name, a short historical note and the ancient sources behind it: Herodotus on the Royal Road, Acts 27 on Paul's voyage, Horace's trip to Brundisium, the Bordeaux Pilgrim, Pliny's record sailing times, and others.
- **Travel options:**
  - Choose which kinds of route to use: road, sea or river.
  - *Ordinary traveller* or *official courier* (Persian angarium or Roman cursus publicus relays).
  - A *month* slider that drives seasonal effects on the edge weights (see below).
  - Choose the fastest or the shortest route.
- **Wind and current.**
  - Sailing with the summer Etesian winds is faster than sailing against them. For example, Rome to Alexandria is much quicker than Alexandria to Rome.
  - Boats go faster downstream than upstream.
- **Map.**
  - Shows approximate political labels for each period, and clickable cities and routes.
  - Includes an offline "parchment" basemap built from Natural Earth coastlines, plus an optional online terrain layer.
- **Shareable links.** The period and journey are saved in the URL, e.g. `index.html#period=0ce&from=rome&to=jerusalem`.

## How the graph is weighted

The network is a weighted, directed graph. Places are nodes and each route is a pair of directed edges (A→B and B→A can weigh differently). The planner runs Dijkstra over it, and alternatives come from re-running it with the legs already used penalised.

An edge's weight in days is built step by step, and every step is shown in the app (open "Edge weight" on any leg or click a route on the map):

```
base   = distance ÷ speed for the mode and traveller (road 30 km/day, sea 120, river 70 for an ordinary traveller)
weight = base × factor × factor … + extra days   (or "closed")
```

Each **effect** in `js/weights.js` looks at the edge and the conditions, and returns a factor, extra days, or closed:

| Effect | What it does |
| --- | --- |
| Sailing season | Vegetius's calendar: sea edges slower in spring and autumn; open sea closed Dec–Feb (short crossings stay open but slow) |
| Prevailing winds | May–Sep Etesians: ×0.8 sailing downwind (e.g. Italy→Egypt), ×2 beating back |
| River currents | upstream ×2.8, except the Nile, where the north wind lets boats sail upstream (×1.4) |
| Nile inundation | Aug–Oct: Nile boats faster, Delta roads flooded |
| Mountain snow | winter penalty applied to the share of a road in snowy zones: up to ×4 in high mountains, ×2 in hill country; coasts and lowlands are unaffected |
| High passes closed | optional: roads crossing high mountains are impassable Dec–Feb |
| Winter mud & short days | ×1.2 on the lowland share of roads, Nov–Feb |
| Desert heat | summer penalty on the desert share of roads |
| Border formalities | +1 day per border crossed along the edge |
| Avoid foreign realms | optional: the share of an edge outside your starting city's realm counts double |

Effects depend on **edge profiles**. When a period loads, every road and river edge is sampled every 10 km against the climate zones in `js/data/zones.js` (high mountains, hill country, deserts, the Nile flood plain) and against the territories. So the Alpine road from Milan to Lyon is known to be 47% high mountain, and it weighs 13 days in July but 35 in January.

To add an effect, append an object to `EFFECTS` in `js/weights.js` with `apply(edge, dir, ctx)` that returns `null` or `{ factor, add, closed, detail }`. It appears in the UI automatically.

**Graph view** (map key): colour edges by their current slowdown, label every edge with its weight in days (showing both directions where they differ), and overlay the climate zones. Under each result, **Watch the search** replays Dijkstra, lighting places up in the order they were settled.

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
js/router.js          graph, edge profiling and path finding (Dijkstra + penalty-based alternatives), no DOM
js/weights.js         edge-weight model: base cost + effects, with explanations
js/data/zones.js      climate & terrain zones used by the effects
js/data/periods.js    periods, map labels, travel speed assumptions
js/data/cities.js     cities, with a name, rank and note for each period
js/data/routes.js     routes: mode, periods, drawing waypoints, description, sources
js/data/waypoints.js  named points used to draw sea lanes and roads
js/data/later-periods.js  300 CE & 565 CE city entries, new places and route rules
js/data/territories.js    generated territory polygons (npm run build:territories)
js/data/land.js       generated coastline data (npm run build:land)
tools/territories.src.js  hand-drawn territory outlines (edit these, then rebuild)
vendor/leaflet/       Leaflet 1.9.4 (BSD-2-Clause), vendored so it works offline
tests/validate.js     data integrity and router tests (npm test)
```

### Adding a city or route

1. Add the place in `js/data/cities.js`, with an entry for each period it existed in. For a site rather than a city, pass a `kind` as the last argument: `'sanctuary'`, `'monument'` or `'fortress'`.
2. Add routes in `js/data/routes.js` with `R(from, to, mode, periods, { name, desc, sources, via })`.
   - Use `via` waypoints so sea lanes go around land.
   - Set `downwind` (sea) or `downstream` (river) when direction matters.
3. To change a border, edit `tools/territories.src.js` and run `npm run build:territories`. In each period, powers are listed in priority order and earlier ones keep any overlapping land, so outlines can be drawn loosely through the sea and over neighbours.
4. Run `npm test`. It checks for unknown cities and waypoints, routes that use a city in a period when it didn't exist, cities with no routes, and networks that aren't connected.

## Caveats

- Travel times are rough estimates. They come from distance and round-number speeds: about 30 km/day on foot, about 120 km/day for a merchant ship including waits, and faster for couriers.
- Routes are drawn schematically.
- The coastlines are modern. Ancient Miletus and Ephesus were on the sea, and the Nile delta and the Po delta were different.
- Political labels and territory borders are approximate and drawn by hand. Ancient frontiers were often zones rather than lines, and control of deserts and mountains was loose. The open sea is treated as nobody's.
- For serious work, see Stanford's [ORBIS](https://orbis.stanford.edu/) model and the Barrington Atlas.
