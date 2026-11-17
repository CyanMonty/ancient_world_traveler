/* global L, AWT */
(function () {
  'use strict';

  const MODE_STYLE = {
    road: { color: '#a0441c', dashArray: null },
    sea: { color: '#1e5a84', dashArray: '6 6' },
    river: { color: '#2d7d5a', dashArray: null },
  };
  const MODE_LABEL = { road: 'Road', sea: 'Sea', river: 'River' };

  const state = {
    period: '0ce',
    from: null,
    to: null,
    results: [],
    selected: 0,
    network: null,
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
  map.createPane('regions');
  map.getPane('regions').style.zIndex = 410;
  map.createPane('networkPane');
  map.getPane('networkPane').style.zIndex = 420;
  map.createPane('journeyPane');
  map.getPane('journeyPane').style.zIndex = 450;

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
  L.control.layers({ Parchment: parchment, 'Terrain (online)': terrain }, null, { position: 'topright' }).addTo(map);
  L.control.scale({ imperial: false, position: 'bottomright' }).addTo(map);

  const regionLayer = L.layerGroup().addTo(map);
  const networkLayer = L.layerGroup().addTo(map);
  const journeyLayer = L.layerGroup().addTo(map);
  const cityLayer = L.layerGroup().addTo(map);
  let showNetwork = true;

  // legend
  const legend = L.control({ position: 'bottomleft' });
  legend.onAdd = function () {
    const div = L.DomUtil.create('div', 'legend');
    div.innerHTML =
      '<div><i class="road"></i>Road</div>' +
      '<div><i class="sea"></i>Sea lane</div>' +
      '<div><i class="river"></i>River</div>' +
      '<label><input type="checkbox" id="toggle-network" checked> Show all known routes</label>';
    L.DomEvent.disableClickPropagation(div);
    div.querySelector('input').addEventListener('change', (e) => {
      showNetwork = e.target.checked;
      drawNetwork();
    });
    return div;
  };
  legend.addTo(map);

  // ------------------------------------------------------------------ UI setup
  function buildTabs() {
    const nav = $('#period-tabs');
    nav.innerHTML = '';
    for (const p of AWT.periods) {
      const b = document.createElement('button');
      b.type = 'button';
      b.role = 'tab';
      b.textContent = p.label;
      b.dataset.period = p.id;
      b.setAttribute('aria-selected', String(p.id === state.period));
      b.addEventListener('click', () => setPeriod(p.id));
      nav.appendChild(b);
    }
  }

  function fillSelects() {
    const cities = Object.values(state.network.cities).sort((a, b) => a.name.localeCompare(b.name));
    for (const sel of [$('#from'), $('#to')]) {
      const current = sel.id === 'from' ? state.from : state.to;
      sel.innerHTML =
        '<option value="">— choose a city —</option>' +
        cities
          .map((c) => `<option value="${c.id}"${c.id === current ? ' selected' : ''}>${esc(c.name)} (${esc(c.modern.split(',')[0])})</option>`)
          .join('');
    }
  }

  function options() {
    const modes = {};
    document.querySelectorAll('input[name=mode]').forEach((i) => (modes[i.value] = i.checked));
    const radio = (name) => document.querySelector(`input[name=${name}]:checked`).value;
    return { modes, traveler: radio('traveler'), season: radio('season'), optimize: radio('optimize'), k: 3 };
  }

  // ------------------------------------------------------------------ drawing
  function drawRegions() {
    regionLayer.clearLayers();
    for (const r of AWT.regionLabels[state.period] || []) {
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
      `<div class="modern">${esc(a)} ↔ ${esc(b)} · ${MODE_LABEL[route.mode]} · ~${route.distanceKm.toLocaleString()} km</div>` +
      `<p>${esc(route.desc)}</p>` +
      `<div class="sources"><b>Sources:</b> ${route.sources.map(esc).join('; ')}</div></div>`
    );
  }

  function drawNetwork() {
    networkLayer.clearLayers();
    if (!showNetwork) return;
    const dim = state.results.length > 0;
    for (const r of state.network.routes) {
      const s = MODE_STYLE[r.mode];
      L.polyline(r.path, {
        pane: 'networkPane',
        color: s.color,
        dashArray: s.dashArray,
        weight: 2.5,
        opacity: dim ? 0.25 : 0.6,
        smoothFactor: 1,
      })
        .bindPopup(routePopup(r), { maxWidth: 320 })
        .addTo(networkLayer);
    }
  }

  function drawCities() {
    cityLayer.clearLayers();
    const z = map.getZoom();
    const labelRank = z < 6 ? 1 : z < 7 ? 2 : 3;
    for (const c of Object.values(state.network.cities)) {
      const isEnd = c.id === state.from || c.id === state.to;
      const radius = isEnd ? 8 : { 1: 6.5, 2: 5, 3: 3.5 }[c.rank];
      const m = L.circleMarker([c.lat, c.lng], {
        radius,
        color: '#3b2a1a',
        weight: isEnd ? 2.5 : 1.5,
        fillColor: c.id === state.from ? '#ffffff' : c.id === state.to ? '#8b2e16' : c.rank === 1 ? '#8b2e16' : '#f4ead5',
        fillOpacity: 1,
        pane: 'markerPane',
      });
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
      `<h3>${esc(c.name)}</h3><div class="modern">Today: ${esc(c.modern)}</div><p>${esc(c.note)}</p>` +
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
    if (!state.from || !state.to) {
      box.innerHTML = `<p class="empty">Choose a starting city and a destination to see the routes a traveller of ${esc(
        AWT.periods.find((p) => p.id === state.period).label
      )} could take.</p>`;
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
        (opts.season === 'winter' ? ' In winter the open sea was closed — try the sailing season.' : '') +
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
          `<span class="via">${via.length ? 'via ' + via.map(esc).join(', ') : 'direct'}</span></button>`
        );
      })
      .join('');

    const r = state.results[state.selected];
    const opts = options();
    const notes = [];
    if (r.legs.some((l) => l.route.downwind && l.route.downwind !== l.to))
      notes.push('Part of this voyage sails against the prevailing summer winds (the Etesians), so it is much slower than the reverse direction.');
    if (opts.season === 'winter')
      notes.push('Winter: Vegetius says the seas were "closed" from 11 November to 10 March; only short crossings are used, and roads are slower.');
    if (r.legs.some((l) => l.mode === 'sea') && opts.season !== 'winter')
      notes.push('Sea times assume a fair wind in the sailing season; ships could wait days or weeks in port for the right weather.');

    const legs = r.legs
      .map((l, i) => {
        const from = net.cities[l.from];
        const to = net.cities[l.to];
        return (
          `<li class="leg ${l.mode}"><span class="dot"></span>` +
          `<h3 data-leg="${i}">${esc(from.name)} → ${esc(to.name)}</h3>` +
          `<div class="meta">${badges([l.mode])} <span class="route-name">${esc(l.route.name)}</span> · ${l.distanceKm.toLocaleString()} km · ${fmtDays(l.days)}</div>` +
          `<p>${esc(l.route.desc)}</p>` +
          `<div class="sources"><b>Sources</b> ${l.route.sources.map(esc).join('; ')}</div></li>`
        );
      })
      .join('');

    box.innerHTML =
      `<h2>${esc(net.cities[state.from].name)} to ${esc(net.cities[state.to].name)}</h2>` +
      `<div class="alt-list" role="group" aria-label="Alternative routes">${alts}</div>` +
      `<p class="summary"><strong>About ${fmtDays(r.totalDays)}</strong> over roughly ${r.totalKm.toLocaleString()} km, ${r.legs.length} stage${r.legs.length > 1 ? 's' : ''}.</p>` +
      notes.map((n) => `<p class="note-box">${esc(n)}</p>`).join('') +
      `<ol class="itinerary">${legs}<li class="arrive"><span class="dot"></span>${esc(net.cities[state.to].name)}</li></ol>`;

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
    state.results = state.from && state.to && state.from !== state.to ? state.network.findRoutes(state.from, state.to, options()) : [];
    state.selected = 0;
    renderResults();
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

  function setPeriod(id) {
    state.period = id;
    state.network = new AWT.Router.Network(AWT, id);
    if (state.from && !state.network.cities[state.from]) state.from = null;
    if (state.to && !state.network.cities[state.to]) state.to = null;
    const p = AWT.periods.find((x) => x.id === id);
    $('#period-title').textContent = `${p.label} — ${p.title}`;
    $('#period-summary').textContent = p.summary;
    document.querySelectorAll('#period-tabs button').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.period === id)));
    fillSelects();
    drawRegions();
    compute(false);
  }

  function writeHash() {
    const params = new URLSearchParams({ period: state.period });
    if (state.from) params.set('from', state.from);
    if (state.to) params.set('to', state.to);
    history.replaceState(null, '', '#' + params.toString());
  }

  function readHash() {
    const params = new URLSearchParams(location.hash.slice(1));
    const p = params.get('period');
    if (p && AWT.periods.some((x) => x.id === p)) state.period = p;
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

  readHash();
  buildTabs();
  setPeriod(state.period);
  if (state.from && state.to) fitJourney();
})();
