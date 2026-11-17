/*
 * Edge-weight model. Pure logic, no DOM; used by router.js in the browser and in Node tests.
 *
 * The weight of a directed edge (travelling from A to B) is built in steps:
 *
 *   base days = distance / speed(mode, traveller)
 *   then each enabled EFFECT may
 *     - multiply the days (factor),   e.g. ×2.4 for snow on 47% of the road
 *     - add days (add),               e.g. +1 day for border formalities
 *     - close the edge (closed),      e.g. open sea in January (mare clausum)
 *
 * Every step is recorded, so the UI can show exactly why an edge weighs what it does.
 * Effects look at:
 *   - the edge: mode, distance, flags (downwind, downstream, crossing, nile),
 *     and its PROFILE — km through each climate zone (js/data/zones.js) and each realm
 *   - the conditions (ctx): month, traveller, enabled effects, home realm
 *
 * To add an effect, append an object to EFFECTS with an `apply(edge, dir, ctx)` that
 * returns null (no change) or { factor?, add?, closed?, detail }.
 */
(function (root) {
  const AWT = (root.AWT = root.AWT || {});

  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  /** Linear blend: a share s (0–1) of the edge gets factor f, the rest is unaffected. */
  const blend = (share, f) => 1 + share * (f - 1);
  const pct = (x) => `${Math.round(x * 100)}%`;
  const shareOf = (edge, kind) => (edge.profile && edge.profile.total ? (edge.profile.km[kind] || 0) / edge.profile.total : 0);

  const EFFECTS = [
    {
      id: 'sailing',
      label: 'Sailing season',
      default: true,
      about: 'Vegetius (4.39): safe sailing 27 May–14 September; "doubtful" until 11 November and from 10 March; the seas are "closed" in between. Short crossings were still risked in winter.',
      apply(edge, dir, ctx) {
        if (edge.mode !== 'sea') return null;
        const m = ctx.month;
        if ([6, 7, 8].includes(m)) return null;
        if ([5, 9].includes(m)) return { factor: 1.15, detail: 'edge of the safe season: some days waiting for weather' };
        if ([4, 10].includes(m)) return { factor: 1.6, detail: '"doubtful" season: frequent waits in port for a fair wind' };
        if ([3, 11].includes(m)) {
          return edge.crossing
            ? { factor: 1.5, detail: 'short crossing in the stormy season' }
            : { factor: 3, detail: 'the seas are closing: only the bold sail, with long waits' };
        }
        return edge.crossing
          ? { factor: 2.5, detail: 'winter crossing: waiting for a calm day' }
          : { closed: true, detail: 'mare clausum: the open sea is closed in winter' };
      },
    },
    {
      id: 'winds',
      label: 'Prevailing winds (Etesians)',
      default: true,
      about: 'From May to September the Etesian winds blow steadily from the north-west across the eastern Mediterranean: fast running south to Egypt, slow beating back.',
      apply(edge, dir, ctx) {
        if (edge.mode !== 'sea' || !edge.downwind) return null;
        const toward = edge.downwind === dir.to;
        const etesian = ctx.month >= 5 && ctx.month <= 9;
        if (etesian) return toward ? { factor: 0.8, detail: 'running before the Etesian winds' } : { factor: 2.0, detail: 'beating against the Etesian winds' };
        return toward ? null : { factor: 1.3, detail: 'against the usual winds' };
      },
    },
    {
      id: 'current',
      label: 'River currents',
      default: true,
      about: 'Boats drift fast downstream but must be rowed or towed upstream — except on the Nile, where the north wind lets boats sail upstream (Herodotus 2.96).',
      apply(edge, dir, ctx) {
        if (edge.mode !== 'river' || edge.downstream === dir.to) return null;
        if (edge.nile) return { factor: 1.4, detail: 'sailing upstream on the Nile\'s north wind' };
        const s = ctx.speeds;
        return { factor: s.riverDown / s.riverUp, detail: 'rowing and towing against the current' };
      },
    },
    {
      id: 'nile_flood',
      label: 'Nile inundation',
      default: true,
      about: 'August to October the Nile floods: boats sail fast on high water, while Delta roads disappear under water (Herodotus 2.97).',
      apply(edge, dir, ctx) {
        if (![8, 9, 10].includes(ctx.month)) return null;
        if (edge.mode === 'river' && edge.nile) return { factor: 0.8, detail: 'high water on the Nile' };
        const s = shareOf(edge, 'floodplain');
        if (edge.mode === 'road' && s > 0) return { factor: blend(s, 1.8), detail: `${pct(s)} of the road is on the flooded Delta` };
        return null;
      },
    },
    {
      id: 'snow',
      label: 'Mountain snow',
      default: true,
      about: 'Winter snow slows travel through mountains and highlands; coastal and lowland roads are unaffected. High passes (Alps, Armenia, Zagros) suffer most.',
      apply(edge, dir, ctx) {
        if (edge.mode !== 'road') return null;
        const high = { 12: 4, 1: 4, 2: 4, 3: 2.2, 11: 2.2, 4: 1.3, 10: 1.3 }[ctx.month] || 1;
        const mid = { 12: 2, 1: 2, 2: 2, 3: 1.4, 11: 1.4 }[ctx.month] || 1;
        const sh = shareOf(edge, 'mountain-high');
        const sm = shareOf(edge, 'mountain');
        if ((high === 1 || !sh) && (mid === 1 || !sm)) return null;
        const f = 1 + sh * (high - 1) + sm * (mid - 1);
        if (f <= 1.001) return null;
        const parts = [];
        if (sh && high > 1) parts.push(`${pct(sh)} in high mountains (${edge.profile.names['mountain-high'].join(', ')})`);
        if (sm && mid > 1) parts.push(`${pct(sm)} in hill country (${edge.profile.names.mountain.join(', ')})`);
        return { factor: f, detail: 'snow: ' + parts.join('; ') };
      },
    },
    {
      id: 'passes',
      label: 'High passes closed in deep winter',
      default: false,
      about: 'Stricter rule: from December to February, roads that cross high mountains for a significant stretch are treated as impassable.',
      apply(edge, dir, ctx) {
        if (edge.mode !== 'road' || ![12, 1, 2].includes(ctx.month)) return null;
        const sh = shareOf(edge, 'mountain-high');
        return sh >= 0.15 ? { closed: true, detail: `pass snowed in (${edge.profile.names['mountain-high'].join(', ')})` } : null;
      },
    },
    {
      id: 'mud',
      label: 'Winter mud & short days',
      default: true,
      about: 'In winter, lowland roads turn to mud and daylight shrinks to under ten hours, so fewer miles are covered each day.',
      apply(edge, dir, ctx) {
        if (edge.mode !== 'road' || ![11, 12, 1, 2].includes(ctx.month)) return null;
        const low = 1 - shareOf(edge, 'mountain-high') - shareOf(edge, 'mountain');
        return low > 0.02 ? { factor: blend(low, 1.2), detail: `mud and short days on ${pct(low)} of the road` } : null;
      },
    },
    {
      id: 'heat',
      label: 'Desert heat',
      default: true,
      about: 'In summer, desert stretches can only be crossed at night and between wells, so they take far longer.',
      apply(edge, dir, ctx) {
        if (edge.mode !== 'road') return null;
        const f = { 6: 1.6, 7: 1.6, 8: 1.6, 5: 1.25, 9: 1.25 }[ctx.month];
        const s = shareOf(edge, 'desert');
        if (!f || !s) return null;
        return { factor: blend(s, f), detail: `${pct(s)} of the road through desert (${edge.profile.names.desert.join(', ')})` };
      },
    },
    {
      id: 'borders',
      label: 'Border formalities',
      default: true,
      about: 'Each time a route leaves one realm for another, allow a day for customs, permits and finding new guides. Rome and Persia limited trade to a few crossing points.',
      apply(edge) {
        const n = edge.realmChanges || 0;
        return n ? { add: n, detail: `${n} border crossing${n > 1 ? 's' : ''}` } : null;
      },
    },
    {
      id: 'foreign',
      label: 'Avoid foreign realms',
      default: false,
      about: 'Travelling outside your own realm (the realm of your starting city) counts double: think of a Roman official avoiding Persian territory.',
      apply(edge, dir, ctx) {
        if (!ctx.homeRealm || !edge.realmKm) return null;
        const total = Object.values(edge.realmKm).reduce((a, b) => a + b, 0);
        if (!total) return null;
        const foreign = 1 - (edge.realmKm[ctx.homeRealm] || 0) / total;
        return foreign > 0.02 ? { factor: blend(foreign, 2), detail: `${pct(foreign)} outside your home realm` } : null;
      },
    },
  ];

  const SPEED_KEY = { road: 'road', sea: 'sea', river: 'riverDown' };
  const MODE_WORD = { road: 'by road', sea: 'by sea', river: 'by river (downstream speed)' };

  /**
   * Weight of travelling along `edge` from `fromId` to `toId` under conditions `ctx`.
   * Returns { days, closed, steps: [{ id, label, detail, factor?, add?, closed?, days }] }.
   */
  function evaluate(edge, fromId, toId, ctx) {
    const speeds = ctx.speeds;
    const speed = speeds[SPEED_KEY[edge.mode]];
    let days = edge.distanceKm / speed;
    const steps = [{ id: 'base', label: 'Base', detail: `${edge.distanceKm.toLocaleString()} km ${MODE_WORD[edge.mode]} at ${speed} km/day`, days }];
    const dir = { from: fromId, to: toId };
    for (const eff of EFFECTS) {
      if (!ctx.effects[eff.id]) continue;
      const r = eff.apply(edge, dir, ctx);
      if (!r) continue;
      if (r.closed) {
        steps.push({ id: eff.id, label: eff.label, detail: r.detail, closed: true, days: Infinity });
        return { days: Infinity, closed: true, steps };
      }
      if (r.factor) days *= r.factor;
      if (r.add) days += r.add;
      steps.push({ id: eff.id, label: eff.label, detail: r.detail, factor: r.factor, add: r.add, days });
    }
    return { days, closed: false, steps };
  }

  function defaultEffects() {
    return Object.fromEntries(EFFECTS.map((e) => [e.id, e.default]));
  }

  /** One-line description of what the month means for travel. */
  function monthSummary(m) {
    const bits = [];
    if ([12, 1, 2].includes(m)) bits.push('seas closed', 'snow on the passes', 'muddy roads');
    else if ([3, 11].includes(m)) bits.push('seas closing', 'snow in the mountains');
    else if ([4, 10].includes(m)) bits.push('doubtful sailing');
    else if ([6, 7, 8].includes(m)) bits.push('best sailing', 'desert heat');
    else bits.push('good sailing');
    if (m >= 5 && m <= 9) bits.push('Etesian winds');
    if ([8, 9, 10].includes(m)) bits.push('Nile in flood');
    return bits.join(' · ');
  }

  AWT.Weights = { EFFECTS, MONTHS, evaluate, defaultEffects, monthSummary };
})(typeof window !== 'undefined' ? window : globalThis);
