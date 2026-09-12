export class ThemeHotspotEngine {
  /**
   * Aggregates normalized demands into recurring/emerging demand themes.
   * @param {Array} demands
   */
  static aggregateThemes(demands) {
    if (!demands || demands.length === 0) return [];

    const categoryGroups = {};
    for (const d of demands) {
      const cat = d.category || 'INFRASTRUCTURE';
      if (!categoryGroups[cat]) categoryGroups[cat] = [];
      categoryGroups[cat].push(d);
    }

    const themes = [];

    for (const [cat, items] of Object.entries(categoryGroups)) {
      const uniqueCitizens = new Set(items.map(i => i.citizen_id || i.id)).size;
      const count = items.length;

      let recurrenceStatus = 'ISOLATED';
      if (uniqueCitizens >= 5 || count >= 10) {
        recurrenceStatus = 'RECURRING';
      } else if (uniqueCitizens >= 2 || count >= 3) {
        recurrenceStatus = 'EMERGING';
      }

      const rep = items[0];
      const name = `${rep.sub_category || rep.subcategory || cat} Infrastructure Demands`;
      const summary = `Recurring citizen priority regarding ${rep.demand_statement || rep.title} across ${items.length} community submissions.`;

      themes.push({
        id: themes.length + 1,
        name,
        summary,
        category: cat,
        subCategory: rep.sub_category || rep.subcategory || 'General',
        recurrenceStatus,
        demandCount: count,
        uniqueCitizenCount: uniqueCitizens,
        coherenceScore: Math.round((0.78 + Math.min(0.20, count * 0.02)) * 100) / 100,
        representativeDemandId: rep.id,
        representativeStatement: rep.demand_statement || rep.title,
        firstObservedAt: items[items.length - 1].created_at || new Date().toISOString(),
        lastObservedAt: items[0].created_at || new Date().toISOString()
      });
    }

    return themes;
  }

  /**
   * Generates geographic demand hotspots from located demands.
   * Hotspot intensity = f(demandCount, uniqueCitizens).
   * @param {Array} demands
   */
  static computeHotspots(demands) {
    if (!demands || demands.length === 0) return [];

    // Group by Ward / spatial grid
    const wardGroups = {};
    for (const d of demands) {
      const ward = d.ward_id || d.wardId || 'Ward 23';
      if (!wardGroups[ward]) wardGroups[ward] = [];
      wardGroups[ward].push(d);
    }

    const hotspots = [];

    for (const [ward, items] of Object.entries(wardGroups)) {
      const count = items.length;
      const uniqueCitizens = new Set(items.map(i => i.citizen_id || i.id)).size;

      // Center is mean of coordinates
      const avgLat = items.reduce((sum, i) => sum + (i.lat || 20.296), 0) / count;
      const avgLng = items.reduce((sum, i) => sum + (i.lng || 85.824), 0) / count;

      // Intensity calculation: (count * 0.5) + (uniqueCitizens * 0.5) scaled
      const intensity = Math.round(((count * 0.45) + (uniqueCitizens * 0.55)) * 10) / 10;
      const radius = 100;

      // Dominant category
      const catFreq = {};
      items.forEach(i => { catFreq[i.category] = (catFreq[i.category] || 0) + 1; });
      const dominantCategory = Object.keys(catFreq).reduce((a, b) => catFreq[a] > catFreq[b] ? a : b, 'INFRASTRUCTURE');

      let recurrence = 'MODERATE';
      if (uniqueCitizens >= 6 || count >= 12) recurrence = 'HIGH';
      else if (uniqueCitizens <= 2 && count <= 3) recurrence = 'LOW';

      hotspots.push({
        id: hotspots.length + 1,
        wardId: ward,
        centerLat: avgLat,
        centerLng: avgLng,
        radius,
        demandCount: count,
        uniqueCitizenCount: uniqueCitizens,
        dominantCategory,
        intensity,
        recurrence,
        geographicConcentration: count >= 5 ? 'HIGH' : 'MEDIUM',
        confidence: 0.91,
        status: 'ACTIVE',
        firstObservedAt: items[items.length - 1].created_at || new Date().toISOString(),
        lastObservedAt: items[0].created_at || new Date().toISOString()
      });
    }

    return hotspots;
  }
}
