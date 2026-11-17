#!/usr/bin/env node
/* Data integrity + router checks. Run with `npm test`. */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

// The JSON in data/ is the source of truth; the app loads the generated bundle.
const { execFileSync } = require('child_process');
try {
  execFileSync(process.execPath, [path.join(__dirname, '..', 'tools', 'build-data.js'), '--check'], { stdio: 'pipe' });
} catch (e) {
  console.error(String(e.stderr || e.stdout || e));
  process.exit(1);
}

const ctx = { console };
vm.createContext(ctx);
vm.runInContext('var window = globalThis;', ctx);
for (const f of ['js/data/bundle.js', 'js/timeline.js', 'js/weights.js', 'js/router.js']) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', f), 'utf8'), ctx, { filename: f });
}
const AWT = ctx.AWT;
const { Network } = AWT.Router;
const data = AWT;
let failures = 0;
function check(cond, msg) {
  if (!cond) {
    failures++;
    console.error('  ✗ ' + msg);
  }
}

const periodIds = AWT.periods.map((p) => p.id);
const KINDS = ['city', 'sanctuary', 'monument', 'fortress'];
const cityIds = new Set();
for (const c of AWT.cities) {
  check(!cityIds.has(c.id), `duplicate node id ${c.id}`);
  cityIds.add(c.id);
  check(KINDS.includes(c.kind), `node ${c.id} bad kind ${c.kind}`);
  check(c.eras.length > 0, `node ${c.id} has no eras`);
  for (const e of c.eras) check(e.name && [1, 2, 3].includes(e.rank) && e.note, `node ${c.id} era ${e.from} incomplete`);
  for (let i = 1; i < c.eras.length; i++) check(c.eras[i].from > c.eras[i - 1].to, `node ${c.id} eras overlap or are unsorted`);
}

const routeIds = new Set();
for (const r of AWT.routes) {
  check(!routeIds.has(r.id), `duplicate edge id ${r.id}`);
  routeIds.add(r.id);
  check(['road', 'sea', 'river'].includes(r.mode), `edge ${r.id} bad mode`);
  check(r.name && r.desc && r.sources && r.sources.length, `edge ${r.id} missing name/desc/sources`);
  check(cityIds.has(r.from) && cityIds.has(r.to), `edge ${r.id} references a missing node`);
  for (const w of r.via) check(AWT.waypoints[w], `edge ${r.id} unknown waypoint ${w}`);
  check(r.spans.length > 0, `edge ${r.id} has no spans`);
  for (let i = 1; i < r.spans.length; i++) check(r.spans[i].from > r.spans[i - 1].to, `edge ${r.id} spans overlap`);
  if (r.downwind) check([r.from, r.to].includes(r.downwind), `edge ${r.id} bad downwind`);
  if (r.mode === 'river') check([r.from, r.to].includes(r.downstream), `river ${r.id} needs downstream`);
  for (const o of r.overrides || []) check(o.from <= o.to, `edge ${r.id} bad override range`);
}

for (const pid of periodIds) {
  const net = new Network(data, pid);
  const ids = Object.keys(net.cities);
  // every city has at least one route, and the network is connected
  const adj = net.adjacency({});
  for (const id of ids) check(adj[id].length > 0, `${pid}: city ${id} has no routes`);
  const seen = new Set([ids[0]]);
  const stack = [ids[0]];
  while (stack.length) for (const e of adj[stack.pop()]) if (!seen.has(e.to)) seen.add(e.to), stack.push(e.to);
  const unreachable = ids.filter((id) => !seen.has(id));
  check(unreachable.length === 0, `${pid}: network disconnected, unreachable from ${ids[0]}: ${unreachable.join(', ')}`);
  console.log(`${pid}: ${ids.length} cities, ${net.routes.length} routes`);
}

