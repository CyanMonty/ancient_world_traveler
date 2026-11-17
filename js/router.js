/*
 * Route finding over the historical travel network.
 * Pure logic, no DOM: usable in the browser (window.AWT.Router) and in Node tests.
 */
(function (root) {
  const AWT = (root.AWT = root.AWT || {});

  const EARTH_RADIUS_KM = 6371;
  function haversine(a, b) {
    const toRad = (d) => (d * Math.PI) / 180;
    const dLat = toRad(b[0] - a[0]);
    const dLng = toRad(b[1] - a[1]);
    const h =
      Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLng / 2) ** 2;
    return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
  }

  /** Returns a period-specific view of a city, or null if it did not exist then. */
  function cityInPeriod(city, periodId) {
    const p = city.periods[periodId];
    if (!p) return null;
    return { id: city.id, lat: city.lat, lng: city.lng, modern: city.modern, kind: city.kind || 'city', name: p.name, rank: p.rank, note: p.note };
  }

  /** Year-specific view of a place, or null if it does not exist in that year. */
  function cityInYear(city, year) {
    const era = (city.eras || []).find((e) => year >= e.from && year <= e.to);
    if (!era) return null;
    return {
      id: city.id, lat: city.lat, lng: city.lng, modern: city.modern, kind: city.kind || 'city',
      name: era.name, rank: era.rank, note: era.note,
      era: { from: era.from, to: era.to, period: era.period },
      lifespan: { from: city.eras[0].from, to: city.eras[city.eras.length - 1].to },
    };
  }

  // Edge geometry never changes, and edge profiles only change with the territory snapshot,
  // so both are cached across Network instances (the year slider rebuilds the network often).
  const GEOM_CACHE = new Map();
  const PROFILE_CACHE = new Map();

  /** Route with per-period overrides applied. */
  function routeInPeriod(route, periodId) {
    const o = (route.byPeriod && route.byPeriod[periodId]) || {};
    return Object.assign({}, route, o, { byPeriod: undefined });
  }

  /** Full drawn path of a route as [lat, lng] points, from `from` to `to`. */
  function routePath(route, cityById, waypoints) {
    const a = cityById[route.from];
    const b = cityById[route.to];
    const pts = [[a.lat, a.lng]];
    for (const w of route.via || []) {
      if (!waypoints[w]) throw new Error(`Unknown waypoint "${w}" on route ${route.id}`);
      pts.push(waypoints[w]);
    }
    pts.push([b.lat, b.lng]);
    return pts;
  }

  function pathLength(points) {
    let d = 0;
    for (let i = 1; i < points.length; i++) d += haversine(points[i - 1], points[i]);
    return d;
  }

  // ----- territories (point-in-polygon on [lng, lat] MultiPolygons)
  function inRing(lng, lat, ring) {
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i];
      const [xj, yj] = ring[j];
      if (yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  }
  function inMultiPolygon(lng, lat, geom) {
    for (const poly of geom.coordinates) {
      if (!inRing(lng, lat, poly[0])) continue;
      let inHole = false;
      for (let h = 1; h < poly.length; h++) if (inRing(lng, lat, poly[h])) inHole = true;
      if (!inHole) return true;
    }
    return false;
  }
  /** Points every ~stepKm along a polyline of [lat, lng]. */
  function samplePath(points, stepKm) {
    const out = [points[0]];
    for (let i = 1; i < points.length; i++) {
      const [a, b] = [points[i - 1], points[i]];
      const n = Math.max(1, Math.ceil(haversine(a, b) / stepKm));
      for (let k = 1; k <= n; k++) out.push([a[0] + ((b[0] - a[0]) * k) / n, a[1] + ((b[1] - a[1]) * k) / n]);
    }
    return out;
  }

  class Network {
    /**
     * @param {object} data   { cities, routes, waypoints, travelers, windingFactor }
     * @param {string} periodId
     */
    /**
     * @param {object} data   { cities, routes, waypoints, travelers, windingFactor, territories, zones, timeline }
     * @param {number|string} when  a year (negative = BC), or an anchor period id such as '300ce'
     */
    constructor(data, when) {
      const tl = data.timeline;
      this.year = typeof when === 'number' ? when : tl.anchorYear(when);
      // borders, labels and route renamings come from the nearest hand-drawn snapshot
      this.periodId = tl.periodForYear(this.year);
      const periodId = this.periodId;
      this.data = data;
      this.cities = {};
      for (const c of data.cities) {
        const v = cityInYear(c, this.year);
        if (v) this.cities[c.id] = v;
      }
      this.routes = [];
      for (const r of data.routes) {
        if (!(r.spans || []).some(([a, b]) => this.year >= a && this.year <= b)) continue;
        if (!this.cities[r.from] || !this.cities[r.to]) continue;
        const route = routeInPeriod(r, periodId);
        let geom = GEOM_CACHE.get(r.id);
        if (!geom) {
          const path = routePath(route, this.cities, data.waypoints);
          geom = { path, distanceKm: Math.round(pathLength(path) * (data.windingFactor[route.mode] || 1)) };
          GEOM_CACHE.set(r.id, geom);
        }
        route.path = geom.path;
        route.distanceKm = geom.distanceKm;
        route.span = r.spans.find(([a, b]) => this.year >= a && this.year <= b);
        this.routes.push(route);
      }
      // borders only where a hand-drawn snapshot is valid for this year
      this.snapshot = tl.snapshotForYear(this.year);
      this.territories = (this.snapshot && data.territories && data.territories[this.snapshot]) || [];
      this.territoryById = Object.fromEntries(this.territories.map((t) => [t.id, t]));
      for (const c of Object.values(this.cities)) {
        const t = this.territoryAt(c.lat, c.lng);
        c.owner = t ? t.id : null;
      }
      const tags = data.routeTags || {};
      const nile = new Set(tags.nile || []);
      for (const r of this.routes) {
        if (nile.has(r.id)) r.nile = true;
        const key = `${r.id}|${this.snapshot || 'none'}`;
        let prof = PROFILE_CACHE.get(key);
        if (!prof) {
          this.profileEdge(r);
          prof = { profile: r.profile, realmKm: r.realmKm, realmChanges: r.realmChanges };
          PROFILE_CACHE.set(key, prof);
        }
        Object.assign(r, prof);
      }
    }

    /** The power controlling a point in this period, or null (independent peoples / sea). */
    territoryAt(lat, lng) {
      for (const t of this.territories) if (inMultiPolygon(lng, lat, t.geometry)) return t;
      return null;
    }

    /**
     * Measures an edge against the climate zones and realms, so effects can weight it:
     *   profile.km[kind]   km through each zone kind (mountain-high, mountain, desert, floodplain)
     *   profile.names[kind] names of the zones crossed, for explanations
     *   realmKm[id]        km through each realm
     *   realmChanges       number of borders crossed along the edge
     * Sea edges cross no land zones; their realm share is split between the two ports.
     */
    profileEdge(r) {
      const STEP = 10;
      const zones = this.data.zones || [];
      const km = {};
      const names = { 'mountain-high': [], mountain: [], desert: [], floodplain: [] };
      const realmKm = {};
      let total = 0;
      if (r.mode === 'sea') {
        total = r.distanceKm;
        for (const id of [this.cities[r.from].owner, this.cities[r.to].owner]) {
          const k = id || '_none';
          realmKm[k] = (realmKm[k] || 0) + r.distanceKm / 2;
        }
      } else {
        const pts = samplePath(r.path, STEP);
        const segKm = r.distanceKm / Math.max(1, pts.length);
        for (const [lat, lng] of pts) {
          total += segKm;
          const t = this.territoryAt(lat, lng);
          const k = t ? t.id : '_none';
          realmKm[k] = (realmKm[k] || 0) + segKm;
          const seen = new Set();
          for (const z of zones) {
            if (seen.has(z.kind) || !inRing(lng, lat, z.ring)) continue;
            seen.add(z.kind);
            km[z.kind] = (km[z.kind] || 0) + segKm;
            if (!names[z.kind].includes(z.name)) names[z.kind].push(z.name);
          }
        }
        // a stretch in high mountains is not also counted as ordinary hill country
        if (km['mountain-high'] && km.mountain) km.mountain = Math.max(0, km.mountain - km['mountain-high']);
      }
      r.profile = { km, names, total };
      r.realmKm = realmKm;
      r.realmChanges = this.territories.length ? this.legTerritories(r.path, r.mode, r.from, r.to).length - 1 : 0;
    }

    /**
     * Ordered list of territory ids a leg passes through (null = land outside any state).
     * Land legs are sampled every ~15 km; sea legs only report the two ports, since
     * the open sea belonged to no one.
     */
    legTerritories(path, mode, fromId, toId) {
      const seq = [];
      const push = (id) => {
        if (seq[seq.length - 1] !== id) seq.push(id);
      };
      if (mode === 'sea') {
        push(this.cities[fromId].owner);
        push(this.cities[toId].owner);
        return seq;
      }
      push(this.cities[fromId].owner);
      for (const [lat, lng] of samplePath(path, 15).slice(1, -1)) {
        const t = this.territoryAt(lat, lng);
        if (t || !this.territories.length) push(t ? t.id : null);
      }
      push(this.cities[toId].owner);
      return seq;
    }

    /** Conditions object for the weight model, from UI/test options. */
    context(opts = {}, src = null) {
      const W = AWT.Weights;
      // backwards compatible: season 'winter' / 'summer' maps to a month
      const month = opts.month || (opts.season === 'winter' ? 1 : 7);
      return {
        month,
        traveler: opts.traveler || 'ordinary',
        speeds: this.data.travelers[opts.traveler || 'ordinary'].speeds,
        effects: Object.assign(W.defaultEffects(), opts.effects || {}),
        homeRealm: src && this.cities[src] ? this.cities[src].owner : null,
      };
    }

    /** Weight of one directed edge, with its full explanation. */
    weigh(route, fromId, opts = {}, src = null) {
      const toId = fromId === route.from ? route.to : route.from;
      return AWT.Weights.evaluate(route, fromId, toId, opts.ctx || this.context(opts, src));
    }

    /**
     * The weighted directed graph under the chosen conditions:
     *   adj[node] = [{ key, route, from, to, days, cost, weight }]
     * cost is what Dijkstra minimises: days (fastest) or km (shortest; closed edges still excluded).
     */
    adjacency(opts = {}, src = null) {
      const modes = opts.modes || { road: true, sea: true, river: true };
      const ctx = this.context(opts, src);
      const adj = {};
      for (const id of Object.keys(this.cities)) adj[id] = [];
      for (const r of this.routes) {
        if (!modes[r.mode]) continue;
        for (const [a, b] of [
          [r.from, r.to],
          [r.to, r.from],
        ]) {
          const weight = AWT.Weights.evaluate(r, a, b, ctx);
          if (weight.closed) continue;
          const cost = opts.optimize === 'distance' ? r.distanceKm : weight.days;
          adj[a].push({ key: `${r.id}>${b}`, route: r, from: a, to: b, days: weight.days, cost, weight });
        }
      }
      return adj;
    }

    /**
     * Dijkstra from src to dst. Returns the list of edges on the cheapest path, or null.
     * If `trace` is given, it is filled with the search as it happened:
     *   trace.settled = [{ node, dist, via }]   nodes in the order they were finalised
     *   trace.relaxations = number of edge relaxations
     */
    static shortest(adj, src, dst, bannedEdges, bannedNodes, trace) {
      const dist = { [src]: 0 };
      const prev = {};
      const done = new Set();
      const queue = [[0, src]];
      if (trace) Object.assign(trace, { settled: [], relaxations: 0 });
      while (queue.length) {
        // small graphs: a sorted array is plenty fast
        queue.sort((x, y) => x[0] - y[0]);
        const [d, u] = queue.shift();
        if (done.has(u)) continue;
        done.add(u);
        if (trace) trace.settled.push({ node: u, dist: d, via: prev[u] ? prev[u].from : null, edge: prev[u] || null });
        if (u === dst) break;
        for (const e of adj[u] || []) {
          if (bannedEdges.has(e.key) || bannedNodes.has(e.to)) continue;
          const nd = d + e.cost;
          if (trace) trace.relaxations++;
          if (dist[e.to] === undefined || nd < dist[e.to] - 1e-9) {
            dist[e.to] = nd;
            prev[e.to] = e;
            queue.push([nd, e.to]);
          }
        }
      }
      if (dist[dst] === undefined) return null;
      const path = [];
      for (let n = dst; n !== src; n = prev[n].from) path.unshift(prev[n]);
      return path;
    }

    /**
     * Up to `k` distinct itineraries. The best route is found with Dijkstra; alternatives
     * are found by repeatedly penalising the legs already used, which yields genuinely
     * different routes (e.g. by sea vs. overland) rather than trivial detours.
     * opts: { traveler, month, effects, modes, optimize, k }
     * The returned array has a `search` property describing the first Dijkstra run.
     */
    findRoutes(src, dst, opts = {}) {
      const out = [];
      if (!this.cities[src] || !this.cities[dst] || src === dst) return out;
      const k = opts.k || 3;
      const adj = this.adjacency(opts, src);
      const realCost = (p) => p.reduce((s, e) => s + e.cost, 0);
      const penalty = {};
      const penalised = {};
      for (const [node, edges] of Object.entries(adj)) {
        penalised[node] = edges.map((e) => Object.assign({}, e, { base: e }));
      }
      const found = [];
      const seen = new Set();
      let best = Infinity;
      const search = {};
      for (let iter = 0; iter < k * 4 && found.length < k; iter++) {
        for (const edges of Object.values(penalised))
          for (const e of edges) e.cost = e.base.cost * (penalty[e.route.id] || 1);
        const raw = Network.shortest(penalised, src, dst, new Set(), new Set(), iter === 0 ? search : null);
        if (!raw) break;
        const path = raw.map((e) => e.base);
        const sig = path.map((e) => e.key).join('|');
        const cost = realCost(path);
        if (!found.length) best = cost;
        if (!seen.has(sig) && cost <= best * 2.5) {
          seen.add(sig);
          found.push(path);
        }
        for (const e of path) penalty[e.route.id] = (penalty[e.route.id] || 1) * 1.6;
      }
      found.sort((a, b) => realCost(a) - realCost(b));
      for (const p of found) out.push(this.describe(p));
      if (search.settled) {
        search.settled = search.settled.map((s) => ({ node: s.node, dist: s.dist, via: s.via, route: s.edge ? s.edge.route : null }));
        search.nodes = Object.keys(adj).length;
        search.edges = Object.values(adj).reduce((n, l) => n + l.length, 0);
        search.metric = opts.optimize === 'distance' ? 'km' : 'days';
      }
      out.search = search;
      return out;
    }

    describe(path) {
      const legs = path.map((e) => ({
        route: e.route,
        from: e.from,
        to: e.to,
        mode: e.route.mode,
        distanceKm: e.route.distanceKm,
        days: e.days,
        weight: e.weight,
        // drawn points in direction of travel
        path: e.from === e.route.from ? e.route.path : e.route.path.slice().reverse(),
      }));
      for (const l of legs) l.territories = this.legTerritories(l.path, l.mode, l.from, l.to);
      const territories = [];
      for (const l of legs) for (const id of l.territories) if (territories[territories.length - 1] !== id) territories.push(id);
      const modes = [...new Set(legs.map((l) => l.mode))];
      return {
        legs,
        totalKm: legs.reduce((s, l) => s + l.distanceKm, 0),
        totalDays: legs.reduce((s, l) => s + l.days, 0),
        modes,
        territories,
      };
    }
  }

  AWT.Router = { Network, haversine, cityInPeriod, cityInYear, routeInPeriod, inMultiPolygon, inRing };
})(typeof window !== 'undefined' ? window : globalThis);
