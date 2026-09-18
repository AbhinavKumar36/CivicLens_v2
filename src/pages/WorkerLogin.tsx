import React, { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { motion } from "framer-motion"
import { useAuth } from "@/contexts/AuthContext"

export function WorkerLogin() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  const [workerId, setWorkerId] = useState("rahul.worker@civiclens.gov")
  const [password, setPassword] = useState("worker123")
  const [workerRole, setWorkerRole] = useState<"HEAD" | "FIELD">("FIELD")
  const [error, setError] = useState("")

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    // Mocked Worker Login
    try {
      const mockUser = {
        id: workerRole === "HEAD" ? 1 : 3,
        name: workerRole === "HEAD" ? "Rajesh Kumar (Head)" : "Rahul Verma",
        email: workerId,
        role: "WORKER" as const,
        workerRole: workerRole,
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80"
      }
      login(mockUser)
      
      const from = (location.state as any)?.from?.pathname || "/worker"
      navigate(from, { replace: true })
    } catch (err) {
      setError("Failed to authenticate.")
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#111827] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1f2937] via-[#111827] to-[#030712] opacity-80"></div>
        {/* Subtle grid for control room feel */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjAuMDUiIGZpbGw9Im5vbmUiPjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiLz48L2c+PC9zdmc+')] opacity-20"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#1f2937]/90 border border-gray-700 p-8 rounded-xl shadow-2xl relative z-10 backdrop-blur-md"
      >
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-gray-800 border-2 border-orange-500 flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.4)]">
            <span className="material-symbols-outlined text-orange-500 text-3xl">engineering</span>
          </div>
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white tracking-tight">Worker Portal</h1>
          <p className="text-gray-400 text-sm mt-1">Manage assigned civic operations.</p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-md bg-red-900/50 border border-red-700 text-red-300 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Worker ID / Email</label>
            <input 
              type="text" 
              value={workerId}
              onChange={e => setWorkerId(e.target.value)}
              className="w-full px-4 py-3 rounded-md bg-gray-900 border border-gray-700 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-md bg-gray-900 border border-gray-700 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Worker Role</label>
            <select
              value={workerRole}
              onChange={e => setWorkerRole(e.target.value as "HEAD" | "FIELD")}
              className="w-full px-4 py-3 rounded-md bg-gray-900 border border-gray-700 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
            >
              <option value="FIELD">Field Worker</option>
              <option value="HEAD">Worker Head</option>
            </select>
          </div>
          <button 
            type="submit" 
            className="w-full py-3.5 mt-2 rounded-md bg-orange-600 text-white font-bold tracking-wide hover:bg-orange-500 transition-colors shadow-lg"
          >
            SIGN IN
          </button>
        </form>
        
        <div className="mt-8 text-center border-t border-gray-700 pt-6">
          <button onClick={() => navigate("/login")} className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
            Return to Citizen Portal
          </button>
        </div>
      </motion.div>
    </div>
  )
}