// Router behaviour
{
  const net = new Network(data, '0ce');
  const res = net.findRoutes('rome', 'jerusalem', { k: 3 });
  assert(res.length === 3, 'expected 3 alternatives Rome→Jerusalem');
  assert(res[0].totalDays <= res[1].totalDays && res[1].totalDays <= res[2].totalDays, 'alternatives sorted');
  for (const r of res) {
    assert.strictEqual(r.legs[0].from, 'rome');
    assert.strictEqual(r.legs[r.legs.length - 1].to, 'jerusalem');
    for (let i = 1; i < r.legs.length; i++) assert.strictEqual(r.legs[i].from, r.legs[i - 1].to, 'legs chain');
  }
  // downwind asymmetry: Italy→Egypt faster than Egypt→Italy
  const out = net.findRoutes('puteoli', 'alexandria', { k: 1 })[0];
  const back = net.findRoutes('alexandria', 'puteoli', { k: 1 })[0];
  assert(out.totalDays < back.totalDays, 'downwind should be faster');
  // winter closes the open sea
  const winter = net.findRoutes('rome', 'alexandria', { k: 1, season: 'winter' })[0];
  assert(winter.legs.every((l) => l.mode !== 'sea' || l.route.crossing), 'winter uses only crossings');
  // land only
  const land = net.findRoutes('rome', 'byzantium', { k: 1, modes: { road: true, sea: false, river: false } });
  assert(land.length === 0 || land[0].legs.every((l) => l.mode === 'road'));
  // 500 BC Royal Road
  const p = new Network(data, '500bc').findRoutes('sardis', 'susa', { k: 3 }).find((r) => r.legs.some((l) => l.route.name === 'Royal Road'));
  assert(p, 'Royal Road among alternatives');
  console.log(`Rome→Jerusalem (0 CE): ${res.map((r) => r.totalDays.toFixed(1) + 'd').join(', ')}`);
  console.log(`Puteoli→Alexandria ${out.totalDays.toFixed(1)}d, back ${back.totalDays.toFixed(1)}d; Sardis→Susa ${p.totalDays.toFixed(0)}d`);
}

// Territories
{
  const owner = (p, id) => new Network(data, p).cities[id].owner;
  assert.strictEqual(owner('500bc', 'sardis'), 'persia');
  assert.strictEqual(owner('500bc', 'athens'), 'greeks');
  assert.strictEqual(owner('0ce', 'rome'), 'rome');
  assert.strictEqual(owner('0ce', 'jerusalem'), 'judaea');
  assert.strictEqual(owner('0ce', 'petra'), 'nabataea');
  assert.strictEqual(owner('300ce', 'nisibis'), 'rome');
  assert.strictEqual(owner('500ad', 'ravenna'), 'ostrogoths');
  assert.strictEqual(owner('500ad', 'carthage'), 'vandals');
  assert.strictEqual(owner('565ce', 'ravenna'), 'rome');
  assert.strictEqual(owner('565ce', 'nisibis'), 'sasanian');
  // year-by-year ownership between the old snapshot dates
  const at = (y, id) => new Network(data, y).cities[id].owner;
  assert.strictEqual(new Network(data, -320).territoryAt(32.54, 44.42).id, 'macedon', 'Babylon Macedonian after Alexander');
  assert.strictEqual(at(-200, 'antioch'), 'seleucid');
  assert.strictEqual(at(-100, 'alexandria'), 'ptolemaic');
  assert.strictEqual(at(-25, 'alexandria'), 'rome');
  assert.strictEqual(at(271, 'alexandria'), 'palmyra', 'Zenobia holds Egypt in 271');
  assert.strictEqual(at(100, 'petra'), 'nabataea');
  assert.strictEqual(at(120, 'petra'), 'rome');
  assert.strictEqual(at(450, 'aquincum'), 'huns');
  assert.strictEqual(at(420, 'carthage'), 'rome_west');
  assert.strictEqual(at(440, 'carthage'), 'vandals');
  assert.strictEqual(at(380, 'nisibis'), 'sasanian');
  // data integrity of powers and regions
  const powerIds = new Set(AWT.powers.map((p) => p.id));
  for (const r of AWT.regions.list) {
    for (let i = 1; i < r.owners.length; i++) check(r.owners[i].from > r.owners[i - 1].from, `region ${r.id} owners unsorted`);
    for (const o of r.owners) check(o.power === null || powerIds.has(o.power), `region ${r.id} unknown power ${o.power}`);
  }
  // a land journey across a border reports both powers, in order
  const j = new Network(data, '500ad').findRoutes('ravenna', 'byzantium', { k: 1, modes: { road: true, sea: false, river: true } })[0];
  assert(j, 'land route Ravenna→Constantinople');
  const seq = j.territories.filter(Boolean);
  assert.strictEqual(seq[0], 'ostrogoths');
  assert.strictEqual(seq[seq.length - 1], 'rome');
  console.log('Ravenna→Constantinople by land (500 CE) crosses: ' + j.territories.map((t) => t || '(none)').join(' → '));
}

