import React, { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.12 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
}

function AnimatedCounter({ end, duration = 1500 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLParagraphElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (hasAnimated.current) return
    hasAnimated.current = true

    let start = 0
    const startTime = performance.now()

    const step = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      // ease-out curve
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.floor(eased * end)
      setCount(current)
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [end, duration])

  return <>{count.toLocaleString()}</>
}

export function LandingPage() {
  const navigate = useNavigate()

  return (
    // Force dark mode on landing page so the marketing page always looks premium
    <div className="dark">
      <main className="w-full min-h-screen bg-[#0b1326] text-[#dae2fd] flex flex-col relative overflow-y-auto">
        {/* Glowing Abstract Background Orbs */}
        <div className="absolute top-[10%] left-[5%] w-96 h-96 bg-[#c0c1ff]/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-[10%] right-[5%] w-96 h-96 bg-[#ddb7ff]/15 blur-[150px] rounded-full pointer-events-none"></div>
        <div className="absolute top-[50%] left-[40%] w-64 h-64 bg-[#ffb0cd]/5 blur-[100px] rounded-full pointer-events-none"></div>

        {/* Header */}
        <header className="w-full h-20 px-8 flex justify-between items-center border-b border-[#dae2fd]/5 relative z-10 shrink-0 bg-[#0b1326]/50 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <img src={`${import.meta.env.BASE_URL}logo.jpeg`} alt="CivicLens Logo" className="w-10 h-10 rounded-xl object-cover" style={{ boxShadow: '0px 0px 40px rgba(192,193,255,0.4)' }} />
            <div>
              <h1 className="font-headline-md text-lg font-extrabold tracking-tight bg-gradient-to-r from-[#c0c1ff] to-[#ddb7ff] bg-clip-text text-transparent">CivicLens AI</h1>
              <p className="text-[9px] text-[#908fa0] font-label-sm uppercase tracking-wider">City Operating System</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate("/dashboard")}
              className="px-5 py-2 rounded-xl bg-[#c0c1ff] hover:bg-[#8083ff] text-[#0d0096] text-xs font-bold transition-all shadow-lg hover:shadow-[#c0c1ff]/20 scale-100 hover:scale-105 active:scale-95"
            >
              Access Platform
            </button>
          </div>
        </header>

        {/* Hero Section */}
        <section className="flex-grow flex flex-col items-center justify-center text-center px-6 py-20 relative z-10 max-w-5xl mx-auto space-y-12">
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-5">
            <motion.span variants={itemVariants} className="inline-block bg-[#c0c1ff]/10 text-[#c0c1ff] border border-[#c0c1ff]/20 px-4 py-1.5 rounded-full text-[10px] font-label-sm uppercase tracking-widest font-bold animate-pulse">
              Now Operational: Neo-Metropolis
            </motion.span>
            <motion.h2 variants={itemVariants} className="font-display-lg text-4xl sm:text-6xl text-[#dae2fd] leading-tight font-extrabold max-w-4xl mx-auto tracking-tight">
              Next-Generation <br className="hidden sm:inline"/>
              <span className="bg-gradient-to-r from-[#c0c1ff] via-[#ddb7ff] to-[#ffb0cd] bg-clip-text text-transparent">AI-Powered City Management</span>
            </motion.h2>
            <motion.p variants={itemVariants} className="text-sm sm:text-base text-[#c7c4d7] max-w-2xl mx-auto leading-relaxed opacity-90">
              Connect citizens, field operations, and municipal administrators under a unified, conversational intelligent dashboard. Maximize resource allocations, resolve outages in real-time, and run predictions.
            </motion.p>
          </motion.div>

          <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex flex-wrap gap-4 justify-center">
            <motion.button 
              variants={itemVariants}
              onClick={() => navigate("/dashboard")} 
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#c0c1ff] to-[#ddb7ff] text-[#0d0096] font-bold text-sm shadow-xl hover:shadow-[#c0c1ff]/20 transition-all hover:scale-105 active:scale-95"
            >
              Get Started
              <span className="material-symbols-outlined ml-2 text-base align-middle">arrow_forward</span>
            </motion.button>
            <motion.button 
              variants={itemVariants}
              onClick={() => navigate("/map")} 
              className="px-8 py-3.5 rounded-2xl bg-[#dae2fd]/5 border border-[#dae2fd]/10 hover:bg-[#dae2fd]/10 text-[#dae2fd] font-bold text-sm transition-all hover:scale-105 active:scale-95"
            >
              <span className="material-symbols-outlined mr-2 text-base align-middle">map</span>
              View Live Map
            </motion.button>
            <motion.button
              variants={itemVariants}
              onClick={() => navigate("/report/anonymous")}
              className="px-8 py-3.5 rounded-2xl bg-[#ffb0cd]/10 border border-[#ffb0cd]/20 hover:bg-[#ffb0cd]/15 text-[#ffb0cd] font-bold text-sm transition-all hover:scale-105 active:scale-95"
            >
              <span className="material-symbols-outlined mr-2 text-base align-middle">shield</span>
              Report Anonymously
            </motion.button>
          </motion.div>

          {/* Live Metrics Grid */}
          <motion.div variants={containerVariants} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-4xl pt-8">
            <motion.div variants={itemVariants} className="bg-[#171f33]/65 backdrop-blur-xl border border-[#dae2fd]/8 p-6 rounded-2xl text-center">
              <h4 className="text-[#908fa0] text-xs font-label-sm uppercase tracking-wider mb-2">Resolved Incidents</h4>
              <p className="text-3xl font-headline-md font-bold text-[#dae2fd]"><AnimatedCounter end={12482} /></p>
              <span className="text-[9px] text-green-400 font-semibold mt-1 inline-block">98.2% SLA Compliance</span>
            </motion.div>
            <motion.div variants={itemVariants} className="bg-[#171f33]/65 backdrop-blur-xl border border-[#dae2fd]/8 p-6 rounded-2xl text-center">
              <h4 className="text-[#908fa0] text-xs font-label-sm uppercase tracking-wider mb-2">Active Field Technicians</h4>
              <p className="text-3xl font-headline-md font-bold text-[#dae2fd]"><AnimatedCounter end={42} duration={1000} /> Active</p>
              <span className="text-[9px] text-[#c0c1ff] mt-1 inline-block">Real-time dispatch operational</span>
            </motion.div>
            <motion.div variants={itemVariants} className="bg-[#171f33]/65 backdrop-blur-xl border border-[#dae2fd]/8 p-6 rounded-2xl text-center">
              <h4 className="text-[#908fa0] text-xs font-label-sm uppercase tracking-wider mb-2">Avg. Response Time</h4>
              <p className="text-3xl font-headline-md font-bold text-[#dae2fd]">4.2 Hours</p>
              <span className="text-[9px] text-green-400 font-semibold mt-1 inline-block">-12% Improvement YoY</span>
            </motion.div>
          </motion.div>
        </section>

        {/* Features Showcase Grid */}
        <section className="max-w-6xl mx-auto px-6 pb-24 relative z-10 w-full">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h3 className="font-headline-md text-xl font-bold text-[#dae2fd]">SaaS Integrated Experience Modules</h3>
            <p className="text-xs text-[#c7c4d7] mt-1">Unified workspaces for every civic role</p>
          </motion.div>
          
          <motion.div variants={containerVariants} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: "person", color: "#c0c1ff", title: "Citizen Portal", desc: "Report potholes or leaks with AI image recognition, track repairs on an interactive timeline, pay utilities, and claim civic rewards.", hoverBorder: "hover:border-[#c0c1ff]/30" },
              { icon: "admin_panel_settings", color: "#ddb7ff", title: "City Control Center", desc: "A centralized administrative cockpit for operators. Dispatch units, monitor emergency SOS alerts, and inspect real-time city charts.", hoverBorder: "hover:border-[#ddb7ff]/30" },
              { icon: "engineering", color: "#ffb0cd", title: "Field Worker Console", desc: "A mobile-responsive task list for city technicians. Get auto-routed tasks, log progress, and record photo resolution evidence.", hoverBorder: "hover:border-[#ffb0cd]/30" },
            ].map((item, idx) => (
              <motion.div key={idx} variants={itemVariants} className={`bg-[#171f33]/45 backdrop-blur-md p-6 rounded-2xl space-y-4 border border-[#dae2fd]/6 ${item.hoverBorder} transition-all hover:-translate-y-1`}>
                <span className="material-symbols-outlined text-3xl" style={{ color: item.color }}>{item.icon}</span>
                <h4 className="font-bold text-md text-[#dae2fd]">{item.title}</h4>
                <p className="text-xs text-[#c7c4d7] leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Anonymous Reporting CTA */}
        <section className="max-w-4xl mx-auto px-6 pb-20 relative z-10 w-full">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }}
            className="bg-gradient-to-r from-[#ffb0cd]/10 to-[#ddb7ff]/10 border border-[#ffb0cd]/20 rounded-3xl p-8 md:p-12 text-center space-y-4"
          >
            <div className="w-16 h-16 rounded-full bg-[#ffb0cd]/20 flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-[#ffb0cd] text-3xl">shield</span>
            </div>
            <h3 className="font-headline-md text-2xl font-bold text-[#dae2fd]">See Something? Say Something.</h3>
            <p className="text-sm text-[#c7c4d7] max-w-xl mx-auto leading-relaxed">
              Report corruption, hazards, or misconduct without fear. Our anonymous reporting system ensures your identity is <strong className="text-[#ffb0cd]">never collected or stored</strong>. No login required.
            </p>
            <button 
              onClick={() => navigate("/report/anonymous")}
              className="mt-4 px-8 py-3 rounded-2xl bg-[#ffb0cd]/20 border border-[#ffb0cd]/30 text-[#ffb0cd] font-bold text-sm hover:bg-[#ffb0cd]/30 transition-all hover:scale-105 active:scale-95"
            >
              <span className="material-symbols-outlined mr-2 text-base align-middle">visibility_off</span>
              File Anonymous Report
            </button>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="w-full py-8 border-t border-[#dae2fd]/5 text-center text-[10px] text-[#908fa0] tracking-wider uppercase bg-[#060e20]/30 relative z-10">
          &copy; {new Date().getFullYear()} CivicLens AI. Powered by Gemini Developer API. All Rights Reserved.
        </footer>
      </main>
    </div>
  )
}
