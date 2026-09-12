import React from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { Headline, BodyText, Label } from "@/components/atoms/Typography"
import { Button } from "@/components/atoms/Button"
import { cn } from "@/utils/utils"
import { useAuth } from "@/contexts/AuthContext"
import { api } from "@/services/api"

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

export function CitizenProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const userId = user?.id || 1;

  const { data: stats } = useQuery({
    queryKey: ['user-stats', userId],
    queryFn: () => api.getUserStats(userId)
  });

  const { data: timeline = [] } = useQuery({
    queryKey: ['user-timeline', userId],
    queryFn: () => api.getUserTimeline(userId)
  });
  
  return (
    <div className="max-w-4xl mx-auto space-y-8 pt-8 pb-32">
      
      {/* Profile Header */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row items-center gap-6"
      >
        <div className="relative">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-primary/30 p-1">
            <div className="w-full h-full rounded-full overflow-hidden">
              <img 
                className="w-full h-full object-cover" 
                src={user?.avatar || "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80"} 
                alt={user?.name || "Profile"}
              />
            </div>
          </div>
          <div className="absolute bottom-1 right-1 bg-primary text-on-primary-container p-1 rounded-full border-2 border-surface shadow-lg">
            <span className="material-symbols-outlined text-[16px] block" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
          </div>
        </div>
        
        <div className="text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center gap-2">
            <Headline level={2}>{user?.name || "Priya Sharma"}</Headline>
            <span className="px-3 py-0.5 rounded-full bg-green-500/10 text-green-400 font-label-sm text-label-sm border border-green-500/20 w-fit mx-auto md:mx-0 flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">shield_person</span>
              {stats?.aadhaarVerified ? "Aadhaar Verified" : "Citizen"}
            </span>
          </div>
          <BodyText className="text-on-surface-variant mt-1">
            Bhubaneswar Municipal Corporation • {stats?.wardId || 'Ward 23 (Bhouma Nagar)'} • {stats?.points ?? 350} Civic Points
          </BodyText>
        </div>
      </motion.section>

      {/* Impact Summary Bento Grid */}
      {user?.role === 'CITIZEN' && (
        <motion.section 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
        <motion.div variants={itemVariants}>
          <GlassPanel className="p-6 rounded-xl flex flex-col items-center justify-center text-center hover:bg-foreground/5 transition-colors relative overflow-hidden group">
            <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(192,193,255,0.15)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <span className="material-symbols-outlined text-primary mb-2">task_alt</span>
            <Headline level={1} className="text-primary font-bold">{stats?.issuesResolved ?? 12}</Headline>
            <Label className="text-on-surface-variant uppercase tracking-widest mt-1 block">Issues Resolved</Label>
          </GlassPanel>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <GlassPanel className="p-6 rounded-xl flex flex-col items-center justify-center text-center hover:bg-foreground/5 transition-colors relative overflow-hidden group">
            <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,176,205,0.15)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <span className="material-symbols-outlined text-tertiary mb-2">eco</span>
            <Headline level={1} className="text-tertiary font-bold">{stats?.co2SavedKg ?? '45kg'}</Headline>
            <Label className="text-on-surface-variant uppercase tracking-widest mt-1 block">CO2 Saved</Label>
          </GlassPanel>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <GlassPanel className="p-6 rounded-xl flex flex-col items-center justify-center text-center hover:bg-foreground/5 transition-colors relative overflow-hidden group">
            <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(221,183,255,0.15)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <span className="material-symbols-outlined text-secondary mb-2">trending_up</span>
            <Headline level={1} className="text-secondary font-bold">{stats?.contributorRank ?? 'Top 5%'}</Headline>
            <Label className="text-on-surface-variant uppercase tracking-widest mt-1 block">Contributor</Label>
          </GlassPanel>
        </motion.div>
        </motion.section>
      )}

      {/* Quick Actions Chips */}
      {user?.role === 'CITIZEN' && (
        <motion.section 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
        <Headline level={3} className="mb-4">Quick Actions</Headline>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          <Button variant="glass" className="rounded-full text-primary border-primary/20 hover:bg-primary/20" onClick={() => navigate('/report')}>
            <span className="material-symbols-outlined text-[20px] mr-2">assignment_late</span>
            Report Issue
          </Button>
          <Button variant="glass" className="rounded-full" onClick={() => navigate('/services')}>
            <span className="material-symbols-outlined text-[20px] mr-2">bookmarks</span>
            Civic Services
          </Button>
          <Button variant="glass" className="rounded-full" onClick={() => navigate('/rewards')}>
            <span className="material-symbols-outlined text-[20px] mr-2">card_giftcard</span>
            Civic Rewards ({stats?.points ?? 350} pts)
          </Button>
          <Button variant="glass" className="rounded-full" onClick={() => navigate('/map')}>
            <span className="material-symbols-outlined text-[20px] mr-2">map</span>
            Live City GIS
          </Button>
        </div>
        </motion.section>
      )}

      {/* Main Content Area: Split View */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Recent AI Municipal Guidance */}
        <motion.section 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          <Headline level={3} className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">smart_toy</span>
            AI Assistant Insights
          </Headline>
          <div className="space-y-3">
            {[
              { title: "Bhouma Nagar Stormwater", time: "1h ago", text: `"Monsoon desilting scheduled along Ward 23 arterial drains. Sluice pumps verified operational."` },
              { title: "Mo Bus Shuttle Optimization", time: "Yesterday", text: `"Route #10 Janpath to Infocity running with 3 additional EV shuttles. Average wait time reduced to 6 mins."` },
              { title: "WATCO Water ATM Purity", time: "3 days ago", text: `"Automated RO kiosks in Saheed Nagar cleared 100% microbiological safety standards."` }
            ].map((conv, idx) => (
              <GlassPanel key={idx} className="p-4 rounded-xl hover:translate-x-1 transition-transform cursor-pointer group" onClick={() => navigate('/ai')}>
                <div className="flex justify-between items-start mb-2">
                  <Label className="text-primary font-bold normal-case tracking-normal">{conv.title}</Label>
                  <span className="text-[10px] text-on-surface-variant">{conv.time}</span>
                </div>
                <BodyText variant="sm" className="text-on-surface-variant line-clamp-2">{conv.text}</BodyText>
              </GlassPanel>
            ))}
          </div>
        </motion.section>

        {/* Impact Timeline */}
        <motion.section 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-4"
        >
          <Headline level={3} className="flex items-center gap-2">
            <span className="material-symbols-outlined text-tertiary">analytics</span>
            Municipal Activity Timeline
          </Headline>
          <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1px] before:bg-foreground/10">
            {timeline.length === 0 ? (
              <p className="text-xs text-on-surface-variant">No recorded activities yet.</p>
            ) : (
              timeline.map((act: any) => (
                <div key={act.id} className="relative">
                  <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-primary/20"></div>
                  <Headline level={4} className="text-sm font-semibold">{act.title}</Headline>
                  <BodyText variant="sm" className="text-on-surface-variant mt-1">{act.description}</BodyText>
                  <div className="flex items-center gap-2 mt-1">
                    <Label className="text-[10px] text-on-surface-variant">{new Date(act.created_at).toLocaleDateString()}</Label>
                    {act.points_earned !== 0 && (
                      <span className={cn("text-[10px] font-bold px-1.5 py-0.2 rounded", act.points_earned > 0 ? "bg-green-500/10 text-green-400" : "bg-purple-500/10 text-purple-400")}>
                        {act.points_earned > 0 ? `+${act.points_earned} pts` : `${act.points_earned} pts`}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.section>
      </div>
    </div>
  )
}
