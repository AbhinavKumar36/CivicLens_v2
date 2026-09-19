import React, { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { api, apiClient } from "@/services/api"
import { useAuth } from "@/contexts/AuthContext"

const BHUBANESWAR_WARDS = [
  "Ward 23 (Bhouma Nagar)",
  "Ward 24 (Saheed Nagar)",
  "Ward 35 (Rasulgarh)",
  "Ward 42 (Nayapalli)",
  "Ward 12 (Chandrasekharpur)",
  "Ward 31 (Old Town)"
];

type Step = "INFO" | "OTP" | "AADHAAR"

export function CitizenRegister() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [step, setStep] = useState<Step>("INFO")
  
  // Basic Info
  const [fullName, setFullName] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [mobile, setMobile] = useState((location.state as any)?.mobile || "")
  const [wardId, setWardId] = useState(BHUBANESWAR_WARDS[0])

  // OTP State
  const [otp, setOtp] = useState("")
  const [resendTimer, setResendTimer] = useState(0)

  // Aadhaar File
  const [fileBase64, setFileBase64] = useState<string | null>(null)
  const [fileName, setFileName] = useState("")

  // UI State
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [verifyStatus, setVerifyStatus] = useState<"IDLE" | "UPLOADING" | "READING" | "VALIDATING" | "VERIFIED" | "FAILED">("IDLE")

  const startResendTimer = () => {
    setResendTimer(30)
    const interval = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      })
    }, 1000)
  }

  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    const cleanMobile = mobile.replace(/[^0-9]/g, "").slice(-10)
    if (cleanMobile.length !== 10) {
      setError("Please enter a valid 10-digit mobile number.")
      return
    }
    
    setLoading(true)
    try {
      // First check if mobile is already registered
      const checkRes = await apiClient.post("/auth/citizen/check", { mobile: cleanMobile })
      if (checkRes.data.exists) {
        throw new Error("Mobile number is already registered. Please sign in.")
      }
      
      // Send OTP
      await apiClient.post("/auth/citizen/send-otp", { mobile: cleanMobile })
      
      setStep("OTP")
      startResendTimer()
    } catch (err: any) {
      setError(err.response?.data?.error || err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (otp.length !== 6) {
      setError("Please enter the 6-digit OTP.")
      return
    }
    
    setLoading(true)
    try {
      const cleanMobile = mobile.replace(/[^0-9]/g, "").slice(-10)
      await api.verifyRegistrationOtp({ mobile: cleanMobile, otp })
      setStep("AADHAAR")
    } catch (err: any) {
      setError(err.response?.data?.error || err.message)
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
      await apiClient.post("/auth/citizen/send-otp", { mobile: cleanMobile })
      startResendTimer()
    } catch (err: any) {
      setError(err.response?.data?.error || err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError("Please upload a valid e-Aadhaar PDF document.")
      return
    }
    setFileName(file.name)
    setError("")

    const reader = new FileReader()
    reader.onload = () => {
      setFileBase64(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleFinalRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fileBase64) {
      setError("Please upload your Aadhaar PDF.")
      return
    }

    setLoading(true)
    setError("")
    
    // Simulate multi-stage validation for UX
    setVerifyStatus("UPLOADING")
    await new Promise(r => setTimeout(r, 800))
    setVerifyStatus("READING")
    await new Promise(r => setTimeout(r, 1200))
    setVerifyStatus("VALIDATING")
    
    try {
      const cleanMobile = mobile.replace(/[^0-9]/g, "").slice(-10)
      
      // Auto-derive PDF password: First 4 letters of name (uppercase) + Year of Birth (YYYY)
      const namePart = fullName.replace(/[^a-zA-Z]/g, '').substring(0, 4).toUpperCase()
      const yearPart = dateOfBirth.substring(0, 4) // dateOfBirth is "YYYY-MM-DD"
      const derivedPdfPassword = namePart + yearPart

      const res = await api.registerCitizen({
        fullName,
        dateOfBirth,
        mobile: cleanMobile,
        wardId: wardId.split(' ')[0] + ' ' + wardId.split(' ')[1],
        fileBase64,
        aadhaarNumber: derivedPdfPassword
      })

      setVerifyStatus("VERIFIED")
      setTimeout(() => {
        login(res.user)
        navigate("/dashboard", { replace: true })
      }, 2000)

    } catch (err: any) {
      setVerifyStatus("FAILED")
      setError(err?.response?.data?.error || err.message || "Failed to validate PDF structure or signature. Ensure name and DOB exactly match the Aadhaar.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#070b14] flex flex-col items-center justify-center p-6 text-white relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[20%] left-[20%] w-[600px] h-[600px] bg-[#c0c1ff]/10 blur-[150px] rounded-full pointer-events-none"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg bg-white/[0.03] border border-white/10 rounded-3xl p-8 backdrop-blur-xl relative z-10 shadow-2xl"
      >
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold mb-2">Create Citizen Account</h1>
          <p className="text-white/50 text-sm">Join CivicLens to participate in evidence-backed development.</p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === "INFO" && (
            <motion.form key="info" onSubmit={handleInfoSubmit} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Full Name</label>
                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} required className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white focus:border-[#494bd6] focus:outline-none" placeholder="As per official ID" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Date of Birth</label>
                  <input type="date" value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} required className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white focus:border-[#494bd6] focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Mobile Number</label>
                  <input type="tel" value={mobile} onChange={e => setMobile(e.target.value)} required maxLength={10} className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white focus:border-[#494bd6] focus:outline-none" placeholder="10-digit number" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Select Constituency / Ward</label>
                <select value={wardId} onChange={e => setWardId(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white focus:border-[#494bd6] focus:outline-none">
                  {BHUBANESWAR_WARDS.map(w => <option key={w} value={w}>{w}</option>)}
                </select>
              </div>
              
              <button type="submit" disabled={loading} className="w-full py-3.5 mt-4 rounded-xl bg-white text-black font-semibold hover:bg-gray-200 transition-all shadow-lg disabled:opacity-50 flex justify-center items-center gap-2">
                {loading ? <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : null}
                Verify Mobile Number
              </button>
              <div className="text-center mt-4">
                <button type="button" onClick={() => navigate("/login")} className="text-sm text-white/50 hover:text-white">Already have an account? Sign in</button>
              </div>
            </motion.form>
          )}

          {step === "OTP" && (
            <motion.form key="otp" onSubmit={handleVerifyOtp} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-5">
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-2xl bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-green-400 text-2xl">sms</span>
                </div>
                <h2 className="text-xl font-bold mb-1">OTP sent!</h2>
                <p className="text-white/50 text-sm">
                  Enter the 6-digit code sent to <span className="text-white font-mono">+91 {mobile}</span>
                </p>
              </div>

              <div>
                <input
                  type="text"
                  inputMode="numeric"
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                  className="w-full px-4 py-4 rounded-xl bg-black/50 border border-white/10 text-white text-center text-2xl font-mono tracking-[0.5em] focus:outline-none focus:border-[#494bd6] transition-all"
                  placeholder="· · · · · ·"
                  maxLength={6}
                  autoFocus
                  required
                />
              </div>

              <div className="flex gap-4">
                <button type="button" onClick={() => setStep("INFO")} className="px-6 py-3.5 rounded-xl bg-white/5 text-white font-medium hover:bg-white/10 transition-all border border-white/10">
                  Back
                </button>
                <button type="submit" disabled={loading || otp.length !== 6} className="flex-1 py-3.5 rounded-xl bg-white text-black font-semibold hover:bg-gray-200 transition-all shadow-lg disabled:opacity-50 flex justify-center items-center gap-2">
                  {loading ? <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : null}
                  Verify OTP
                </button>
              </div>

              <div className="mt-6 text-center">
                <p className="text-white/40 text-sm">
                  Didn't receive the OTP?{" "}
                  {resendTimer > 0 ? (
                    <span className="text-white/30">Resend in {resendTimer}s</span>
                  ) : (
                    <button type="button" onClick={handleResendOtp} disabled={loading} className="text-[#c0c1ff] hover:text-white transition-colors font-medium">
                      Resend OTP
                    </button>
                  )}
                </p>
              </div>
            </motion.form>
          )}

          {step === "AADHAAR" && (
            <motion.form key="aadhaar" onSubmit={handleFinalRegister} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
              <div className="p-4 rounded-xl bg-[#494bd6]/10 border border-[#494bd6]/30 mb-6">
                <h3 className="text-[#c0c1ff] font-semibold text-sm mb-1 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">privacy_tip</span>
                  Aadhaar Identity Verification
                </h3>
                <p className="text-xs text-white/60 leading-relaxed">
                  Your Aadhaar document is used only for identity verification. We validate the PDF structure and embedded digital signature dictionary. The file is never stored permanently.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Upload e-Aadhaar PDF</label>
                <div className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:border-white/40 transition-colors relative">
                  <input type="file" accept=".pdf" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <span className="material-symbols-outlined text-3xl text-white/30 mb-2">upload_file</span>
                  <p className="text-sm text-white/70">{fileName ? fileName : "Click or drag PDF here"}</p>
                </div>
              </div>

              {verifyStatus !== "IDLE" ? (
                <div className="py-4 space-y-4">
                  <div className="flex justify-between text-xs font-mono text-white/60">
                    <span>{verifyStatus}</span>
                    {verifyStatus === "VERIFIED" && <span className="text-green-400">Identity verified</span>}
                  </div>
                  <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      className={`h-full ${verifyStatus === "VERIFIED" ? "bg-green-500" : verifyStatus === "FAILED" ? "bg-red-500" : "bg-[#494bd6]"}`}
                      initial={{ width: "0%" }}
                      animate={{ width: verifyStatus === "UPLOADING" ? "25%" : verifyStatus === "READING" ? "50%" : verifyStatus === "VALIDATING" ? "80%" : verifyStatus === "VERIFIED" ? "100%" : "100%" }}
                    />
                  </div>
                </div>
              ) : (
                <button type="submit" disabled={!fileBase64 || loading} className="w-full mt-2 py-3.5 rounded-xl bg-white text-black font-semibold hover:bg-gray-200 transition-all shadow-lg disabled:opacity-50 flex justify-center items-center gap-2">
                  {loading ? <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : null}
                  Verify PDF & Create Account
                </button>
              )}
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
