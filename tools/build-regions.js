/*
 * Region geometry for year-by-year borders, used by tools/build-data.js.
 *
 * data/regions.json lists ~150 regions, each with one or more SEED points and an ownership
 * timeline (who controlled it from which year). The map is divided into Voronoi cells around
 * the seeds — every point belongs to its nearest seed — and the cells of each region are merged.
 * We also record the shared boundary between every pair of neighbouring regions, so the app can
 * draw a border wherever two neighbours have different owners in the chosen year.
 *
 * Voronoi borders are straight-line approximations; add seeds to a region to shape it.
 * The sea is masked on the map, so cells may run freely through it.
 */
const turf = require('@turf/turf');

const BBOX = [-25, 5, 70, 62]; // west, south, east, north (matches the coastline data)
const P = 3;
const round = (v) => Math.round(v * 10 ** P) / 10 ** P;
const key = ([x, y]) => `${x.toFixed(5)},${y.toFixed(5)}`;

function buildRegions(d) {
  const seeds = [];
  d.regions.forEach((r, ri) => r.seeds.forEach(([lng, lat]) => seeds.push({ lng, lat, ri })));
  const cells = turf.voronoi(turf.featureCollection(seeds.map((s) => turf.point([s.lng, s.lat]))), { bbox: BBOX });

  // merge cells into regions
  const geoms = d.regions.map(() => null);
  cells.features.forEach((cell, i) => {
    if (!cell) throw new Error(`duplicate seed ${seeds[i].lng},${seeds[i].lat}`);
    const ri = seeds[i].ri;
    geoms[ri] = geoms[ri] ? turf.union(turf.featureCollection([geoms[ri], cell])) : cell;
  });

  // shared edges between cells of different regions → borders between region pairs
  const edgeOwners = new Map(); // edge key → [{ri, a, b}]
  cells.features.forEach((cell, i) => {
    const ring = cell.geometry.coordinates[0];
    for (let k = 0; k < ring.length - 1; k++) {
      const a = ring[k];
      const b = ring[k + 1];
      const kk = [key(a), key(b)].sort().join('|');
      if (!edgeOwners.has(kk)) edgeOwners.set(kk, []);
      edgeOwners.get(kk).push({ ri: seeds[i].ri, a, b });
    }
  });
  const pairs = new Map();
  for (const list of edgeOwners.values()) {
    if (list.length !== 2 || list[0].ri === list[1].ri) continue;
    const [x, y] = [list[0].ri, list[1].ri].sort((m, n) => m - n);
    const pk = `${x}|${y}`;
    if (!pairs.has(pk)) pairs.set(pk, { a: x, b: y, segments: [] });
    const { a, b } = list[0];
    pairs.get(pk).segments.push([
      [round(a[1]), round(a[0])],
      [round(b[1]), round(b[0])],
    ]);
  }

  const toLatLng = (geom) => {
    const polys = geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates;
    return polys.map((poly) => poly.map((ring) => ring.map(([x, y]) => [round(y), round(x)])));
  };

  return {
    // seeds as [lng, lat, regionIndex]: the owner of any point is found from its nearest seed
    seeds: seeds.map((s) => [s.lng, s.lat, s.ri]),
    list: d.regions.map((r, i) => ({
      id: r.id,
      name: r.name,
      owners: r.owners,
      label: [r.seeds[0][1], r.seeds[0][0]],
      area: round(turf.area(geoms[i]) / 1e6),
      polygons: toLatLng(geoms[i].geometry), // [lat, lng] rings, ready for Leaflet
    })),
    borders: [...pairs.values()],
  };
}

module.exports = { buildRegions, BBOX };
