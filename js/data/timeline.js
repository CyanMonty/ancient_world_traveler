window.AWT = window.AWT || {};

/*
 * The timeline: turns the data into things that exist between years.
 *
 * Years are integers: negative = BC, positive = CE (there is no year 0).
 *
 *   city.eras   = [{ from, to, name, rank, note, period }]   — a place exists while some era covers the year
 *   route.spans = [[from, to], ...]                          — a route is usable while a span covers the year
 *                                                              (and both of its places exist)
 *
 * The underlying data is written as entries for five ANCHOR periods (500 BC, 1 CE, 300 CE,
 * 500 CE, 565 CE). By default each entry covers the years up to halfway to the neighbouring
 * anchors. Where a real date is known (a founding, a destruction, a renaming, a road being
 * built), it is set below in CITY_DATES and ROUTE_DATES and overrides the default.
 *
 * Borders, region labels and route renamings still come from the nearest anchor ("snapshot"),
 * because they are hand-drawn per period.
 */
(function () {
  const ANCHORS = [
    { id: '500bc', year: -500 },
    { id: '0ce', year: 1 },
    { id: '300ce', year: 300 },
    { id: '500ad', year: 500 },
    { id: '565ce', year: 565 },
  ];
  const MIN = -550;
  const MAX = 600;
  const FAR_PAST = -3000;
  const FAR_FUTURE = 3000;
  const idx = Object.fromEntries(ANCHORS.map((a, i) => [a.id, i]));
  const mid = (i) => Math.round((ANCHORS[i].year + ANCHORS[i + 1].year) / 2); // boundary between anchor i and i+1
  const lowerOf = (i) => (i === 0 ? FAR_PAST : mid(i - 1) + 1);
  const upperOf = (i) => (i === ANCHORS.length - 1 ? FAR_FUTURE : mid(i));

  // Hand-drawn borders are only shown for the years they are roughly right for.
  const SNAPSHOT_WINDOWS = {
    '500bc': [-550, -335], // until Alexander's invasion of Persia
    '0ce': [-30, 40], // from the annexation of Egypt to the annexation of Mauretania
    '300ce': [285, 330], // Diocletian's Tetrarchy to the founding of Constantinople
    '500ad': [476, 507], // from the end of the western empire to Clovis's victory at Vouillé
    '565ce': [554, 568], // Justinian's reconquests to the Lombard invasion of Italy
  };
  /** The border snapshot valid in `year`, or null when no border map covers it. */
  function snapshotForYear(year) {
    for (const [id, [a, b]] of Object.entries(SNAPSHOT_WINDOWS)) if (year >= a && year <= b) return id;
    return null;
  }

  /** Anchor period whose share of the timeline contains `year`. */
  function periodForYear(year) {
    for (let i = 0; i < ANCHORS.length; i++) if (year <= upperOf(i)) return ANCHORS[i].id;
    return ANCHORS[ANCHORS.length - 1].id;
  }

  function fmtYear(y) {
    if (y <= FAR_PAST) return 'antiquity';
    if (y >= FAR_FUTURE) return 'beyond';
    return y < 0 ? `${-y} BC` : `${y === 0 ? 1 : y} CE`;
  }

  // ------------------------------------------------------------------ known dates for places
  // from / to: first and last year; gaps: [[from, to]] when the place did not exist;
  // cuts: { 'periodA|periodB': year } — the year one name/era gives way to the next.
  const CITY_DATES = {
    rome: { from: -753 },
    ostia: { from: -350 },
    puteoli: { from: -194 },
    taras: { from: -706 },
    brundisium: { from: -244 },
    aquileia: { from: -181 },
    rhegion: { from: -720 },
    syracuse: { from: -733 },
    akragas: { from: -580, to: -210 },
    motya: { to: -397 },
    lilybaeum: { from: -397 },
    massalia: { from: -600 },
    emporion: { from: -575 },
    gades: { from: -1100 },
    carthago_nova: { from: -227 },
    tarraco: { from: -218 },
    narbo: { from: -118 },
    arelate: { from: -46 },
    lugdunum: { from: -43 },
    emerita: { from: -25 },
    treverorum: { from: -16 },
    carthage: {
      from: -814,
      cuts: { '500bc|0ce': -145 },
      interludes: [{ from: -145, to: -45, name: 'Ruins of Carthage', rank: 3, note: 'Razed by Scipio Aemilianus in 146 BC; Utica is now the capital of Roman Africa. Gaius Gracchus\'s colony "Junonia" (122 BC) briefly settled nearby, and Caesar will refound the city in 44 BC.' }],
    },
    utica: { from: -1100 },
    caesarea_maur: { from: -25 },
    cyrene: { from: -631 },
    alexandria: { from: -331 },
    caesarea: { from: -22 },
    jerusalem: { cuts: { '0ce|300ce': 130 } },
    antioch: { from: -300 },
    zeugma: { from: -300, to: 253 },
    edessa: { from: -303 },
    ctesiphon: { from: -120 },
    persepolis: { from: -518, to: -330 },
    rhodes: { from: -408 },
    byzantium: { from: -667, cuts: { '300ce|500ad': 330 } },
    nicomedia: { from: -264 },
    sinope: { from: -630 },
    corinth: {
      cuts: { '500bc|0ce': -145 },
      interludes: [{ from: -145, to: -45, name: 'Ruins of Corinth', rank: 3, note: 'Sacked by Mummius in 146 BC. Squatters live among the ruins, which Cicero saw, but travellers still cross the Isthmus. Caesar will refound it as a colony in 44 BC.' }],
    },
    thessalonica: { from: -315 },
    delos: { to: -88 },
    nicopolis: { from: -29 },
    chersonesos: { from: -422 },
    artaxata: { from: -176 },
    nemrut: { from: -62 },
    tanais: { from: -250, to: 240 },
    meroe: { to: 350 },
    masada: { from: -35, to: 74 },
    pompeii: { to: 79 },
    veii: { to: -396 },
    spalatum: { from: 295 },
    qalat_siman: { from: 423 },
    dara: { from: 505 },
    londinium: { from: 47, to: 410 },
    eboracum: { from: 71, to: 410 },
    hadrians_wall: { from: 122, to: 410 },
    gesoriacum: { from: 43, to: 450 },
    olympia: { to: 426 },
    delphi: { to: 560 },
    carnuntum: { to: 430 },
    volubilis: { from: -40 },
    olbia: { from: -550, to: 250 },
    gordion: { to: -330 },
    palmyra: { to: 400 },
    babylon: { to: -100 },
    susa: { to: -250 },
    giza: { from: -2560 },
    thebes: { from: -2000 },
    memphis: { from: -3000 },
  };

  // ------------------------------------------------------------------ known dates for routes
  const ROUTE_DATES = {
    'rome-capua-road': { from: -312 },
    'capua-taras-road': { from: -268 },
    'taras-brundisium-road': { from: -244 },
    'rome-ariminum-road': { from: -220 },
    'ariminum-mediolanum-road': { from: -187 },
    'rome-arelate-road': { from: -13 },
    'arelate-nemausus-road': { from: -118 },
    'nemausus-narbo-road': { from: -118 },
    'narbo-tarraco-road': { from: -118 },
    'tarraco-carthago_nova-road': { from: -120 },
    'carthago_nova-corduba-road': { from: -120 },
    'hispalis-gades-road': { from: -8 },
    'dyrrachium-thessalonica-road': { from: -146 },
    'thessalonica-byzantium-road': { from: -146 },
    'mediolanum-lugdunum-road': { from: -20 },
    'lugdunum-lutetia-road': { from: -20 },
    'lugdunum-treverorum-road': { from: -20 },
    'sardis-gordion-road': { from: -547, to: -330 },
    'gordion-susa-road': { from: -547, to: -330 },
    'susa-persepolis-road': { from: -518, to: -330 },
    'byzantium-sardis-road': { from: -513, to: -330 },
    'palmyra-resafa-road': { from: 293 },
    'alexandria-puteoli-sea': { from: -30, to: 330 },
    'byzantium-alexandria-sea': { from: 332 },
    'salona-siscia-road': { from: 16 },
    'edessa-dara-road': { from: 505 },
    'dara-nisibis-road': { from: 505 },
    'sirmium-singidunum-road': { from: 50 },
    'singidunum-naissus-road': { from: 50 },
    'naissus-serdica-road': { from: 50 },
    'serdica-byzantium-road': { from: 50 },
    'petra-gaza-road': { to: 400 },
    'carthago_nova-carthage-sea': { from: -227 },
    'capua-poseidonia-road': { from: -273 }, // Latin colony of Paestum, 273 BC; paved as the Via Popilia in 132 BC
  };

  const cityById = Object.fromEntries(AWT.cities.map((c) => [c.id, c]));

  // ---- places → eras
  for (const c of AWT.cities) {
    const d = CITY_DATES[c.id] || {};
    const present = ANCHORS.map((a) => !!c.periods[a.id]);
    let eras = [];
    ANCHORS.forEach((a, i) => {
      if (!present[i]) return;
      const p = c.periods[a.id];
      // exactFrom / exactTo: false while a boundary is only the default halfway estimate
      eras.push({ from: lowerOf(i), to: upperOf(i), name: p.name, rank: p.rank, note: p.note, period: a.id, exactFrom: false, exactTo: false });
    });
    if (!eras.length) {
      c.eras = [];
      continue;
    }
    // cuts move the boundary between two consecutive eras
    for (const [pair, year] of Object.entries(d.cuts || {})) {
      const [pa, pb] = pair.split('|');
      const ea = eras.find((e) => e.period === pa);
      const eb = eras.find((e) => e.period === pb);
      if (!ea || !eb) throw new Error(`timeline: bad cut ${pair} for ${c.id}`);
      ea.to = year - 1;
      eb.from = year;
      ea.exactTo = eb.exactFrom = true;
    }
    // a place's first era starts at its known founding, and its last era ends at its known end
    if (d.from !== undefined) {
      eras[0].from = d.from;
      // the first era may also need to reach forward if the founding is later than its default range
      eras = eras.filter((e) => e.to >= d.from);
      eras[0].from = Math.max(eras[0].from, d.from);
      eras[0].exactFrom = true;
    }
    if (d.to !== undefined) {
      eras = eras.filter((e) => e.from <= d.to);
      eras[eras.length - 1].to = d.to;
      eras[eras.length - 1].exactTo = true;
    }
    // gaps: years when the place did not exist (e.g. Carthage between its destruction and refoundation)
    for (const [g1, g2] of d.gaps || []) {
      const out = [];
      for (const e of eras) {
        if (e.to < g1 || e.from > g2) out.push(e);
        else {
          if (e.from < g1) out.push(Object.assign({}, e, { to: g1 - 1 }));
          if (e.to > g2) out.push(Object.assign({}, e, { from: g2 + 1 }));
        }
      }
      eras = out;
    }
    // interludes replace part of a place's history with a different era (e.g. ruins)
    for (const it of d.interludes || []) {
      const out = [];
      for (const e of eras) {
        if (e.to < it.from || e.from > it.to) out.push(e);
        else {
          if (e.from < it.from) out.push(Object.assign({}, e, { to: it.from - 1, exactTo: true }));
          if (e.to > it.to) out.push(Object.assign({}, e, { from: it.to + 1, exactFrom: true }));
        }
      }
      out.push(Object.assign({ period: periodForYear(it.from), exactFrom: true, exactTo: true }, it));
      eras = out.sort((x, y) => x.from - y.from);
    }
    c.eras = eras;
  }

  const startOf = (c) => (c.eras.length ? c.eras[0].from : FAR_FUTURE);
  const endOf = (c) => (c.eras.length ? c.eras[c.eras.length - 1].to : FAR_PAST);

  // ---- routes → spans
  for (const r of AWT.routes) {
    const d = ROUTE_DATES[r.id] || {};
    const A = cityById[r.from];
    const B = cityById[r.to];
    const inR = ANCHORS.map((a) => r.periods.includes(a.id));
    const spans = [];
    ANCHORS.forEach((a, i) => {
      if (!inR[i]) return;
      let lo = lowerOf(i);
      let hi = upperOf(i);
      // A route first attested in this anchor, joining a place founded since the previous
      // anchor, opens when that place appears (e.g. Alexandria's routes from 331 BC).
      if (i > 0 && !inR[i - 1]) {
        const cand = Math.max(startOf(A), startOf(B));
        if (cand < lo && cand > ANCHORS[i - 1].year) lo = cand;
      }
      // ...and likewise stays open until its place disappears before the next anchor.
      if (i < ANCHORS.length - 1 && !inR[i + 1]) {
        const cand = Math.min(endOf(A), endOf(B));
        if (cand > hi && cand < ANCHORS[i + 1].year) hi = cand;
      }
      const last = spans[spans.length - 1];
      if (last && last[1] + 1 >= lo) last[1] = Math.max(last[1], hi);
      else spans.push([lo, hi]);
    });
    if (spans.length) {
      if (d.from !== undefined) spans[0][0] = d.from;
      if (d.to !== undefined) spans[spans.length - 1][1] = d.to;
    }
    r.spans = spans.filter(([a, b]) => a <= b);
  }

  // ---- places without a known founding date join the travel graph once they are connected to it.
  // Sweeping year by year, such a place is held back until a route links it to the main network
  // (otherwise e.g. Lutetia would appear in 249 BC with no road to it until Agrippa's in 20 BC).
  {
    const auto = AWT.cities.filter((c) => c.eras.length && !(CITY_DATES[c.id] && CITY_DATES[c.id].from !== undefined));
    const settled = new Set();
    const exists = (c, y) => c.eras.some((e) => y >= e.from && y <= e.to);
    for (let y = MIN; y <= MAX && settled.size < auto.length; y++) {
      const adj = {};
      for (const r of AWT.routes) {
        if (!r.spans.some(([a, b]) => y >= a && y <= b)) continue;
        const A = cityById[r.from];
        const B = cityById[r.to];
        if (!exists(A, y) || !exists(B, y)) continue;
        (adj[r.from] = adj[r.from] || []).push(r.to);
        (adj[r.to] = adj[r.to] || []).push(r.from);
      }
      // largest connected component this year
      const seen = new Set();
      let main = new Set();
      for (const start of Object.keys(adj)) {
        if (seen.has(start)) continue;
        const comp = new Set([start]);
        const stack = [start];
        seen.add(start);
        while (stack.length) for (const n of adj[stack.pop()]) if (!seen.has(n)) seen.add(n), comp.add(n), stack.push(n);
        if (comp.size > main.size) main = comp;
      }
      for (const c of auto) {
        if (settled.has(c.id) || !exists(c, y)) continue;
        if (main.has(c.id)) settled.add(c.id);
        else {
          c.eras[0].from = y + 1;
          if (c.eras[0].from > c.eras[0].to) c.eras.shift();
          if (!c.eras.length) settled.add(c.id);
        }
      }
    }
  }

  // ---- dated events (only real, known dates — not the default halfway boundaries)
  const events = [];
  const nameAt = (c, y) => (c.eras.find((e) => y >= e.from && y <= e.to) || c.eras[0] || {}).name || c.id;
  for (const [id, d] of Object.entries(CITY_DATES)) {
    const c = cityById[id];
    if (!c || !c.eras.length) continue;
    if (d.from !== undefined) events.push({ year: d.from, kind: 'appear', text: nameAt(c, d.from), city: id });
    if (d.to !== undefined) events.push({ year: d.to, kind: 'vanish', text: nameAt(c, d.to), city: id });
    for (const y of Object.values(d.cuts || {})) events.push({ year: y, kind: 'rename', text: `${nameAt(c, y - 1)} → ${nameAt(c, y)}`, city: id });
    for (const it of d.interludes || []) {
      events.push({ year: it.from - 1, kind: 'vanish', text: `${nameAt(c, it.from - 1)} destroyed`, city: id });
      events.push({ year: it.to + 1, kind: 'appear', text: `${nameAt(c, it.to + 1)} refounded`, city: id });
    }
  }
  const routeById = Object.fromEntries(AWT.routes.map((r) => [r.id, r]));
  for (const [id, d] of Object.entries(ROUTE_DATES)) {
    const r = routeById[id];
    if (!r) continue;
    if (d.from !== undefined) events.push({ year: d.from, kind: 'route-open', text: r.name, route: id });
    if (d.to !== undefined) events.push({ year: d.to, kind: 'route-close', text: r.name, route: id });
  }
  events.sort((x, y) => x.year - y.year);

  AWT.timeline = {
    anchors: ANCHORS,
    min: MIN,
    max: MAX,
    periodForYear,
    snapshotForYear,
    snapshotWindows: SNAPSHOT_WINDOWS,
    fmtYear,
    anchorYear: (id) => ANCHORS[idx[id]].year,
    events,
    cityDates: CITY_DATES,
    routeDates: ROUTE_DATES,
  };
})();
