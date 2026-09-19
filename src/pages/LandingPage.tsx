import React, { useEffect, useRef, useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { motion, useScroll, useTransform } from "framer-motion"
import { Canvas } from '@react-three/fiber'
import { CivicPipeline3D } from '../components/3d/CivicPipeline3D'

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
}

export function LandingPage() {
  const navigate = useNavigate()
  const { scrollYProgress } = useScroll()
  const yHero = useTransform(scrollYProgress, [0, 1], [0, 300])
  const opacityHero = useTransform(scrollYProgress, [0, 0.2], [1, 0])

  return (
    <div className="dark">
      <main className="w-full min-h-screen bg-[#070b14] text-[#e2e8f0] font-sans overflow-x-hidden selection:bg-[#494bd6] selection:text-white">
        
        {/* Navigation */}
        <header className="fixed top-0 w-full h-20 px-8 flex justify-between items-center z-50 bg-[#070b14]/80 backdrop-blur-xl border-b border-white/5">
          <Link to="/" className="flex items-center gap-3">
            <img src={`${import.meta.env.BASE_URL}logo.png`} alt="CivicLens Logo" className="w-8 h-8 rounded-lg object-contain bg-white/10 p-1 border border-white/10" />
            <span className="font-bold text-lg tracking-tight text-white">CIVICLENS</span>
          </Link>
          <div className="flex items-center gap-6 text-sm font-medium">
            <a href="#problem" className="text-white/60 hover:text-white transition-colors">The Problem</a>
            <a href="#pipeline" className="text-white/60 hover:text-white transition-colors">How it works</a>
            <button 
              onClick={() => navigate("/login")}
              className="px-5 py-2.5 rounded-lg bg-white text-black font-semibold hover:bg-gray-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            >
              Sign In
            </button>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center pt-20 px-6 overflow-hidden">
          {/* 3D Background Pipeline */}
          <div className="absolute inset-0 z-0 opacity-80 pointer-events-none">
            <Canvas camera={{ position: [0, 2, 12], fov: 45 }}>
              <React.Suspense fallback={null}>
                <CivicPipeline3D />
              </React.Suspense>
            </Canvas>
          </div>
          
          {/* Gradients */}
          <div className="absolute top-1/4 -left-1/4 w-[800px] h-[800px] bg-[#494bd6]/10 blur-[120px] rounded-full pointer-events-none z-0"></div>
          <div className="absolute bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-[#f751a1]/5 blur-[120px] rounded-full pointer-events-none z-0"></div>

          <motion.div 
            style={{ y: yHero, opacity: opacityHero }}
            className="w-full max-w-6xl mx-auto relative z-10"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            <motion.div variants={itemVariants} className="max-w-3xl">
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-[1.1] text-white mb-6">
                FROM CITIZEN VOICES <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#c0c1ff] to-[#f751a1]">TO BETTER DEVELOPMENT DECISIONS.</span>
              </h1>
              <p className="text-lg md:text-xl text-white/60 max-w-2xl mb-10 leading-relaxed font-light">
                AI-powered civic intelligence for evidence-backed constituency development planning.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => navigate("/dashboard")}
                  className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#494bd6] to-[#7173e8] text-white font-semibold hover:opacity-90 transition-all shadow-xl shadow-[#494bd6]/20 flex items-center gap-2"
                >
                  Explore CivicLens
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
                <a 
                  href="#pipeline"
                  className="px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-colors flex items-center gap-2"
                >
                  See how it works
                </a>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* The Problem */}
        <section id="problem" className="py-32 px-6 relative z-10 border-t border-white/5 bg-gradient-to-b from-[#070b14] to-[#0a101d]">
          <div className="max-w-5xl mx-auto text-center space-y-8">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="text-4xl md:text-6xl font-bold tracking-tight text-white/90"
            >
              Thousands of voices.<br />
              <span className="text-[#f751a1]">Limited budgets.</span><br />
              Complex decisions.
            </motion.h2>
            <p className="text-white/50 max-w-2xl mx-auto text-lg">
              Cities produce an overwhelming amount of unstructured signal. Planning relies on intuition rather than empirical evidence.
            </p>
          </div>
        </section>

        {/* Not Just a Grievance App & Pipeline */}
        <section id="pipeline" className="py-32 px-6 relative z-10 border-t border-white/5">
          <div className="max-w-6xl mx-auto">
            <div className="mb-20 text-center">
              <h3 className="text-3xl font-bold text-white mb-4">Not just a grievance app</h3>
              <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 text-sm font-mono tracking-widest text-white/40 uppercase">
                <div className="flex flex-col items-center gap-2 line-through decoration-red-500/50">
                  <span className="text-xs text-white/30 mb-2">Traditional</span>
                  <div className="flex items-center gap-2 flex-wrap justify-center">Report <span className="material-symbols-outlined text-xs">arrow_forward</span> Route <span className="material-symbols-outlined text-xs">arrow_forward</span> Resolve</div>
                </div>
                <div className="hidden md:block w-[1px] h-12 bg-white/10"></div>
                <div className="flex flex-col items-center gap-2">
                  <span className="text-xs text-[#c0c1ff] mb-2">CivicLens</span>
                  <div className="flex items-center gap-2 flex-wrap justify-center text-white/80">Voice <span className="material-symbols-outlined text-xs text-[#494bd6]">arrow_forward</span> Aggregate <span className="material-symbols-outlined text-xs text-[#494bd6]">arrow_forward</span> Map <span className="material-symbols-outlined text-xs text-[#494bd6]">arrow_forward</span> Validate <span className="material-symbols-outlined text-xs text-[#494bd6]">arrow_forward</span> Prioritize <span className="material-symbols-outlined text-xs text-[#494bd6]">arrow_forward</span> Optimize <span className="material-symbols-outlined text-xs text-[#494bd6]">arrow_forward</span> Decide</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute left-8 top-0 bottom-0 w-[1px] bg-gradient-to-b from-[#c0c1ff] via-[#f751a1] to-[#10b981] opacity-20 hidden md:block"></div>
              
              <div className="space-y-12">
                {[
                  { title: "Voice", desc: "Citizens report issues via multi-modal inputs.", icon: "mic", color: "#c0c1ff" },
                  { title: "Demand", desc: "Raw inputs are normalized into structured civic demands.", icon: "format_list_bulleted", color: "#ddb7ff" },
                  { title: "Theme", desc: "Demands are clustered into semantic planning themes.", icon: "category", color: "#ffb0cd" },
                  { title: "Hotspot", desc: "Density clustering identifies geographic areas of severe need.", icon: "location_on", color: "#f751a1" },
                  { title: "Evidence", desc: "External geospatial and demographic data validates the hotspot.", icon: "plagiarism", color: "#494bd6" },
                  { title: "Proposal", desc: "Auto-generation of actionable infrastructure proposals.", icon: "description", color: "#6366f1" },
                  { title: "Priority", desc: "Deterministic 11-factor assessment engine scores the need.", icon: "sort", color: "#8b5cf6" },
                  { title: "Impact", desc: "Estimation of economic, health, and service delivery benefits.", icon: "trending_up", color: "#a855f7" },
                  { title: "Portfolio", desc: "Budget-constrained combinatorial optimization for project selection.", icon: "account_balance_wallet", color: "#d946ef" },
                  { title: "Decision", desc: "Immutable audit trail of why a project was funded.", icon: "gavel", color: "#10b981" },
                ].map((step, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-start gap-6 md:pl-0 pl-4 relative"
                  >
                    <div className="hidden md:flex w-16 h-16 rounded-full bg-[#070b14] border border-white/10 items-center justify-center z-10 shrink-0 shadow-lg relative">
                      <div className="absolute inset-0 rounded-full opacity-20 blur-md" style={{ backgroundColor: step.color }}></div>
                      <span className="material-symbols-outlined text-2xl" style={{ color: step.color }}>{step.icon}</span>
                    </div>
                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 flex-grow hover:bg-white/[0.04] transition-colors">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs font-mono px-2 py-1 rounded bg-white/5 text-white/50">STEP {idx + 1}</span>
                        <h4 className="text-xl font-semibold text-white">{step.title}</h4>
                      </div>
                      <p className="text-white/60">{step.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Feature Highlights (Decision, Portfolio, Transparency) */}
        <section className="py-32 px-6 relative z-10 border-t border-white/5 bg-[#0a101d]">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-white/5 to-transparent border border-white/10 p-8 rounded-3xl">
              <span className="material-symbols-outlined text-[#494bd6] text-4xl mb-6">psychology</span>
              <h3 className="text-2xl font-bold text-white mb-4">Decision Intelligence</h3>
              <p className="text-white/50 mb-6 text-sm leading-relaxed">
                Proposals aren't just lists; they contain 11-factor deterministic priority scoring. Infrastructure Gap, Vulnerability, and Evidence Confidence are assessed before a human ever looks at it.
              </p>
            </div>
            <div className="bg-gradient-to-br from-white/5 to-transparent border border-white/10 p-8 rounded-3xl">
              <span className="material-symbols-outlined text-[#f751a1] text-4xl mb-6">account_balance</span>
              <h3 className="text-2xl font-bold text-white mb-4">Portfolio Optimization</h3>
              <p className="text-white/50 mb-6 text-sm leading-relaxed">
                Input your budget constraints and let the knapsack algorithm construct the most impactful portfolio of projects across the constituency, maximizing ROI for citizens.
              </p>
            </div>
            <div className="bg-gradient-to-br from-white/5 to-transparent border border-white/10 p-8 rounded-3xl">
              <span className="material-symbols-outlined text-[#10b981] text-4xl mb-6">verified_user</span>
              <h3 className="text-2xl font-bold text-white mb-4">Transparent Decisions</h3>
              <p className="text-white/50 mb-6 text-sm leading-relaxed">
                Every approved project carries a cryptographically hashed decision record explaining the evidence, demand history, and rationale. Trust is built through visibility.
              </p>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-40 px-6 relative z-10 text-center">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center opacity-5 grayscale pointer-events-none"></div>
          <div className="max-w-4xl mx-auto relative z-10">
            <h2 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-white mb-6 leading-tight">
              Turn citizen voices<br/>
              <span className="text-[#494bd6]">into development intelligence.</span>
            </h2>
            <div className="mt-12">
              <button 
                onClick={() => navigate("/dashboard")}
                className="px-10 py-5 rounded-2xl bg-white text-black text-lg font-bold hover:bg-gray-200 transition-all shadow-[0_0_40px_rgba(255,255,255,0.15)]"
              >
                Enter CivicLens
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="w-full py-10 border-t border-white/5 text-center text-xs font-mono text-white/30 tracking-widest uppercase bg-[#070b14] relative z-10">
          CIVICLENS OPERATING SYSTEM &copy; {new Date().getFullYear()}
        </footer>
      </main>
    </div>
  )
}
