import { getWardDemographics } from './bhubaneswarData.js';

export class ImpactEngine {
  /**
   * Deterministically evaluates Social & Economic Impact and creates 3 scenarios.
   * @param {Object} proposal
   * @param {Object} context
   */
  static evaluateImpact(proposal, context = {}) {
    const wardDemographics = getWardDemographics(proposal.ward_id || proposal.wardId);
    const baseBeneficiaries = proposal.beneficiaries || wardDemographics?.population || 20000;
    const targetGroups = proposal.target_groups
      ? (typeof proposal.target_groups === 'string' ? JSON.parse(proposal.target_groups) : proposal.target_groups)
      : [];
    const hasSlumContext = Boolean(wardDemographics?.slumPopulation && wardDemographics.slumPopulation > 0);

    // 1. Social Impact Factors (weights sum to 1.0)
    // Beneficiary reach (0.25)
    const normReach = Math.min(100, Math.max(20, Math.round((baseBeneficiaries / 25000) * 100)));
    const fReach = {
      label: 'Beneficiary Reach',
      rawValue: baseBeneficiaries,
      normalizedValue: normReach,
      weight: 0.25,
      contribution: Math.round(normReach * 0.25 * 10) / 10
    };

    // Accessibility improvement (0.20)
    const normAccessibility = 80;
    const fAccessibility = {
      label: 'Accessibility Improvement',
      rawValue: 'Moderate-to-High',
      normalizedValue: normAccessibility,
      weight: 0.20,
      contribution: Math.round(normAccessibility * 0.20 * 10) / 10
    };

    // Service coverage (0.20)
    const normCoverage = 75;
    const fCoverage = {
      label: 'Service Coverage',
      rawValue: 'Ward Catchment',
      normalizedValue: normCoverage,
      weight: 0.20,
      contribution: Math.round(normCoverage * 0.20 * 10) / 10
    };

    // Equity impact (0.15)
    const normEquity = Math.min(100, 40 + (targetGroups.length * 15) + (hasSlumContext ? 20 : 0));
    const fEquity = {
      label: 'Equity Impact',
      rawValue: `${targetGroups.length} target groups`,
      normalizedValue: normEquity,
      weight: 0.15,
      contribution: Math.round(normEquity * 0.15 * 10) / 10
    };

    // Quality of life enhancement (0.10)
    const normQoL = 85;
    const fQoL = {
      label: 'Quality of Life',
      rawValue: 'High',
      normalizedValue: normQoL,
      weight: 0.10,
      contribution: Math.round(normQoL * 0.10 * 10) / 10
    };

    // Vulnerable population benefit (0.10)
    const normVulnerable = hasSlumContext ? 90 : 60;
    const fVulnerable = {
      label: 'Vulnerable Population Benefit',
      rawValue: hasSlumContext ? `${wardDemographics.slumPopulation.toLocaleString()} slum population` : 'General Cohort',
      normalizedValue: normVulnerable,
      weight: 0.10,
      contribution: Math.round(normVulnerable * 0.10 * 10) / 10
    };

    const socialFactors = {
      beneficiaryReach: fReach,
      accessibilityImprovement: fAccessibility,
      serviceCoverage: fCoverage,
      equityImpact: fEquity,
      qualityOfLife: fQoL,
      vulnerablePopulationBenefit: fVulnerable
    };

    const socialScoreRaw = Object.values(socialFactors).reduce((sum, f) => sum + f.contribution, 0);
    const socialImpactScore = Math.min(100, Math.max(0, Math.round(socialScoreRaw * 10) / 10));

    // 2. Economic Impact Factors
    const cost = proposal.estimated_cost || 15000000;
    const directEmployment = Math.max(15, Math.round(cost / 400000)); // Estimated jobs created
    const normEmployment = Math.min(100, Math.round((directEmployment / 50) * 100));

    const economicFactors = {
      directBeneficiaryReach: {
        label: 'Direct Economic Reach',
        rawValue: baseBeneficiaries,
        normalizedValue: normReach,
        weight: 0.30,
        contribution: Math.round(normReach * 0.30 * 10) / 10
      },
      employmentPotential: {
        label: 'Employment Potential',
        rawValue: `~${directEmployment} direct/indirect jobs`,
        normalizedValue: normEmployment,
        weight: 0.35,
        contribution: Math.round(normEmployment * 0.35 * 10) / 10
      },
      serviceEfficiency: {
        label: 'Service & Commute Efficiency',
        rawValue: 'Estimated 20-30% transit or service delay reduction',
        normalizedValue: 75,
        weight: 0.35,
        contribution: Math.round(75 * 0.35 * 10) / 10
      }
    };

    const economicScoreRaw = Object.values(economicFactors).reduce((sum, f) => sum + f.contribution, 0);
    const economicImpactScore = Math.min(100, Math.max(0, Math.round(economicScoreRaw * 10) / 10));
    const economicImpactLevel = economicImpactScore >= 75 ? 'HIGH' : economicImpactScore >= 50 ? 'MEDIUM' : 'LOW';

    // 3. Three Scenarios: Conservative, Base, Optimistic
    const scenarios = {
      conservative: {
        name: 'CONSERVATIVE',
        beneficiaries: Math.round(baseBeneficiaries * 0.70),
        jobsCreated: Math.round(directEmployment * 0.65),
        description: `Conservative estimate focusing strictly on immediate direct catchment (~${Math.round(baseBeneficiaries * 0.70).toLocaleString()} residents).`,
        economicBenefitLevel: economicImpactLevel === 'HIGH' ? 'MEDIUM' : economicImpactLevel,
        riskFactors: 'Assumes seasonal construction delays and initial adoption frictions.'
      },
      base: {
        name: 'BASE',
        beneficiaries: baseBeneficiaries,
        jobsCreated: directEmployment,
        description: `Standard baseline estimate assuming standard municipal execution (~${baseBeneficiaries.toLocaleString()} residents).`,
        economicBenefitLevel: economicImpactLevel,
        riskFactors: 'Normal municipal procurement and utility realignments.'
      },
      optimistic: {
        name: 'OPTIMISTIC',
        beneficiaries: Math.round(baseBeneficiaries * 1.35),
        jobsCreated: Math.round(directEmployment * 1.40),
        description: `Optimistic projection including extended spillover across adjacent municipal wards (~${Math.round(baseBeneficiaries * 1.35).toLocaleString()} residents).`,
        economicBenefitLevel: 'HIGH',
        riskFactors: 'Assumes rapid cross-departmental coordination and accelerated execution.'
      }
    };

    // 4. Uncertainty & Confidence
    const uncertaintyReasons = [];
    let confidence = 0.75;
    if (!wardDemographics) {
      uncertaintyReasons.push('Precise census ward profile unavailable; projected from municipal cohort.');
      confidence -= 0.15;
    } else {
      confidence += 0.10;
    }
    uncertaintyReasons.push('Economic returns estimated from capital expenditure multiplier (no real-time micro-survey data).');

    confidence = Math.min(0.95, Math.max(0.40, Math.round(confidence * 100) / 100));
    const uncertainty = confidence >= 0.75 ? 'LOW' : confidence >= 0.55 ? 'MEDIUM' : 'HIGH';

    const assumptions = [
      `Active utility radius estimated at 3.0km - 5.0km for ${proposal.category}.`,
      `Baseline beneficiary cohort projected at ~${baseBeneficiaries.toLocaleString()} residents using official census ward figures.`,
      `Project timeline estimated at ${proposal.estimated_timeline || '10 months'} with standard municipal execution efficiency.`
    ];

    return {
      proposalId: proposal.id,
      socialImpactScore,
      economicImpactScore,
      economicImpactLevel,
      socialFactors,
      economicFactors,
      scenarios,
      assumptions,
      uncertainty,
      uncertaintyReasons,
      confidence,
      calculatedAt: new Date().toISOString()
    };
  }
}
