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

    // Filter demands with valid coordinates
    const locatedDemands = demands.filter(d => d.lat != null && d.lng != null);

    // Haversine distance function (in meters)
    const getDistanceInMeters = (lat1, lon1, lat2, lon2) => {
      const R = 6371e3; // Earth radius in meters
      const p1 = lat1 * Math.PI / 180;
      const p2 = lat2 * Math.PI / 180;
      const dp = (lat2 - lat1) * Math.PI / 180;
      const dl = (lon2 - lon1) * Math.PI / 180;

      const a = Math.sin(dp / 2) * Math.sin(dp / 2) +
                Math.cos(p1) * Math.cos(p2) *
                Math.sin(dl / 2) * Math.sin(dl / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    const clusters = [];

    // O(n^2) spatial clustering (acceptable for small N demands)
    for (const d of locatedDemands) {
      let foundCluster = null;
      for (const cluster of clusters) {
        if (getDistanceInMeters(cluster.centerLat, cluster.centerLng, d.lat, d.lng) <= 100) {
          foundCluster = cluster;
          break;
        }
      }

      if (foundCluster) {
        foundCluster.items.push(d);
        // Recalculate cluster center dynamically
        const totalLat = foundCluster.items.reduce((sum, item) => sum + parseFloat(item.lat), 0);
        const totalLng = foundCluster.items.reduce((sum, item) => sum + parseFloat(item.lng), 0);
        foundCluster.centerLat = totalLat / foundCluster.items.length;
        foundCluster.centerLng = totalLng / foundCluster.items.length;
      } else {
        clusters.push({
          centerLat: parseFloat(d.lat),
          centerLng: parseFloat(d.lng),
          items: [d]
        });
      }
    }

    const hotspots = [];

    for (const cluster of clusters) {
      const items = cluster.items;
      const count = items.length;
      const uniqueCitizens = new Set(items.map(i => i.citizen_id || i.id)).size;

      // Threshold enforcement
      if (count < 3 || uniqueCitizens < 2) continue;

      // Determine dominant category
      const catFreq = {};
      items.forEach(i => { catFreq[i.category] = (catFreq[i.category] || 0) + 1; });
      const dominantCategory = Object.keys(catFreq).reduce((a, b) => catFreq[a] > catFreq[b] ? a : b, 'INFRASTRUCTURE');

      const intensity = Math.round(((count * 0.45) + (uniqueCitizens * 0.55)) * 10) / 10;
      
      let recurrence = 'MODERATE';
      if (uniqueCitizens >= 6 || count >= 12) recurrence = 'HIGH';
      else if (uniqueCitizens <= 2 && count <= 3) recurrence = 'LOW';

      // Find earliest and latest observation dates
      const firstObserved = items.reduce((min, d) => (!min || d.created_at < min) ? d.created_at : min, null) || new Date().toISOString();
      const lastObserved = items.reduce((max, d) => (!max || d.created_at > max) ? d.created_at : max, null) || new Date().toISOString();

      // Determine most frequent Ward in the cluster
      const wardFreq = {};
      items.forEach(i => { 
        const w = i.ward_id || i.wardId; 
        if (w) wardFreq[w] = (wardFreq[w] || 0) + 1; 
      });
      let ward = 'Unknown';
      if (Object.keys(wardFreq).length > 0) {
        ward = Object.keys(wardFreq).reduce((a, b) => wardFreq[a] > wardFreq[b] ? a : b);
      }

      hotspots.push({
        id: hotspots.length + 1,
        wardId: ward,
        centerLat: cluster.centerLat,
        centerLng: cluster.centerLng,
        radius: 100,
        demandCount: count,
        uniqueCitizenCount: uniqueCitizens,
        dominantCategory,
        intensity,
        recurrence,
        geographicConcentration: count >= 5 ? 'HIGH' : 'MEDIUM',
        confidence: 0.91,
        status: 'ACTIVE',
        firstObservedAt: firstObserved,
        lastObservedAt: lastObserved
      });
    }

    return hotspots;
  }
}
