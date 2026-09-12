import React, { useState, useMemo, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/services/api"
import { planningApi, type DevelopmentProposal, type DemandHotspot, type NormalizedDemand } from "@/services/planningService"
import { motion, AnimatePresence } from "framer-motion"
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker, Circle, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { Headline, BodyText, Label } from "@/components/atoms/Typography"
import { Button } from "@/components/atoms/Button"
import { cn } from "@/utils/utils"

// Constants
const BHUBANESWAR_CENTER: [number, number] = [20.2961, 85.8245];
const USER_LOCATION: [number, number] = [19.0760, 72.8777]; // Mumbai command base

export type MapLayerType = 
  | "ISSUES" 
  | "DEMANDS" 
  | "HOTSPOTS" 
  | "INFRASTRUCTURE" 
  | "PROPOSALS" 
  | "PORTFOLIO";

export interface MapIncident {
  id: number;
  category: string;
  priority: string;
  summary: string;
  status: string;
  latitude: number;
  longitude: number;
  created_at: string;
}

const MAP_LAYERS = [
  { id: "ISSUES", label: "Civic Issues", icon: "warning", desc: "Live citizen reported problems" },
  { id: "DEMANDS", label: "Demands", icon: "dataset", desc: "Normalized multi-channel BMC demands" },
  { id: "HOTSPOTS", label: "Demand Hotspots", icon: "local_fire_department", desc: "Spatial intensity clusters" },
  { id: "PROPOSALS", label: "Proposals", icon: "assignment", desc: "Constituency development projects" },
  { id: "PORTFOLIO", label: "Portfolio", icon: "account_balance_wallet", desc: "Feasible funded allocation (₹5 Cr)" }
];

// Custom Leaflet Icons
const createIcon = (colorObj: {bg: string, border: string, text: string}, iconName: string, isUser = false) => {
  return L.divIcon({
    className: "custom-leaflet-icon",
    html: `
      <div class="relative group transition-all ${isUser ? 'animate-bounce' : ''}">
        <div class="absolute -inset-2 ${colorObj.bg} rounded-full blur-md opacity-50 group-hover:opacity-80 transition-opacity ${isUser ? 'animate-pulse' : ''}"></div>
        <div class="relative w-10 h-10 bg-surface-container-high rounded-full border-2 ${colorObj.border} flex items-center justify-center ${colorObj.text} shadow-lg">
          <span class="material-symbols-outlined text-[20px]" style="font-variation-settings: 'FILL' 1;">${iconName}</span>
        </div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

const createProposalIcon = (category: string, score: number, isFunded = true) => {
  const badgeColor = isFunded ? "bg-green-500 text-white" : "bg-orange-500 text-white";
  return L.divIcon({
    className: "custom-proposal-icon",
    html: `
      <div class="relative group cursor-pointer">
        <div class="absolute -inset-2 bg-primary/40 rounded-2xl blur-md opacity-50 group-hover:opacity-90 transition-opacity"></div>
        <div class="relative px-2.5 py-1.5 bg-surface-container-highest rounded-xl border-2 ${isFunded ? 'border-green-400' : 'border-orange-400'} shadow-2xl flex items-center gap-1.5 text-foreground">
          <span class="material-symbols-outlined text-[16px] text-primary">account_tree</span>
          <span class="text-xs font-bold">${category}</span>
          <span class="text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${badgeColor}">${score.toFixed(0)}</span>
        </div>
      </div>
    `,
    iconSize: [120, 36],
    iconAnchor: [60, 18]
  });
};

const getCategoryIcon = (category: string) => {
  const cat = category.toLowerCase();
  if (cat.includes("infrastructure") || cat.includes("road")) return { type: "construction", colorObj: { bg: "bg-primary", border: "border-primary", text: "text-primary" } };
  if (cat.includes("environment") || cat.includes("park") || cat.includes("tree")) return { type: "park", colorObj: { bg: "bg-emerald-500", border: "border-emerald-500", text: "text-emerald-500" } };
  if (cat.includes("sanitation") || cat.includes("waste")) return { type: "delete", colorObj: { bg: "bg-secondary", border: "border-secondary", text: "text-secondary" } };
  if (cat.includes("drainage") || cat.includes("flood")) return { type: "waves", colorObj: { bg: "bg-blue-500", border: "border-blue-500", text: "text-blue-500" } };
  if (cat.includes("water")) return { type: "water_drop", colorObj: { bg: "bg-cyan-500", border: "border-cyan-500", text: "text-cyan-500" } };
  if (cat.includes("health")) return { type: "local_hospital", colorObj: { bg: "bg-rose-500", border: "border-rose-500", text: "text-rose-500" } };
  if (cat.includes("education") || cat.includes("school")) return { type: "school", colorObj: { bg: "bg-amber-500", border: "border-amber-500", text: "text-amber-500" } };
  if (cat.includes("safety")) return { type: "local_police", colorObj: { bg: "bg-error", border: "border-error", text: "text-error" } };
  return { type: "report", colorObj: { bg: "bg-primary", border: "border-primary", text: "text-primary" } };
};

function MapController({ center, zoom, trigger }: { center: [number, number], zoom: number, trigger: number }) {
  const map = useMap();
  React.useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.5 });
  }, [center, zoom, trigger, map]);
  return null;
}

export function MapDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Layer Selection State
  const [activeLayer, setActiveLayer] = useState<MapLayerType>("HOTSPOTS");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Selected entity for Drawer/Popup
  const [selectedEntity, setSelectedEntity] = useState<{
    type: "INCIDENT" | "DEMAND" | "HOTSPOT" | "PROPOSAL";
    data: any;
  } | null>(null);

  const [mapCenter, setMapCenter] = useState<[number, number]>(BHUBANESWAR_CENTER);
  const [mapZoom, setMapZoom] = useState(13);
  const [locateTrigger, setLocateTrigger] = useState(0);

  // Auto-focus location if passed in navigation state
  useEffect(() => {
    if (location.state?.lat && location.state?.lng) {
      setMapCenter([location.state.lat, location.state.lng]);
      setMapZoom(16);
      setLocateTrigger(Date.now());
    }
  }, [location.state]);

  // Queries with real-time sync
  const { data: complaints = [] } = useQuery({
    queryKey: ['complaints'],
    queryFn: api.getComplaints,
    refetchInterval: 3000
  });

  const { data: demands = [] } = useQuery({
    queryKey: ['planning-demands'],
    queryFn: planningApi.getDemands,
    refetchInterval: 3000
  });

  const { data: hotspots = [] } = useQuery({
    queryKey: ['planning-hotspots'],
    queryFn: planningApi.getHotspots,
    refetchInterval: 3000
  });

  const { data: proposals = [] } = useQuery({
    queryKey: ['planning-proposals'],
    queryFn: planningApi.getProposals
  });

  const { data: portfolioResult } = useQuery({
    queryKey: ['planning-portfolio-opt', 5.0],
    queryFn: () => planningApi.optimizePortfolio({ maxBudget: 50000000 })
  });

  const fundedProposalIds = useMemo(() => {
    return new Set((portfolioResult?.selectedProposals || []).map(p => p.id));
  }, [portfolioResult]);

  // Auto-select hotspot entity if navigated with complaint ID
  useEffect(() => {
    if (location.state?.id && hotspots.length > 0) {
      const match = hotspots.find((h: any) => h.complaintId === location.state.id || h.id === 10000 + location.state.id);
      if (match) {
        setSelectedEntity({ type: "HOTSPOT", data: match });
      }
    }
  }, [location.state, hotspots]);

  const handleSelectHotspot = (hotspot: DemandHotspot) => {
    setSelectedEntity({ type: "HOTSPOT", data: hotspot });
    setMapCenter([hotspot.centerLat, hotspot.centerLng]);
    setMapZoom(15);
    setLocateTrigger(Date.now());
  };

  const handleSelectProposal = (proposal: DevelopmentProposal) => {
    setSelectedEntity({ type: "PROPOSAL", data: proposal });
    setMapCenter([proposal.lat, proposal.lng]);
    setMapZoom(16);
    setLocateTrigger(Date.now());
  };

  const handleSelectDemand = (demand: NormalizedDemand) => {
    setSelectedEntity({ type: "DEMAND", data: demand });
    setMapCenter([demand.lat, demand.lng]);
    setMapZoom(16);
    setLocateTrigger(Date.now());
  };

  const handleLayerChange = (layer: MapLayerType) => {
    setActiveLayer(layer);
    setSelectedEntity(null);
    // Always center on Bhubaneswar for all layers
    setMapCenter(BHUBANESWAR_CENTER);
    setMapZoom(13);
    setLocateTrigger(Date.now());
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#060e20]">
      
      {/* Map Canvas */}
      <div className="absolute inset-0 z-0">
        <MapContainer 
          center={mapCenter} 
          zoom={mapZoom} 
          zoomControl={false}
          className="w-full h-full bg-[#060e20]"
        >
          <MapController center={mapCenter} zoom={mapZoom} trigger={locateTrigger} />
          
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
            attribution='&copy; <a href="https://www.esri.com/">Esri</a> &copy; OpenStreetMap contributors'
            maxZoom={16}
          />
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}"
            maxZoom={16}
          />

          {/* LAYER 1: CIVIC ISSUES */}
          {activeLayer === "ISSUES" && complaints.map((c: any) => {
            const { type, colorObj } = getCategoryIcon(c.category || "infrastructure");
            const pos: [number, number] = c.latitude && c.longitude ? [c.latitude, c.longitude] : BHUBANESWAR_CENTER;
            return (
              <Marker 
                key={`c-${c.id}`} 
                position={pos} 
                icon={createIcon(colorObj, type)}
                eventHandlers={{
                  click: () => setSelectedEntity({ type: "INCIDENT", data: c })
                }}
              />
            );
          })}

          {/* LAYER 2: NORMALIZED DEMANDS */}
          {activeLayer === "DEMANDS" && demands.map((d: NormalizedDemand) => {
            const { type, colorObj } = getCategoryIcon(d.category);
            return (
              <Marker 
                key={`d-${d.id}`} 
                position={[d.lat, d.lng]} 
                icon={createIcon(colorObj, type)}
                eventHandlers={{
                  click: () => handleSelectDemand(d)
                }}
              />
            );
          })}

          {/* LAYER 3: DEMAND HOTSPOTS (Pulsing Circles & Heatmap Markers) */}
          {(activeLayer === "HOTSPOTS" || activeLayer === "DEMANDS") && hotspots.map((h: DemandHotspot) => {
            const cat = (h.dominantCategory || "").toUpperCase();
            const isDrainage = cat === "DRAINAGE";
            const isEnv = cat.includes("ENV") || cat.includes("TREE") || cat.includes("PARK");
            const isWater = cat.includes("WATER");
            const isSanitation = cat.includes("SANIT");
            
            const circleColor = isDrainage ? "#3b82f6" : isEnv ? "#10b981" : isWater ? "#06b6d4" : isSanitation ? "#a855f7" : "#f97316";
            const strokeColor = isDrainage ? "#60a5fa" : isEnv ? "#34d399" : isWater ? "#22d3ee" : isSanitation ? "#c084fc" : "#fb923c";
            const iconName = isEnv ? "park" : isWater ? "water_drop" : isSanitation ? "delete" : "local_fire_department";
            const iconBg = isEnv 
              ? { bg: "bg-emerald-500", border: "border-emerald-400", text: "text-emerald-400" } 
              : isWater
              ? { bg: "bg-cyan-500", border: "border-cyan-400", text: "text-cyan-400" }
              : isSanitation
              ? { bg: "bg-purple-500", border: "border-purple-400", text: "text-purple-400" }
              : isDrainage
              ? { bg: "bg-blue-500", border: "border-blue-400", text: "text-blue-400" }
              : { bg: "bg-orange-500", border: "border-orange-400", text: "text-orange-400" };

            return (
              <React.Fragment key={`h-${h.id}`}>
                {/* Exact 100m Geographic Catchment Area */}
                <Circle
                  center={[h.centerLat, h.centerLng]}
                  radius={100}
                  pathOptions={{
                    fillColor: circleColor,
                    fillOpacity: 0.22,
                    color: strokeColor,
                    weight: 1.5,
                    dashArray: "4, 4"
                  }}
                  eventHandlers={{
                    click: () => handleSelectHotspot(h)
                  }}
                />
                <CircleMarker
                  center={[h.centerLat, h.centerLng]}
                  radius={16}
                  pathOptions={{
                    fillColor: circleColor,
                    fillOpacity: 0.38,
                    color: strokeColor,
                    weight: 2
                  }}
                  eventHandlers={{
                    click: () => handleSelectHotspot(h)
                  }}
                />
                <Marker
                  position={[h.centerLat, h.centerLng]}
                  icon={createIcon(iconBg, iconName)}
                  eventHandlers={{
                    click: () => handleSelectHotspot(h)
                  }}
                />
              </React.Fragment>
            );
          })}

          {/* LAYER 4 & 5: PROPOSALS & PORTFOLIO */}
          {(activeLayer === "PROPOSALS" || activeLayer === "PORTFOLIO") && proposals.map((p: DevelopmentProposal) => {
            const isFunded = fundedProposalIds.has(p.id);
            return (
              <Marker
                key={`p-${p.id}`}
                position={[p.lat, p.lng]}
                icon={createProposalIcon(p.category, p.priority_score, isFunded)}
                eventHandlers={{
                  click: () => handleSelectProposal(p)
                }}
              />
            );
          })}

        </MapContainer>
        <div className="absolute inset-0 bg-primary/5 pointer-events-none mix-blend-overlay"></div>
      </div>

      {/* Floating Multi-Layer Selector Header */}
      <div className="absolute top-4 md:top-6 left-0 right-0 z-20 flex justify-center px-4 pointer-events-none">
        <GlassPanel className="max-w-3xl w-full flex items-center justify-between gap-2 px-3 py-2 rounded-2xl pointer-events-auto shadow-2xl bg-surface-container-low/90 backdrop-blur-xl border border-foreground/10">
          <div className="flex items-center gap-1 overflow-x-auto hide-scrollbar">
            {MAP_LAYERS.map(layer => (
              <button
                key={layer.id}
                onClick={() => handleLayerChange(layer.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all",
                  activeLayer === layer.id 
                    ? "bg-primary text-on-primary shadow-md shadow-primary/25" 
                    : "text-on-surface-variant hover:text-foreground hover:bg-foreground/5"
                )}
                title={layer.desc}
              >
                <span className="material-symbols-outlined text-[17px]">{layer.icon}</span>
                {layer.label}
              </button>
            ))}
          </div>

          <button 
            onClick={() => navigate("/admin/planning")} 
            className="text-[11px] font-bold text-primary hover:underline px-3 py-1 flex items-center gap-1"
          >
            Planning Studio <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </GlassPanel>
      </div>

      {/* Selected Entity Card Overlay */}
      <AnimatePresence>
        {selectedEntity && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute top-24 right-4 md:right-8 z-30 w-80 md:w-96 pointer-events-auto"
          >
            <GlassPanel className="rounded-3xl p-6 shadow-[0_30px_60px_rgba(0,0,0,0.5)] border border-primary/30 bg-surface-container/95 backdrop-blur-2xl space-y-4">
              
              {/* Header */}
              <div className="flex justify-between items-start">
                <div>
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-primary/20 text-primary border border-primary/30">
                    {selectedEntity.type}
                  </span>
                  <Headline level={4} className="mt-2 text-base text-foreground leading-snug">
                    {selectedEntity.data.title || selectedEntity.data.wardId || selectedEntity.data.summary}
                  </Headline>
                </div>
                <button 
                  onClick={() => setSelectedEntity(null)}
                  className="w-7 h-7 rounded-full bg-foreground/5 text-on-surface-variant hover:text-foreground flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              </div>

              {/* Entity Type: HOTSPOT */}
              {selectedEntity.type === "HOTSPOT" && (
                <div className="space-y-3">
                  <div className="grid grid-cols-4 gap-2 bg-foreground/5 p-3 rounded-2xl text-center">
                    <div>
                      <Label className="text-[9px] text-on-surface-variant block">Intensity</Label>
                      <span className="text-sm font-bold text-orange-400">{selectedEntity.data.intensity.toFixed(1)}</span>
                    </div>
                    <div>
                      <Label className="text-[9px] text-on-surface-variant block">Demands</Label>
                      <span className="text-sm font-bold text-foreground">{selectedEntity.data.demandCount}</span>
                    </div>
                    <div>
                      <Label className="text-[9px] text-on-surface-variant block">Citizens</Label>
                      <span className="text-sm font-bold text-foreground">{selectedEntity.data.uniqueCitizenCount}</span>
                    </div>
                    <div>
                      <Label className="text-[9px] text-on-surface-variant block">Radius</Label>
                      <span className="text-sm font-bold text-foreground">{selectedEntity.data.radius || 100}m</span>
                    </div>
                  </div>

                  <p className="text-xs text-on-surface-variant">
                    Spatial cluster in <strong>{selectedEntity.data.wardId}</strong> with dominant category: <strong>{selectedEntity.data.dominantCategory}</strong>.
                  </p>

                  <div className="pt-2 border-t border-foreground/5 flex justify-between text-[11px] text-on-surface-variant">
                    <span>Recurrence: <strong className="text-foreground">{selectedEntity.data.recurrence}</strong></span>
                    <span>Confidence: <strong className="text-foreground">{(selectedEntity.data.confidence * 100).toFixed(0)}%</strong></span>
                  </div>

                  {selectedEntity.data.complaintId ? (
                    <Button 
                      onClick={() => navigate(`/track/${selectedEntity.data.complaintId}`)} 
                      className="w-full text-xs bg-primary text-on-primary font-bold shadow-md flex items-center justify-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-sm">timeline</span>
                      Track Incident Timeline
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => navigate("/admin/planning")} 
                      className="w-full text-xs bg-primary text-on-primary font-bold shadow-md"
                    >
                      View Matching Proposal & Evidence
                    </Button>
                  )}
                </div>
              )}

              {/* Entity Type: PROPOSAL */}
              {selectedEntity.type === "PROPOSAL" && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 bg-foreground/5 p-3 rounded-2xl">
                    <div>
                      <Label className="text-[9px] text-on-surface-variant block">Estimated Cost</Label>
                      <span className="text-xs font-bold text-primary">₹{(selectedEntity.data.estimated_cost / 10000000).toFixed(2)} Cr</span>
                    </div>
                    <div>
                      <Label className="text-[9px] text-on-surface-variant block">Priority Score</Label>
                      <span className="text-xs font-bold text-foreground">{selectedEntity.data.priority_score?.toFixed(1)} / 100</span>
                    </div>
                  </div>

                  <p className="text-xs text-on-surface-variant line-clamp-3 leading-relaxed">
                    {selectedEntity.data.description}
                  </p>

                  <div className="pt-2 border-t border-foreground/5 flex justify-between text-[11px]">
                    <span className="text-on-surface-variant">Beneficiaries: ~{selectedEntity.data.beneficiaries?.toLocaleString()}</span>
                    <span className={cn("font-bold", fundedProposalIds.has(selectedEntity.data.id) ? "text-green-400" : "text-orange-400")}>
                      {fundedProposalIds.has(selectedEntity.data.id) ? "RECOMMENDED IN PORTFOLIO" : "BUDGET EXCLUDED"}
                    </span>
                  </div>

                  <Button 
                    onClick={() => navigate("/admin/planning")} 
                    className="w-full text-xs bg-gradient-to-r from-primary to-secondary text-on-primary font-bold shadow-md"
                  >
                    Inspect 11-Factor Breakdown
                  </Button>
                </div>
              )}

              {/* Entity Type: DEMAND */}
              {selectedEntity.type === "DEMAND" && (
                <div className="space-y-3">
                  <div className="bg-foreground/5 p-3 rounded-xl border border-foreground/5">
                    <p className="text-[10px] text-on-surface-variant uppercase font-bold">Demand Statement</p>
                    <p className="text-xs text-foreground mt-1">{selectedEntity.data.demand_statement}</p>
                  </div>
                  <div className="flex justify-between text-xs text-on-surface-variant">
                    <span>Severity: <strong className="text-foreground">{selectedEntity.data.severity}</strong></span>
                    <span>Urgency: <strong className="text-foreground">{selectedEntity.data.urgency}</strong></span>
                  </div>
                </div>
              )}

              {/* Entity Type: INCIDENT */}
              {selectedEntity.type === "INCIDENT" && (
                <div className="space-y-3">
                  <p className="text-xs text-on-surface-variant">{selectedEntity.data.summary}</p>
                  <div className="flex justify-between text-xs">
                    <span>Department: {selectedEntity.data.department}</span>
                    <span>Status: {selectedEntity.data.status}</span>
                  </div>
                </div>
              )}

            </GlassPanel>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Location Fly-to Controls */}
      <div className="absolute bottom-8 right-4 md:right-8 z-30 flex flex-col items-end gap-3 pointer-events-none">
        <button 
          onClick={() => {
            setMapCenter(BHUBANESWAR_CENTER);
            setMapZoom(13);
            setLocateTrigger(Date.now());
          }}
          className="pointer-events-auto px-4 py-2.5 rounded-full bg-surface-container-highest border border-foreground/15 text-xs font-bold text-foreground hover:bg-foreground/10 transition-all shadow-xl flex items-center gap-2"
          title="Jump to Bhubaneswar Constituency"
        >
          <span className="material-symbols-outlined text-primary text-base">near_me</span>
          Bhubaneswar Center
        </button>

        <button 
          onClick={() => navigate("/report")}
          className="pointer-events-auto h-12 px-6 rounded-full bg-gradient-to-r from-primary to-secondary text-on-primary font-bold flex items-center gap-2 shadow-lg shadow-primary/25 hover:scale-105 active:scale-95 transition-all text-xs"
        >
          <span className="material-symbols-outlined text-base">add_location_alt</span>
          Submit Citizen Voice
        </button>
      </div>

    </div>
  );
}
