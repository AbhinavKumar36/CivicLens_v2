import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { api } from "@/services/api"
import { useAuth } from "@/contexts/AuthContext"

const BHUBANESWAR_WARDS = [
  "Ward 23 (Bhouma Nagar)",
  "Ward 24 (Saheed Nagar)",
  "Ward 35 (Rasulgarh)",
  "Ward 42 (Nayapalli)",
  "Ward 12 (Chandrasekharpur)",
  "Ward 31 (Old Town)"
];

export function CitizenRegister() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [step, setStep] = useState(1)
  
  // Basic Info
  const [fullName, setFullName] = useState("")
  const [mobile, setMobile] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [wardId, setWardId] = useState(BHUBANESWAR_WARDS[0])

  // Aadhaar File
  const [fileBase64, setFileBase64] = useState<string | null>(null)
  const [fileName, setFileName] = useState("")
  const [pdfPassword, setPdfPassword] = useState("")

  // Verification State
  const [isVerifying, setIsVerifying] = useState(false)
  const [verifyStatus, setVerifyStatus] = useState<"IDLE" | "UPLOADING" | "READING" | "VALIDATING" | "VERIFIED" | "FAILED">("IDLE")
  const [verificationError, setVerificationError] = useState("")

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setVerificationError("Please upload a valid e-Aadhaar PDF document.")
      return
    }
    setFileName(file.name)
    setVerificationError("")

    const reader = new FileReader()
    reader.onload = () => {
      setFileBase64(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      alert("Passwords do not match.")
      return
    }
    setStep(2)
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fileBase64) {
      setVerificationError("Please upload your Aadhaar PDF.")
      return
    }
    if (!pdfPassword) {
      setVerificationError("Please enter the Aadhaar PDF password (usually first 4 letters of name + YYYY).")
      return
    }

    setIsVerifying(true)
    setVerificationError("")
    
    // Simulate multi-stage validation for UX
    setVerifyStatus("UPLOADING")
    await new Promise(r => setTimeout(r, 800))
    setVerifyStatus("READING")
    await new Promise(r => setTimeout(r, 1200))
    setVerifyStatus("VALIDATING")
    
    try {
      const res = await api.registerCitizen({
        fullName,
        mobile,
        password,
        wardId: wardId.split(' ')[0] + ' ' + wardId.split(' ')[1], // Quick format
        fileBase64,
        aadhaarPassword: pdfPassword
      })

      setVerifyStatus("VERIFIED")
      setTimeout(() => {
        login(res.user)
        navigate("/dashboard", { replace: true })
      }, 2000)

    } catch (err: any) {
      setVerifyStatus("FAILED")
      setVerificationError(err?.response?.data?.error || err.message || "Failed to validate PDF structure or signature.")
      setIsVerifying(false)
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

        {step === 1 && (
          <form onSubmit={handleStep1Submit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Full Name</label>
              <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} required className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white focus:border-[#494bd6] focus:outline-none" placeholder="As per official ID" />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Mobile Number</label>
              <input type="tel" value={mobile} onChange={e => setMobile(e.target.value)} required className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white focus:border-[#494bd6] focus:outline-none" placeholder="10-digit number" />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Select Constituency / Ward</label>
              <select value={wardId} onChange={e => setWardId(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white focus:border-[#494bd6] focus:outline-none">
                {BHUBANESWAR_WARDS.map(w => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white focus:border-[#494bd6] focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Confirm</label>
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white focus:border-[#494bd6] focus:outline-none" />
              </div>
            </div>
            <button type="submit" className="w-full py-3.5 mt-4 rounded-xl bg-white text-black font-semibold hover:bg-gray-200 transition-all shadow-lg">
              Continue to Verification
            </button>
            <div className="text-center mt-4">
              <button type="button" onClick={() => navigate("/login")} className="text-sm text-white/50 hover:text-white">Already have an account? Sign in</button>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerify} className="space-y-5">
            <div className="p-4 rounded-xl bg-[#494bd6]/10 border border-[#494bd6]/30 mb-6">
              <h3 className="text-[#c0c1ff] font-semibold text-sm mb-1 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">privacy_tip</span>
                Identity Verification
              </h3>
              <p className="text-xs text-white/60 leading-relaxed">
                Your Aadhaar document is used only for identity verification. We validate the PDF structure and embedded digital signature dictionary. The file is never stored permanently and your full Aadhaar number remains masked.
              </p>
            </div>

            {verificationError && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                {verificationError}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Upload e-Aadhaar PDF</label>
              <div className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:border-white/40 transition-colors relative">
                <input type="file" accept=".pdf" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <span className="material-symbols-outlined text-3xl text-white/30 mb-2">upload_file</span>
                <p className="text-sm text-white/70">{fileName ? fileName : "Click or drag PDF here"}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">PDF Password</label>
              <input type="password" value={pdfPassword} onChange={e => setPdfPassword(e.target.value)} required className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white focus:border-[#494bd6] focus:outline-none" placeholder="e.g. ABCD1990" />
            </div>

            {isVerifying ? (
              <div className="py-4 space-y-4">
                <div className="flex justify-between text-xs font-mono text-white/60">
                  <span>{verifyStatus}</span>
                  {verifyStatus === "VERIFIED" && <span className="text-green-400">Document signature structure detected</span>}
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
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setStep(1)} className="px-6 py-3.5 rounded-xl bg-white/5 text-white font-medium hover:bg-white/10 transition-all border border-white/10">
                  Back
                </button>
                <button type="submit" disabled={!fileBase64} className="flex-1 py-3.5 rounded-xl bg-white text-black font-semibold hover:bg-gray-200 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                  Verify & Create Account
                </button>
              </div>
            )}
          </form>
        )}
      </motion.div>
    </div>
  )
}
