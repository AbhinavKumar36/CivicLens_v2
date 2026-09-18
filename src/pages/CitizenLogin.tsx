import React, { useState } from "react"
import { useNavigate, useLocation, Link } from "react-router-dom"
import { motion } from "framer-motion"
import { useAuth } from "@/contexts/AuthContext"
import { api } from "@/services/api"

export function CitizenLogin() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  const [mobile, setMobile] = useState("9876543210")
  const [password, setPassword] = useState("password123")
  const [error, setError] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    // In a real app we'd call an API. Here we use the mocked OTP / auth approach the user requested to preserve.
    try {
      // Mocked Citizen Login - fallback to predefined
      const mockUser = {
        id: 1,
        name: "Priya Sharma",
        email: "priya@example.com",
        role: "CITIZEN" as const,
        avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80"
      }
      login(mockUser)
      
      const from = (location.state as any)?.from?.pathname || "/dashboard"
      navigate(from, { replace: true })
    } catch (err) {
      setError("Failed to authenticate.")
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#070b14] flex relative overflow-hidden text-white">
      {/* Blurred Background with 3D aesthetic */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[10%] -left-[10%] w-[800px] h-[800px] bg-[#494bd6]/20 blur-[150px] rounded-full mix-blend-screen pointer-events-none"></div>
        <div className="absolute bottom-[10%] -right-[10%] w-[600px] h-[600px] bg-[#f751a1]/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none"></div>
        <div className="absolute inset-0 bg-[#070b14]/60 backdrop-blur-[100px]"></div>
      </div>

      <div className="w-full max-w-7xl mx-auto flex z-10">
        {/* Left Side: Brand & Context */}
        <div className="hidden lg:flex flex-col justify-center w-1/2 p-12 relative">
          <div className="absolute top-12 left-12 flex items-center gap-3">
            <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Logo" className="w-8 h-8 rounded-lg bg-white/10 p-1 border border-white/10" />
            <span className="font-bold text-lg tracking-tight">CIVICLENS</span>
          </div>
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="text-5xl font-bold tracking-tight mb-6">Your voice shapes the city.</h1>
            <p className="text-white/50 text-lg max-w-md leading-relaxed">
              Report issues, validate community needs, and track neighborhood development in real-time. 
              The city listens when citizens speak together.
            </p>
          </motion.div>
        </div>

        {/* Right Side: Auth Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-white/[0.03] border border-white/10 p-10 rounded-3xl shadow-2xl backdrop-blur-md"
          >
            <div className="mb-8 text-center lg:text-left">
              <h2 className="text-2xl font-bold mb-2">Welcome back</h2>
              <p className="text-white/50">Continue contributing to your community.</p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Mobile number / Email</label>
                <input 
                  type="text" 
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#070b14]/50 border border-white/10 text-white focus:outline-none focus:border-[#494bd6] focus:ring-1 focus:ring-[#494bd6] transition-all"
                  placeholder="Enter your registered mobile or email"
                  required
                />
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <label className="block text-sm font-medium text-white/70">Password</label>
                  <a href="#" className="text-sm text-[#c0c1ff] hover:text-white transition-colors">Forgot password?</a>
                </div>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#070b14]/50 border border-white/10 text-white focus:outline-none focus:border-[#494bd6] focus:ring-1 focus:ring-[#494bd6] transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button 
                type="submit" 
                className="w-full py-3.5 rounded-xl bg-white text-black font-semibold hover:bg-gray-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]"
              >
                Sign in
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-white/10 text-center">
              <p className="text-white/50 text-sm mb-4">Don't have an account?</p>
              <button 
                onClick={() => navigate("/register")}
                className="w-full py-3.5 rounded-xl bg-transparent border border-white/20 text-white font-semibold hover:bg-white/5 transition-all"
              >
                Create citizen account
              </button>
            </div>
            
            <div className="mt-6 flex justify-center gap-4 text-xs font-mono text-white/30">
              <Link to="/worker/login" className="hover:text-white/60">Worker Portal</Link>
              <span>|</span>
              <Link to="/operator/login" className="hover:text-white/60">Operator Portal</Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
