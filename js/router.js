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
    return { id: city.id, lat: city.lat, lng: city.lng, modern: city.modern, name: p.name, rank: p.rank, note: p.note };
  }

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

  class Network {
    /**
     * @param {object} data   { cities, routes, waypoints, travelers, windingFactor }
     * @param {string} periodId
     */
    constructor(data, periodId) {
      this.periodId = periodId;
      this.data = data;
      this.cities = {};
      for (const c of data.cities) {
        const v = cityInPeriod(c, periodId);
        if (v) this.cities[c.id] = v;
      }
      this.routes = [];
      for (const r of data.routes) {
        if (!r.periods.includes(periodId)) continue;
        if (!this.cities[r.from] || !this.cities[r.to]) continue;
        const route = routeInPeriod(r, periodId);
        route.path = routePath(route, this.cities, data.waypoints);
        route.distanceKm = Math.round(pathLength(route.path) * (data.windingFactor[route.mode] || 1));
        this.routes.push(route);
      }
    }

    /** Travel days along `route` when heading from city `fromId`. Returns Infinity if not usable. */
    legDays(route, fromId, opts) {
      const speeds = this.data.travelers[opts.traveler || 'ordinary'].speeds;
      const winter = opts.season === 'winter';
      const toId = fromId === route.from ? route.to : route.from;
      let speed;
      if (route.mode === 'sea') {
        if (winter && !route.crossing) return Infinity; // mare clausum
        speed = speeds.sea;
        if (route.downwind) speed *= route.downwind === toId ? 1.25 : 0.5;
        if (winter) speed *= 0.5;
      } else if (route.mode === 'river') {
        speed = route.downstream === toId ? speeds.riverDown : speeds.riverUp;
      } else {
        speed = speeds.road;
        if (winter) speed *= 0.8;
      }
      return route.distanceKm / speed;
    }

    /** Adjacency list honouring the chosen options. */
    adjacency(opts) {
      const modes = opts.modes || { road: true, sea: true, river: true };
      const adj = {};
      for (const id of Object.keys(this.cities)) adj[id] = [];
      for (const r of this.routes) {
        if (!modes[r.mode]) continue;
        for (const [a, b] of [
          [r.from, r.to],
          [r.to, r.from],
        ]) {
          const days = this.legDays(r, a, opts);
          if (!isFinite(days)) continue;
          const cost = opts.optimize === 'distance' ? r.distanceKm : days;
          adj[a].push({ key: `${r.id}>${b}`, route: r, from: a, to: b, days, cost });
        }
      }
      return adj;
    }

    /** Dijkstra; returns array of adjacency edges or null. */
    static shortest(adj, src, dst, bannedEdges, bannedNodes) {
      const dist = { [src]: 0 };
      const prev = {};
      const done = new Set();
      const queue = [[0, src]];
      while (queue.length) {
        // small graphs: a sorted array is plenty fast
        queue.sort((x, y) => x[0] - y[0]);
        const [d, u] = queue.shift();
        if (done.has(u)) continue;
        done.add(u);
        if (u === dst) break;
        for (const e of adj[u] || []) {
          if (bannedEdges.has(e.key) || bannedNodes.has(e.to)) continue;
          const nd = d + e.cost;
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
     * opts: { traveler, season, modes, optimize, k }
     */
    findRoutes(src, dst, opts = {}) {
      if (!this.cities[src] || !this.cities[dst] || src === dst) return [];
      const k = opts.k || 3;
      const adj = this.adjacency(opts);
      const realCost = (p) => p.reduce((s, e) => s + e.cost, 0);
      const penalty = {};
      const penalised = {};
      for (const [node, edges] of Object.entries(adj)) {
        penalised[node] = edges.map((e) => Object.assign({}, e, { base: e }));
      }
      const found = [];
      const seen = new Set();
      let best = Infinity;
      for (let iter = 0; iter < k * 4 && found.length < k; iter++) {
        for (const edges of Object.values(penalised))
          for (const e of edges) e.cost = e.base.cost * (penalty[e.route.id] || 1);
        const raw = Network.shortest(penalised, src, dst, new Set(), new Set());
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
      return found.map((p) => this.describe(p));
    }

    describe(path) {
      const legs = path.map((e) => ({
        route: e.route,
        from: e.from,
        to: e.to,
        mode: e.route.mode,
        distanceKm: e.route.distanceKm,
        days: e.days,
        // drawn points in direction of travel
        path: e.from === e.route.from ? e.route.path : e.route.path.slice().reverse(),
      }));
      const modes = [...new Set(legs.map((l) => l.mode))];
      return {
        legs,
        totalKm: legs.reduce((s, l) => s + l.distanceKm, 0),
        totalDays: legs.reduce((s, l) => s + l.days, 0),
        modes,
      };
    }
  }

  AWT.Router = { Network, haversine, cityInPeriod, routeInPeriod };
})(typeof window !== 'undefined' ? window : globalThis);
