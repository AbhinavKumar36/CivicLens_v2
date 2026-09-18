import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { Headline, BodyText, Label } from "@/components/atoms/Typography"
import { Button } from "@/components/atoms/Button"
import { cn } from "@/utils/utils"

export function ReportIssueReview() {
  const navigate = useNavigate()
  const [confidence, setConfidence] = useState(98.4)

  useEffect(() => {
    const interval = setInterval(() => {
      const base = 98.4
      const jitter = ((Date.now() % 100) * 0.002).toFixed(1)
      setConfidence(parseFloat((base + parseFloat(jitter)).toFixed(1)))
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="max-w-4xl mx-auto py-12 relative z-10 w-full space-y-10">
      
      {/* Step Progress Bar */}
      <div className="flex items-center justify-between mb-16 max-w-3xl mx-auto">
        <div className="flex flex-col items-center gap-2 relative z-10">
          <div className="w-10 h-10 rounded-full bg-surface-container-highest border border-primary text-primary flex items-center justify-center font-bold shadow-lg shadow-primary/30">
            <span className="material-symbols-outlined">check</span>
          </div>
          <span className="text-xs font-label-sm text-primary uppercase tracking-widest">Identify</span>
        </div>
        <div className="flex-1 h-0.5 bg-primary/30 mx-4 mt-[-24px]"></div>
        
        <div className="flex flex-col items-center gap-2 relative z-10">
          <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold shadow-lg shadow-primary/30">2</div>
          <span className="text-xs font-label-sm text-primary uppercase tracking-widest">Details</span>
        </div>
        <div className="flex-1 h-0.5 bg-foreground/10 mx-4 mt-[-24px]"></div>
        
        <div className="flex flex-col items-center gap-2 relative z-10">
          <div className="w-10 h-10 rounded-full bg-surface-container-highest border border-foreground/10 text-on-surface-variant flex items-center justify-center font-bold">3</div>
          <span className="text-xs font-label-sm text-on-surface-variant uppercase tracking-widest">Submit</span>
        </div>
      </div>

      {/* Conversation Section */}
      <div className="space-y-6">
        
        {/* User Input (Historical) */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 0.8, x: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex justify-end gap-4"
        >
          <div className="bg-surface-container-highest px-6 py-4 rounded-2xl rounded-tr-none max-w-lg">
            <BodyText>There's a massive water leak on the corner of 5th and Madison. It's flooding the sidewalk and looks like a main pipe burst.</BodyText>
          </div>
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-on-secondary shrink-0">
            <span className="material-symbols-outlined text-sm">person</span>
          </div>
        </motion.div>

        {/* AI Response & Detection */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex gap-4 items-start"
        >
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-[0px_0px_20px_rgba(192,193,255,0.4)]">
            <span className="material-symbols-outlined text-on-primary">auto_awesome</span>
          </div>
          <div className="space-y-4 max-w-xl">
            <GlassPanel className="px-6 py-4 rounded-2xl rounded-tl-none">
              <p className="font-body-md text-primary mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm animate-pulse">waves</span>
                AI Detected: Water Leakage
              </p>
              <BodyText>Understood. I've analyzed your description and cross-referenced with city utility maps. I've classified this as a major infrastructure failure.</BodyText>
            </GlassPanel>

            {/* Duplicate Detection Alert */}
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-lg">info</span>
                </div>
                <Headline level={4}>Duplicate Detection Alert</Headline>
              </div>
              <BodyText variant="sm" className="text-on-surface-variant">A similar issue was reported 200m away at Madison & 4th St about 12 minutes ago. Is this the same one?</BodyText>
              <div className="flex gap-3">
                <Button variant="outline" className="rounded-full bg-surface-container-high border-foreground/10 hover:bg-surface-container-highest">Yes, it's the same</Button>
                <Button className="rounded-full shadow-lg shadow-primary/20 hover:scale-105 transition-all">No, this is new</Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Complaint Preview Card (The Hero) */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="w-full glass-panel rounded-3xl overflow-hidden shadow-2xl border-foreground/10 relative"
      >
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 blur-[100px] pointer-events-none"></div>
        <div className="p-8 space-y-8 relative z-10">
          
          {/* Card Header */}
          <div className="flex justify-between items-end">
            <div>
              <div className="flex items-center gap-2 text-primary font-label-sm mb-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
                READY TO SUBMIT
              </div>
              <Headline level={2} className="text-3xl font-extrabold">Issue Preview: Major Water Leakage</Headline>
            </div>
            <div className="text-right">
              <Label className="block text-on-surface-variant text-xs uppercase tracking-widest mb-1">Confidence Score</Label>
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-primary to-secondary">{confidence}%</span>
            </div>
          </div>

          {/* Bento Grid Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* AI Summary */}
            <div className="md:col-span-2 space-y-6">
              <div className="bg-foreground/5 rounded-2xl p-6 border border-foreground/5 h-full">
                <Label className="text-on-surface-variant text-xs uppercase tracking-wider mb-4 block">AI-Generated Summary</Label>
                <BodyText variant="lg" className="leading-relaxed">
                  Severe water main breach detected near 5th and Madison. Visual evidence suggests high-pressure discharge affecting pedestrian safety and structural integrity of adjacent sidewalk. Flow rate estimated at 400GPM. Recommended immediate dispatch for Water Division Emergency Response.
                </BodyText>
              </div>
            </div>

            {/* Severity & Metadata */}
            <div className="space-y-4">
              <div className="bg-error/10 border border-error/20 rounded-2xl p-4 flex justify-between items-center">
                <div>
                  <span className="text-error text-[10px] font-label-sm uppercase">Severity</span>
                  <div className="text-error font-bold">CRITICAL / HIGH</div>
                </div>
                <span className="material-symbols-outlined text-error" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
              </div>
              <div className="bg-surface-container-high/50 rounded-2xl p-4 border border-foreground/5">
                <span className="text-on-surface-variant text-[10px] font-label-sm uppercase">Department</span>
                <div className="font-semibold">Public Works - Water Division</div>
              </div>
              <div className="bg-surface-container-high/50 rounded-2xl p-4 border border-foreground/5">
                <span className="text-on-surface-variant text-[10px] font-label-sm uppercase">Est. Resolution</span>
                <div className="font-semibold">4 hours (Priority P1)</div>
              </div>
            </div>

            {/* Visuals */}
            <div className="rounded-2xl overflow-hidden h-48 border border-foreground/10 relative group">
              <img 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAdwBd-DlVRNd6cgcXFTwfqnod-kioGbi4qXK3thiPgZbxo2J0-el42QgS0Fh_dhIXEOOZ8K3V_myNJVGNA-GkjFH5O4J83eeaxbRnE3sr5Xf8P0Uo-NWnXBsBVbfXuJncZf9HaJN00FrxVYDS415eQgRjtUss3pSO9RPA0F4FcyiZm7dCcNuIf3nP6yxfJT8uIDTeGJiJLOAW_QjfmqlbcRE1GTQnVwMZsS5OCf8CC9RWbd5vAKWrl6S9wBSKilANPdDtKRjL3sqew"
                alt="Water main break"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-3 left-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-xs">image</span>
                <span className="text-[10px] font-label-sm text-white">UPLOADED PHOTO</span>
              </div>
            </div>
            
            <div className="md:col-span-2 rounded-2xl overflow-hidden h-48 border border-foreground/10 relative group bg-[#131b2e]">
              <img 
                className="w-full h-full object-cover opacity-80" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCfkCqSLJHxYXMDKEDUB9TGLPYJL8BEWAz8bZgKk4fzUpb2BliLn4bQqwdwNNJV5ZiF5sCWEej-fCi7g8B4M4Wxm5fhrxGiyEEf8kUvniScoQi7pB2ZPQ5REQJdn2es2_tEevx79Dx5L632Kdq4HXpEMbnJF3GlLYS0HR3_iXnCAX9ll1ufwMpLt5OMupm9a8D2y6LRfMGPs4Llv4HZ9vvJu8bROKh_XaL8C78WMoCf1AXse6nStaVUVWAmOI_0sEN7anqP58EXVYve"
                alt="Map"
              />
              <div className="absolute inset-0 bg-primary/10 pointer-events-none"></div>
              <div className="absolute bottom-3 left-3 bg-surface/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-foreground/10 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xs">location_on</span>
                <span className="text-[10px] font-label-sm text-on-surface">5th Ave & Madison St</span>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-6 border-t border-foreground/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-on-surface-variant">
              <span className="material-symbols-outlined text-sm">verified_user</span>
              <span className="text-xs font-body-md">Identity verified via Digital City Pass</span>
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <Button variant="outline" className="flex-1 md:flex-none rounded-xl" onClick={() => navigate('/report')}>
                Edit Details
              </Button>
              <Button 
                className="flex-1 md:flex-none px-12 bg-gradient-to-tr from-[#8083ff] to-[#6f00be] text-white rounded-xl shadow-[0px_0px_30px_rgba(128,131,255,0.4)] hover:scale-[1.02]"
                onClick={() => navigate('/reports/UP-9928')}
              >
                Confirm & Submit
                <span className="material-symbols-outlined ml-3">send</span>
              </Button>
            </div>
          </div>

        </div>
      </motion.section>
    </div>
  )
}
