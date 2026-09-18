import React, { useRef, useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { api } from "@/services/api"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { Headline, BodyText, Label } from "@/components/atoms/Typography"
import { cn } from "@/utils/utils"
import { useAuth } from "@/contexts/AuthContext"
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"

// Fix leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

function PhotoUploadModal({ job, onClose, onSuccess, workerId }) {
  const fileInputRef = useRef(null)
  const [preview, setPreview] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState(null)
  const [markResolved, setMarkResolved] = useState(true)
  const queryClient = useQueryClient()

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setError("Photo must be under 5MB."); return }
    setError(null)
    const reader = new FileReader()
    reader.onload = () => setPreview(reader.result)
    reader.readAsDataURL(file)
  }

  const handleSubmit = async () => {
    if (!preview) { setError("Please select a photo first."); return }
    setIsUploading(true)
    setError(null)
    try {
      await api.uploadConfirmationPhoto(job.id, preview, workerId)
      if (markResolved) await api.updateComplaintStatus(job.id, "Resolved")
      queryClient.invalidateQueries({ queryKey: ['complaints'] })
      onSuccess()
    } catch (e) {
      setError("Upload failed. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0 }}
          className="w-full max-w-md bg-surface-container border border-foreground/10 rounded-3xl shadow-2xl overflow-hidden"
        >
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-foreground/10">
            <div>
              <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>photo_camera</span>
                Upload Confirmation Photo
              </h2>
              <p className="text-xs text-on-surface-variant mt-0.5 truncate max-w-[280px]">{job.summary}</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-foreground/10 text-on-surface-variant transition-colors">
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <div className="p-6 space-y-5">
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`relative w-full h-52 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden ${preview ? 'border-primary/40 bg-transparent' : 'border-foreground/20 bg-foreground/5 hover:bg-foreground/10 hover:border-primary/40'}`}
            >
              {preview ? (
                <>
                  <img src={preview} alt="Preview" className="absolute inset-0 w-full h-full object-cover rounded-2xl" />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-2xl">
                    <span className="text-white text-sm font-bold bg-black/60 px-3 py-1.5 rounded-full">Change Photo</span>
                  </div>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-5xl text-on-surface-variant/50 mb-3" style={{ fontVariationSettings: "'FILL' 1" }}>add_a_photo</span>
                  <p className="text-sm font-semibold text-on-surface-variant">Tap to capture or select</p>
                  <p className="text-xs text-on-surface-variant/60 mt-1">Camera · Gallery · Max 5MB</p>
                </>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />

            <label className="flex items-center gap-3 cursor-pointer group">
              <div
                onClick={() => setMarkResolved(v => !v)}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${markResolved ? 'bg-primary border-primary' : 'border-foreground/30 bg-foreground/5'}`}
              >
                {markResolved && <span className="material-symbols-outlined text-[14px] text-on-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>}
              </div>
              <div>
                <p className="text-sm font-semibold text-on-surface group-hover:text-primary transition-colors">Mark as Resolved</p>
                <p className="text-xs text-on-surface-variant">Auto-update job status to Resolved</p>
              </div>
            </label>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-error/10 border border-error/20 text-error text-sm">
                <span className="material-symbols-outlined text-[18px]">error</span>
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-foreground/15 text-on-surface-variant font-semibold text-sm hover:bg-foreground/10 transition-all">Cancel</button>
              <button
                onClick={handleSubmit}
                disabled={!preview || isUploading}
                className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${preview && !isUploading ? 'bg-primary text-on-primary hover:bg-primary/90 shadow-lg shadow-primary/30 active:scale-95' : 'bg-foreground/10 text-on-surface-variant cursor-not-allowed'}`}
              >
                {isUploading ? (
                  <><span className="w-4 h-4 border-2 border-on-primary/40 border-t-on-primary rounded-full animate-spin"></span>Uploading...</>
                ) : (
                  <><span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>cloud_upload</span>Submit Confirmation</>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export function WorkerDashboard() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const [uploadingJobId, setUploadingJobId] = useState(null)
  const [successJobId, setSuccessJobId] = useState(null)
  const [sosAlert, setSosAlert] = useState(null)

  useEffect(() => {
    const sse = new EventSource('http://localhost:3000/api/emergency/stream')
    sse.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data)
        setSosAlert(data)
      } catch (err) {}
    }
    return () => sse.close()
  }, [])

  const handleStatusChange = async (jobId, newStatus) => {
    try {
      await api.updateComplaintStatus(jobId, newStatus)
      queryClient.invalidateQueries({ queryKey: ['complaints'] })
    } catch (e) {
      console.error("Failed to update job status:", e)
    }
  }

  const { data: rawWorkers = [] } = useQuery({ queryKey: ['workers'], queryFn: api.getWorkers })
  const { data: rawComplaints = [], isLoading } = useQuery({ queryKey: ['complaints'], queryFn: api.getComplaints, refetchInterval: 5000 })

  const activeWorker = React.useMemo(() => {
    const matched = rawWorkers.find((w) => w.name === user?.name)
    return matched || rawWorkers[0] || { id: 1, name: "Rahul Verma", status: "Busy", department: { name: "Transit" } }
  }, [rawWorkers, user])

  const workerJobs = React.useMemo(() => rawComplaints.filter((c) => c.worker_id === activeWorker.id), [rawComplaints, activeWorker])
  const completedJobs = workerJobs.filter((j) => j.status === "Resolved" || j.status === "Closed").length
  const activeJobs = workerJobs.length - completedJobs

  const uploadingJob = workerJobs.find((j) => j.id === uploadingJobId)

  return (
    <div className="w-full h-full p-4 md:p-8 space-y-6">
      {uploadingJobId !== null && uploadingJob && (
        <PhotoUploadModal
          job={uploadingJob}
          workerId={activeWorker?.id}
          onClose={() => setUploadingJobId(null)}
          onSuccess={() => {
            setSuccessJobId(uploadingJobId)
            setUploadingJobId(null)
            setTimeout(() => setSuccessJobId(null), 3000)
          }}
        />
      )}

      {/* SOS Alert Modal */}
      <AnimatePresence>
        {sosAlert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-error/20 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-surface border-2 border-error rounded-3xl p-8 max-w-md w-full shadow-[0_0_50px_rgba(255,0,0,0.3)] text-center relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-error/10 animate-pulse pointer-events-none" />
              <span className="material-symbols-outlined text-6xl text-error mb-4">emergency</span>
              <Headline level={2} className="text-error font-bold mb-2">SOS ALERT RECEIVED</Headline>
              <BodyText className="text-on-surface text-lg mb-1">{sosAlert.type}</BodyText>
              <BodyText className="text-on-surface-variant mb-6">Location: {sosAlert.location}</BodyText>
              
              <button 
                onClick={() => setSosAlert(null)}
                className="w-full py-4 bg-error text-on-error font-bold rounded-xl text-lg hover:bg-error/90 transition-colors shadow-lg active:scale-95"
              >
                Acknowledge & Route
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="md:hidden flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden border border-primary/30 bg-primary/10 flex items-center justify-center text-primary font-bold">
            {activeWorker.name[0]}
          </div>
          <div>
            <Headline level={4} className="text-[18px] text-primary leading-tight">Field Central</Headline>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
              <Label className="text-[10px] text-on-surface-variant uppercase tracking-wider block">
                {activeWorker.department?.name || "General"} - {activeWorker.status}
              </Label>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="material-symbols-outlined text-primary text-xl">signal_wifi_off</span>
          <Label className="text-[8px] text-primary/70 block">OFFLINE</Label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[calc(100vh-140px)]">
        <div className="md:col-span-5 flex flex-col gap-6 h-full">
          <div className="hidden md:flex justify-between items-end">
            <div>
              <Headline level={1} className="text-3xl text-primary font-bold">{activeWorker.name}</Headline>
              <BodyText className="text-on-surface-variant flex items-center gap-2 mt-1">
                <span className="material-symbols-outlined text-sm">badge</span>
                {activeWorker.department?.name || "General"} Division
              </BodyText>
            </div>
            <div className="flex items-center gap-2 bg-foreground/5 px-3 py-1.5 rounded-full border border-foreground/10">
              <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface">{activeWorker.status}</span>
            </div>
          </div>

          <motion.section initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-3xl p-6 relative overflow-hidden bg-surface-container/60 border border-foreground/10 flex-shrink-0">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-primary/10 blur-3xl rounded-full"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <Headline level={2} className="mb-1 text-2xl">Today's Agenda</Headline>
                  <BodyText className="text-on-surface-variant opacity-80">
                    {new Date().toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
                  </BodyText>
                </div>
                <div className="bg-surface-container-highest px-3 py-1 rounded-full border border-foreground/5">
                  <Label className="text-primary">v2.4 AI Active</Label>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-foreground/5 rounded-2xl p-4 border border-foreground/5">
                  <Label className="text-on-surface-variant mb-1 block">Total Tasks</Label>
                  <Headline level={1} className="text-3xl">0{workerJobs.length}</Headline>
                </div>
                <div className="bg-foreground/5 rounded-2xl p-4 border border-foreground/5">
                  <Label className="text-on-surface-variant mb-1 block">Remaining</Label>
                  <Headline level={1} className="text-3xl text-tertiary">{activeJobs} Active</Headline>
                </div>
              </div>
              <button className="w-full h-14 bg-gradient-to-r from-primary-container to-secondary-container rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                <span className="material-symbols-outlined text-on-primary" style={{ fontVariationSettings: "'FILL' 1" }}>route</span>
                <span className="font-headline-md text-[18px] font-bold text-on-primary">Start Optimized Route</span>
              </button>
            </div>
          </motion.section>

          <GlassPanel className="flex-1 rounded-3xl overflow-hidden relative border border-foreground/10 min-h-[200px]">
            {workerJobs.length > 0 ? (
              <MapContainer 
                center={[workerJobs[0].latitude || 20.296, workerJobs[0].longitude || 85.824]} 
                zoom={13} 
                style={{ height: '100%', width: '100%', zIndex: 1 }}
                zoomControl={false}
              >
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />
                {workerJobs.filter(j => j.latitude && j.longitude).map(job => (
                  <Marker key={job.id} position={[job.latitude, job.longitude]} />
                ))}
                <Polyline 
                  positions={workerJobs.filter(j => j.latitude && j.longitude).map(j => [j.latitude, j.longitude])}
                  pathOptions={{ color: '#ffb0cd', weight: 4, dashArray: '10, 10' }}
                />
              </MapContainer>
            ) : (
              <div className="absolute inset-0 bg-surface-variant/30 flex flex-col items-center justify-center text-on-surface-variant/50 z-10">
                <span className="material-symbols-outlined text-4xl mb-2">map</span>
                <span className="text-sm font-bold uppercase tracking-widest">Live Routing</span>
              </div>
            )}
            <div className="absolute top-4 left-4 z-10 bg-surface-container/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-foreground/10 shadow-lg">
              <span className="text-xs font-bold text-primary flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">route</span> TSP Optimized
              </span>
            </div>
          </GlassPanel>

          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="grid grid-cols-2 gap-4 flex-shrink-0">
            <GlassPanel className="p-4 rounded-2xl bg-surface-container/40">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-tertiary text-lg">bolt</span>
                <Label className="text-on-surface-variant">Efficiency</Label>
              </div>
              <Headline level={1} className="text-2xl">94%</Headline>
              <div className="w-full bg-foreground/10 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-tertiary h-full" style={{ width: "94%" }}></div>
              </div>
            </GlassPanel>
            <GlassPanel className="p-4 rounded-2xl bg-surface-container/40">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-primary text-lg">verified</span>
                <Label className="text-on-surface-variant">Completion</Label>
              </div>
              <Headline level={1} className="text-2xl">{completedJobs}/{workerJobs.length}</Headline>
              <div className="w-full bg-foreground/10 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-primary h-full" style={{ width: `${workerJobs.length > 0 ? (completedJobs/workerJobs.length)*100 : 0}%` }}></div>
              </div>
            </GlassPanel>
          </motion.section>
        </div>

        <div className="md:col-span-7 flex flex-col h-full">
          <div className="flex justify-between items-center mb-4 px-2">
            <Headline level={3} className="text-[20px] flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">assignment</span>
              Assigned Jobs
            </Headline>
            <div className="flex items-center gap-2 bg-foreground/5 rounded-full px-1 py-1">
              <button className="px-3 py-1 bg-surface rounded-full text-xs font-bold shadow-sm">All</button>
              <button className="px-3 py-1 text-on-surface-variant text-xs font-bold hover:text-on-surface">Active</button>
              <button className="px-3 py-1 text-on-surface-variant text-xs font-bold hover:text-on-surface">Resolved</button>
            </div>
          </div>

          <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
            {isLoading ? (
              <p className="text-sm text-on-surface-variant p-4">Loading jobs...</p>
            ) : workerJobs.length === 0 ? (
              <GlassPanel className="p-12 text-center text-on-surface-variant mt-10">
                <span className="material-symbols-outlined text-5xl mb-4 text-primary opacity-50">task_alt</span>
                <p className="font-semibold text-lg text-foreground mb-2">All clear!</p>
                <p className="text-sm">No active jobs assigned to {activeWorker.name} right now.</p>
              </GlassPanel>
            ) : (
              workerJobs.map((job) => {
                const isCritical = job.priority === "Critical" || job.priority === "High"
                const isResolved = job.status === "Resolved" || job.status === "Closed"
                const hasPhoto = !!job.confirmation_photo_url
                const isJustSucceeded = successJobId === job.id
                const borderClass = isResolved ? "border-l-foreground/20 opacity-80" : isCritical ? "border-l-error" : "border-l-secondary-container"
                const chipClass = isCritical ? "bg-error-container text-on-error-container" : "bg-secondary-container/20 text-secondary"

                return (
                  <motion.div key={job.id} variants={itemVariants}>
                    <GlassPanel hover className={`p-5 space-y-4 border-l-[6px] bg-surface-container/40 transition-all ${borderClass}`}>
                      <AnimatePresence>
                        {isJustSucceeded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary/10 border border-secondary/20 text-secondary text-sm font-semibold"
                          >
                            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                            Photo confirmation uploaded successfully!
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="flex justify-between items-start">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${isResolved ? 'bg-foreground/10 text-foreground' : chipClass}`}>
                          {job.priority} Priority
                        </span>
                        <div className="flex items-center gap-2">
                          <Label className="text-[10px] text-on-surface-variant uppercase font-bold mr-1">Status:</Label>
                          <select
                            value={job.status}
                            onChange={(e) => handleStatusChange(job.id, e.target.value)}
                            className={`bg-foreground/5 border border-foreground/10 rounded-lg focus:ring-0 text-xs font-bold p-1 outline-none cursor-pointer ${isResolved ? 'text-on-surface-variant' : 'text-primary'}`}
                          >
                            <option value="Pending" className="bg-surface text-on-surface">Pending</option>
                            <option value="In Progress" className="bg-surface text-on-surface">In Progress</option>
                            <option value="Resolved" className="bg-surface text-on-surface">Resolved</option>
                            <option value="Closed" className="bg-surface text-on-surface">Closed</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <Headline level={4} className="text-[20px] leading-tight mb-2">{job.summary}</Headline>
                        <div className="flex flex-wrap items-center gap-4 text-on-surface-variant">
                          <div className="flex items-center gap-1 bg-foreground/5 px-2 py-1 rounded-md">
                            <span className="material-symbols-outlined text-[14px]">category</span>
                            <Label className="text-[11px]">{job.category}</Label>
                          </div>
                          <div className="flex items-center gap-1 bg-foreground/5 px-2 py-1 rounded-md">
                            <span className="material-symbols-outlined text-[14px]">schedule</span>
                            <Label className="text-[11px]">Est: {job.estimated_resolution_time}</Label>
                          </div>
                          <div className="flex items-center gap-1 bg-foreground/5 px-2 py-1 rounded-md">
                            <span className="material-symbols-outlined text-[14px]">location_on</span>
                            <Label className="text-[11px]">Sector 4</Label>
                          </div>
                        </div>
                      </div>

                      {hasPhoto && (
                        <div className="flex items-center gap-3 pt-1">
                          <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-secondary/30 flex-shrink-0 shadow-md">
                            <img src={job.confirmation_photo_url} alt="Confirmation" className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-secondary flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                              Confirmation Photo Uploaded
                            </p>
                            <p className="text-[10px] text-on-surface-variant mt-0.5">
                              {job.confirmation_uploaded_at ? new Date(job.confirmation_uploaded_at).toLocaleString() : "Just now"}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-end gap-3 pt-4 mt-2 border-t border-foreground/5">
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setUploadingJobId(job.id)}
                          className={`px-4 py-2 rounded-xl font-bold font-label-sm text-xs transition-colors flex items-center gap-2 ${hasPhoto ? 'bg-secondary/10 text-secondary hover:bg-secondary/20' : 'bg-primary/10 text-primary hover:bg-primary/20'}`}
                        >
                          <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                            {hasPhoto ? "photo_camera" : "add_a_photo"}
                          </span>
                          {hasPhoto ? "Update Photo" : "Upload Photo"}
                        </motion.button>
                        <button className="px-4 py-2 text-primary hover:bg-primary/10 rounded-xl font-bold font-label-sm text-xs transition-colors flex items-center gap-2">
                          <span className="material-symbols-outlined text-base">directions</span>
                          Navigate
                        </button>
                        <button onClick={() => navigate(`/reports/${job.id}`)} className="px-4 py-2 bg-foreground/10 text-foreground hover:bg-foreground/20 rounded-xl font-bold font-label-sm text-xs transition-colors flex items-center gap-2">
                          <span className="material-symbols-outlined text-base">visibility</span>
                          Details
                        </button>
                      </div>
                    </GlassPanel>
                  </motion.div>
                )
              })
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
