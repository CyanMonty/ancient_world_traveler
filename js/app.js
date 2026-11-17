/* global L, AWT */
(function () {
  'use strict';

  const MODE_STYLE = {
    road: { color: '#a0441c', dashArray: null },
    sea: { color: '#1e5a84', dashArray: '6 6' },
    river: { color: '#2d7d5a', dashArray: null },
  };
  const MODE_LABEL = { road: 'Road', sea: 'Sea', river: 'River' };
  // Slowdown factor = current weight / base weight (distance at normal speed)
  const COST_BANDS = [
    { max: 0.95, color: '#1d7f9e', label: 'faster' },
    { max: 1.15, color: '#5f8f3a', label: 'normal' },
    { max: 1.6, color: '#d9a227', label: '×1.2–1.6' },
    { max: 2.5, color: '#d9622b', label: '×1.6–2.5' },
    { max: Infinity, color: '#b3261e', label: '×2.5+' },
    { closed: true, color: '#8a8a8a', label: 'closed' },
  ];
  const costColor = (f, closed) => (closed ? '#8a8a8a' : COST_BANDS.find((b) => f <= b.max).color);
  const KIND_LABEL = { city: 'City', sanctuary: 'Sanctuary / pilgrimage site', monument: 'Monument', fortress: 'Fortress' };

  const state = {
    year: 1,
    period: '0ce', // the territory snapshot in use for the current year
    from: null,
    to: null,
    results: [],
    selected: 0,
    network: null,
    month: 7,
    effects: AWT.Weights.defaultEffects(),
  };

  const $ = (sel) => document.querySelector(sel);
  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // ------------------------------------------------------------------ map setup
  const map = L.map('map', {
    zoomControl: true,
    zoomSnap: 0.5,
    minZoom: 4,
    maxZoom: 9,
    maxBounds: [
      [14, -25],
      [58, 70],
    ],
    worldCopyJump: false,
  }).fitBounds([
    [31, -6],
    [45, 44],
  ]);

  AWT.map = map; // handy for debugging from the console
  map.createPane('territoryPane');
  map.getPane('territoryPane').style.zIndex = 402;
  map.createPane('seaMaskPane');
  map.getPane('seaMaskPane').style.zIndex = 404;
  map.getPane('seaMaskPane').style.pointerEvents = 'none';
  map.createPane('regions');
  map.getPane('regions').style.zIndex = 410;
  map.createPane('networkPane');
  map.getPane('networkPane').style.zIndex = 420;
  map.createPane('journeyPane');
  map.getPane('journeyPane').style.zIndex = 450;
  map.createPane('zonePane');
  map.getPane('zonePane').style.zIndex = 406;
  map.createPane('labelPane');
  map.getPane('labelPane').style.zIndex = 460;

  const parchment = L.geoJSON(AWT.land, {
    style: { color: '#9c8661', weight: 0.8, fillColor: '#efe2c2', fillOpacity: 1 },
    interactive: false,
    attribution: 'Coastlines: <a href="https://www.naturalearthdata.com/">Natural Earth</a>',
  });
  const terrain = L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}',
    { maxNativeZoom: 8, maxZoom: 9, attribution: 'Terrain: Esri, US National Park Service' }
  );
  parchment.addTo(map);

  // Sea mask: an ocean-coloured rectangle with every land ring cut out (even-odd fill).
  // Territory outlines can then run loosely through the sea and are only seen on land.
  (function addSeaMask() {
    const rings = [[[5, -35], [65, -35], [65, 80], [5, 80]]];
    for (const poly of AWT.land.geometry.coordinates) for (const ring of poly) rings.push(ring.map(([x, y]) => [y, x]));
    L.polygon(rings, { pane: 'seaMaskPane', interactive: false, stroke: true, color: '#8fa9ad', weight: 0.8, fillColor: '#b9d0d3', fillOpacity: 1 }).addTo(map);
  })();
  L.control.layers({ Parchment: parchment, 'Terrain (online)': terrain }, null, { position: 'topright' }).addTo(map);
  L.control.scale({ imperial: false, position: 'bottomright' }).addTo(map);

  const territoryLayer = L.layerGroup().addTo(map);
  let territoryShapes = {};
  let showTerritories = true;
  const regionLayer = L.layerGroup().addTo(map);
  const networkLayer = L.layerGroup().addTo(map);
  const journeyLayer = L.layerGroup().addTo(map);
  const searchLayer = L.layerGroup().addTo(map);
  const weightLabelLayer = L.layerGroup().addTo(map);
  const zoneLayer = L.layerGroup().addTo(map);
  let colorByWeight = true;
  let showWeights = false;
  let showZones = false;
  let searchTimer = null;
  const cityLayer = L.layerGroup().addTo(map);
  let showNetwork = true;

  // legend
  const legend = L.control({ position: 'bottomleft' });
  legend.onAdd = function () {
    const div = L.DomUtil.create('div', 'legend');
    const compact = window.matchMedia('(max-width: 760px)').matches;
    div.innerHTML =
      `<details${compact ? '' : ' open'}><summary>Map key</summary>` +
      '<div><i class="road"></i>Road</div>' +
      '<div><i class="sea"></i>Sea lane</div>' +
      '<div><i class="river"></i>River</div>' +
      '<div class="kinds"><span class="pin city"></span>City <span class="pin site sanctuary"></span>Sanctuary <span class="pin site monument"></span>Monument <span class="pin site fortress"></span>Fort</div>' +
      '<label><input type="checkbox" id="toggle-network" checked> Show all known routes</label>' +
      '<label><input type="checkbox" id="toggle-territories" checked> Show territories</label>' +
      '<div class="graph-key"><b>Graph view</b>' +
      '<label><input type="checkbox" id="toggle-cost" checked> Colour edges by weight</label>' +
      '<div class="cost-scale" id="cost-scale"></div>' +
      '<label><input type="checkbox" id="toggle-weights"> Show edge weights (days)</label>' +
      '<label><input type="checkbox" id="toggle-zones"> Show climate zones</label></div></details>';
    L.DomEvent.disableClickPropagation(div);
    div.querySelector('#toggle-network').addEventListener('change', (e) => {
      showNetwork = e.target.checked;
      drawNetwork();
    });
    div.querySelector('#toggle-territories').addEventListener('change', (e) => {
      showTerritories = e.target.checked;
      drawTerritories();
    });
    div.querySelector('#toggle-cost').addEventListener('change', (e) => {
      colorByWeight = e.target.checked;
      drawNetwork();
    });
    div.querySelector('#toggle-weights').addEventListener('change', (e) => {
      showWeights = e.target.checked;
      drawNetwork();
    });
    div.querySelector('#toggle-zones').addEventListener('change', (e) => {
      showZones = e.target.checked;
      drawZones();
    });
    div.querySelector('#cost-scale').innerHTML = COST_BANDS.map((b) => `<span><i style="background:${b.color}"></i>${b.label}</span>`).join('');
    return div;
  };
  legend.addTo(map);

  // ------------------------------------------------------------------ UI setup
  const TL = AWT.timeline;
  const fmtYear = TL.fmtYear;
  /** "331 BC – 79 CE", "from 331 BC", "until 79 CE" or "throughout". */
  // exactA / exactB false → the year is only the default estimate, shown as "c."
  const spanText = (a, b, exactA = true, exactB = true) => {
    const fa = (exactA ? '' : 'c. ') + fmtYear(a);
    const fb = (exactB ? '' : 'c. ') + fmtYear(b);
    return a <= -3000 && b >= 3000 ? 'throughout' : a <= -3000 ? `until ${fb}` : b >= 3000 ? `from ${fa}` : `${fa} – ${fb}`;
  };

  function buildTabs() {
    const nav = $('#period-tabs');
    nav.innerHTML = '';
    for (const p of AWT.periods) {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = p.label;
      b.dataset.period = p.id;
      b.title = `Jump to ${fmtYear(TL.anchorYear(p.id))} — ${p.title}`;
      b.addEventListener('click', () => setYear(TL.anchorYear(p.id)));
      nav.appendChild(b);
    }
  }

  function fillSelects() {
    const all = Object.values(state.network.cities).sort((a, b) => a.name.localeCompare(b.name));
    const groups = [
      ['Cities', all.filter((c) => c.kind === 'city')],
      ['Sites, sanctuaries & fortresses', all.filter((c) => c.kind !== 'city')],
    ];
    for (const sel of [$('#from'), $('#to')]) {
      const current = sel.id === 'from' ? state.from : state.to;
      sel.innerHTML =
        '<option value="">— choose a place —</option>' +
        groups
          .filter(([, list]) => list.length)
          .map(
            ([label, list]) =>
              `<optgroup label="${label}">` +
              list
                .map((c) => `<option value="${c.id}"${c.id === current ? ' selected' : ''}>${esc(c.name)} (${esc(c.modern.split(',')[0])})</option>`)
                .join('') +
              '</optgroup>'
          )
          .join('');
    }
  }

  function options() {
    const modes = {};
    document.querySelectorAll('input[name=mode]').forEach((i) => (modes[i.value] = i.checked));
    const radio = (name) => document.querySelector(`input[name=${name}]:checked`).value;
    return { modes, traveler: radio('traveler'), month: state.month, effects: Object.assign({}, state.effects), optimize: radio('optimize'), k: 3 };
  }

  // ------------------------------------------------------------------ drawing
  function drawRegions() {
    regionLayer.clearLayers();
    for (const r of (state.snapshot && AWT.regionLabels[state.snapshot]) || []) {
      L.marker([r.lat, r.lng], {
        pane: 'regions',
        interactive: false,
        keyboard: false,
        icon: L.divIcon({ className: 'region-label' + (r.size === 'lg' ? ' lg' : ''), html: `<span>${esc(r.text)}</span>`, iconSize: [0, 0] }),
      }).addTo(regionLayer);
    }
  }

  function routePopup(route) {
    const net = state.network;
    const a = net.cities[route.from].name;
    const b = net.cities[route.to].name;
    return (
      `<div class="popup"><h3>${esc(route.name)}</h3>` +
      `<div class="modern">${esc(a)} ↔ ${esc(b)} · ${MODE_LABEL[route.mode]} · ~${route.distanceKm.toLocaleString()} km` +
      (route.span
        ? ` · in use ${spanText(route.span[0], route.span[1], (TL.routeDates[route.id] || {}).from === route.span[0], (TL.routeDates[route.id] || {}).to === route.span[1])}`
        : '') +
      '</div>' +
      `<p>${esc(route.desc)}</p>` +
      `<div class="sources"><b>Sources:</b> ${route.sources.map(esc).join('; ')}</div>` +
      edgeWeightsHtml(route) +
      '</div>'
    );
  }

  /** Both directed weights of an edge under the current conditions, with explanations. */
  function edgeWeightsHtml(route) {
    const net = state.network;
    const ctx = net.context(options(), state.from);
    const dirs = [
      [route.from, route.to],
      [route.to, route.from],
    ];
    return (
      `<div class="edge-weights"><b>Edge weight in ${AWT.Weights.MONTHS[state.month - 1]}</b>` +
      dirs
        .map(([a, b]) => {
          const w = AWT.Weights.evaluate(route, a, b, ctx);
          return `<div class="ew"><div class="ew-head">${esc(net.cities[a].name)} → ${esc(net.cities[b].name)}: <strong>${w.closed ? 'closed' : fmtDays(w.days)}</strong></div>${stepsHtml(w)}</div>`;
        })
        .join('') +
      '</div>'
    );
  }

  function stepsHtml(w) {
    return (
      '<ol class="steps">' +
      w.steps
        .map((st, i) => {
          const op = i === 0 ? '' : st.closed ? '✕' : st.factor ? `×${st.factor.toFixed(2)}` : `+${st.add}d`;
          const val = st.closed ? 'closed' : `${st.days.toFixed(1)} d`;
          return `<li class="${st.closed ? 'closed' : ''}"><span class="op">${op}</span><span class="what"><b>${esc(st.label)}</b> ${esc(st.detail)}</span><span class="val">${val}</span></li>`;
        })
        .join('') +
      '</ol>'
    );
  }

  function drawNetwork() {
    networkLayer.clearLayers();
    weightLabelLayer.clearLayers();
    if (!showNetwork) return;
    const dim = state.results.length > 0;
    const net = state.network;
    const ctx = net.context(options(), state.from);
    for (const r of net.routes) {
      const s = MODE_STYLE[r.mode];
      const wa = AWT.Weights.evaluate(r, r.from, r.to, ctx);
      const wb = AWT.Weights.evaluate(r, r.to, r.from, ctx);
      const base = wa.steps[0].days;
      const closed = wa.closed && wb.closed;
      const open = [wa, wb].filter((w) => !w.closed);
      const factor = open.length ? open.reduce((x, w) => x + w.days, 0) / open.length / base : Infinity;
      const color = colorByWeight ? costColor(factor, closed) : s.color;
      L.polyline(r.path, {
        pane: 'networkPane',
        color,
        dashArray: closed ? '2 6' : s.dashArray,
        weight: colorByWeight ? 3 : 2.5,
        opacity: dim ? 0.3 : colorByWeight ? 0.8 : 0.6,
        smoothFactor: 1,
      })
        .bindPopup(() => routePopup(r), { maxWidth: 360 })
        .addTo(networkLayer);
      if (showWeights) {
        const mid = r.path[Math.floor(r.path.length / 2)];
        const midPt = r.path.length % 2 === 0 && r.path.length > 1 ? [(r.path[r.path.length / 2 - 1][0] + mid[0]) / 2, (r.path[r.path.length / 2 - 1][1] + mid[1]) / 2] : mid;
        const fmt = (w) => (w.closed ? '✕' : w.days < 10 ? w.days.toFixed(1) : Math.round(w.days));
        const same = !wa.closed && !wb.closed && Math.abs(wa.days - wb.days) < 0.05;
        const text = closed ? 'closed' : same ? `${fmt(wa)}d` : `${fmt(wa)}⇄${fmt(wb)}d`;
        L.marker(midPt, {
          pane: 'labelPane',
          interactive: false,
          keyboard: false,
          icon: L.divIcon({ className: 'w-label', html: `<span style="border-color:${color}">${text}</span>`, iconSize: [0, 0] }),
        }).addTo(weightLabelLayer);
      }
    }
  }

  function drawZones() {
    zoneLayer.clearLayers();
    if (!showZones) return;
    const winter = [11, 12, 1, 2, 3].includes(state.month);
    const style = {
      'mountain-high': { color: '#5d7fa3', fillColor: winter ? '#ffffff' : '#9fb3c8', fillOpacity: winter ? 0.75 : 0.35, dashArray: '4 3' },
      mountain: { color: '#7d8fa3', fillColor: winter ? '#e8eef5' : '#b8c4cf', fillOpacity: winter ? 0.55 : 0.3, dashArray: '4 3' },
      desert: { color: '#c79a3c', fillColor: '#f2c96b', fillOpacity: [5, 6, 7, 8, 9].includes(state.month) ? 0.5 : 0.25, dashArray: '2 4' },
      floodplain: { color: '#3c7fb5', fillColor: '#7fb8e6', fillOpacity: [8, 9, 10].includes(state.month) ? 0.6 : 0.2, dashArray: '2 4' },
    };
    for (const z of AWT.zones) {
      L.polygon(
        z.ring.map(([x, y]) => [y, x]),
        Object.assign({ pane: 'zonePane', weight: 1 }, style[z.kind])
      )
        .bindTooltip(`<b>${esc(z.name)}</b><br>${esc(z.note)}`, { sticky: true, className: 'zone-tip', maxWidth: 260 })
        .addTo(zoneLayer);
    }
  }

  function drawCities() {
    cityLayer.clearLayers();
    const z = map.getZoom();
    const labelRank = z < 6 ? 1 : z < 7 ? 2 : 3;
    for (const c of Object.values(state.network.cities)) {
      const isEnd = c.id === state.from || c.id === state.to;
      const radius = isEnd ? 8 : { 1: 6.5, 2: 5, 3: 3.5 }[c.rank];
      let m;
      if (c.kind === 'city') {
        m = L.circleMarker([c.lat, c.lng], {
          radius,
          color: '#3b2a1a',
          weight: isEnd ? 2.5 : 1.5,
          fillColor: c.id === state.from ? '#ffffff' : c.id === state.to ? '#8b2e16' : c.rank === 1 ? '#8b2e16' : '#f4ead5',
          fillOpacity: 1,
          pane: 'markerPane',
          className: state.appeared && state.appeared.has(c.id) ? 'appear' : '',
        });
      } else {
        // sites are drawn as diamonds, coloured by kind
        const size = isEnd ? 16 : 11;
        const endCls = (c.id === state.from ? ' is-from' : c.id === state.to ? ' is-to' : '') + (state.appeared && state.appeared.has(c.id) ? ' appear' : '');
        m = L.marker([c.lat, c.lng], {
          icon: L.divIcon({ className: `site-marker ${c.kind}${endCls}`, iconSize: [size, size], html: '<span></span>' }),
          title: `${c.name} (${KIND_LABEL[c.kind]})`,
        });
      }
      const label = L.tooltip({
        permanent: isEnd || c.rank <= labelRank,
        direction: 'right',
        offset: [radius + 2, 0],
        className: `city-label rank-${c.rank}`,
      }).setContent(esc(c.name));
      m.bindTooltip(label);
      m.bindPopup(() => cityPopup(c), { maxWidth: 300 });
      m.addTo(cityLayer);
    }
  }

  function cityPopup(c) {
    const div = document.createElement('div');
    div.className = 'popup';
    div.innerHTML =
      `<h3>${esc(c.name)}</h3><div class="modern">${c.kind === 'city' ? '' : esc(KIND_LABEL[c.kind]) + ' · '}Today: ${esc(c.modern)}</div>` +
      (state.network.territories.length ? `<div class="owner">Controlled by ${territoryChip(c.owner)}</div>` : '<div class="owner"><i>No border map for this year</i></div>') +
      `<p>${noteWhen(c)}${esc(c.note)}</p>` +
      nameHistory(c.id) +
      '<div class="actions"><button data-act="from">Start here</button><button data-act="to">Go here</button></div>';
    div.querySelector('[data-act=from]').addEventListener('click', () => {
      map.closePopup();
      setEndpoints(c.id, state.to === c.id ? null : state.to);
    });
    div.querySelector('[data-act=to]').addEventListener('click', () => {
      map.closePopup();
      setEndpoints(state.from === c.id ? null : state.from, c.id);
    });
    return div;
  }

  function drawJourney() {
    journeyLayer.clearLayers();
    const res = state.results[state.selected];
    if (!res) return;
    for (const leg of res.legs) {
      const s = MODE_STYLE[leg.mode];
      L.polyline(leg.path, { pane: 'journeyPane', color: '#fffaf0', weight: 9, opacity: 0.9, interactive: false }).addTo(journeyLayer);
      L.polyline(leg.path, { pane: 'journeyPane', color: s.color, weight: 5, dashArray: leg.mode === 'sea' ? '10 7' : null })
        .bindPopup(routePopup(leg.route), { maxWidth: 320 })
        .addTo(journeyLayer);
    }
  }

  // ------------------------------------------------------------------ weights & search
  /** Days added (or saved) by each effect over the whole itinerary. */
  function weightSummary(r) {
    const by = {};
    let base = 0;
    for (const l of r.legs) {
      const st = l.weight.steps;
      base += st[0].days;
      for (let i = 1; i < st.length; i++) {
        const d = st[i].days - st[i - 1].days;
        by[st[i].label] = (by[st[i].label] || 0) + d;
      }
    }
    const items = Object.entries(by)
      .filter(([, d]) => Math.abs(d) >= 0.05)
      .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));
    if (!items.length) return `<div class="weight-summary">No effects change this route in ${AWT.Weights.MONTHS[state.month - 1]}: every edge is at its base weight (${fmtDays(base)}).</div>`;
    return (
      `<div class="weight-summary"><b>What sets the weight</b> Base ${fmtDays(base)}` +
      items.map(([label, d]) => `<span class="eff ${d > 0 ? 'up' : 'down'}">${esc(label)} ${d > 0 ? '+' : '−'}${Math.abs(d).toFixed(1)}d</span>`).join('') +
      '</div>'
    );
  }

  function searchSummary() {
    const s = state.results.search;
    if (!s || !s.settled) return '';
    return (
      `<div class="search-summary">Dijkstra settled <b>${s.settled.length}</b> of ${s.nodes} places and relaxed ${s.relaxations} of ${s.edges} directed edges, minimising ${s.metric}. ` +
      '<button type="button" id="watch-search" class="small-btn">▶ Watch the search</button></div>'
    );
  }

  /** Replays the first Dijkstra run: places light up in the order they were settled. */
  function animateSearch() {
    const s = state.results.search;
    if (!s || !s.settled) return;
    clearTimeout(searchTimer);
    searchLayer.clearLayers();
    journeyLayer.clearLayers();
    const net = state.network;
    const maxDist = s.settled[s.settled.length - 1].dist || 1;
    const step = Math.max(35, Math.min(160, 4500 / s.settled.length));
    let i = 0;
    const tick = () => {
      if (i >= s.settled.length) {
        searchTimer = setTimeout(() => drawJourney(), 600);
        return;
      }
      const st = s.settled[i++];
      const c = net.cities[st.node];
      const heat = st.dist / maxDist;
      const color = `hsl(${30 - heat * 30}, 85%, ${55 - heat * 15}%)`;
      if (st.route) {
        const path = st.via === st.route.from ? st.route.path : st.route.path.slice().reverse();
        L.polyline(path, { pane: 'journeyPane', color, weight: 3, opacity: 0.9, dashArray: st.route.mode === 'sea' ? '6 5' : null, interactive: false }).addTo(searchLayer);
      }
      L.circleMarker([c.lat, c.lng], { pane: 'labelPane', radius: 6, color: '#3b2a1a', weight: 1.5, fillColor: color, fillOpacity: 1, interactive: false })
        .bindTooltip(`${esc(c.name)}: ${s.metric === 'km' ? Math.round(st.dist) + ' km' : st.dist.toFixed(1) + ' d'}`, { permanent: true, direction: 'top', offset: [0, -6], className: 'search-tip' })
        .addTo(searchLayer);
      searchTimer = setTimeout(tick, step);
    };
    tick();
  }

  // ------------------------------------------------------------------ territories
  function territory(id) {
    return id ? state.network.territoryById[id] : null;
  }
  function territoryChip(id) {
    const t = territory(id);
    if (!t) return '<span class="terr-chip none" title="Not part of any organised state">independent lands</span>';
    return `<span class="terr-chip" title="${esc(t.note || '')}"><i style="background:${t.color}"></i>${esc(t.name)}</span>`;
  }
  function territoryChain(ids, sep) {
    return ids.map(territoryChip).join(`<span class="terr-sep">${sep}</span>`);
  }
  function territoryDots(ids) {
    const uniq = [...new Set(ids)];
    return uniq
      .map((id) => {
        const t = territory(id);
        return `<i class="dot-terr" style="background:${t ? t.color : '#ccc'}" title="${esc(t ? t.name : 'independent lands')}"></i>`;
      })
      .join('');
  }
  function territorySummary(r) {
    const uniq = [...new Set(r.territories)];
    if (!state.network.territories.length) return '';
    const borders = r.territories.length - 1;
    return (
      `<div class="terr-summary"><b>Whose lands?</b> ${territoryChain(r.territories, ' → ')}` +
      (uniq.length === 1
        ? `<div class="terr-note">The whole journey stays within one realm.</div>`
        : `<div class="terr-note">${borders} border crossing${borders === 1 ? '' : 's'} between ${uniq.length} realms.</div>`) +
      '</div>'
    );
  }

  /** Notes are written for an anchor year; say so when the slider is far from it. */
  function noteWhen(c) {
    const p = c.era && c.era.period;
    if (!p) return '';
    const ay = TL.anchorYear(p);
    return Math.abs(state.year - ay) > 25 && (c.era.from > state.year - 1000) ? `<span class="note-when">Around ${fmtYear(ay)}:</span> ` : '';
  }

  function nameHistory(id) {
    const c = AWT.cities.find((x) => x.id === id);
    if (!c || !c.eras.length) return '';
    const rows = [];
    for (const e of c.eras) {
      const last = rows[rows.length - 1];
      if (last && last.name === e.name && last.to + 1 >= e.from) Object.assign(last, { to: e.to, exactTo: e.exactTo });
      else rows.push({ name: e.name, from: e.from, to: e.to, exactFrom: e.exactFrom, exactTo: e.exactTo });
    }
    return (
      '<div class="name-history"><b>On the map</b><ul>' +
      rows.map((r) => `<li${state.year >= r.from && state.year <= r.to ? ' class="now"' : ''}><span>${spanText(r.from, r.to, r.exactFrom, r.exactTo)}</span> ${esc(r.name)}</li>`).join('') +
      '</ul></div>'
    );
  }

  function drawTerritories() {
    territoryLayer.clearLayers();
    territoryShapes = {};
    if (!showTerritories) return;
    const res = state.results[state.selected];
    const crossed = new Set(res ? res.territories : []);
    for (const t of state.network.territories) {
      const hot = crossed.has(t.id);
      const dim = res && !hot;
      const shape = L.geoJSON(
        { type: 'Feature', geometry: t.geometry },
        {
          pane: 'territoryPane',
          style: {
            color: t.color,
            weight: hot ? 2 : 1,
            opacity: dim ? 0.35 : 0.8,
            fillColor: t.color,
            fillOpacity: hot ? 0.45 : dim ? 0.12 : 0.32,
          },
        }
      );
      shape.bindTooltip(esc(t.name), { sticky: true, className: 'terr-tip' });
      shape.addTo(territoryLayer);
      territoryShapes[t.id] = shape;
    }
  }

  function renderPowers() {
    const box = $('#powers');
    const list = state.network.territories;
    if (!list.length) {
      box.innerHTML = '';
      return;
    }
    box.innerHTML =
      '<h3>Powers of the age</h3><ul>' +
      list
        .map((t) => `<li><button type="button" data-terr="${t.id}" title="${esc(t.note || '')}"><i style="background:${t.color}"></i>${esc(t.name)}</button></li>`)
        .join('') +
      '</ul>';
    box.querySelectorAll('[data-terr]').forEach((b) =>
      b.addEventListener('click', () => {
        const shape = territoryShapes[b.dataset.terr];
        if (shape) map.fitBounds(shape.getBounds(), { padding: [30, 30], maxZoom: 6 });
      })
    );
  }

  // ------------------------------------------------------------------ results panel
  function fmtDays(d) {
    if (d < 1) return `${Math.max(1, Math.round(d * 24))} hours`;
    const n = d < 10 ? Math.round(d * 2) / 2 : Math.round(d);
    return `${n} day${n === 1 ? '' : 's'}`;
  }
  function badges(modes) {
    return `<span class="badges">${modes.map((m) => `<span class="badge ${m}">${MODE_LABEL[m]}</span>`).join('')}</span>`;
  }

  function renderResults() {
    const box = $('#results');
    const net = state.network;
    const missing = [state.from, state.to].filter((id) => id && !net.cities[id]);
    if (missing.length) {
      box.innerHTML = missing
        .map((id) => {
          const c = AWT.cities.find((x) => x.id === id);
          const spans = [];
          for (const e of c.eras) {
            const last = spans[spans.length - 1];
            if (last && last[1] + 1 >= e.from) last[1] = e.to;
            else spans.push([e.from, e.to]);
          }
          const life = spans.length ? ` It is on the map ${spans.map(([a, b]) => spanText(a, b)).join(' and ')}.` : '';
          return `<p class="empty"><b>${esc(c.eras[0] ? c.eras[0].name : id)}</b> is not on the map in ${fmtYear(state.year)}.${life} Move the year slider, or pick another place.</p>`;
        })
        .join('');
      return;
    }
    if (!state.from || !state.to) {
      box.innerHTML = `<p class="empty">Choose a starting place and a destination to see the routes a traveller of ${esc(fmtYear(state.year))} could take.</p>`;
      return;
    }
    if (state.from === state.to) {
      box.innerHTML = '<p class="empty">You are already there!</p>';
      return;
    }
    if (!state.results.length) {
      const opts = options();
      box.innerHTML =
        '<p class="empty">No known route connects these cities with the current options.' +
        ([11, 12, 1, 2, 3].includes(opts.month) ? ' Winter conditions may have closed the sea or the passes — try another month, or turn off an effect.' : '') +
        (!opts.modes.sea ? ' Try allowing sea travel.' : '') +
        '</p>';
      return;
    }

    const alts = state.results
      .map((r, i) => {
        const via = r.legs.slice(0, -1).map((l) => net.cities[l.to].name);
        return (
          `<button type="button" class="alt" data-i="${i}" aria-pressed="${i === state.selected}">` +
          `<span class="days">${fmtDays(r.totalDays)}${badges(r.modes)}</span>` +
          `<span class="km">${r.totalKm.toLocaleString()} km</span>` +
          `<span class="via">${via.length ? 'via ' + via.map(esc).join(', ') : 'direct'}</span>` +
          (net.territories.length ? `<span class="alt-terr">${territoryDots(r.territories)}</span>` : '') + '</button>'
        );
      })
      .join('');

    const r = state.results[state.selected];
    const opts = options();
    const notes = [];
    if (r.legs.some((l) => l.mode === 'sea'))
      notes.push('Sea times assume normal sailing for the month; ships could still wait days or weeks in port for the right wind.');
    const legs = r.legs
      .map((l, i) => {
        const from = net.cities[l.from];
        const to = net.cities[l.to];
        return (
          `<li class="leg ${l.mode}"><span class="dot"></span>` +
          `<h3 data-leg="${i}">${esc(from.name)} → ${esc(to.name)}</h3>` +
          `<div class="meta">${badges([l.mode])} <span class="route-name">${esc(l.route.name)}</span> · ${l.distanceKm.toLocaleString()} km · ${fmtDays(l.days)}</div>` +
          (net.territories.length ? `<div class="through">${l.mode === 'sea' ? 'From' : 'Through'} ${territoryChain(l.territories, l.mode === 'sea' ? ' ⟶ by sea ⟶ ' : ' → ')}</div>` : '') +
          `<details class="leg-weight"><summary>Edge weight: ${fmtDays(l.days)}${l.weight.steps.length > 1 ? ` (base ${fmtDays(l.weight.steps[0].days)})` : ''}</summary>${stepsHtml(l.weight)}</details>` +
          `<p>${esc(l.route.desc)}</p>` +
          `<div class="sources"><b>Sources</b> ${l.route.sources.map(esc).join('; ')}</div></li>`
        );
      })
      .join('');

    box.innerHTML =
      `<h2>${esc(net.cities[state.from].name)} to ${esc(net.cities[state.to].name)}</h2>` +
      `<div class="alt-list" role="group" aria-label="Alternative routes">${alts}</div>` +
      `<p class="summary"><strong>About ${fmtDays(r.totalDays)}</strong> over roughly ${r.totalKm.toLocaleString()} km, ${r.legs.length} stage${r.legs.length > 1 ? 's' : ''}.</p>` +
      weightSummary(r) +
      searchSummary() +
      territorySummary(r) +
      notes.map((n) => `<p class="note-box">${esc(n)}</p>`).join('') +
      `<ol class="itinerary">${legs}<li class="arrive"><span class="dot"></span>${esc(net.cities[state.to].name)}</li></ol>`;

    const watch = box.querySelector('#watch-search');
    if (watch) watch.addEventListener('click', animateSearch);
    box.querySelectorAll('.alt').forEach((b) =>
      b.addEventListener('click', () => {
        state.selected = Number(b.dataset.i);
        renderResults();
        drawJourney();
        fitJourney();
      })
    );
    box.querySelectorAll('[data-leg]').forEach((h) =>
      h.addEventListener('click', () => {
        const leg = r.legs[Number(h.dataset.leg)];
        map.fitBounds(L.latLngBounds(leg.path), { padding: [40, 40], maxZoom: 7 });
      })
    );
  }

  function fitJourney() {
    const r = state.results[state.selected];
    if (!r) return;
    const pts = r.legs.flatMap((l) => l.path);
    map.fitBounds(L.latLngBounds(pts), { padding: [40, 40], maxZoom: 7 });
  }

  // ------------------------------------------------------------------ state changes
  function compute(fit) {
    clearTimeout(searchTimer);
    searchLayer.clearLayers();
    state.results = state.from && state.to && state.from !== state.to ? state.network.findRoutes(state.from, state.to, options()) : [];
    state.selected = 0;
    renderResults();
    drawTerritories();
    drawNetwork();
    drawJourney();
    drawCities();
    if (fit) fitJourney();
    writeHash();
  }

  function setEndpoints(from, to) {
    state.from = from || null;
    state.to = to || null;
    $('#from').value = state.from || '';
    $('#to').value = state.to || '';
    compute(true);
  }

  let prevCities = null;

  /** Moves the whole app to a year: rebuilds the graph, then redraws everything that depends on it. */
  function setYear(y, { fit = false } = {}) {
    y = Math.max(TL.min, Math.min(TL.max, Math.round(y)));
    if (y === 0) y = state.year < 0 ? 1 : -1; // there is no year 0
    state.year = y;
    state.network = new AWT.Router.Network(AWT, y);
    const snapshotChanged = state.network.snapshot !== state.snapshot || state.network.periodId !== state.period;
    state.period = state.network.periodId;
    state.snapshot = state.network.snapshot;
    const now = new Set(Object.keys(state.network.cities));
    state.appeared = prevCities ? new Set([...now].filter((id) => !prevCities.has(id))) : new Set();
    prevCities = now;

    $('#year').value = y;
    $('#year-label').textContent = fmtYear(y);
    if (state.snapshot) {
      const p = AWT.periods.find((x) => x.id === state.snapshot);
      const [wa, wb] = TL.snapshotWindows[p.id];
      $('#period-title').textContent = `${fmtYear(y)} — ${p.title}`;
      $('#snapshot-note').textContent = `Borders mapped for ${fmtYear(wa)} – ${fmtYear(wb)}.`;
      $('#period-summary').textContent = p.summary;
    } else {
      const wins = Object.entries(TL.snapshotWindows);
      const before = wins.filter(([, [, b]]) => b < y).pop();
      const after = wins.find(([, [a]]) => a > y);
      const near = [before, after].filter(Boolean).map(([id, [a, b]]) => `${fmtYear(a)}–${fmtYear(b)} (${AWT.periods.find((x) => x.id === id).title})`);
      $('#period-title').textContent = fmtYear(y);
      $('#snapshot-note').textContent = `No border map for this year, so territories and border-crossing weights are switched off. Borders are mapped for ${near.join(' and ')}.`;
      $('#period-summary').textContent = 'Places and routes are shown as they stood in this year; drag the slider to watch them appear and disappear.';
    }
    document.querySelectorAll('#period-tabs button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.period === state.snapshot)));
    renderEvents();
    fillSelects();
    if (snapshotChanged) {
      drawRegions();
      renderPowers();
    }
    compute(fit);
  }

  /** Dated changes within a few decades of the current year. */
  function renderEvents() {
    const y = state.year;
    const W = 40;
    const near = TL.events.filter((e) => e.year >= y - W && e.year <= y + W);
    if (!near.length) {
      $('#year-events').innerHTML = '';
      return;
    }
    const icon = { appear: '+', vanish: '−', rename: '↻', 'route-open': '⟶', 'route-close': '⤫' };
    $('#year-events').innerHTML =
      `<h3>Changes within ${W} years</h3><ul>` +
      near
        .map(
          (e) =>
            `<li class="ev ${e.kind} ${e.year <= y ? 'past' : 'future'}"><span class="ev-year">${fmtYear(e.year)}</span><span class="ev-icon">${icon[e.kind]}</span>${esc(e.text)}</li>`
        )
        .join('') +
      '</ul>';
  }

  function writeHash() {
    const params = new URLSearchParams({ year: state.year, month: state.month });
    if (state.from) params.set('from', state.from);
    if (state.to) params.set('to', state.to);
    history.replaceState(null, '', '#' + params.toString());
  }

  function readHash() {
    const params = new URLSearchParams(location.hash.slice(1));
    const p = params.get('period'); // links from before the year slider
    if (p && AWT.periods.some((x) => x.id === p)) state.year = TL.anchorYear(p);
    const yr = Number(params.get('year'));
    if (params.has('year') && Number.isFinite(yr)) state.year = yr;
    const m = Number(params.get('month'));
    if (m >= 1 && m <= 12) state.month = m;
    state.from = params.get('from');
    state.to = params.get('to');
  }

  $('#from').addEventListener('change', (e) => setEndpoints(e.target.value, state.to));
  $('#to').addEventListener('change', (e) => setEndpoints(state.from, e.target.value));
  $('#swap').addEventListener('click', () => setEndpoints(state.to, state.from));
  document.querySelectorAll('.options input').forEach((i) => i.addEventListener('change', () => compute(true)));

  let lastLabelRank = null;
  map.on('zoomend', () => {
    const z = map.getZoom();
    const r = z < 6 ? 1 : z < 7 ? 2 : 3;
    if (r !== lastLabelRank && state.network) drawCities();
    lastLabelRank = r;
  });

  function buildConditions() {
    const W = AWT.Weights;
    $('#effects').innerHTML = W.EFFECTS.map(
      (e) =>
        `<label class="effect" title="${esc(e.about)}"><input type="checkbox" data-effect="${e.id}"${state.effects[e.id] ? ' checked' : ''}> ${esc(e.label)}<span class="about">${esc(e.about)}</span></label>`
    ).join('');
    $('#effects').querySelectorAll('[data-effect]').forEach((i) =>
      i.addEventListener('change', () => {
        state.effects[i.dataset.effect] = i.checked;
        compute(false);
      })
    );
    const slider = $('#month');
    const sync = () => {
      $('#month-name').textContent = W.MONTHS[state.month - 1];
      $('#month-summary').textContent = W.monthSummary(state.month);
      slider.value = state.month;
    };
    slider.addEventListener('input', () => {
      state.month = Number(slider.value);
      sync();
      compute(false);
      drawZones();
    });
    sync();
  }

  readHash();
  buildConditions();
  buildTabs();
  // year slider: redraw at most once per animation frame while dragging
  let pendingYear = null;
  $('#year').addEventListener('input', (e) => {
    const first = pendingYear === null;
    pendingYear = Number(e.target.value);
    if (first)
      requestAnimationFrame(() => {
        const y = pendingYear;
        pendingYear = null;
        setYear(y);
      });
  });
  $('#year-prev').addEventListener('click', () => setYear(state.year - 10));
  $('#year-next').addEventListener('click', () => setYear(state.year + 10));
  setYear(state.year);
  if (state.from && state.to) fitJourney();
})();
