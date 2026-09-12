import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { 
  planningApi, 
  type DevelopmentProposal, 
  type NormalizedDemand, 
  type DemandTheme, 
  type DemandHotspot, 
  type EvidenceRecord, 
  type PortfolioOptimizationResult, 
  type DecisionRecord 
} from "@/services/planningService";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Headline, BodyText, Label } from "@/components/atoms/Typography";
import { Button } from "@/components/atoms/Button";
import { StatusChip } from "@/components/atoms/StatusChip";
import { cn } from "@/utils/utils";
import { 
  BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar 
} from "recharts";

type TabKey = 
  | "demands" 
  | "themes" 
  | "hotspots" 
  | "evidence" 
  | "proposals" 
  | "priority" 
  | "impact" 
  | "portfolio" 
  | "decision";

const TABS: Array<{ key: TabKey; label: string; icon: string }> = [
  { key: "demands", label: "Demand Intelligence", icon: "forum" },
  { key: "themes", label: "Themes & Recurrence", icon: "repeat" },
  { key: "hotspots", label: "Demand Hotspots", icon: "local_fire_department" },
  { key: "evidence", label: "Public Data & Evidence", icon: "verified" },
  { key: "proposals", label: "Proposals", icon: "assignment" },
  { key: "priority", label: "Priority Engine", icon: "leaderboard" },
  { key: "impact", label: "Impact Assessment", icon: "insights" },
  { key: "portfolio", label: "Portfolio Optimizer", icon: "account_balance_wallet" },
  { key: "decision", label: "Decision Studio", icon: "gavel" }
];

