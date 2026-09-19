import React, { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { motion } from "framer-motion"
import { useAuth } from "@/contexts/AuthContext"

export function OperatorLogin() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  const [operatorId, setOperatorId] = useState("operator@civiclens.gov")
  const [password, setPassword] = useState("admin123")
  const [error, setError] = useState("")

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    try {
      const mockUser = {
        id: 2,
        name: "Ananya Gupta",
        email: "operator@civiclens.gov",
        role: "OPERATOR" as const,
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80"
      }
      login(mockUser)
      
      const from = (location.state as any)?.from?.pathname || "/admin/planning"
      navigate(from, { replace: true })
    } catch (err) {
      setError("Failed to authenticate.")
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#fafafa] dark:bg-[#0c0e12] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#494bd6]/5 blur-[120px] rounded-full pointer-events-none"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[420px] bg-white dark:bg-[#151821] border border-gray-200 dark:border-gray-800 p-10 rounded-2xl shadow-xl relative z-10"
      >
        <div className="mb-8 text-center">
          <div className="w-12 h-12 mx-auto bg-[#494bd6]/10 text-[#494bd6] rounded-xl flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-2xl">admin_panel_settings</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Development Planning Studio</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Evidence-backed constituency planning.</p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Operator ID / Email</label>
            <input 
              type="text" 
              value={operatorId}
              onChange={e => setOperatorId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-[#0c0e12] border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-[#494bd6] focus:ring-1 focus:ring-[#494bd6] transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-[#0c0e12] border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-[#494bd6] focus:ring-1 focus:ring-[#494bd6] transition-colors"
              required
            />
          </div>
          <button 
            type="submit" 
            className="w-full py-3 mt-4 rounded-lg bg-[#494bd6] text-white font-semibold hover:bg-[#3d3fc2] transition-colors shadow-md shadow-[#494bd6]/20"
          >
            Sign in to Studio
          </button>
        </form>
        
        <div className="mt-8 text-center">
          <button onClick={() => navigate("/login")} className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
            Return to Public Site
          </button>
        </div>
      </motion.div>
    </div>
  )
}
