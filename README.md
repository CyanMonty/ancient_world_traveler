# Ancient World Traveler

A crude "Google Maps for the ancient Mediterranean". Pick a time period, choose two cities, and see how a traveller of that age could get between them, using roads, sea lanes and rivers that appear in the historical sources.

## A sliding timeline

A **year slider** runs from 550 BC to 600 CE. Places and routes have validity ranges, so they drop in and out as you drag: Alexandria appears in 331 BC, Persepolis burns in 330 BC, the Via Appia opens in 312 BC, Carthage and Corinth lie in ruins from 146 BC to 44 BC, Pompeii is buried in 79 CE, and Byzantium becomes Constantinopolis in 330. A side panel lists the dated changes within 40 years of the current year, and places that have just appeared pulse on the map.

- **Places** have *eras*: from-year, to-year, name, importance and note (`city.eras`). Gaps and renamings are allowed. Popups show a place's name history.
- **Routes** have *spans* (`route.spans`) and are usable while a span covers the year and both of their places exist.
- **Borders** are hand-drawn snapshots, each shown only within the window it is roughly right for:

| Snapshot | Shown for | Setting |
| --- | --- | --- |
| 500 BC | 550–335 BC | Achaemenid Persia, the Greek and Phoenician cities, early Rome, Carthage |
| 1 CE | 30 BC – 40 CE | The Roman Empire under Augustus, Parthia, Nabataea, Kush |
| 300 CE | 285–330 CE | Diocletian's Tetrarchy, from Hadrian's Wall to beyond the Tigris; Sasanian Persia |
| 500 CE | 476–507 CE | Ostrogothic Italy, Vandal Africa, Visigoths and Franks, the Eastern Roman Empire |
| 565 CE | 554–568 CE | Justinian's reconquests: only the Eastern Romans remain |

Between windows the map shows no borders and says so, and the border-based weights switch off. The five snapshots are also quick-jump buttons.

**Where the dates come from:** the data was first written as entries for those five anchor years. Each entry was stretched to cover the years up to halfway to its neighbours, and then replaced with real dates wherever they are known: foundings, destructions, renamings and road construction. Known dates are flagged `exactFrom`/`exactTo` in the JSON; the rest are estimates and show as "c." in the app. The test suite sweeps every 5 years to check that no place is ever cut off from the network.

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

The data is a graph stored as plain JSON in `data/`. That's the source of truth: edit it there, then rebuild the bundle the app loads.

```
data/nodes.json       places (nodes): id, modern name, lat/lng, kind, eras [{from, to, name, rank, note, exactFrom, exactTo, noteYear}]
data/edges.json       routes (edges): id, from, to, mode, name, desc, sources, via, flags (downwind, downstream, crossing, nile),
                      spans [{from, to, exactFrom, exactTo, roadDateFrom, roadDateTo}], overrides [{from, to, name/desc/sources}]
data/waypoints.json   named points used to draw edges
data/zones.json       climate & terrain zones used by the edge-weight effects
data/narratives.json  descriptions of the five mapped periods
data/config.json      timeline range, traveller speeds, winding factors

tools/build-data.js   validates data/*.json and writes js/data/bundle.js   (npm run build:data)
js/data/bundle.js     generated — loaded by the app, so index.html works straight from disk
js/timeline.js        year formatting and dated events derived from eras and spans
js/router.js          weighted graph per year, edge profiling, Dijkstra + alternatives (no DOM)
js/weights.js         edge-weight model: base cost + effects, with explanations
js/app.js             map and UI (Leaflet)
js/data/land.js       generated coastline data (npm run build:land)
vendor/leaflet/       Leaflet 1.9.4, vendored so it works offline
tests/validate.js     data integrity, bundle freshness, router and timeline tests (npm test)
```

Years are integers (negative = BC). `exactFrom`/`exactTo` mark known dates; other boundaries are estimates and show as "c." in the app. Because the data is plain nodes and edges, it can be loaded into a graph database (Neo4j), PostGIS/pgRouting or SQLite if the project ever outgrows the browser.

## Adding a place or route

1. Add a node to `data/nodes.json` with one or more eras (`from`, `to`, `name`, `rank` 1–3, `note`). For a site rather than a city, set `kind` to `sanctuary`, `monument` or `fortress`.
2. Add an edge to `data/edges.json` with `from`, `to`, `mode`, `name`, `desc`, `sources`, `via` waypoints and `spans`.
   - Use `via` waypoints so sea lanes go around land.
   - Set `downwind` (sea) or `downstream` (river) when direction matters.
3. Run `npm run build:data`, then `npm test`. The tests check the data, that the bundle is up to date, and that no place is cut off from the network in any year.

## Caveats

- Travel times are rough estimates. They come from distance and round-number speeds: about 30 km/day on foot, about 120 km/day for a merchant ship including waits, and faster for couriers.
- Routes are drawn schematically.
- The coastlines are modern. Ancient Miletus and Ephesus were on the sea, and the Nile delta and the Po delta were different.
- Dates not flagged as exact in `data/` are estimates, and place notes describe their anchor year (popups say so when you are far from it).
- Political labels and territory borders are approximate and drawn by hand. Ancient frontiers were often zones rather than lines, and control of deserts and mountains was loose. The open sea is treated as nobody's.
- For serious work, see Stanford's [ORBIS](https://orbis.stanford.edu/) model and the Barrington Atlas.