export function DevelopmentPlanning() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<TabKey>("proposals");
  const [selectedProposalId, setSelectedProposalId] = useState<number>(1);
  const [selectedScenario, setSelectedScenario] = useState<"conservative" | "base" | "optimistic">("base");
  
  // Portfolio constraint controls
  const [budgetCrores, setBudgetCrores] = useState<number>(5.0); // ₹5.0 Cr
  const [maxPerCategory, setMaxPerCategory] = useState<number>(2);

  // Authority Overrides state
  const [manualOverrides, setManualOverrides] = useState<Array<{ proposalId: number; action: "ADDED" | "REMOVED"; justification: string }>>([]);
  const [overrideModalProposal, setOverrideModalProposal] = useState<{ proposal: DevelopmentProposal; action: "ADDED" | "REMOVED" } | null>(null);
  const [overrideJustification, setOverrideJustification] = useState<string>("");
  const [overrideError, setOverrideError] = useState<string>("");

  // Queries
  const { data: proposals = [], isLoading: isLoadingProposals } = useQuery({
    queryKey: ["planning-proposals"],
    queryFn: planningApi.getProposals
  });

  const { data: demands = [], isLoading: isLoadingDemands } = useQuery({
    queryKey: ["planning-demands"],
    queryFn: planningApi.getDemands
  });

  const { data: themes = [] } = useQuery({
    queryKey: ["planning-themes"],
    queryFn: planningApi.getThemes
  });

  const { data: hotspots = [] } = useQuery({
    queryKey: ["planning-hotspots"],
    queryFn: planningApi.getHotspots
  });

  const { data: datasets = [] } = useQuery({
    queryKey: ["planning-datasets"],
    queryFn: planningApi.getDatasets
  });

  const { data: demographics = [] } = useQuery({
    queryKey: ["planning-demographics"],
    queryFn: planningApi.getDemographics
  });

  const { data: decisions = [] } = useQuery({
    queryKey: ["planning-decisions"],
    queryFn: planningApi.getDecisions
  });

  // Synchronize selectedProposalId with loaded proposals
  React.useEffect(() => {
    if (proposals.length > 0 && (!selectedProposalId || !proposals.some(p => p.id === selectedProposalId))) {
      setSelectedProposalId(proposals[0].id);
    }
  }, [proposals, selectedProposalId]);

  const selectedProposal = useMemo(() => {
    return proposals.find(p => p.id === selectedProposalId) || proposals[0];
  }, [proposals, selectedProposalId]);

  // Selected proposal's priority assessment
  const { data: priorityAssessment, isLoading: isLoadingPriority } = useQuery({
    queryKey: ["planning-priority", selectedProposal?.id],
    queryFn: () => selectedProposal ? planningApi.getPriorityAssessment(selectedProposal.id) : null,
    enabled: Boolean(selectedProposal)
  });

  // Selected proposal's impact assessment
  const { data: impactAssessment, isLoading: isLoadingImpact } = useQuery({
    queryKey: ["planning-impact", selectedProposal?.id],
    queryFn: () => selectedProposal ? planningApi.getImpactAssessment(selectedProposal.id) : null,
    enabled: Boolean(selectedProposal)
  });

  // Selected proposal's evidence
  const { data: evidenceRecords = [] } = useQuery({
    queryKey: ["planning-evidence", selectedProposal?.id],
    queryFn: () => selectedProposal ? planningApi.getEvidence(selectedProposal.id) : [],
    enabled: Boolean(selectedProposal)
  });

  // Portfolio Optimization query based on budget & category constraints
  const { data: portfolioResult, isLoading: isLoadingPortfolio, refetch: refetchPortfolio } = useQuery({
    queryKey: ["planning-portfolio-opt", budgetCrores, maxPerCategory],
    queryFn: () => planningApi.optimizePortfolio({
      maxBudget: budgetCrores * 10000000,
      categoryLimits: [
        { category: "DRAINAGE", maxCount: maxPerCategory },
        { category: "HEALTHCARE", maxCount: maxPerCategory },
        { category: "EDUCATION", maxCount: maxPerCategory },
        { category: "WATER", maxCount: maxPerCategory },
        { category: "ROADS", maxCount: maxPerCategory }
      ]
    })
  });

  // Computed Portfolio after human overrides
  const effectivePortfolio = useMemo(() => {
    if (!portfolioResult) return null;
    let currentSelected = [...portfolioResult.selectedProposals];

    manualOverrides.forEach(ov => {
      if (ov.action === "REMOVED") {
        currentSelected = currentSelected.filter(p => p.id !== ov.proposalId);
      } else if (ov.action === "ADDED") {
        const toAdd = proposals.find(p => p.id === ov.proposalId);
        if (toAdd && !currentSelected.some(p => p.id === toAdd.id)) {
          currentSelected.push(toAdd);
        }
      }
    });

    const totalCost = currentSelected.reduce((sum, p) => sum + (p.estimated_cost || 0), 0);
    const maxBudget = budgetCrores * 10000000;
    const remainingBudget = maxBudget - totalCost;

    return {
      selectedProposals: currentSelected,
      totalCost,
      remainingBudget,
      isBudgetExceeded: totalCost > maxBudget
    };
  }, [portfolioResult, manualOverrides, proposals, budgetCrores]);

  // Approval Mutation
  const approveMutation = useMutation({
    mutationFn: planningApi.approveDecision,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["planning-decisions"] });
      queryClient.invalidateQueries({ queryKey: ["planning-proposals"] });
      setManualOverrides([]);
      alert(`Decision Approved! ${data.message}`);
      setActiveTab("decision");
    },
    onError: (err: any) => {
      alert(`Approval Failed: ${err.response?.data?.error || err.message}`);
    }
  });

  const handleApplyOverride = () => {
    if (!overrideModalProposal) return;
    if (overrideJustification.trim().length < 10) {
      setOverrideError("Official justification must be at least 10 characters long.");
      return;
    }

    setManualOverrides(prev => [
      ...prev.filter(o => o.proposalId !== overrideModalProposal.proposal.id),
      {
        proposalId: overrideModalProposal.proposal.id,
        action: overrideModalProposal.action,
        justification: overrideJustification.trim()
      }
    ]);

    setOverrideModalProposal(null);
    setOverrideJustification("");
    setOverrideError("");
  };

  const handleExecuteApproval = () => {
    if (!effectivePortfolio) return;
    if (effectivePortfolio.isBudgetExceeded) {
      alert(`Cannot approve portfolio: Total cost (₹${(effectivePortfolio.totalCost / 10000000).toFixed(2)} Cr) exceeds authorized budget limit of ₹${budgetCrores.toFixed(2)} Cr.`);
      return;
    }

    const justification = manualOverrides.length > 0
      ? `Authority approved portfolio with ${manualOverrides.length} strategic intervention overrides: ${manualOverrides.map(o => o.justification).join("; ")}`
      : `Standard optimal constituency portfolio approved within ₹${budgetCrores} Cr allocation constraint.`;

    approveMutation.mutate({
      approvedProposalIds: effectivePortfolio.selectedProposals.map(p => p.id),
      humanOverrides: manualOverrides,
      justification,
      approvedBy: "BMC Planning Director / Ward Authority",
      maxBudget: budgetCrores * 10000000
    });
  };

  return (
    <div className="max-w-[1600px] mx-auto w-full pt-4 pb-24 space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-foreground/10 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase bg-primary/20 text-primary border border-primary/30">
              CONSTITUENCY PLANNING ENGINE
            </span>
            <span className="text-xs text-on-surface-variant font-medium">Bhubaneswar Open Data Fusion</span>
          </div>
          <Headline level={1} className="text-2xl md:text-3xl text-primary font-bold">
            Constituency Development Planning Studio
          </Headline>
          <BodyText className="text-on-surface-variant text-sm mt-0.5">
            People's Priorities: Citizen Demand Intelligence • Explainable Priority Engine • Constraint-Aware Portfolio
          </BodyText>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => navigate("/map")}
            className="flex items-center gap-2 border-foreground/15 text-xs font-semibold"
          >
            <span className="material-symbols-outlined text-base text-primary">map</span>
            Constituency Map View
          </Button>
          <Button 
            onClick={() => navigate("/ai")}
            className="flex items-center gap-2 bg-gradient-to-r from-primary to-secondary text-on-primary text-xs font-bold shadow-lg shadow-primary/20"
          >
            <span className="material-symbols-outlined text-base">auto_awesome</span>
            Ask AI Assistant
          </Button>
        </div>
      </div>

      {/* KPI Highlight Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <GlassPanel className="p-4 rounded-2xl border border-foreground/5 flex flex-col justify-between">
          <Label className="text-on-surface-variant text-xs">Normalized Demands</Label>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold text-foreground">{demands.length || 5}</span>
            <span className="text-[11px] text-primary font-semibold">100% Normalized</span>
          </div>
        </GlassPanel>

        <GlassPanel className="p-4 rounded-2xl border border-foreground/5 flex flex-col justify-between">
          <Label className="text-on-surface-variant text-xs">Recurring Themes</Label>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold text-foreground">{themes.length || 3}</span>
            <span className="text-[11px] text-orange-400 font-semibold">{themes.filter(t => t.recurrenceStatus === "RECURRING").length} Active Clusters</span>
          </div>
        </GlassPanel>

        <GlassPanel className="p-4 rounded-2xl border border-foreground/5 flex flex-col justify-between">
          <Label className="text-on-surface-variant text-xs">Development Proposals</Label>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold text-foreground">{proposals.length || 8}</span>
            <span className="text-[11px] text-green-400 font-semibold">Evaluated</span>
          </div>
        </GlassPanel>

        <GlassPanel className="p-4 rounded-2xl border border-foreground/5 flex flex-col justify-between">
          <Label className="text-on-surface-variant text-xs">Authorized Budget</Label>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold text-primary">₹{budgetCrores.toFixed(1)} Cr</span>
            <span className="text-[11px] text-on-surface-variant font-medium">Bhubaneswar Fund</span>
          </div>
        </GlassPanel>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar border-b border-foreground/10 pb-2">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all",
              activeTab === tab.key 
                ? "bg-primary text-on-primary shadow-md shadow-primary/20" 
                : "text-on-surface-variant hover:text-foreground hover:bg-foreground/5"
            )}
          >
            <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: DEMAND INTELLIGENCE */}
      {activeTab === "demands" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <Headline level={3}>Normalized Citizen Demands</Headline>
              <BodyText className="text-xs text-on-surface-variant">
                Raw citizen voice processed into structured development demands with intent fidelity and clear confidence scoring.
              </BodyText>
            </div>
            <span className="text-xs font-medium text-on-surface-variant bg-foreground/5 px-3 py-1.5 rounded-lg">
              {demands.length} Submissions Processed
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {demands.map(demand => (
              <GlassPanel key={demand.id} className="p-5 rounded-2xl border border-foreground/10 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                      {demand.category} • {demand.sub_category || "General"}
                    </span>
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                      demand.severity === "CRITICAL" ? "bg-error/20 text-error" :
                      demand.severity === "HIGH" ? "bg-orange-500/20 text-orange-400" :
                      "bg-foreground/10 text-on-surface-variant"
                    )}>
                      {demand.severity} SEVERITY
                    </span>
                  </div>

                  <Headline level={4} className="text-base text-foreground leading-snug">
                    {demand.title}
                  </Headline>
                  
                  <div className="bg-foreground/5 p-3 rounded-xl border border-foreground/5">
                    <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider mb-1">Raw Citizen Voice</p>
                    <p className="text-xs italic text-on-surface font-medium">"{demand.summary}"</p>
                  </div>

                  <div>
                    <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider mb-1">Normalized Demand Statement</p>
                    <p className="text-xs text-on-surface-variant leading-relaxed">{demand.demand_statement}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-foreground/5 flex items-center justify-between text-[11px] text-on-surface-variant">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-primary">location_on</span>
                    <span className="font-semibold text-foreground">{demand.ward_id}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-green-400">verified</span>
                    <span>Confidence: {(demand.confidence * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </GlassPanel>
            ))}
          </div>
        </motion.div>
      )}

      {/* TAB 2: DEMAND THEMES & RECURRENCE */}
      {activeTab === "themes" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div>
            <Headline level={3}>Demand Themes & Recurrence Intelligence</Headline>
            <BodyText className="text-xs text-on-surface-variant">
              Systemic aggregation identifying recurring patterns, community coherence, and geographic spread beyond isolated complaints.
            </BodyText>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {themes.map(theme => (
              <GlassPanel key={theme.id} className="p-6 rounded-3xl border border-foreground/10 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className={cn(
                      "px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider",
                      theme.recurrenceStatus === "RECURRING" ? "bg-error/20 text-error border border-error/30 animate-pulse" :
                      theme.recurrenceStatus === "EMERGING" ? "bg-orange-500/20 text-orange-400 border border-orange-500/30" :
                      "bg-foreground/10 text-on-surface-variant"
                    )}>
                      {theme.recurrenceStatus}
                    </span>
                    <span className="text-xs font-semibold text-primary">{theme.category}</span>
                  </div>

                  <Headline level={4} className="text-base text-foreground leading-snug">{theme.name}</Headline>
                  <BodyText className="text-xs text-on-surface-variant">{theme.summary}</BodyText>

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div className="bg-foreground/5 p-3 rounded-xl">
                      <Label className="text-[10px] text-on-surface-variant uppercase">Submissions</Label>
                      <p className="text-lg font-bold text-foreground mt-1">{theme.demandCount}</p>
                    </div>
                    <div className="bg-foreground/5 p-3 rounded-xl">
                      <Label className="text-[10px] text-on-surface-variant uppercase">Unique Citizens</Label>
                      <p className="text-lg font-bold text-foreground mt-1">{theme.uniqueCitizenCount}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-foreground/5 flex items-center justify-between text-xs">
                  <span className="text-on-surface-variant">Theme Coherence</span>
                  <span className="font-bold text-primary">{(theme.coherenceScore * 100).toFixed(0)}%</span>
                </div>
              </GlassPanel>
            ))}
          </div>
        </motion.div>
      )}

      {/* TAB 3: DEMAND HOTSPOTS */}
      {activeTab === "hotspots" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <Headline level={3}>Ward-level Demand Hotspot Analysis</Headline>
              <BodyText className="text-xs text-on-surface-variant">
                Ward-aggregated demand concentrations derived from normalized citizen submissions. Intensity reflects community submission volume and verified unique citizen reach across Bhubaneswar wards.
              </BodyText>
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate("/map")} 
              className="text-xs flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm text-primary">layers</span>
              View on Map
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotspots.map(hotspot => (
              <GlassPanel key={hotspot.id} className="p-6 rounded-3xl border border-foreground/10 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-orange-400">local_fire_department</span>
                    <span className="font-bold text-foreground text-sm">{hotspot.wardId}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500/20 text-orange-400">
                    INTENSITY: {hotspot.intensity.toFixed(1)}
                  </span>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold text-primary">{hotspot.dominantCategory} Dominant Hotspot</p>
                  <p className="text-xs text-on-surface-variant">
                    Spatial concentration calculated across {hotspot.demandCount} citizen demand submissions from {hotspot.uniqueCitizenCount} distinct residents.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-foreground/5 p-3 rounded-2xl text-center">
                  <div>
                    <Label className="text-[9px] text-on-surface-variant block">Demands</Label>
                    <span className="text-sm font-bold text-foreground">{hotspot.demandCount}</span>
                  </div>
                  <div>
                    <Label className="text-[9px] text-on-surface-variant block">Citizens</Label>
                    <span className="text-sm font-bold text-foreground">{hotspot.uniqueCitizenCount}</span>
                  </div>
                  <div>
                    <Label className="text-[9px] text-on-surface-variant block">Radius</Label>
                    <span className="text-sm font-bold text-foreground">{hotspot.radius}m</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[11px] text-on-surface-variant pt-2 border-t border-foreground/5">
                  <span>Recurrence: <strong className="text-foreground">{hotspot.recurrence}</strong></span>
                  <span>Spread: <strong className="text-foreground">{hotspot.geographicConcentration}</strong></span>
                </div>
              </GlassPanel>
            ))}
          </div>
        </motion.div>
      )}

      {/* TAB 4: PUBLIC DATA & EVIDENCE */}
      {activeTab === "evidence" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div>
            <Headline level={3}>Public Data Fusion & Evidence Layer</Headline>
            <BodyText className="text-xs text-on-surface-variant">
              Reconciling citizen perception with documented municipal census data, slum registries, and OpenStreetMap infrastructure metrics.
            </BodyText>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {datasets.map(ds => (
              <GlassPanel key={ds.id} className="p-5 rounded-2xl border border-foreground/10 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                    {ds.category}
                  </span>
                  <span className="text-[10px] text-green-400 font-semibold">OFFICIAL SOURCE</span>
                </div>
                <Headline level={4} className="text-sm font-bold text-foreground">{ds.name}</Headline>
                <BodyText className="text-xs text-on-surface-variant leading-relaxed">{ds.description}</BodyText>
                <div className="pt-2 border-t border-foreground/5 text-[10px] text-on-surface-variant flex justify-between">
                  <span>Publisher: {ds.publisher}</span>
                  <span>Records: {ds.record_count}</span>
                </div>
              </GlassPanel>
            ))}
          </div>

          {/* Proposal Ground-Truth Evidence Chain */}
          <div className="pt-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Headline level={4}>Proposal-Specific Ground Truth Evidence Chain</Headline>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-500/20 text-green-400 border border-green-500/30">
                    ZERO FABRICATED BASELINES
                  </span>
                </div>
                <BodyText className="text-xs text-on-surface-variant">
                  Live evidence records traceable to real SQLite rows, Census 2011 records, BMC slum registries, and OpenStreetMap amenities.
                </BodyText>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-on-surface-variant whitespace-nowrap">Proposal:</span>
                <select 
                  value={selectedProposalId} 
                  onChange={(e) => setSelectedProposalId(Number(e.target.value))}
                  className="bg-surface-container border border-foreground/10 rounded-xl px-3 py-1.5 text-xs font-semibold text-foreground outline-none max-w-[280px] truncate"
                >
                  {proposals.map(p => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>
            </div>

            {evidenceRecords.length === 0 ? (
              <div className="p-8 text-center text-xs text-on-surface-variant bg-foreground/5 rounded-2xl border border-foreground/5">
                No evidence records linked to this proposal.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {evidenceRecords.map((ev: EvidenceRecord) => {
                  const badgeStyle = 
                    ev.dataSourceType === "OFFICIAL_CENSUS_RECORD" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" :
                    ev.dataSourceType === "OFFICIAL_SLUM_REGISTRY" ? "bg-amber-500/20 text-amber-400 border-amber-500/30" :
                    ev.dataSourceType === "OPENSTREETMAP_GIS" ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/30" :
                    ev.dataSourceType === "CITIZEN_STREAM" ? "bg-sky-500/20 text-sky-400 border-sky-500/30" :
                    "bg-rose-500/20 text-rose-400 border-rose-500/30";

                  const badgeIcon =
                    ev.dataSourceType === "OFFICIAL_CENSUS_RECORD" ? "analytics" :
                    ev.dataSourceType === "OFFICIAL_SLUM_REGISTRY" ? "holiday_village" :
                    ev.dataSourceType === "OPENSTREETMAP_GIS" ? "map" :
                    ev.dataSourceType === "CITIZEN_STREAM" ? "people" :
                    "pending";

                  return (
                    <GlassPanel key={ev.id} className="p-5 rounded-2xl border border-foreground/10 space-y-3 flex flex-col justify-between">
                      <div className="space-y-2.5">
                        <div className="flex flex-wrap items-center justify-between gap-1">
                          <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1", badgeStyle)}>
                            <span className="material-symbols-outlined text-xs">{badgeIcon}</span>
                            {ev.dataSourceType || "DATA_SOURCE"}
                          </span>
                          <span className={cn(
                            "text-[10px] font-semibold px-1.5 py-0.5 rounded",
                            ev.evidenceType === "INSUFFICIENT_DATA" ? "text-rose-400 bg-rose-500/10" : "text-green-400 bg-green-500/10"
                          )}>
                            {ev.verificationStatus || ev.evidenceType}
                          </span>
                        </div>

                        <div>
                          <p className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">{ev.metric}</p>
                          <p className="text-sm font-bold text-foreground mt-0.5">{ev.observedValue}</p>
                        </div>

                        <div className="bg-foreground/5 p-2.5 rounded-xl space-y-1 text-[11px]">
                          <span className="text-[10px] text-on-surface-variant block">Comparison Reference:</span>
                          <p className="font-semibold text-foreground">{ev.comparisonValue}</p>
                        </div>

                        <p className="text-xs text-on-surface-variant leading-relaxed">{ev.explanation}</p>
                      </div>

                      <div className="pt-2 border-t border-foreground/5 text-[10px] text-on-surface-variant/80 flex justify-between items-center">
                        <span className="truncate max-w-[180px]" title={ev.source}>Source: {ev.source}</span>
                        <span className={cn("font-bold font-mono", ev.confidence > 0 ? "text-primary" : "text-rose-400")}>
                          {ev.confidence > 0 ? `${(ev.confidence * 100).toFixed(0)}% Conf.` : "0% (INSUFFICIENT_DATA)"}
                        </span>
                      </div>
                    </GlassPanel>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-6">
            <Headline level={4} className="mb-3">Bhubaneswar Ward Demographic Profiles (Census & Slum Survey)</Headline>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-foreground/10 text-on-surface-variant uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">Ward</th>
                    <th className="py-3 px-4">Zone</th>
                    <th className="py-3 px-4">Census Population</th>
                    <th className="py-3 px-4">Slum Population</th>
                    <th className="py-3 px-4">Identified Slums</th>
                    <th className="py-3 px-4">Area (sq km)</th>
                    <th className="py-3 px-4">Data Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-foreground/5">
                  {demographics.slice(0, 10).map((w, idx) => (
                    <tr key={idx} className="hover:bg-foreground/5 transition-colors">
                      <td className="py-3 px-4 font-bold text-foreground">{w.wardKey}</td>
                      <td className="py-3 px-4 text-on-surface-variant">{w.zone}</td>
                      <td className="py-3 px-4 font-semibold text-foreground">{w.population?.toLocaleString() || "—"}</td>
                      <td className="py-3 px-4 text-orange-400 font-semibold">{w.slumPopulation > 0 ? w.slumPopulation.toLocaleString() : "None Documented"}</td>
                      <td className="py-3 px-4">{w.identifiedSlums || 0}</td>
                      <td className="py-3 px-4 text-on-surface-variant">{w.areaSqKm ? w.areaSqKm.toFixed(3) : "—"}</td>
                      <td className="py-3 px-4 text-on-surface-variant italic text-[11px]">{w.source}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB 5: DEVELOPMENT PROPOSALS */}
      {activeTab === "proposals" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <Headline level={3}>Constituency Development Proposals</Headline>
              <BodyText className="text-xs text-on-surface-variant">
                Synthesized projects addressing citizen demands and infrastructure evidence across Bhubaneswar wards.
              </BodyText>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {proposals.map(prop => (
              <GlassPanel 
                key={prop.id} 
                onClick={() => setSelectedProposalId(prop.id)}
                className={cn(
                  "p-6 rounded-3xl cursor-pointer border transition-all relative overflow-hidden flex flex-col justify-between space-y-4",
                  selectedProposalId === prop.id 
                    ? "border-primary shadow-[0_0_30px_rgba(192,193,255,0.15)] bg-surface-container-high/80" 
                    : "border-foreground/10 hover:border-foreground/25 bg-surface-container-low/60"
                )}
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                      {prop.category} • {prop.ward_id}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-primary">Score: {prop.priority_score?.toFixed(1)}</span>
                      <StatusChip status={prop.status} variant={prop.status === "APPROVED" ? "success" : "primary"} />
                    </div>
                  </div>

                  <Headline level={4} className="text-base text-foreground leading-snug">{prop.title}</Headline>
                  <BodyText className="text-xs text-on-surface-variant leading-relaxed line-clamp-3">{prop.description}</BodyText>

                  <div className="grid grid-cols-3 gap-2 bg-foreground/5 p-3 rounded-2xl text-center">
                    <div>
                      <Label className="text-[9px] text-on-surface-variant block">Estimated Cost</Label>
                      <span className="text-xs font-bold text-primary">₹{(prop.estimated_cost / 10000000).toFixed(2)} Cr</span>
                    </div>
                    <div>
                      <Label className="text-[9px] text-on-surface-variant block">Timeline</Label>
                      <span className="text-xs font-bold text-foreground">{prop.estimated_timeline}</span>
                    </div>
                    <div>
                      <Label className="text-[9px] text-on-surface-variant block">Beneficiaries</Label>
                      <span className="text-xs font-bold text-foreground">~{prop.beneficiaries?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-foreground/5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setSelectedProposalId(prop.id); setActiveTab("priority"); }}
                      className="text-primary font-bold hover:underline"
                    >
                      Inspect Priority Score →
                    </button>
                    <span className="text-foreground/20">|</span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setSelectedProposalId(prop.id); setActiveTab("impact"); }}
                      className="text-secondary font-bold hover:underline"
                    >
                      Impact Assessment →
                    </button>
                  </div>
                  <span className="text-[11px] text-on-surface-variant">Social: {prop.social_impact_score?.toFixed(0)}/100</span>
                </div>
              </GlassPanel>
            ))}
          </div>
        </motion.div>
      )}

      {/* TAB 6: EXPLAINABLE PRIORITY ENGINE */}
      {activeTab === "priority" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-primary/20 text-primary">
                  DETERMINISTIC 11-FACTOR SCORING ENGINE
                </span>
                <span className="text-xs text-on-surface-variant">Reproducible Math • Zero Hallucinations</span>
                {priorityAssessment?.dataCompletenessRatio !== undefined && (
                  <span className={cn(
                    "px-2.5 py-0.5 rounded text-[10px] font-bold uppercase border",
                    priorityAssessment.dataCompletenessRatio >= 80 
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" 
                      : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                  )}>
                    DATA COMPLETENESS: {priorityAssessment.dataCompletenessRatio}%
                  </span>
                )}
              </div>
              <Headline level={3}>{selectedProposal?.title}</Headline>
            </div>

            <div className="flex items-center gap-3">
              <select 
                value={selectedProposalId} 
                onChange={(e) => setSelectedProposalId(Number(e.target.value))}
                className="bg-surface-container border border-foreground/10 rounded-xl px-4 py-2 text-xs font-semibold text-foreground outline-none"
              >
                {proposals.map(p => (
                  <option key={p.id} value={p.id}>{p.title.substring(0, 50)}...</option>
                ))}
              </select>
            </div>
          </div>

          {isLoadingPriority || !priorityAssessment ? (
            <div className="p-12 text-center text-on-surface-variant">Calculating deterministic priority factors...</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Score Breakdown Card */}
              <div className="lg:col-span-4 space-y-6">
                <GlassPanel className="p-8 rounded-3xl border border-primary/30 flex flex-col items-center text-center relative overflow-hidden bg-gradient-to-b from-primary/10 to-transparent shadow-xl">
                  <Label className="text-xs font-bold uppercase tracking-widest text-primary">TOTAL PRIORITY SCORE</Label>
                  <div className="text-6xl font-black text-foreground my-4 tracking-tight">
                    {priorityAssessment.totalScore}
                    <span className="text-2xl text-on-surface-variant font-normal">/100</span>
                  </div>
                  <div className="w-full bg-foreground/10 h-2.5 rounded-full overflow-hidden mb-4">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-1000" 
                      style={{ width: `${priorityAssessment.totalScore}%` }}
                    />
                  </div>
                  <p className="text-xs text-on-surface-variant italic leading-relaxed">
                    {priorityAssessment.explanation.summary}
                  </p>
                </GlassPanel>

                <GlassPanel className="p-6 rounded-3xl border border-foreground/10 space-y-4">
                  <Headline level={4} className="text-sm font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-green-400 text-base">thumb_up</span>
                    Key Score Drivers
                  </Headline>
                  <ul className="space-y-2 text-xs">
                    {priorityAssessment.explanation.topStrengths.map((str, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-on-surface leading-snug bg-foreground/5 p-2.5 rounded-xl">
                        <span className="material-symbols-outlined text-green-400 text-sm mt-0.5">check_circle</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>

                  <Headline level={4} className="text-sm font-bold flex items-center gap-2 pt-2">
                    <span className="material-symbols-outlined text-orange-400 text-base">info</span>
                    Score Limitations
                  </Headline>
                  <ul className="space-y-2 text-xs">
                    {priorityAssessment.explanation.limitations.map((lim, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-on-surface-variant leading-snug bg-foreground/5 p-2.5 rounded-xl">
                        <span className="material-symbols-outlined text-orange-400 text-sm mt-0.5">warning</span>
                        <span>{lim}</span>
                      </li>
                    ))}
                  </ul>
                </GlassPanel>
              </div>

              {/* 11 Factor Bars Table */}
              <div className="lg:col-span-8">
                <GlassPanel className="p-6 rounded-3xl border border-foreground/10 space-y-4">
                  <div className="flex justify-between items-center border-b border-foreground/10 pb-4">
                    <Headline level={4}>11 Transparent Factor Contributions</Headline>
                    <span className="text-[11px] text-on-surface-variant">Sum of contributions = Total Score</span>
                  </div>

                  <div className="space-y-3">
                    {Object.entries(priorityAssessment.factors).map(([key, f]: [string, any]) => (
                      <div key={key} className="bg-foreground/5 p-3.5 rounded-2xl border border-foreground/5 space-y-2 hover:bg-foreground/8 transition-colors">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-foreground">{f.label}</span>
                            <span className="text-[10px] text-on-surface-variant bg-foreground/5 px-2 py-0.5 rounded">
                              Weight: {(f.weight * 100).toFixed(0)}%
                            </span>
                            {f.isDataPresent === false && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                                INSUFFICIENT_DATA (0 pts)
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[11px] text-on-surface-variant font-mono">Norm: {f.normalizedValue}/100</span>
                            <span className="text-xs font-bold text-primary font-mono">+{f.contribution.toFixed(1)} pts</span>
                          </div>
                        </div>

                        <div className="w-full bg-foreground/10 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full transition-all duration-700" 
                            style={{ width: `${f.normalizedValue}%` }}
                          />
                        </div>

                        <p className="text-[11px] text-on-surface-variant">{f.explanation}</p>

                        {priorityAssessment.dataTrace?.[key] && (
                          <div className="text-[10px] text-on-surface-variant/80 font-mono bg-surface-container/60 px-2.5 py-1 rounded-lg flex items-center gap-1.5 border border-foreground/5">
                            <span className="material-symbols-outlined text-xs text-primary/70">database</span>
                            <span className="truncate">Data Trace: {priorityAssessment.dataTrace[key]}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </GlassPanel>
              </div>

            </div>
          )}
        </motion.div>
      )}

      {/* TAB 7: IMPACT ASSESSMENT */}
      {activeTab === "impact" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <Headline level={3}>Social & Economic Impact Assessment</Headline>
              <BodyText className="text-xs text-on-surface-variant">
                Deterministic multi-criteria valuation across Conservative, Base, and Optimistic scenarios with declared assumptions.
              </BodyText>
            </div>

            <select 
              value={selectedProposalId} 
              onChange={(e) => setSelectedProposalId(Number(e.target.value))}
              className="bg-surface-container border border-foreground/10 rounded-xl px-4 py-2 text-xs font-semibold text-foreground outline-none"
            >
              {proposals.map(p => (
                <option key={p.id} value={p.id}>{p.title.substring(0, 50)}...</option>
              ))}
            </select>
          </div>

          {isLoadingImpact || !impactAssessment ? (
            <div className="p-12 text-center text-on-surface-variant">Calculating social and economic scenarios...</div>
          ) : (
            <div className="space-y-6">
              
              {/* Scenario Toggle Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {(["conservative", "base", "optimistic"] as const).map(scenKey => {
                  const scen = impactAssessment.scenarios[scenKey];
                  const isSelected = selectedScenario === scenKey;

                  return (
                    <GlassPanel 
                      key={scenKey} 
                      onClick={() => setSelectedScenario(scenKey)}
                      className={cn(
                        "p-6 rounded-3xl cursor-pointer border transition-all space-y-4",
                        isSelected 
                          ? "border-primary shadow-[0_0_30px_rgba(192,193,255,0.2)] bg-surface-container-high/90" 
                          : "border-foreground/10 hover:border-foreground/20 bg-surface-container-low/60"
                      )}
                    >
                      <div className="flex justify-between items-center">
                        <span className={cn(
                          "px-2.5 py-0.5 rounded text-[10px] font-bold uppercase",
                          scenKey === "conservative" ? "bg-foreground/10 text-on-surface-variant" :
                          scenKey === "base" ? "bg-primary/20 text-primary" : "bg-green-500/20 text-green-400"
                        )}>
                          {scen.name} SCENARIO
                        </span>
                        {isSelected && <span className="material-symbols-outlined text-primary text-base">check_circle</span>}
                      </div>

                      <div>
                        <Label className="text-xs text-on-surface-variant">Projected Beneficiaries</Label>
                        <p className="text-2xl font-bold text-foreground mt-1">~{scen.beneficiaries.toLocaleString()}</p>
                      </div>

                      <div className="bg-foreground/5 p-3 rounded-2xl space-y-1">
                        <p className="text-[10px] text-on-surface-variant uppercase font-semibold">Jobs Created</p>
                        <p className="text-sm font-bold text-foreground">~{scen.jobsCreated} Employment Opportunities</p>
                      </div>

                      <p className="text-xs text-on-surface-variant leading-relaxed">{scen.description}</p>
                    </GlassPanel>
                  );
                })}
              </div>

              {/* Assumptions & Uncertainty Statement */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <GlassPanel className="p-6 rounded-3xl border border-foreground/10 space-y-4">
                  <Headline level={4} className="text-sm font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-base">rule</span>
                    Declared Assumptions (Truthfulness Standard)
                  </Headline>
                  <ul className="space-y-2 text-xs text-on-surface-variant">
                    {impactAssessment.assumptions.map((assump, idx) => (
                      <li key={idx} className="flex items-start gap-2 bg-foreground/5 p-3 rounded-xl">
                        <span className="text-primary font-bold">•</span>
                        <span>{assump}</span>
                      </li>
                    ))}
                  </ul>
                </GlassPanel>

                <GlassPanel className="p-6 rounded-3xl border border-foreground/10 space-y-4">
                  <div className="flex justify-between items-center">
                    <Headline level={4} className="text-sm font-bold flex items-center gap-2">
                      <span className="material-symbols-outlined text-orange-400 text-base">psychology_alt</span>
                      Uncertainty & Evidence Confidence
                    </Headline>
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-orange-500/20 text-orange-400">
                      {impactAssessment.uncertainty} UNCERTAINTY
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs bg-foreground/5 p-3 rounded-xl">
                    <span className="text-on-surface-variant">Evaluation Confidence:</span>
                    <span className="font-bold text-primary">{(impactAssessment.confidence * 100).toFixed(0)}%</span>
                  </div>

                  <ul className="space-y-2 text-xs text-on-surface-variant">
                    {impactAssessment.uncertaintyReasons.map((reason, idx) => (
                      <li key={idx} className="flex items-start gap-2 bg-foreground/5 p-3 rounded-xl">
                        <span className="material-symbols-outlined text-orange-400 text-sm mt-0.5">info</span>
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </GlassPanel>
              </div>

            </div>
          )}
        </motion.div>
      )}

      {/* TAB 8: CONSTRAINT-AWARE PORTFOLIO OPTIMIZER */}
      {activeTab === "portfolio" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <Headline level={3}>Constraint-Aware Portfolio Optimizer</Headline>
              <BodyText className="text-xs text-on-surface-variant">
                Exact 0/1 Knapsack Branch-and-Bound algorithm selecting the mathematically optimal proposal portfolio maximizing composite citizen value within budgetary, category, and statutory clearance constraints.
              </BodyText>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-xs text-on-surface-variant">Budget:</span>
              <div className="flex items-center gap-1.5 bg-surface-container border border-foreground/10 px-3 py-1.5 rounded-xl">
                <span className="text-xs font-bold text-primary">₹</span>
                <input 
                  type="number" 
                  step="0.5"
                  min="1"
                  max="20"
                  value={budgetCrores} 
                  onChange={(e) => setBudgetCrores(Number(e.target.value))}
                  className="bg-transparent text-xs font-bold text-foreground w-12 outline-none"
                />
                <span className="text-xs text-on-surface-variant">Cr</span>
              </div>
            </div>
          </div>

          {isLoadingPortfolio || !portfolioResult ? (
            <div className="p-12 text-center text-on-surface-variant">Running portfolio optimization algorithms...</div>
          ) : (
            <div className="space-y-6">
              
              {/* Metrics Summary Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                <GlassPanel className="p-4 rounded-2xl border border-foreground/10">
                  <Label className="text-[10px] text-on-surface-variant">Allocated Cost</Label>
                  <p className="text-lg font-bold text-primary mt-1">₹{(portfolioResult.metrics.totalCost / 10000000).toFixed(2)} Cr</p>
                  <span className="text-[10px] text-on-surface-variant">of ₹{budgetCrores.toFixed(1)} Cr Budget</span>
                </GlassPanel>

                <GlassPanel className="p-4 rounded-2xl border border-foreground/10">
                  <Label className="text-[10px] text-on-surface-variant">Remaining Budget</Label>
                  <p className="text-lg font-bold text-green-400 mt-1">₹{(portfolioResult.metrics.remainingBudget / 10000000).toFixed(2)} Cr</p>
                  <span className="text-[10px] text-on-surface-variant">{100 - portfolioResult.metrics.budgetUtilizationPercent}% unallocated</span>
                </GlassPanel>

                <GlassPanel className="p-4 rounded-2xl border border-foreground/10">
                  <Label className="text-[10px] text-on-surface-variant">Proposals Selected</Label>
                  <p className="text-lg font-bold text-foreground mt-1">{portfolioResult.metrics.selectedCount}</p>
                  <span className="text-[10px] text-on-surface-variant">{portfolioResult.metrics.excludedCount} Excluded</span>
                </GlassPanel>

                <GlassPanel className="p-4 rounded-2xl border border-foreground/10">
                  <Label className="text-[10px] text-on-surface-variant">Wards Covered</Label>
                  <p className="text-lg font-bold text-foreground mt-1">{portfolioResult.metrics.wardsCoveredCount}</p>
                  <span className="text-[10px] text-on-surface-variant">Geographic spread</span>
                </GlassPanel>

                <GlassPanel className="p-4 rounded-2xl border border-foreground/10">
                  <Label className="text-[10px] text-on-surface-variant">Avg Priority Score</Label>
                  <p className="text-lg font-bold text-foreground mt-1">{portfolioResult.metrics.averagePriorityScore}</p>
                  <span className="text-[10px] text-primary">High collective impact</span>
                </GlassPanel>
              </div>

              {/* Selected Proposals */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Headline level={4} className="text-base text-foreground flex items-center gap-2">
                    <span className="material-symbols-outlined text-green-400 text-base">check_circle</span>
                    Recommended Feasible Proposals ({portfolioResult.selectedProposals.length})
                  </Headline>
                  <Button 
                    onClick={() => setActiveTab("decision")} 
                    className="text-xs bg-primary text-on-primary font-bold shadow-md"
                  >
                    Proceed to Authority Studio →
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {portfolioResult.selectedProposals.map((p, idx) => (
                    <GlassPanel key={p.id} className="p-5 rounded-2xl border border-green-500/20 bg-surface-container/80 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex justify-between items-center text-xs mb-1.5">
                          <span className="font-bold text-green-400">#{idx + 1} RECOMMENDED</span>
                          <span className="font-mono text-primary font-bold">₹{(p.estimated_cost / 10000000).toFixed(2)} Cr</span>
                        </div>
                        <Headline level={4} className="text-sm font-bold text-foreground">{p.title}</Headline>
                        <p className="text-xs text-on-surface-variant mt-1 line-clamp-2">{p.description}</p>
                      </div>

                      <div className="pt-2 border-t border-foreground/5 flex justify-between items-center text-xs">
                        <span className="text-on-surface-variant">{p.ward_id} • Priority: {p.priority_score?.toFixed(1)}</span>
                        <button 
                          onClick={() => setOverrideModalProposal({ proposal: p, action: "REMOVED" })}
                          className="text-error font-semibold hover:underline text-[11px]"
                        >
                          Exclude with Justification
                        </button>
                      </div>
                    </GlassPanel>
                  ))}
                </div>
              </div>

              {/* Excluded Proposals with Explicit Reasons */}
              <div className="space-y-4 pt-4">
                <Headline level={4} className="text-base text-foreground flex items-center gap-2">
                  <span className="material-symbols-outlined text-orange-400 text-base">cancel</span>
                  Excluded Proposals with Transparent Rationale ({portfolioResult.excludedProposals.length})
                </Headline>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {portfolioResult.excludedProposals.map((ex) => (
                    <GlassPanel key={ex.proposalId} className="p-5 rounded-2xl border border-foreground/10 bg-foreground/5 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex justify-between items-center text-xs mb-1">
                          <span className="font-bold text-on-surface-variant">EXCLUDED</span>
                          <span className="font-mono text-on-surface-variant font-bold">₹{(ex.cost / 10000000).toFixed(2)} Cr</span>
                        </div>
                        <Headline level={4} className="text-sm font-semibold text-foreground/80">{ex.proposalTitle}</Headline>
                        
                        <div className="bg-orange-500/10 border border-orange-500/20 p-2.5 rounded-xl mt-2 text-xs text-orange-400 flex items-start gap-2">
                          <span className="material-symbols-outlined text-sm mt-0.5">info</span>
                          <span><strong>Reason:</strong> {ex.reason}</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-foreground/5 flex justify-end">
                        <button 
                          onClick={() => {
                            const fullProp = proposals.find(p => p.id === ex.proposalId);
                            if (fullProp) setOverrideModalProposal({ proposal: fullProp, action: "ADDED" });
                          }}
                          className="text-primary font-semibold hover:underline text-[11px]"
                        >
                          Override & Force Include →
                        </button>
                      </div>
                    </GlassPanel>
                  ))}
                </div>
              </div>

            </div>
          )}
        </motion.div>
      )}

      {/* TAB 9: AUTHORITY DECISION STUDIO */}
      {activeTab === "decision" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-primary/20 text-primary">
                  AUTHORITY CONTROL CENTER
                </span>
                <span className="text-xs text-on-surface-variant">Auditable Final Approval</span>
              </div>
              <Headline level={3}>Authority Decision Studio</Headline>
              <BodyText className="text-xs text-on-surface-variant">
                Review, apply human overrides with required justifications, and officially ratify the development portfolio with an auditable DecisionRecord.
              </BodyText>
            </div>
          </div>

          {effectivePortfolio && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Final Approval Review */}
              <div className="lg:col-span-8 space-y-6">
                <GlassPanel className="p-6 rounded-3xl border border-foreground/10 space-y-4">
                  <div className="flex justify-between items-center border-b border-foreground/10 pb-4">
                    <Headline level={4}>Current Candidate Portfolio for Official Approval</Headline>
                    <span className="text-xs font-bold text-primary">{effectivePortfolio.selectedProposals.length} Proposals</span>
                  </div>

                  <div className="divide-y divide-foreground/5">
                    {effectivePortfolio.selectedProposals.map((p, idx) => (
                      <div key={p.id} className="py-3 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <div>
                            <p className="text-xs font-bold text-foreground">{p.title}</p>
                            <p className="text-[11px] text-on-surface-variant">{p.ward_id} • Score: {p.priority_score?.toFixed(1)}</p>
                          </div>
                        </div>
                        <span className="font-mono text-xs font-bold text-primary">₹{(p.estimated_cost / 10000000).toFixed(2)} Cr</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-foreground/10 flex justify-between items-center text-sm">
                    <span className="font-bold text-foreground">Total Authorized Expenditure:</span>
                    <span className={cn(
                      "font-mono font-black text-base",
                      effectivePortfolio.isBudgetExceeded ? "text-error" : "text-green-400"
                    )}>
                      ₹{(effectivePortfolio.totalCost / 10000000).toFixed(2)} Cr / ₹{budgetCrores.toFixed(2)} Cr
                    </span>
                  </div>

                  {effectivePortfolio.isBudgetExceeded && (
                    <div className="bg-error/10 border border-error/30 p-3 rounded-xl text-xs text-error">
                      ⚠️ Error: Current portfolio exceeds authorized budget by ₹{((effectivePortfolio.totalCost - budgetCrores * 10000000) / 10000000).toFixed(2)} Cr. Remove a proposal before approval.
                    </div>
                  )}
                </GlassPanel>

                {/* Overrides List */}
                {manualOverrides.length > 0 && (
                  <GlassPanel className="p-6 rounded-3xl border border-orange-500/30 space-y-4 bg-orange-500/5">
                    <Headline level={4} className="text-sm font-bold text-orange-400 flex items-center gap-2">
                      <span className="material-symbols-outlined text-base">gavel</span>
                      Documented Human Overrides ({manualOverrides.length})
                    </Headline>
                    <div className="space-y-3 text-xs">
                      {manualOverrides.map(ov => {
                        const prop = proposals.find(p => p.id === ov.proposalId);
                        return (
                          <div key={ov.proposalId} className="bg-foreground/5 p-3 rounded-xl border border-foreground/5 space-y-1">
                            <div className="flex justify-between font-bold">
                              <span className={ov.action === "ADDED" ? "text-green-400" : "text-error"}>
                                [{ov.action}] {prop?.title}
                              </span>
                              <button 
                                onClick={() => setManualOverrides(prev => prev.filter(o => o.proposalId !== ov.proposalId))}
                                className="text-on-surface-variant hover:text-foreground text-[10px]"
                              >
                                Cancel Override
                              </button>
                            </div>
                            <p className="text-on-surface-variant italic">"Justification: {ov.justification}"</p>
                          </div>
                        );
                      })}
                    </div>
                  </GlassPanel>
                )}
              </div>

              {/* Right Column: Ratification Action & History */}
              <div className="lg:col-span-4 space-y-6">
                <GlassPanel className="p-6 rounded-3xl border border-primary/30 space-y-4 bg-surface-container-high/80">
                  <Headline level={4} className="text-base text-foreground">Official Decision Ratification</Headline>
                  <BodyText className="text-xs text-on-surface-variant leading-relaxed">
                    Executing approval validates the portfolio against municipal constraints, updates proposal statuses, and issues an immutable, auditable <strong>DecisionRecord</strong>.
                  </BodyText>

                  <div className="bg-foreground/5 p-3 rounded-xl space-y-1.5 text-xs">
                    <p className="text-[10px] text-on-surface-variant uppercase font-bold">Authorizing Official</p>
                    <p className="font-semibold text-foreground">BMC Planning Director / Ward Authority</p>
                  </div>

                  <Button 
                    onClick={handleExecuteApproval}
                    disabled={effectivePortfolio.isBudgetExceeded || approveMutation.isPending}
                    className="w-full py-4 bg-gradient-to-r from-primary to-secondary text-on-primary font-bold shadow-lg shadow-primary/25 disabled:opacity-50"
                  >
                    {approveMutation.isPending ? "Validating & Approving..." : "Ratify & Approve Portfolio"}
                  </Button>
                </GlassPanel>

                {/* Audit Trail Log */}
                <GlassPanel className="p-6 rounded-3xl border border-foreground/10 space-y-4">
                  <Headline level={4} className="text-sm font-bold flex items-center justify-between">
                    <span>Decision Audit Trail</span>
                    <span className="material-symbols-outlined text-base text-on-surface-variant">history</span>
                  </Headline>

                  <div className="space-y-3 max-h-64 overflow-y-auto pr-1 text-xs">
                    {decisions.length === 0 ? (
                      <p className="text-on-surface-variant text-xs italic">No previous decision records recorded.</p>
                    ) : (
                      decisions.map(dec => (
                        <div key={dec.id} className="bg-foreground/5 p-3 rounded-xl border border-foreground/5 space-y-1">
                          <div className="flex justify-between text-[11px] font-bold">
                            <span className="text-green-400">Decision #{dec.id}</span>
                            <span className="text-on-surface-variant">{new Date(dec.approved_at).toLocaleDateString()}</span>
                          </div>
                          <p className="text-[11px] text-foreground font-medium">Cost: ₹{(dec.total_cost / 10000000).toFixed(2)} Cr ({dec.approved_proposals?.length} proposals)</p>
                          <p className="text-[10px] text-on-surface-variant truncate">"{dec.justification}"</p>
                        </div>
                      ))
                    )}
                  </div>
                </GlassPanel>
              </div>

            </div>
          )}
        </motion.div>
      )}

      {/* Override Justification Modal */}
      <AnimatePresence>
        {overrideModalProposal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-lg w-full"
            >
              <GlassPanel className="p-6 rounded-3xl border border-primary/30 shadow-2xl space-y-4 bg-surface-container">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-orange-500/20 text-orange-400">
                      MANDATORY OVERRIDE JUSTIFICATION
                    </span>
                    <Headline level={4} className="mt-2 text-base">{overrideModalProposal.proposal.title}</Headline>
                  </div>
                  <button 
                    onClick={() => { setOverrideModalProposal(null); setOverrideError(""); }}
                    className="text-on-surface-variant hover:text-foreground"
                  >
                    <span className="material-symbols-outlined text-base">close</span>
                  </button>
                </div>

                <BodyText className="text-xs text-on-surface-variant">
                  You are performing an authority override to <strong>{overrideModalProposal.action}</strong> this proposal. Government audit guidelines mandate an official public interest justification.
                </BodyText>

                <div className="space-y-1">
                  <Label className="text-xs font-bold text-foreground">Official Justification (Min 10 characters)</Label>
                  <textarea
                    rows={4}
                    value={overrideJustification}
                    onChange={(e) => setOverrideJustification(e.target.value)}
                    placeholder="E.g., Overriding priority due to immediate critical school structural safety hazard confirmed by on-ground engineer inspection."
                    className="w-full bg-surface border border-foreground/15 rounded-xl p-3 text-xs text-foreground placeholder:text-on-surface-variant/40 outline-none focus:border-primary"
                  />
                  {overrideError && <p className="text-xs text-error">{overrideError}</p>}
                </div>

                <div className="flex gap-3 pt-2">
                  <Button variant="outline" className="flex-1 text-xs" onClick={() => setOverrideModalProposal(null)}>
                    Cancel
                  </Button>
                  <Button className="flex-1 text-xs bg-primary text-on-primary font-bold" onClick={handleApplyOverride}>
                    Save Override
                  </Button>
                </div>
              </GlassPanel>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
