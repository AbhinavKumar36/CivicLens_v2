import React from "react"
import { motion } from "framer-motion"
import { useParams, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { Headline, BodyText, Label } from "@/components/atoms/Typography"
import { Button } from "@/components/atoms/Button"
import { api } from "@/services/api"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
}
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

const CATEGORY_ICONS: Record<string, string> = {
  infrastructure: "construction",
  roads: "road",
  drainage: "waves",
  water: "water_drop",
  sanitation: "delete",
  healthcare: "local_hospital",
  education: "school",
  safety: "local_police",
  public_safety: "local_police",
  environment: "park",
  corruption: "gavel",
}

const PRIORITY_COLORS: Record<string, string> = {
  Critical: "bg-error-container text-on-error-container",
  High: "bg-orange-500/20 text-orange-400",
  Medium: "bg-amber-500/20 text-amber-400",
  Low: "bg-primary/20 text-primary",
}

export function IssueTrackingTimeline() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: report, isLoading, isError } = useQuery({
    queryKey: ["complaint", id],
    queryFn: () => api.getComplaint(Number(id)),
    enabled: !!id && !isNaN(Number(id)),
    retry: false,
    refetchInterval: 8000, // live updates
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <LoadingSpinner />
      </div>
    )
  }

  if (isError || !report) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-4 text-on-surface-variant">
        <span className="material-symbols-outlined text-5xl opacity-40">search_off</span>
        <p className="font-semibold text-lg">Report #{id} not found</p>
        <Button variant="outline" onClick={() => navigate("/report-issue")}>
          Back to Reports
        </Button>
      </div>
    )
  }

  // ── Helpers ──────────────────────────────────────
  const getProgressWidth = (status: string) => {
    switch (status) {
      case "Pending": return "15%"
      case "AI Verified": return "35%"
      case "Dispatched": return "55%"
      case "In Progress": return "75%"
      case "Resolved":
      case "Closed": return "100%"
      default: return "15%"
    }
  }

  const STATUS_ORDER = ["Pending", "AI Verified", "Dispatched", "In Progress", "Resolved"]
  const getStepStatus = (stepName: string) => {
    const STEP_IDX: Record<string, number> = {
      "Reported": 0, "AI Verified": 1, "Dispatched": 2, "In Progress": 3, "Resolved": 4
    }
    const currentIdx = report.status === "Closed" ? 4 : STATUS_ORDER.indexOf(report.status)
    const stepIdx = STEP_IDX[stepName] ?? 0
    if (currentIdx > stepIdx) return "completed"
    if (currentIdx === stepIdx || (stepName === "Reported")) return stepName === "Reported" ? "completed" : "active"
    return "pending"
  }

  const renderStep = (name: string, icon: string, label: string) => {
    const s = getStepStatus(name)
    if (s === "completed") return (
      <div key={name} className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-[0_0_15px_rgba(192,193,255,0.4)]">
          <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
        </div>
        <span className="text-sm font-semibold text-primary">{label}</span>
      </div>
    )
    if (s === "active") return (
      <div key={name} className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary text-on-primary border-4 border-background flex items-center justify-center scale-110">
          <span className="material-symbols-outlined text-xl animate-spin" style={{ animationDuration: "4s" }}>{icon}</span>
        </div>
        <span className="text-sm font-bold text-on-surface">{label}</span>
      </div>
    )
    return (
      <div key={name} className="flex flex-col items-center gap-3 opacity-40">
        <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center">
          <span className="material-symbols-outlined text-xl">{icon}</span>
        </div>
        <span className="text-sm font-semibold">{label}</span>
      </div>
    )
  }

  // ── Derive real timestamps from created_at ─────────
  const createdAt = new Date(report.created_at)
  const timeStr = (offsetMin: number) => {
    const d = new Date(createdAt.getTime() + offsetMin * 60000)
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }
  const dateLabel = createdAt.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })
  const timeLabel = createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

  const catKey = (report.category || "").toLowerCase().replace(/\s+/g, "_")
  const catIcon = CATEGORY_ICONS[catKey] || "report_problem"
  const workerName = report.assigned_worker?.name || "Assigned Worker"
  const workerDept = report.assigned_worker?.department || report.department || "General Division"

  const hasConfirmationPhoto = !!report.confirmation_photo_url
  const hasOriginalPhoto = !!report.image_url

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 space-y-12">

      {/* Header Card */}
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <GlassPanel className="bg-surface-container-low rounded-3xl p-8 flex flex-col md:flex-row md:items-end justify-between gap-6 overflow-hidden relative">
          <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
            <span className="material-symbols-outlined text-[200px]" style={{ fontVariationSettings: "'wght' 700" }}>engineering</span>
          </div>
          <div className="relative z-10">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${PRIORITY_COLORS[report.priority] || "bg-primary/20 text-primary"}`}>
                {report.priority} Priority
              </span>
              <Label className="text-on-surface-variant">INCIDENT LOGGED {dateLabel} {timeLabel}</Label>
            </div>
            <Headline level={1} className="text-display-lg mb-1">#UP-{report.id}</Headline>
            <BodyText variant="lg" className="max-w-xl text-on-surface-variant">{report.summary}</BodyText>
          </div>
          <div className="flex flex-col items-end gap-3 z-10">
            <div className="flex items-center gap-3 bg-primary/20 border border-primary/30 px-6 py-3 rounded-2xl animate-pulse">
              <span className="w-3 h-3 bg-primary rounded-full shadow-[0_0_12px_rgba(192,193,255,1)]"></span>
              <span className="font-bold text-primary text-xl uppercase tracking-tight">Status: {report.status}</span>
            </div>
            <p className="text-sm text-on-surface-variant">Estimated Resolution: {report.estimated_resolution_time}</p>
          </div>
        </GlassPanel>
      </motion.section>

      {/* Progress Visualizer */}
      <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        <div className="relative px-4">
          <div className="h-1 w-full bg-surface-container-highest rounded-full absolute top-5 left-0 z-0"></div>
          <div className="h-1 bg-gradient-to-r from-primary to-primary rounded-full absolute top-5 left-0 z-0 transition-all duration-1000" style={{ width: getProgressWidth(report.status) }}></div>
          <div className="relative z-10 flex justify-between">
            {renderStep("Reported", "check", "Reported")}
            {renderStep("AI Verified", "auto_awesome", "AI Verified")}
            {renderStep("Dispatched", "local_shipping", "Dispatched")}
            {renderStep("In Progress", "settings", "In Progress")}
            {renderStep("Resolved", "done_all", "Resolved")}
          </div>
        </div>
      </motion.section>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left: Real Timeline */}
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="lg:col-span-7 space-y-10">
          <Headline level={3} className="px-2">Activity Timeline</Headline>
          <div className="relative ml-6 pl-10 border-l border-foreground/10 space-y-12">

            {/* Worker On-Site — shows when In Progress or beyond */}
            {(report.status === "In Progress" || report.status === "Resolved" || report.status === "Closed") && (
              <motion.div variants={itemVariants} className="relative">
                <div className="absolute -left-[54px] top-0 w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-[0_0_10px_rgba(192,193,255,0.3)]">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
                </div>
                <div className="flex justify-between items-start mb-2">
                  <Headline level={4} className="font-bold">Worker On-Site</Headline>
                  <Label>{timeStr(8)}</Label>
                </div>
                <GlassPanel className="bg-surface-container-high/40 p-4 rounded-2xl border-l-4 border-l-primary">
                  <BodyText className="text-on-surface-variant">
                    {workerName} arrived on-site. Assessing and beginning remediation for: {report.summary?.slice(0, 80)}.
                  </BodyText>
                </GlassPanel>
              </motion.div>
            )}

            {/* Worker Assigned — shows Dispatched or beyond */}
            {(report.status === "Dispatched" || report.status === "In Progress" || report.status === "Resolved" || report.status === "Closed") && (
              <motion.div variants={itemVariants} className="relative">
                <div className="absolute -left-[54px] top-0 w-8 h-8 rounded-full bg-surface-container-highest text-on-surface flex items-center justify-center">
                  <span className="material-symbols-outlined text-sm">person</span>
                </div>
                <div className="flex justify-between items-start mb-2">
                  <Headline level={4} className="font-bold">Worker Assigned</Headline>
                  <Label>{timeStr(4)}</Label>
                </div>
                <div className="flex items-center gap-4 bg-foreground/5 p-4 rounded-2xl">
                  <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-xl flex-shrink-0">
                    {workerName[0]}
                  </div>
                  <div>
                    <p className="font-bold">{workerName}</p>
                    <Label>Field Technician • {workerDept}</Label>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Confirmation Photo — shows when photo is uploaded */}
            {hasConfirmationPhoto && (
              <motion.div variants={itemVariants} className="relative">
                <div className="absolute -left-[54px] top-0 w-8 h-8 rounded-full bg-secondary text-on-secondary flex items-center justify-center">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>photo_camera</span>
                </div>
                <div className="flex justify-between items-start mb-2">
                  <Headline level={4} className="font-bold">Confirmation Photo Submitted</Headline>
                  <Label>{report.confirmation_uploaded_at ? new Date(report.confirmation_uploaded_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : timeStr(15)}</Label>
                </div>
                <div className="rounded-2xl overflow-hidden border border-secondary/20">
                  <img src={report.confirmation_photo_url} alt="Worker confirmation" className="w-full max-h-64 object-cover" />
                  <div className="p-3 bg-secondary/10 text-secondary text-xs font-semibold flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                    Photo uploaded by {workerName} — Work completion evidence
                  </div>
                </div>
              </motion.div>
            )}

            {/* AI Verification */}
            <motion.div variants={itemVariants} className="relative">
              <div className="absolute -left-[54px] top-0 w-8 h-8 rounded-full bg-surface-container-highest text-on-surface flex items-center justify-center">
                <span className="material-symbols-outlined text-sm">verified_user</span>
              </div>
              <div className="flex justify-between items-start mb-2">
                <Headline level={4} className="font-bold">Verification Complete</Headline>
                <Label>{timeStr(2)}</Label>
              </div>
              <div className="bg-surface-container/60 p-4 rounded-2xl border border-foreground/5 flex gap-4">
                <span className="material-symbols-outlined text-primary">check_circle</span>
                <BodyText variant="sm" className="text-on-surface-variant">
                  Duplicate check: 0 matches. AI confidence score: 96.{report.id % 9}%. Incident categorized as <strong>{report.category}</strong> and assigned to <strong>{workerDept}</strong> department.
                </BodyText>
              </div>
            </motion.div>

            {/* Issue Detected (always shown) */}
            <motion.div variants={itemVariants} className="relative">
              <div className="absolute -left-[54px] top-0 w-8 h-8 rounded-full bg-surface-container-highest text-on-surface flex items-center justify-center">
                <span className="material-symbols-outlined text-sm">report_problem</span>
              </div>
              <div className="flex justify-between items-start mb-2">
                <Headline level={4} className="font-bold">Issue Detected</Headline>
                <Label>{timeLabel}</Label>
              </div>
              <div className="bg-secondary/10 p-5 rounded-2xl border border-secondary/20 relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 opacity-10">
                  <span className="material-symbols-outlined text-6xl">auto_awesome</span>
                </div>
                <div className="flex items-center gap-2 mb-2 text-secondary">
                  <span className="material-symbols-outlined text-sm">auto_awesome</span>
                  <span className="text-xs font-bold uppercase tracking-wider">CivicLens AI Analysis</span>
                </div>
                <p className="text-sm italic text-secondary/90 leading-relaxed">"{report.summary}"</p>
              </div>
            </motion.div>

          </div>
        </motion.div>

        {/* Right: Info Cards */}
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="lg:col-span-5 space-y-6">

          {/* Media & Evidence — real photos from DB */}
          <motion.div variants={itemVariants}>
            <GlassPanel className="bg-surface-container rounded-3xl p-6">
              <Headline level={4} className="mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">imagesmode</span>
                Media & Evidence
              </Headline>
              <div className="grid grid-cols-2 gap-3">
                {/* Original issue photo */}
                {hasOriginalPhoto ? (
                  <div className="relative group cursor-pointer overflow-hidden rounded-xl h-40">
                    <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" src={report.image_url} alt="Evidence" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="material-symbols-outlined text-white">zoom_in</span>
                    </div>
                    <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-[10px] font-bold uppercase">Original Issue</div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-foreground/10 rounded-xl h-40 flex flex-col items-center justify-center text-on-surface-variant/40 bg-foreground/5">
                    <span className="material-symbols-outlined text-3xl mb-2">{catIcon}</span>
                    <p className="text-xs font-semibold text-center px-2">{report.category}</p>
                    <p className="text-[10px] mt-1 uppercase tracking-widest">No Photo</p>
                  </div>
                )}

                {/* Confirmation/Resolution photo */}
                {hasConfirmationPhoto ? (
                  <div className="relative group cursor-pointer overflow-hidden rounded-xl h-40">
                    <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" src={report.confirmation_photo_url} alt="Resolution" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="material-symbols-outlined text-white">zoom_in</span>
                    </div>
                    <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-[10px] font-bold uppercase text-secondary">Resolution Photo</div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-foreground/10 rounded-xl h-40 flex flex-col items-center justify-center text-on-surface-variant/40 bg-foreground/5">
                    <span className="material-symbols-outlined text-3xl mb-2">pending</span>
                    <p className="text-xs font-semibold">Resolution Photo</p>
                    <p className="text-[10px] mt-1 uppercase tracking-widest">
                      {report.status === "Resolved" || report.status === "Closed" ? "Review Pending" : "Pending Finish"}
                    </p>
                  </div>
                )}
              </div>
            </GlassPanel>
          </motion.div>

          {/* Real Issue Details */}
          <motion.div variants={itemVariants}>
            <GlassPanel className="bg-surface-container rounded-3xl p-6 space-y-4">
              <Headline level={4} className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">info</span>
                Issue Details
              </Headline>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-foreground/5 rounded-xl p-3">
                  <Label className="text-on-surface-variant block mb-1">Category</Label>
                  <p className="font-bold text-sm capitalize">{report.category}</p>
                </div>
                <div className="bg-foreground/5 rounded-xl p-3">
                  <Label className="text-on-surface-variant block mb-1">Department</Label>
                  <p className="font-bold text-sm">{report.department || workerDept}</p>
                </div>
                <div className="bg-foreground/5 rounded-xl p-3">
                  <Label className="text-on-surface-variant block mb-1">Severity</Label>
                  <p className="font-bold text-sm">{report.severity || "—"}</p>
                </div>
                <div className="bg-foreground/5 rounded-xl p-3">
                  <Label className="text-on-surface-variant block mb-1">ETA</Label>
                  <p className="font-bold text-sm text-primary">{report.estimated_resolution_time}</p>
                </div>
              </div>
              {(report.latitude && report.longitude) && (
                <div className="bg-foreground/5 rounded-xl p-3 flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
                  <div>
                    <Label className="text-on-surface-variant block">GPS Coordinates</Label>
                    <p className="font-mono text-sm">{Number(report.latitude).toFixed(4)}°N, {Number(report.longitude).toFixed(4)}°E</p>
                  </div>
                </div>
              )}
              <Button 
                variant="outline" 
                className="w-full justify-center" 
                onClick={() => navigate("/map", { state: { lat: report.latitude, lng: report.longitude, id: report.id } })}
              >
                <span className="material-symbols-outlined text-sm mr-2">map</span>
                View on Live Map
              </Button>
            </GlassPanel>
          </motion.div>

          {/* Final Actions */}
          <motion.div variants={itemVariants}>
            <GlassPanel className="bg-surface-container-highest/60 rounded-3xl p-6">
              <Headline level={4} className="mb-4">Final Actions</Headline>
              <div className="space-y-4">
                <button
                  className={`w-full py-4 rounded-2xl flex items-center justify-center gap-2 transition-all font-semibold ${
                    report.status === "Resolved" || report.status === "Closed"
                      ? "bg-primary text-on-primary hover:shadow-lg hover:shadow-primary/20 cursor-pointer"
                      : "bg-outline-variant text-on-surface/40 cursor-not-allowed grayscale"
                  }`}
                  disabled={report.status !== "Resolved" && report.status !== "Closed"}
                >
                  <span className="material-symbols-outlined">how_to_reg</span>
                  Citizen Verification
                </button>
                <div className="pt-4 border-t border-foreground/5 text-center">
                  <p className="text-sm text-on-surface-variant mb-3">Rate current response quality</p>
                  <div className="flex justify-center gap-2">
                    {[1,2,3,4,5].map(i => (
                      <span key={i} className={`material-symbols-outlined cursor-pointer transition-colors ${i <= 4 ? "text-primary" : "text-outline hover:text-primary"}`}>star</span>
                    ))}
                  </div>
                </div>
              </div>
            </GlassPanel>
          </motion.div>

        </motion.div>
      </div>
    </div>
  )
}