// Weighted edges & effects
{
  const net = new Network(data, '0ce');
  const edge = (id) => net.routes.find((r) => r.id === id);
  const alps = edge('mediolanum-lugdunum-road');
  assert(alps.profile.km['mountain-high'] / alps.profile.total > 0.3, 'Alpine road profiled as high mountain');
  const coast = edge('rome-arelate-road');
  assert(!coast.profile.km['mountain-high'], 'coast road not high mountain');
  const jan = net.weigh(alps, 'mediolanum', { month: 1 });
  const jul = net.weigh(alps, 'mediolanum', { month: 7 });
  assert(jan.days > jul.days * 2, 'Alpine pass much heavier in January');
  // the coastal road is penalised far less by winter than the Alpine pass
  const cJan = net.weigh(coast, 'rome', { month: 1 }).days / net.weigh(coast, 'rome', { month: 7 }).days;
  assert(cJan < jan.days / jul.days, 'coast milder than mountains in winter');
  // effects can be switched off
  const noSnow = net.weigh(alps, 'mediolanum', { month: 1, effects: { snow: false, mud: false } });
  assert(Math.abs(noSnow.days - jul.days) < 1e-9, 'disabling effects restores base weight');
  // mare clausum closes the open sea; strict passes closes the Alps
  assert(net.weigh(edge('alexandria-puteoli-sea'), 'alexandria', { month: 1 }).closed);
  assert(!net.weigh(edge('brundisium-dyrrachium-sea'), 'brundisium', { month: 1 }).closed, 'crossings stay open');
  assert(net.weigh(alps, 'mediolanum', { month: 1, effects: { passes: true } }).closed, 'strict passes rule closes the Alps');
  // Nile: upstream helped by the north wind, much cheaper than a normal river
  const nile = net.weigh(edge('memphis-thebes-river'), 'memphis', { month: 1 });
  const rhone = net.weigh(edge('lugdunum-arelate-river'), 'arelate', { month: 1 });
  assert(nile.steps.find((s) => s.id === 'current').factor < rhone.steps.find((s) => s.id === 'current').factor);
  // every weight explains itself: product of steps equals the result
  for (const r of net.routes.slice(0, 40)) {
    const w = net.weigh(r, r.from, { month: 3 });
    if (w.closed) continue;
    let d = w.steps[0].days;
    for (const s of w.steps.slice(1)) d = d * (s.factor || 1) + (s.add || 0);
    assert(Math.abs(d - w.days) < 1e-6, 'breakdown adds up for ' + r.id);
  }
  // search trace
  const res = net.findRoutes('rome', 'athens', { month: 7 });
  assert(res.search.settled.length > 1 && res.search.settled[0].node === 'rome', 'search trace recorded');
  for (let i = 1; i < res.search.settled.length; i++) assert(res.search.settled[i].dist >= res.search.settled[i - 1].dist - 1e-9, 'Dijkstra settles in order');
  console.log(`Alps (Mediolanum→Lugdunum) July ${jul.days.toFixed(1)}d, January ${jan.days.toFixed(1)}d; Rome→Athens search settled ${res.search.settled.length} of ${res.search.nodes} nodes`);
}

// Sliding year: every place present in a year must be reachable from the main network
{
  const fy = AWT.timeline.fmtYear;
  const stranded = {};
  for (let y = AWT.timeline.min; y <= AWT.timeline.max; y += 5) {
    if (y === 0) continue;
    const net = new Network(data, y);
    const adj = net.adjacency({ effects: { sailing: false, passes: false } });
    const ids = Object.keys(net.cities);
    let main = new Set();
    const seen = new Set();
    for (const s0 of ids) {
      if (seen.has(s0)) continue;
      const comp = new Set([s0]);
      const st = [s0];
      seen.add(s0);
      while (st.length) for (const e of adj[st.pop()]) if (!seen.has(e.to)) seen.add(e.to), comp.add(e.to), st.push(e.to);
      if (comp.size > main.size) main = comp;
    }
    for (const id of ids) if (!main.has(id)) (stranded[id] = stranded[id] || []).push(y);
  }
  for (const [id, ys] of Object.entries(stranded)) check(false, `${id} is cut off from the network in ${ys.map(fy).join(', ')}`);
  // places drop in and out
  const ids = (y) => Object.keys(new Network(data, y).cities);
  assert(!ids(-400).includes('alexandria') && ids(-300).includes('alexandria'), 'Alexandria founded 331 BC');
  assert(ids(-100).includes('carthage') && new Network(data, -100).cities.carthage.name === 'Ruins of Carthage');
  assert(ids(70).includes('pompeii') && !ids(80).includes('pompeii'), 'Pompeii buried AD 79');
  assert(new Network(data, 320).cities.byzantium.name === 'Byzantium' && new Network(data, 340).cities.byzantium.name === 'Constantinopolis');
  assert(ids(-340).includes('persepolis') && !ids(-320).includes('persepolis'), 'Persepolis burned 330 BC');
  const n200 = new Network(data, 200);
  assert(n200.territories.length > 3, 'borders in every year');
  console.log(`200 CE: ${Object.keys(n200.cities).length} places, ${n200.routes.length} routes, ${n200.territories.length} powers: ${n200.territories.map((t) => t.name).join(', ')}`);
}

if (failures) {
  console.error(`\n${failures} data problem(s)`);
  process.exit(1);
}
console.log('\nAll checks passed.');
