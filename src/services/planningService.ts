import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:3000/api",
  headers: {
    "Content-type": "application/json",
  },
});

export interface NormalizedDemand {
  id: number;
  civic_input_id?: number;
  category: string;
  sub_category?: string;
  title: string;
  summary: string;
  demand_statement: string;
  problem_statement?: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  urgency: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  language: string;
  ward_id: string;
  lat: number;
  lng: number;
  confidence: number;
  affected_groups: string[];
  citizen_id: string;
  source: string;
  created_at: string;
}

export interface DemandTheme {
  id: number;
  name: string;
  summary: string;
  category: string;
  subCategory?: string;
  recurrenceStatus: "RECURRING" | "EMERGING" | "ISOLATED";
  demandCount: number;
  uniqueCitizenCount: number;
  coherenceScore: number;
  representativeDemandId?: number;
  representativeStatement?: string;
  firstObservedAt: string;
  lastObservedAt: string;
}

export interface DemandHotspot {
  id: number;
  wardId: string;
  centerLat: number;
  centerLng: number;
  radius: number;
  demandCount: number;
  uniqueCitizenCount: number;
  dominantCategory: string;
  intensity: number;
  recurrence: string;
  geographicConcentration: string;
  confidence: number;
  status: string;
  firstObservedAt: string;
  lastObservedAt: string;
}

export interface Dataset {
  id: number;
  name: string;
  description: string;
  category: string;
  source: string;
  publisher: string;
  dataset_version: string;
  record_count: number;
  is_demo: number;
  created_at: string;
}

export interface WardDemographics {
  wardNo: string;
  wardKey: string;
  zone: string;
  areaSqKm: number;
  population: number;
  malePopulation: number;
  femalePopulation: number;
  childrenPopulation: number;
  youthPopulation: number;
  slumPopulation: number;
  identifiedSlums: number;
  source: string;
  isOfficial: boolean;
}

export interface EvidenceRecord {
  id: number;
  evidenceType: "SUPPORTING" | "CONTRADICTING" | "NEUTRAL" | "INSUFFICIENT_DATA";
  dataSourceType?: string;
  verificationStatus?: string;
  dataset: string;
  record: string;
  metric: string;
  observedValue: string;
  comparisonValue: string;
  unit: string;
  relationship: string;
  confidence: number;
  source: string;
  explanation: string;
  isDemo: boolean;
}

export interface DevelopmentProposal {
  id: number;
  title: string;
  description: string;
  category: string;
  sub_category: string;
  ward_id: string;
  lat: number;
  lng: number;
  estimated_cost: number;
  estimated_timeline: string;
  beneficiaries: number;
  target_groups: string[];
  dependencies: string[];
  status: "UNDER_REVIEW" | "EVALUATED" | "APPROVED" | "REJECTED";
  priority_score: number;
  social_impact_score: number;
  economic_impact_score: number;
  economic_impact_level: string;
  created_at: string;
}

export interface PriorityFactor {
  label: string;
  rawValue: string | number;
  normalizedValue: number;
  weight: number;
  contribution: number;
  unit: string;
  isDataPresent?: boolean;
  explanation: string;
}

export interface PriorityAssessment {
  proposalId: number;
  totalScore: number;
  dataCompletenessRatio?: number;
  factors: Record<string, PriorityFactor>;
  weights: Record<string, number>;
  dataTrace?: Record<string, string>;
  explanation: {
    summary: string;
    topStrengths: string[];
    limitations: string[];
  };
  calculatedAt: string;
}

export interface ImpactScenario {
  name: string;
  beneficiaries: number;
  jobsCreated: number;
  description: string;
  economicBenefitLevel: string;
  riskFactors: string;
}

export interface ImpactAssessment {
  proposalId: number;
  socialImpactScore: number;
  economicImpactScore: number;
  economicImpactLevel: string;
  socialFactors: Record<string, any>;
  economicFactors: Record<string, any>;
  scenarios: {
    conservative: ImpactScenario;
    base: ImpactScenario;
    optimistic: ImpactScenario;
  };
  assumptions: string[];
  uncertainty: string;
  uncertaintyReasons: string[];
  confidence: number;
  calculatedAt: string;
}

