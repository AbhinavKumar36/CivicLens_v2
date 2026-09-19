import React, { useState } from "react"
import { useNavigate, useLocation, Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/contexts/AuthContext"
import { apiClient } from "@/services/api"

type Step = "ENTER_MOBILE" | "ENTER_OTP"

export function CitizenLogin() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [step, setStep] = useState<Step>("ENTER_MOBILE")
  const [mobile, setMobile] = useState("")
  const [otp, setOtp] = useState("")
  const [citizenName, setCitizenName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [resendTimer, setResendTimer] = useState(0)

  const startResendTimer = () => {
    setResendTimer(30)
    const interval = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      })
    }, 1000)
  }

  const handleCheckMobile = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    const cleanMobile = mobile.replace(/[^0-9]/g, "").slice(-10)
    if (cleanMobile.length !== 10) {
      setError("Please enter a valid 10-digit mobile number.")
      return
    }
    setLoading(true)
    try {
      const res = await apiClient.post("/auth/citizen/check", { mobile: cleanMobile })
      const data = res.data

      if (!data.exists) {
        navigate("/register", { state: { mobile: cleanMobile } })
        return
      }

      setCitizenName(data.name)
      // Send OTP
      const otpRes = await apiClient.post("/auth/citizen/send-otp", { mobile: cleanMobile })
      const otpData = otpRes.data

      setStep("ENTER_OTP")
      startResendTimer()
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (otp.length !== 6) {
      setError("Please enter the 6-digit OTP sent to your mobile.")
      return
    }
    setLoading(true)
    try {
      const cleanMobile = mobile.replace(/[^0-9]/g, "").slice(-10)
      const res = await apiClient.post("/auth/citizen/verify-otp", { mobile: cleanMobile, otp })
      const data = res.data

      login({
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: "CITIZEN",
        avatar: data.user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(data.user.name)}`
      })

      const from = (location.state as any)?.from?.pathname || "/dashboard"
      navigate(from, { replace: true })
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "OTP verification failed.")
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (resendTimer > 0) return
    setError("")
    setLoading(true)
    try {
      const cleanMobile = mobile.replace(/[^0-9]/g, "").slice(-10)
      const res = await apiClient.post("/auth/citizen/send-otp", { mobile: cleanMobile })
      const data = res.data
      startResendTimer()
    } catch (err: any) {
      setError(err.response?.data?.error || err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#070b14] flex relative overflow-hidden text-white">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[10%] -left-[10%] w-[800px] h-[800px] bg-[#494bd6]/20 blur-[150px] rounded-full mix-blend-screen pointer-events-none" />
        <div className="absolute bottom-[10%] -right-[10%] w-[600px] h-[600px] bg-[#f751a1]/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />
        <div className="absolute inset-0 bg-[#070b14]/60 backdrop-blur-[100px]" />
      </div>

      <div className="w-full max-w-7xl mx-auto flex z-10">
        {/* Left Side */}
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

        {/* Right Side */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-white/[0.03] border border-white/10 p-10 rounded-3xl shadow-2xl backdrop-blur-md"
          >
            <AnimatePresence mode="wait">
              {step === "ENTER_MOBILE" && (
                <motion.div key="mobile" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                  <div className="mb-8 text-center lg:text-left">
                    <div className="w-12 h-12 rounded-2xl bg-[#494bd6]/20 border border-[#494bd6]/30 flex items-center justify-center mb-4">
                      <span className="material-symbols-outlined text-[#c0c1ff] text-2xl">smartphone</span>
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Enter your mobile</h2>
                    <p className="text-white/50 text-sm">We'll check if you're registered and send you an OTP.</p>
                  </div>

                  {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
                  )}

                  <form onSubmit={handleCheckMobile} className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">Mobile Number</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 text-sm font-mono">+91</span>
                        <input
                          type="tel"
                          value={mobile}
                          onChange={e => setMobile(e.target.value.replace(/[^0-9]/g, "").slice(0, 10))}
                          className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-[#070b14]/50 border border-white/10 text-white focus:outline-none focus:border-[#494bd6] focus:ring-1 focus:ring-[#494bd6] transition-all font-mono text-lg tracking-widest"
                          placeholder="9876543210"
                          maxLength={10}
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading || mobile.length !== 10}
                      className="w-full py-3.5 rounded-xl bg-white text-black font-semibold hover:bg-gray-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <><span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Checking...</>
                      ) : "Continue"}
                    </button>
                  </form>

                  <div className="mt-8 pt-6 border-t border-white/10 text-center">
                    <p className="text-white/50 text-sm mb-4">New to CivicLens?</p>
                    <button
                      onClick={() => navigate("/register")}
                      className="w-full py-3.5 rounded-xl bg-transparent border border-white/20 text-white font-semibold hover:bg-white/5 transition-all"
                    >
                      Create citizen account
                    </button>
                  </div>
                </motion.div>
              )}

              {step === "ENTER_OTP" && (
                <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className="mb-8">
                    <button
                      onClick={() => { setStep("ENTER_MOBILE"); setError(""); setOtp(""); }}
                      className="flex items-center gap-1.5 text-white/40 hover:text-white text-sm mb-6 transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">arrow_back</span> Back
                    </button>
                    <div className="w-12 h-12 rounded-2xl bg-green-500/20 border border-green-500/30 flex items-center justify-center mb-4">
                      <span className="material-symbols-outlined text-green-400 text-2xl">sms</span>
                    </div>
                    <h2 className="text-2xl font-bold mb-1">OTP sent!</h2>
                    {citizenName && <p className="text-[#c0c1ff] text-sm font-medium mb-1">Welcome back, {citizenName}!</p>}
                    <p className="text-white/50 text-sm">
                      Enter the 6-digit code sent to <span className="text-white font-mono">+91 {mobile}</span>
                    </p>
                  </div>

                  {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
                  )}

                  <form onSubmit={handleVerifyOtp} className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">One-Time Password</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={otp}
                        onChange={e => setOtp(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                        className="w-full px-4 py-4 rounded-xl bg-[#070b14]/50 border border-white/10 text-white text-center text-2xl font-mono tracking-[0.5em] focus:outline-none focus:border-[#494bd6] focus:ring-1 focus:ring-[#494bd6] transition-all"
                        placeholder="· · · · · ·"
                        maxLength={6}
                        autoFocus
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading || otp.length !== 6}
                      className="w-full py-3.5 rounded-xl bg-white text-black font-semibold hover:bg-gray-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <><span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Verifying...</>
                      ) : "Verify & Sign In"}
                    </button>
                  </form>

                  <div className="mt-6 text-center">
                    <p className="text-white/40 text-sm">
                      Didn't receive the OTP?{" "}
                      {resendTimer > 0 ? (
                        <span className="text-white/30">Resend in {resendTimer}s</span>
                      ) : (
                        <button
                          onClick={handleResendOtp}
                          disabled={loading}
                          className="text-[#c0c1ff] hover:text-white transition-colors font-medium"
                        >
                          Resend OTP
                        </button>
                      )}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

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
