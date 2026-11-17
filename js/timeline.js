/*
 * Timeline helpers, derived at load time from the data bundle.
 * Years are integers: negative = BC, positive = CE (there is no year 0).
 *
 *   AWT.timeline.fmtYear(y)           "331 BC", "79 CE"
 *   AWT.timeline.periodForYear(y)     nearest mapped period (for its narrative text)
 *   AWT.timeline.snapshotForYear(y)   mapped period whose narrative applies to y, or null
 *   AWT.timeline.events               dated changes: places appearing, vanishing, being renamed; roads opening/closing
 */
(function (root) {
  const AWT = (root.AWT = root.AWT || {});
  const FAR_PAST = -3000;
  const FAR_FUTURE = 3000;

  const anchors = AWT.periods.map((p) => ({ id: p.id, year: p.year }));
  const windows = Object.fromEntries(AWT.periods.map((p) => [p.id, p.bordersMapped]));

  function fmtYear(y) {
    if (y <= FAR_PAST) return 'antiquity';
    if (y >= FAR_FUTURE) return 'beyond';
    return y < 0 ? `${-y} BC` : `${y === 0 ? 1 : y} CE`;
  }
  function periodForYear(y) {
    for (let i = 0; i < anchors.length - 1; i++) if (y <= Math.round((anchors[i].year + anchors[i + 1].year) / 2)) return anchors[i].id;
    return anchors[anchors.length - 1].id;
  }
  function snapshotForYear(y) {
    for (const [id, [a, b]] of Object.entries(windows)) if (y >= a && y <= b) return id;
    return null;
  }

  // ---- dated events, from exact (known) era and span boundaries
  const events = [];
  for (const c of AWT.cities) {
    const eras = c.eras;
    eras.forEach((e, i) => {
      const prev = eras[i - 1];
      if (e.exactFrom && e.from > FAR_PAST) {
        if (prev && prev.to + 1 === e.from) {
          if (prev.name !== e.name) events.push({ year: e.from, kind: 'rename', text: `${prev.name} → ${e.name}`, city: c.id });
        } else events.push({ year: e.from, kind: 'appear', text: e.name, city: c.id });
      }
      const next = eras[i + 1];
      if (e.exactTo && e.to < FAR_FUTURE && !(next && next.from === e.to + 1)) events.push({ year: e.to, kind: 'vanish', text: e.name, city: c.id });
    });
  }
  for (const r of AWT.routes) {
    for (const s of r.spans) {
      // roadDateFrom / roadDateTo mark the road's own dates (not ones inherited from a place being founded)
      if (s.roadDateFrom) events.push({ year: s.from, kind: 'route-open', text: r.name, route: r.id });
      if (s.roadDateTo) events.push({ year: s.to, kind: 'route-close', text: r.name, route: r.id });
    }
  }
  events.sort((x, y) => x.year - y.year);

  // region labels for the mapped periods (used until year-by-year borders replace them)
  AWT.regionLabels = Object.fromEntries(AWT.periods.map((p) => [p.id, p.regionLabels || []]));

  AWT.timeline = {
    anchors,
    min: AWT.config.timeline.min,
    max: AWT.config.timeline.max,
    fmtYear,
    periodForYear,
    snapshotForYear,
    snapshotWindows: windows,
    anchorYear: (id) => (anchors.find((a) => a.id === id) || {}).year,
    events,
  };
})(typeof window !== 'undefined' ? window : globalThis);
