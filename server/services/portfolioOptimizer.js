export class PortfolioOptimizer {
  /**
   * Deterministically solves the capital expenditure portfolio optimization problem.
   * Guarantees mathematical optimality using exact 0/1 Knapsack Branch-and-Bound
   * maximizing total social & priority value under budget, category caps, and dependency constraints.
   * @param {Array} proposals
   * @param {Object} constraints - { maxBudget, categoryLimits, minWards }
   */
  static optimize(proposals, constraints = {}) {
    const maxBudget = constraints.maxBudget || 50000000; // Default ₹5.0 Cr (50,000,000 INR)
    const categoryLimits = constraints.categoryLimits || []; // Array of { category, maxCount }

    // Normalize proposal items and compute composite objective value
    // Value = (priority_score * 1.0) + (social_impact_score * 0.5)
    const items = proposals.map(p => {
      const priority = p.priority_score !== undefined ? p.priority_score : (p.priorityScore || 50);
      const social = p.social_impact_score !== undefined ? p.social_impact_score : (p.socialImpactScore || 50);
      const cost = Math.max(Number(p.estimated_cost) || 0, 0);
      const value = priority + (social * 0.5);

      // Parse dependencies if any
      let deps = [];
      if (p.dependencies) {
        try {
          deps = typeof p.dependencies === 'string' ? JSON.parse(p.dependencies) : p.dependencies;
        } catch {
          deps = [];
        }
      }

      return {
        ...p,
        cost,
        value,
        deps,
        cat: (p.category || 'OTHER').toUpperCase()
      };
    });

    // 1. Exact Branch-and-Bound Knapsack Solver
    let bestSubset = [];
    let bestValue = -1;
    let bestCost = 0;

    // Sort items by value/cost ratio descending for effective search pruning
    items.sort((a, b) => {
      const ratioA = a.cost > 0 ? a.value / a.cost : a.value;
      const ratioB = b.cost > 0 ? b.value / b.cost : b.value;
      return ratioB - ratioA;
    });

    function isFeasible(currentItems, nextItem) {
      const nextCost = currentItems.reduce((s, it) => s + it.cost, 0) + nextItem.cost;
      if (nextCost > maxBudget) return false;

      // Check category caps
      const catLimit = categoryLimits.find(l => l.category.toUpperCase() === nextItem.cat);
      if (catLimit) {
        const currentCount = currentItems.filter(it => it.cat === nextItem.cat).length;
        if (currentCount >= catLimit.maxCount) return false;
      }

      return true;
    }

    const catalogIds = new Set(items.map(p => p.id));
    const catalogTitles = new Set(items.map(p => p.title));

    function checkDependencies(selectedList) {
      const selectedIds = new Set(selectedList.map(it => it.id));
      const selectedTitles = new Set(selectedList.map(it => it.title));
      for (const it of selectedList) {
        if (it.deps && it.deps.length > 0) {
          for (const dep of it.deps) {
            // Only enforce if dependency refers to another proposal in the catalog
            const isCatalogProposal = catalogIds.has(dep) || catalogTitles.has(dep);
            if (isCatalogProposal && !selectedIds.has(dep) && !selectedTitles.has(dep)) {
              return false;
            }
          }
        }
      }
      return true;
    }

    function search(index, currentItems, currentCost, currentValue) {
      // If valid leaf or branch, check against best
      if (checkDependencies(currentItems)) {
        if (currentValue > bestValue || (Math.abs(currentValue - bestValue) < 1e-6 && currentCost < bestCost)) {
          bestValue = currentValue;
          bestCost = currentCost;
          bestSubset = [...currentItems];
        }
      }

      if (index >= items.length) return;

      // Calculate upper bound of remaining items to prune suboptimal branches
      let remainingPotential = 0;
      for (let i = index; i < items.length; i++) {
        remainingPotential += items[i].value;
      }
      if (currentValue + remainingPotential <= bestValue) {
        return; // Prune branch: cannot beat best found
      }

      const item = items[index];

      // Branch 1: Include item if feasible
      if (isFeasible(currentItems, item)) {
        currentItems.push(item);
        search(index + 1, currentItems, currentCost + item.cost, currentValue + item.value);
        currentItems.pop();
      }

      // Branch 2: Exclude item
      search(index + 1, currentItems, currentCost, currentValue);
    }

    // Execute branch-and-bound search
    search(0, [], 0, 0);

    const selectedIds = new Set(bestSubset.map(p => p.id));
    const selectedProposals = bestSubset;
    const excludedProposals = [];
    const remainingBudget = maxBudget - bestCost;

    // 2. Derive auditable, deterministic exclusion reasons for unselected proposals
    for (const item of items) {
      if (!selectedIds.has(item.id)) {
        let reason = '';
        const catLimit = categoryLimits.find(l => l.category.toUpperCase() === item.cat);
        const currentCatCount = selectedProposals.filter(p => p.cat === item.cat).length;
        const unmetCatalogDeps = (item.deps || []).filter(d => (catalogIds.has(d) || catalogTitles.has(d)) && !selectedIds.has(d) && !selectedProposals.some(p => p.title === d));

        if (item.cost > maxBudget) {
          reason = `Cost (₹${(item.cost / 10000000).toFixed(2)} Cr) exceeds total authorized budget (₹${(maxBudget / 10000000).toFixed(2)} Cr)`;
        } else if (unmetCatalogDeps.length > 0) {
          reason = `Prerequisite dependencies not selected: ${unmetCatalogDeps.join(', ')}`;
        } else if (catLimit && currentCatCount >= catLimit.maxCount) {
          reason = `Category allocation cap reached for ${item.cat} (Maximum ${catLimit.maxCount} allowed)`;
        } else if (item.cost > remainingBudget) {
          reason = `Exceeds remaining available budget of ₹${(remainingBudget / 10000000).toFixed(2)} Cr (Requires ₹${(item.cost / 10000000).toFixed(2)} Cr)`;
        } else {
          reason = `Suboptimal trade-off: Optimal portfolio achieved higher cumulative value within the ₹${(maxBudget / 10000000).toFixed(2)} Cr envelope`;
        }

        excludedProposals.push({
          proposalId: item.id,
          proposalTitle: item.title,
          cost: item.cost,
          reason
        });
      }
    }

    const selectedWards = new Set(selectedProposals.map(p => p.ward_id || p.wardId).filter(Boolean));

    const totalPriorityScore = selectedProposals.reduce(
      (sum, p) => sum + (p.priority_score !== undefined ? p.priority_score : (p.priorityScore || 0)),
      0
    );
    const totalSocialImpactScore = selectedProposals.reduce(
      (sum, p) => sum + (p.social_impact_score !== undefined ? p.social_impact_score : (p.socialImpactScore || 0)),
      0
    );

    return {
      selectedProposals,
      excludedProposals,
      totalCost: bestCost,
      budget: maxBudget,
      remainingBudget,
      metrics: {
        algorithm: 'EXACT_01_KNAPSACK_BRANCH_AND_BOUND',
        totalCost: bestCost,
        remainingBudget,
        budgetUtilizationPercent: Math.round((bestCost / maxBudget) * 100),
        totalPriorityScore: Math.round(totalPriorityScore * 10) / 10,
        averagePriorityScore: selectedProposals.length > 0 ? Math.round((totalPriorityScore / selectedProposals.length) * 10) / 10 : 0,
        totalSocialImpactScore: Math.round(totalSocialImpactScore * 10) / 10,
        selectedCount: selectedProposals.length,
        excludedCount: excludedProposals.length,
        wardsCoveredCount: selectedWards.size,
        wardsCovered: Array.from(selectedWards)
      },
      constraints: {
        maxBudget,
        categoryLimits
      }
    };
  }
}

