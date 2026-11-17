#!/usr/bin/env node
/* Data integrity + router checks. Run with `npm test`. */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const ctx = { console };
vm.createContext(ctx);
vm.runInContext('var window = globalThis;', ctx);
for (const f of ['js/data/periods.js', 'js/data/waypoints.js', 'js/data/cities.js', 'js/data/routes.js', 'js/router.js']) {
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
const cityIds = new Set();
for (const c of AWT.cities) {
  check(!cityIds.has(c.id), `duplicate city id ${c.id}`);
  cityIds.add(c.id);
  for (const p of Object.keys(c.periods)) check(periodIds.includes(p), `city ${c.id} has unknown period ${p}`);
}

const routeIds = new Set();
for (const r of AWT.routes) {
  check(!routeIds.has(r.id), `duplicate route id ${r.id}`);
  routeIds.add(r.id);
  check(['road', 'sea', 'river'].includes(r.mode), `route ${r.id} bad mode`);
  check(r.name && r.desc && r.sources && r.sources.length, `route ${r.id} missing name/desc/sources`);
  for (const w of r.via) check(AWT.waypoints[w], `route ${r.id} unknown waypoint ${w}`);
  for (const p of r.periods) {
    check(periodIds.includes(p), `route ${r.id} unknown period ${p}`);
    for (const end of [r.from, r.to]) {
      const c = AWT.cities.find((x) => x.id === end);
      check(c, `route ${r.id} unknown city ${end}`);
      if (c) check(c.periods[p], `route ${r.id} in ${p} but ${end} does not exist then`);
    }
  }
  if (r.downwind) check([r.from, r.to].includes(r.downwind), `route ${r.id} bad downwind`);
  if (r.mode === 'river') check([r.from, r.to].includes(r.downstream), `river ${r.id} needs downstream`);
  if (r.byPeriod) for (const p of Object.keys(r.byPeriod)) check(r.periods.includes(p), `route ${r.id} override for unused period ${p}`);
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

if (failures) {
  console.error(`\n${failures} data problem(s)`);
  process.exit(1);
}
console.log('\nAll checks passed.');
