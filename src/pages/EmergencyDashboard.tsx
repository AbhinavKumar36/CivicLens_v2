import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "@/services/api"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { Headline, BodyText, Label } from "@/components/atoms/Typography"
import { cn } from "@/utils/utils"

const handleSOSDispatch = async (type: string, severity: string) => {
  if (confirm(`Are you sure you want to dispatch an SOS alert for ${type}?`)) {
    try {
      await api.client.post('/api/emergency/sos', { type, location: 'Citywide', severity });
      alert('SOS Alert Dispatched successfully!');
    } catch (err) {
      alert('Failed to dispatch SOS alert.');
      console.error(err);
    }
  }
}

export function EmergencyDashboard() {
  const queryClient = useQueryClient()
  
  // State for panic button
  const [countdown, setCountdown] = useState<number | null>(null)
  const [isCounting, setIsCounting] = useState(false)
  const [sosActive, setSosActive] = useState(false)

  // Query backend emergencies
  const { data: emergencies = [], isLoading } = useQuery({
    queryKey: ['emergencies'],
    queryFn: api.getEmergencies
  })

  // Handle SOS button countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isCounting && countdown !== null) {
      if (countdown > 0) {
        timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      } else if (countdown === 0) {
        setIsCounting(false)
        setCountdown(null)
        setSosActive(true)
        handleBroadcastSOS()
      }
    }
    return () => clearTimeout(timer)
  }, [isCounting, countdown])

  const handleStartSOS = () => {
    if (sosActive) return
    setIsCounting(true)
    setCountdown(3)
  }

  const handleCancelSOS = () => {
    setIsCounting(false)
    setCountdown(null)
  }

  const handleBroadcastSOS = async () => {
    try {
      await api.createEmergency({
        type: "Tier-1 Critical SOS Alert",
        location: "Emergency panic trigger reported from BMC Command Console. Automatic regional triage dispatch initiated.",
        severity: "Critical",
        latitude: 20.2960 + ((Date.now() % 1000) - 500) / 50000,
        longitude: 85.8240 + ((Date.now() % 900) - 450) / 50000
      })
      queryClient.invalidateQueries({ queryKey: ['emergencies'] })
      setTimeout(() => {
        setSosActive(false)
      }, 5000)
    } catch (e) {
      console.error(e)
      setSosActive(false)
    }
  }

  const handleQuickAction = async (type: 'medical' | 'accident') => {
    try {
      if (type === 'medical') {
        await api.createEmergency({
          type: "Critical Medical Assistance Required",
          location: "Citizen report: Medical emergency distress call. Immediate ambulance dispatch requested.",
          severity: "Critical",
          latitude: 20.2960 + ((Date.now() % 1000) - 500) / 50000,
          longitude: 85.8240 + ((Date.now() % 900) - 450) / 50000
        })
      } else {
        await api.createEmergency({
          type: "Multi-Vehicle Collision",
          location: "Traffic Alert: Multiple vehicle crash blocking lanes. Responders and cleanup crew dispatched.",
          severity: "High",
          latitude: 20.2960 + ((Date.now() % 1000) - 500) / 50000,
          longitude: 85.8240 + ((Date.now() % 900) - 450) / 50000
        })
      }
      queryClient.invalidateQueries({ queryKey: ['emergencies'] })
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="max-w-[1600px] mx-auto w-full pt-4 pb-20 space-y-8">
      
      <div className="mb-8">
        <Headline level={1} className="text-3xl text-primary font-bold">Emergency Command</Headline>
        <BodyText className="text-on-surface-variant uppercase tracking-widest text-xs font-bold">District 01 • Live Operations</BodyText>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-12 gap-8">
        
        {/* 1. Critical SOS Command (Top Left/Center) */}
        <motion.section 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="col-span-12 lg:col-span-8 glass-panel rounded-3xl p-8 flex flex-col items-center justify-center relative overflow-hidden group min-h-[360px] bg-surface-container/60 border border-foreground/10"
        >
          <div className="z-10 text-center flex flex-col items-center">
            <Headline level={2} className="text-2xl lg:text-3xl mb-6 tracking-tight text-on-surface">
              {sosActive ? "CRITICAL ALERT ACTIVE" : "CRITICAL EMERGENCY TRIGGER"}
            </Headline>
            
            <div className="relative">
              <AnimatePresence>
                {isCounting && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1.2 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
                  >
                    <span className="text-6xl font-black text-primary drop-shadow-[0_0_20px_rgba(99,102,241,0.5)]">
                      {countdown}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              <button 
                onClick={handleStartSOS}
                className={cn(
                  "w-48 h-48 rounded-full flex flex-col items-center justify-center border-8 border-foreground/20 active:scale-95 transition-all cursor-pointer shadow-2xl relative",
                  sosActive ? "bg-primary text-white shadow-[0_0_50px_rgba(99,102,241,0.6)] animate-pulse" : "bg-error text-white hover:brightness-110 shadow-[0_0_40px_rgba(239,68,68,0.4)]"
                )}
              >
                <span className="material-symbols-outlined text-7xl text-white font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {sosActive ? "wifi_tethering" : "emergency_home"}
                </span>
                <span className="font-headline-md text-white text-3xl font-black mt-2">
                  {sosActive ? "ACTIVE" : "SOS"}
                </span>
              </button>
            </div>

            {isCounting && (
              <button 
                onClick={handleCancelSOS} 
                className="mt-6 px-4 py-2 bg-foreground/10 hover:bg-foreground/20 rounded-full text-xs font-semibold uppercase tracking-wider text-on-surface-variant transition-colors"
              >
                Cancel Broadcast
              </button>
            )}

            <div className="mt-8 flex gap-3 flex-wrap justify-center">
              <button onClick={() => handleSOSDispatch('Fire Emergency', 'CRITICAL')} className="px-5 py-2.5 bg-error/20 text-error font-bold rounded-xl hover:bg-error/30 transition-all flex items-center gap-2 border border-error/30">
                <span className="material-symbols-outlined text-sm">local_fire_department</span> Fire
              </button>
              <button onClick={() => handleSOSDispatch('Severe Accident', 'CRITICAL')} className="px-5 py-2.5 bg-orange-600/20 text-orange-400 font-bold rounded-xl hover:bg-orange-600/30 transition-all flex items-center gap-2 border border-orange-600/30">
                <span className="material-symbols-outlined text-sm">car_crash</span> Accident
              </button>
              <button onClick={() => handleSOSDispatch('Medical Emergency', 'HIGH')} className="px-5 py-2.5 bg-blue-600/20 text-blue-400 font-bold rounded-xl hover:bg-blue-600/30 transition-all flex items-center gap-2 border border-blue-600/30">
                <span className="material-symbols-outlined text-sm">medical_services</span> Medical
              </button>
            </div>
            
            
            <BodyText className="mt-8 text-on-surface-variant max-w-md mx-auto text-sm">
              {sosActive 
                ? "Emergency protocol broadcast successfully. Regional units have been notified." 
                : "Press the button to broadcast a Tier-1 Critical Alert to all regional dispatch units and AI coordination hubs."}
            </BodyText>
          </div>
        </motion.section>

        {/* 4. Quick Action Grid (Top Right) */}
        <motion.section 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="col-span-12 lg:col-span-4 grid grid-rows-3 gap-4"
        >
          <button 
            onClick={() => handleQuickAction('medical')}
            className="glass-panel bg-surface-container/40 hover:bg-surface-container-high transition-all rounded-2xl flex items-center px-6 gap-5 group border-l-4 border-error text-left"
          >
            <div className="w-12 h-12 bg-error/10 text-error rounded-full flex items-center justify-center group-hover:bg-error group-hover:text-foreground transition-all">
              <span className="material-symbols-outlined">medical_services</span>
            </div>
            <div>
              <Headline level={4} className="font-bold text-lg">Medical Emergency</Headline>
              <Label className="text-on-surface-variant">Immediate triage dispatch</Label>
            </div>
          </button>
          
          <button 
            onClick={() => handleQuickAction('accident')}
            className="glass-panel bg-surface-container/40 hover:bg-surface-container-high transition-all rounded-2xl flex items-center px-6 gap-5 group border-l-4 border-orange-500 text-left"
          >
            <div className="w-12 h-12 bg-orange-500/10 text-orange-500 rounded-full flex items-center justify-center group-hover:bg-orange-500 group-hover:text-foreground transition-all">
              <span className="material-symbols-outlined">car_crash</span>
            </div>
            <div>
              <Headline level={4} className="font-bold text-lg">Traffic Accident</Headline>
              <Label className="text-on-surface-variant">Reporting and road closure</Label>
            </div>
          </button>
          
          <button className="glass-panel bg-surface-container/40 hover:bg-surface-container-high transition-all rounded-2xl flex items-center px-6 gap-5 group border-l-4 border-primary text-left">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center group-hover:bg-primary group-hover:text-foreground transition-all">
              <span className="material-symbols-outlined">call</span>
            </div>
            <div>
              <Headline level={4} className="font-bold text-lg">Emergency Numbers</Headline>
              <Label className="text-on-surface-variant">Global directory access</Label>
            </div>
          </button>
        </motion.section>

        {/* 2. Real-time Disaster & Alert Feed (Left Column) */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="col-span-12 lg:col-span-4 space-y-6"
        >
          <div className="flex items-center justify-between">
            <Headline level={3} className="text-xl flex items-center gap-2">
              <span className="material-symbols-outlined text-error">warning</span>
              Active Alerts
            </Headline>
            <span className="px-3 py-1 bg-error/10 text-error text-xs font-bold rounded-full border border-error/20 tracking-wider">
              LIVE: {emergencies.length} EVENTS
            </span>
          </div>
          
          <div className="space-y-4">
            {isLoading ? (
              <p className="text-sm text-on-surface-variant">Loading live alerts...</p>
            ) : emergencies.length === 0 ? (
              <p className="text-sm text-on-surface-variant">No active alerts at this time.</p>
            ) : (
              emergencies.map((em: any) => {
                const isCritical = em.severity.toLowerCase() === "critical"
                const borderClass = isCritical ? "border-l-error" : "border-l-orange-500"
                const textClass = isCritical ? "text-error" : "text-orange-500"
                
                const eventTime = new Date(em.reported_at || em.created_at || new Date()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                
                const titleStr = em.type || em.title || "Alert";
                const descStr = em.location || em.description || "";
                
                let icon = "warning"
                if (titleStr.toLowerCase().includes("chemical") || titleStr.toLowerCase().includes("spill")) icon = "science"
                if (titleStr.toLowerCase().includes("power") || titleStr.toLowerCase().includes("grid")) icon = "bolt"
                if (titleStr.toLowerCase().includes("flood") || titleStr.toLowerCase().includes("water")) icon = "flood"
                if (titleStr.toLowerCase().includes("fire")) icon = "local_fire_department"
                if (titleStr.toLowerCase().includes("sos")) icon = "emergency_home"

                return (
                  <GlassPanel key={em.id} className={cn("p-5 rounded-2xl border-l-4 relative overflow-hidden bg-surface-container/40", borderClass)}>
                    <div className="absolute top-0 right-0 p-2 opacity-10">
                      <span className="material-symbols-outlined text-6xl">{icon}</span>
                    </div>
                    <div className="flex justify-between items-start mb-2">
                      <span className={cn("font-bold uppercase text-xs tracking-widest", textClass)}>
                        {em.severity} Alert
                      </span>
                      <Label className="opacity-50 text-[10px]">{eventTime}</Label>
                    </div>
                    <Headline level={4} className="text-lg mb-1">{titleStr}</Headline>
                    <BodyText variant="sm" className="text-on-surface-variant">{descStr}</BodyText>
                    {em.latitude && em.longitude && (
                      <div className="mt-4 flex gap-2">
                        <span className="bg-foreground/5 px-2 py-1 rounded text-[10px] font-mono text-on-surface-variant">
                          Lat: {em.latitude.toFixed(4)}, Lng: {em.longitude.toFixed(4)}
                        </span>
                      </div>
                    )}
                  </GlassPanel>
                )
              })
            )}
          </div>
        </motion.section>

        {/* 3. Emergency Service Proximity (Center Column) */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="col-span-12 lg:col-span-4 space-y-6"
        >
          <Headline level={3} className="text-xl flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">near_me</span>
            Nearest Responders
          </Headline>
          
          <div className="grid gap-4">
            <GlassPanel className="p-6 rounded-2xl hover:border-primary/50 transition-colors group bg-surface-container/40 border border-foreground/10">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">local_hospital</span>
                </div>
                <div className="flex-1">
                  <Headline level={4} className="text-[16px] leading-tight">St. Benedict Memorial</Headline>
                  <Label className="text-on-surface-variant block mt-1">Distance: 1.2km • Cap: 84%</Label>
                </div>
                <div className="text-right">
                  <span className="text-primary font-bold text-lg">4 min</span>
                  <p className="text-[10px] uppercase opacity-50 font-bold tracking-widest">ETA</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button className="flex-1 py-2 bg-foreground/5 hover:bg-foreground/10 rounded-lg text-xs font-bold transition-all text-on-surface">NAVIGATE</button>
                <button className="w-10 h-10 bg-primary/20 text-primary rounded-lg flex items-center justify-center hover:bg-primary hover:text-on-primary transition-all">
                  <span className="material-symbols-outlined text-sm">call</span>
                </button>
              </div>
            </GlassPanel>
            
            <GlassPanel className="p-6 rounded-2xl hover:border-error/50 transition-colors group bg-surface-container/40 border border-foreground/10">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-error/10 rounded-xl flex items-center justify-center text-error">
                  <span className="material-symbols-outlined">local_fire_department</span>
                </div>
                <div className="flex-1">
                  <Headline level={4} className="text-[16px] leading-tight">Fire Station 09</Headline>
                  <Label className="text-on-surface-variant block mt-1">Distance: 0.8km • Units: 3</Label>
                </div>
                <div className="text-right">
                  <span className="text-error font-bold text-lg">2 min</span>
                  <p className="text-[10px] uppercase opacity-50 font-bold tracking-widest">ETA</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button className="flex-1 py-2 bg-foreground/5 hover:bg-foreground/10 rounded-lg text-xs font-bold transition-all text-on-surface">NAVIGATE</button>
                <button className="w-10 h-10 bg-error/20 text-error rounded-lg flex items-center justify-center hover:bg-error hover:text-on-primary transition-all">
                  <span className="material-symbols-outlined text-sm">call</span>
                </button>
              </div>
            </GlassPanel>
          </div>
        </motion.section>
      </div>
    </div>
  )
}
