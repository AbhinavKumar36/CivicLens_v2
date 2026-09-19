import React, { useState, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { Headline, BodyText, Label } from "@/components/atoms/Typography"
import { Button } from "@/components/atoms/Button"
import { StatusChip } from "@/components/atoms/StatusChip"
import { cn } from "@/utils/utils"
import { api } from "@/services/api"
import { ManualReportForm } from "@/components/organisms/ManualReportForm"
import { useNotifications } from "@/contexts/NotificationContext"
import { useAuth } from "@/contexts/AuthContext"
import { useGeolocation } from "@/hooks/useGeolocation"
import { VoiceReportForm } from "@/components/organisms/VoiceReportForm"

interface ReportData {
  category: string
  priority: string
  department: string
  severity: string
  summary: string
  estimated_resolution_time: string
  image?: string | null
}

export function ReportIssue() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addNotification } = useNotifications()
  const queryClient = useQueryClient()
  
  const [reportMode, setReportMode] = useState<"history" | "manual" | "image" | "voice">("voice")
  
  // Image Upload State
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [fileName, setFileName] = useState("")
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  
  // Global Report State
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAnonymous, setIsAnonymous] = useState(false)
  
  const { latitude: userLat, longitude: userLng } = useGeolocation()

  const { data: rawReports, isLoading: isHistoryLoading } = useQuery({
    queryKey: ['complaints'],
    queryFn: api.getComplaints
  })

  // Image Upload Logic
  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return
    setFileName(file.name)
    setReportData(null)

    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleRunImageAnalysis = async () => {
    if (!imagePreview) return
    setIsAnalyzingImage(true)

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY
      if (!apiKey) throw new Error("No API key")

      const base64Data = imagePreview.split(",")[1]
      const mimeType = imagePreview.split(";")[0].split(":")[1]

      const requestBody = JSON.stringify({
        contents: [{
          parts: [
            { inlineData: { data: base64Data, mimeType } },
            { text: `Analyze this uploaded image for a municipal damage report in our smart city OS. You must return a JSON object with the following fields: { "summary": "A short, precise summary (e.g. 'Pothole in Asphalt')", "category": "One of: infrastructure, corruption, safety, environment, sanitation", "severity": "One of: Critical, High, Medium, Low", "priority": "One of: Critical, High, Medium, Low", "department": "A plausible city department (e.g. 'Public Works')", "estimated_resolution_time": "e.g. '48 Hours'" }. Return ONLY the raw JSON string inside your output.` }
          ]
        }],
        generationConfig: { responseMimeType: "application/json" }
      });

      let response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`,
        { method: "POST", headers: { "Content-Type": "application/json" }, body: requestBody }
      )

      if (!response.ok) {
        console.warn(`Gemini 3.5 Flash failed (HTTP ${response.status}). Falling back to 2.5 Flash...`)
        response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          { method: "POST", headers: { "Content-Type": "application/json" }, body: requestBody }
        )
      }

      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      
      const data = await response.json()
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || ""
      let cleaned = rawText.trim()
      if (cleaned.startsWith("```json")) {
        cleaned = cleaned.replace(/^```json\s*/i, "").replace(/\s*```$/i, "")
      } else if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```\s*/, "").replace(/\s*```$/, "")
      }
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
      const parsed: ReportData = JSON.parse(jsonMatch ? jsonMatch[0] : cleaned)
      
      setReportData({ ...parsed, image: imagePreview })
      addNotification({
        title: "Image Diagnostic Complete",
        message: `Gemini identified "${parsed.summary}" classified under ${parsed.category}.`,
        type: "success",
        group: "system"
      })
    } catch (error) {
      console.warn("Gemini Vision analysis failed, falling back to mock:", error)
      const mockResult: ReportData = {
        summary: "Damaged Road Surface",
        category: "infrastructure",
        priority: "High",
        severity: "High",
        department: "Public Works",
        estimated_resolution_time: "48 Hours",
        image: imagePreview
      }
      setReportData(mockResult)
      addNotification({
        title: "Image Analysis Complete (Demo)",
        message: `Identified "${mockResult.summary}". Using demo data — add VITE_GEMINI_API_KEY for real analysis.`,
        type: "info",
        group: "system"
      })
    } finally {
      setIsAnalyzingImage(false)
    }
  }

  const handleSubmitReport = async () => {
    if (!reportData) return
    setIsSubmitting(true)
    try {
      let lat = userLat || 20.2961;
      let lng = userLng || 85.8245;
      const lower = (reportData.summary || "").toLowerCase();
      if (lower.includes("bhouma") || lower.includes("unit 4") || lower.includes("unit-4")) {
        lat = 20.2785; lng = 85.8324;
      } else if (lower.includes("saheed")) {
        lat = 20.2882; lng = 85.8501;
      } else if (lower.includes("rasulgarh")) {
        lat = 20.2961; lng = 85.8712;
      } else if (lower.includes("nayapalli") || lower.includes("irc")) {
        lat = 20.3015; lng = 85.8152;
      } else if (lower.includes("patia") || lower.includes("kiit")) {
        lat = 20.3541; lng = 85.8175;
      } else if (lower.includes("sum") || lower.includes("khandagiri") || lower.includes("nh 16") || lower.includes("nh-16")) {
        lat = 20.2835; lng = 85.7697;
      }

      const response = await api.createComplaint({
        category: reportData.category,
        priority: reportData.priority,
        department: reportData.department,
        severity: reportData.severity,
        summary: reportData.summary,
        estimated_resolution_time: reportData.estimated_resolution_time,
        user_id: isAnonymous ? null : (user?.id || 1),
        department_id: 1,
        latitude: lat,
        longitude: lng,
        image_url: reportData.image || null,
      })

      queryClient.invalidateQueries({ queryKey: ['complaints'] })
      queryClient.invalidateQueries({ queryKey: ['planning-demands'] })
      queryClient.invalidateQueries({ queryKey: ['planning-hotspots'] })

      addNotification({
        title: "Real-Time Hotspot Marked!",
        message: response.message || "Demand hotspot dynamically recomputed with 100m radius.",
        type: "success",
        group: "emergency"
      })

      navigate(`/reports/${response.id}`)
    } catch (error) {
      console.error("Failed to submit report:", error)
      alert("Failed to submit report. Ensure the backend is running.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleManualSubmit = async (data: { category: string; severity: string; description: string; location: string; image: string | null }) => {
    setIsSubmitting(true)
    try {
      let lat = 20.2835;
      let lng = 85.7697;

      const locText = (data.location + " " + data.description).toLowerCase();
      if (data.location) {
        const coordMatch = data.location.match(/(-?\d+\.\d+)[,\s]+(-?\d+\.\d+)/);
        if (coordMatch) {
          lat = parseFloat(coordMatch[1]);
          lng = parseFloat(coordMatch[2]);
        } else if (locText.includes('sum') || locText.includes('khandagiri') || locText.includes('nh 16') || locText.includes('nh-16')) {
          lat = 20.2835; lng = 85.7697;
        } else if (locText.includes('23') || locText.includes('bhouma') || locText.includes('unit 4')) {
          lat = 20.2785; lng = 85.8324;
        } else if (locText.includes('24') || locText.includes('saheed')) {
          lat = 20.2882; lng = 85.8501;
        } else if (locText.includes('35') || locText.includes('rasulgarh')) {
          lat = 20.2961; lng = 85.8712;
        } else if (locText.includes('42') || locText.includes('nayapalli')) {
          lat = 20.3015; lng = 85.8152;
        } else if (locText.includes('12') || locText.includes('chandrasekharpur') || locText.includes('patia')) {
          lat = 20.3245; lng = 85.8182;
        } else if (locText.includes('31') || locText.includes('old town')) {
          lat = 20.2421; lng = 85.8354;
        }
      }

      const response = await api.createComplaint({
        category: data.category,
        priority: data.severity.charAt(0).toUpperCase() + data.severity.slice(1),
        department: data.category === "infrastructure" ? "Public Works" : data.category === "corruption" ? "Internal Affairs" : data.category === "safety" ? "Public Safety" : data.category === "environment" ? "Environmental" : data.category === "sanitation" ? "Sanitation" : "General",
        severity: data.severity.charAt(0).toUpperCase() + data.severity.slice(1),
        summary: data.description,
        estimated_resolution_time: data.severity === "critical" ? "24 Hours" : data.severity === "high" ? "48 Hours" : data.severity === "medium" ? "5 Business Days" : "10 Business Days",
        user_id: isAnonymous ? null : (user?.id || 1),
        department_id: 1,
        latitude: lat,
        longitude: lng,
        image_url: data.image || null,
      })

      queryClient.invalidateQueries({ queryKey: ['complaints'] })
      queryClient.invalidateQueries({ queryKey: ['planning-demands'] })
      queryClient.invalidateQueries({ queryKey: ['planning-hotspots'] })

      addNotification({
        title: "Real-Time Hotspot Marked!",
        message: response.message || "Demand hotspot dynamically recomputed with 100m radius.",
        type: "success",
        group: "emergency"
      })

      navigate(`/reports/${response.id}`)
    } catch (error) {
      console.error("Failed to submit manual report:", error)
      alert("Failed to submit manual report.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 relative z-10 min-h-[calc(100vh-140px)] flex flex-col">
      
      {/* Header */}
      <div className="mb-8 text-center relative">
        <Headline level={2} className="text-primary font-bold">Report an Issue</Headline>
        <BodyText className="text-on-surface-variant mt-2">
          {reportMode === "history" 
            ? "View and track the status of your past reports."
            : reportMode === "image"
            ? "Upload a photo and let AI automatically classify and describe the issue."
            : "Fill out the form below to manually file a report."}
        </BodyText>
        
        {/* Toggle Mode */}
        <div className="mt-6 inline-flex bg-surface-container-lowest border border-foreground/10 rounded-xl p-1 relative z-20 flex-wrap justify-center gap-1">
          <button
            onClick={() => { setReportMode("history"); setReportData(null); }}
            className={cn(
              "px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2",
              reportMode === "history" ? "bg-primary text-on-primary shadow-md" : "text-on-surface-variant hover:bg-foreground/5"
            )}
          >
            <span className="material-symbols-outlined text-sm">history</span>
            History & Tracking
          </button>
          <button
            onClick={() => { setReportMode("voice"); setReportData(null); }}
            className={cn(
              "px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2",
              reportMode === "voice" ? "bg-primary text-on-primary shadow-md" : "text-on-surface-variant hover:bg-foreground/5"
            )}
          >
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>mic</span>
            Voice
          </button>
          <button
            onClick={() => { setReportMode("image"); setReportData(null); }}
            className={cn(
              "px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2",
              reportMode === "image" ? "bg-primary text-on-primary shadow-md" : "text-on-surface-variant hover:bg-foreground/5"
            )}
          >
            <span className="material-symbols-outlined text-sm">image_search</span>
            Image Analysis
          </button>
          <button
            onClick={() => { setReportMode("manual"); setReportData(null); }}
            className={cn(
              "px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2",
              reportMode === "manual" ? "bg-primary text-on-primary shadow-md" : "text-on-surface-variant hover:bg-foreground/5"
            )}
          >
            <span className="material-symbols-outlined text-sm">edit_document</span>
            Manual Entry
          </button>
        </div>
      </div>

      <div className="flex-1 max-w-4xl mx-auto w-full flex flex-col h-full gap-6">
        
        <AnimatePresence mode="wait">
          {reportMode === "history" && !reportData ? (
             <motion.div
             key="history"
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             exit={{ opacity: 0, scale: 0.95 }}
             className="w-full space-y-4"
           >
             {isHistoryLoading ? (
               <div className="flex justify-center p-8">
                 <span className="material-symbols-outlined animate-spin text-4xl text-primary">sync</span>
               </div>
             ) : rawReports && rawReports.length > 0 ? (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {rawReports.map((report: any) => (
                   <GlassPanel
                     key={report.id}
                     onClick={() => navigate(`/reports/${report.id}`)}
                     className="p-5 rounded-2xl cursor-pointer hover:bg-foreground/5 hover:border-primary/30 transition-all border border-foreground/10 flex flex-col h-full"
                   >
                     <div className="flex justify-between items-start mb-3 gap-2">
                       <Headline level={4} className="text-on-surface line-clamp-2 leading-snug text-base">{report.summary}</Headline>
                       <StatusChip status={report.status} variant={report.status === 'Resolved' ? 'success' : report.status === 'Pending' ? 'warning' : 'primary'} />
                     </div>
                      <div className="mt-auto pt-3 border-t border-foreground/5 flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                          <div className="flex flex-col gap-0.5">
                            <Label className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">Category</Label>
                            <BodyText className="text-sm font-semibold capitalize text-foreground">{report.category}</BodyText>
                          </div>
                          <span className="material-symbols-outlined text-primary/70 group-hover:text-primary transition-colors">arrow_forward</span>
                        </div>
                        {report.latitude && report.longitude && (
                          <div className="flex items-center justify-between gap-2 pt-1">
                            <div className="flex items-center gap-1 text-[11px] text-on-surface-variant font-mono">
                              <span className="material-symbols-outlined text-xs text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
                              <span>{Number(report.latitude).toFixed(4)}°N, {Number(report.longitude).toFixed(4)}°E</span>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate('/map', { state: { lat: report.latitude, lng: report.longitude, id: report.id } });
                              }}
                              className="text-[11px] font-bold text-primary hover:text-on-primary hover:bg-primary px-2.5 py-1 rounded-lg border border-primary/30 transition-all flex items-center gap-1 bg-primary/10"
                            >
                              <span className="material-symbols-outlined text-xs">map</span>
                              View on Map
                            </button>
                          </div>
                        )}
                      </div>
                    </GlassPanel>
                 ))}
               </div>
             ) : (
               <div className="text-center p-12 bg-surface-container-lowest/50 rounded-3xl border border-foreground/5">
                 <span className="material-symbols-outlined text-5xl text-on-surface-variant/50 mb-4">inbox</span>
                 <Headline level={3} className="mb-2">No Reports Yet</Headline>
                 <BodyText className="text-on-surface-variant">You haven't filed any reports. Select 'Manual Entry' or 'Image Analysis' to report a new issue.</BodyText>
               </div>
             )}
           </motion.div>
          ) : reportMode === "manual" && !reportData ? (
            <motion.div
              key="manual"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full"
            >
              <ManualReportForm
                onSubmit={handleManualSubmit}
                onCancel={() => navigate("/dashboard")}
                isSubmitting={isSubmitting}
                showAnonymityInfo={false}
              />
              <div className="mt-6 flex items-center gap-3">
                <Label className="text-on-surface font-semibold block">Report Anonymously</Label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </motion.div>
          ) : reportMode === "voice" && !reportData ? (
            <motion.div
              key="voice"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6 w-full max-w-2xl mx-auto"
            >
              <VoiceReportForm 
                isAnonymous={isAnonymous} 
                lat={userLat} 
                lng={userLng} 
                onExtractedData={(data: any) => {
                  setReportData(data);
                }} 
              />
            </motion.div>
          ) : reportMode === "image" && !reportData ? (
            <motion.div
              key="image"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl mx-auto space-y-6"
            >
              {/* Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={cn(
                  "relative border-2 border-dashed rounded-3xl cursor-pointer transition-all overflow-hidden",
                  isDragging 
                    ? "border-primary bg-primary/10" 
                    : imagePreview 
                      ? "border-primary/30 bg-foreground/5" 
                      : "border-foreground/15 bg-foreground/5 hover:border-foreground/30 hover:bg-foreground/8",
                  imagePreview ? "min-h-[250px]" : "min-h-[300px]"
                )}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
                />
                
                {imagePreview ? (
                  <div className="p-6 space-y-4 text-center">
                    <img src={imagePreview} alt="Upload preview" className="max-h-64 mx-auto rounded-2xl border border-foreground/10 shadow-lg object-contain" />
                    <p className="text-xs text-green-400 font-semibold">{fileName} loaded</p>
                    <p className="text-[10px] text-on-surface-variant">Click or drop to replace image</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full min-h-[300px] gap-4 text-on-surface-variant">
                    <span className="material-symbols-outlined text-5xl opacity-50">cloud_upload</span>
                    <div className="text-center">
                      <p className="font-bold text-sm text-foreground">Drag & drop an image here</p>
                      <p className="text-xs mt-1">or click to browse files</p>
                    </div>
                    <p className="text-[10px] opacity-60">JPG, PNG, WEBP — Max 10MB</p>
                  </div>
                )}
              </div>

              {/* Run Analysis Button */}
              <Button
                className={cn(
                  "w-full py-4 font-bold transition-all",
                  imagePreview && !isAnalyzingImage
                    ? "bg-gradient-to-r from-primary to-secondary text-on-primary shadow-lg shadow-primary/20"
                    : "bg-foreground/10 text-on-surface-variant cursor-not-allowed"
                )}
                onClick={handleRunImageAnalysis}
                disabled={!imagePreview || isAnalyzingImage}
              >
                {isAnalyzingImage ? (
                  <>
                    <span className="material-symbols-outlined animate-spin mr-2 text-base">auto_awesome</span>
                    Analyzing Image...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined mr-2 text-base">auto_awesome</span>
                    Analyze Image & Create Report
                  </>
                )}
              </Button>
            </motion.div>
          ) : reportData ? (
            <motion.div
              key="confirmation"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex flex-col items-center justify-center"
            >
              <GlassPanel className="w-full max-w-3xl p-8 rounded-3xl border border-primary/30 shadow-[0_0_40px_rgba(192,193,255,0.15)] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-10">
                  <span className="material-symbols-outlined text-9xl text-primary">assignment_turned_in</span>
                </div>
                
                <Headline level={3} className="text-primary mb-6 flex items-center gap-3">
                  <span className="material-symbols-outlined">verified</span>
                  Report Ready for Submission
                </Headline>
                
                <div className="space-y-6 relative z-10">
                  {reportData.image && (
                    <div className="bg-surface-container-lowest/50 p-4 rounded-xl border border-foreground/5 text-center">
                       <Label className="text-on-surface-variant mb-3 block text-left">Attached Evidence</Label>
                       <img src={reportData.image} alt="Report evidence" className="max-h-48 mx-auto rounded-lg shadow-sm border border-foreground/10 object-contain" />
                    </div>
                  )}

                  <div className="bg-surface-container-lowest/50 p-4 rounded-xl border border-foreground/5">
                    <Label className="text-on-surface-variant mb-1 block">Summary</Label>
                    <BodyText className="text-on-surface font-medium">{reportData.summary}</BodyText>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-surface-container-lowest/50 p-4 rounded-xl border border-foreground/5">
                      <Label className="text-on-surface-variant mb-1 block">Category</Label>
                      <BodyText className="text-on-surface font-semibold">{reportData.category}</BodyText>
                    </div>
                    <div className="bg-surface-container-lowest/50 p-4 rounded-xl border border-foreground/5">
                      <Label className="text-on-surface-variant mb-1 block">Department</Label>
                      <BodyText className="text-on-surface font-semibold">{reportData.department}</BodyText>
                    </div>
                    <div className="bg-surface-container-lowest/50 p-4 rounded-xl border border-foreground/5">
                      <Label className="text-on-surface-variant mb-1 block">Priority</Label>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "w-2 h-2 rounded-full",
                          reportData.priority === "Critical" ? "bg-error" : reportData.priority === "High" ? "bg-orange-500" : "bg-primary"
                        )}></span>
                        <BodyText className="text-on-surface font-semibold">{reportData.priority}</BodyText>
                      </div>
                    </div>
                    <div className="bg-surface-container-lowest/50 p-4 rounded-xl border border-foreground/5">
                      <Label className="text-on-surface-variant mb-1 block">Severity</Label>
                      <BodyText className="text-on-surface font-semibold">{reportData.severity}</BodyText>
                    </div>
                  </div>
                  
                  <div className="bg-primary/10 p-4 rounded-xl border border-primary/20 flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">schedule</span>
                    <div>
                      <Label className="text-primary block">Estimated Resolution Time</Label>
                      <BodyText className="text-on-surface-variant font-medium">{reportData.estimated_resolution_time}</BodyText>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-4 rounded-xl border border-primary/20 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-base">hub</span>
                      <Label className="text-primary font-bold">Constituency Development Planning Link</Label>
                    </div>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      This submission automatically feeds the <strong>People's Priorities AI Normalization Pipeline</strong>, contributing to Ward-level demand recurrence, hotspot identification, and public infrastructure proposals.
                    </p>
                  </div>

                  <div className="bg-surface-container-lowest/50 p-4 rounded-xl border border-foreground/5 flex items-center justify-between">
                    <div>
                      <Label className="text-on-surface font-semibold block">Report Anonymously</Label>
                      <BodyText className="text-on-surface-variant text-xs mt-1">
                        Submit this report without tying it to your citizen profile.
                      </BodyText>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>

                <div className="mt-8 flex gap-4">
                  <Button variant="outline" className="flex-1" onClick={() => {
                    setReportData(null);
                  }}>
                    Edit / Go Back
                  </Button>
                  <Button 
                    className="flex-1 bg-gradient-to-r from-primary to-secondary text-on-primary font-bold shadow-lg shadow-primary/20"
                    onClick={handleSubmitReport}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Report"}
                    {!isSubmitting && <span className="material-symbols-outlined ml-2">send</span>}
                  </Button>
                </div>
              </GlassPanel>
            </motion.div>
          ) : null}
        </AnimatePresence>

      </div>
    </div>
  )
}