export interface PortfolioMetrics {
  totalCost: number;
  remainingBudget: number;
  budgetUtilizationPercent: number;
  totalPriorityScore: number;
  averagePriorityScore: number;
  totalSocialImpactScore: number;
  selectedCount: number;
  excludedCount: number;
  wardsCoveredCount: number;
  wardsCovered: string[];
}

export interface ExcludedProposal {
  proposalId: number;
  proposalTitle: string;
  cost: number;
  reason: string;
}

export interface PortfolioOptimizationResult {
  selectedProposals: DevelopmentProposal[];
  excludedProposals: ExcludedProposal[];
  metrics: PortfolioMetrics;
  constraints: {
    maxBudget: number;
    categoryLimits: Array<{ category: string; maxCount: number }>;
  };
}

export interface DecisionRecord {
  id: number;
  portfolio_id?: number;
  approved_proposals: Array<{ id: number; title: string; cost: number; ward: string }>;
  human_overrides: Array<{ proposalId: number; action: "ADDED" | "REMOVED"; justification: string }>;
  justification: string;
  approved_by: string;
  total_cost: number;
  remaining_budget: number;
  approved_at: string;
}

export const planningApi = {
  getDemands: async (): Promise<NormalizedDemand[]> => {
    const res = await apiClient.get("/planning/demands");
    return res.data;
  },

  normalizeDemand: async (data: { text: string; ward?: string; lat?: number; lng?: number; citizenId?: string }): Promise<NormalizedDemand> => {
    const res = await apiClient.post("/planning/demands/normalize", data);
    return res.data;
  },

  getThemes: async (): Promise<DemandTheme[]> => {
    const res = await apiClient.get("/planning/themes");
    return res.data;
  },

  getHotspots: async (): Promise<DemandHotspot[]> => {
    const res = await apiClient.get("/planning/hotspots");
    return res.data;
  },

  getDatasets: async (): Promise<Dataset[]> => {
    const res = await apiClient.get("/planning/datasets");
    return res.data;
  },

  getDemographics: async (): Promise<WardDemographics[]> => {
    const res = await apiClient.get("/planning/demographics");
    return res.data;
  },

  getEvidence: async (proposalId: number): Promise<EvidenceRecord[]> => {
    const res = await apiClient.get(`/planning/evidence/${proposalId}`);
    return res.data;
  },

  getProposals: async (): Promise<DevelopmentProposal[]> => {
    const res = await apiClient.get("/planning/proposals");
    return res.data;
  },

  getProposal: async (id: number): Promise<DevelopmentProposal> => {
    const res = await apiClient.get(`/planning/proposals/${id}`);
    return res.data;
  },

  getPriorityAssessment: async (proposalId: number): Promise<PriorityAssessment> => {
    const res = await apiClient.get(`/planning/priority/${proposalId}`);
    return res.data;
  },

  getImpactAssessment: async (proposalId: number): Promise<ImpactAssessment> => {
    const res = await apiClient.get(`/planning/impact/${proposalId}`);
    return res.data;
  },

  optimizePortfolio: async (constraints: { maxBudget: number; categoryLimits?: Array<{ category: string; maxCount: number }> }): Promise<PortfolioOptimizationResult> => {
    const res = await apiClient.post("/planning/portfolio/optimize", constraints);
    return res.data;
  },

  getDecisions: async (): Promise<DecisionRecord[]> => {
    const res = await apiClient.get("/planning/decisions");
    return res.data;
  },

  approveDecision: async (data: {
    approvedProposalIds: number[];
    humanOverrides: Array<{ proposalId: number; action: "ADDED" | "REMOVED"; justification: string }>;
    justification: string;
    approvedBy: string;
    maxBudget: number;
  }): Promise<{ message: string; decisionRecord: DecisionRecord }> => {
    const res = await apiClient.post("/planning/decisions", data);
    return res.data;
  },

  verifyAadhaar: async (data: { fullName: string; dateOfBirth: string; fileBase64?: string }): Promise<{ isValid: boolean; derivedPassword?: string; message?: string; error?: string }> => {
    const res = await apiClient.post("/auth/aadhaar-verify", data);
    return res.data;
  },

  getGroundedAiContext: async (question: string): Promise<any> => {
    const res = await apiClient.post("/planning/ai-context", { question });
    return res.data;
  }
};
