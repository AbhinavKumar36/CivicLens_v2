import React, { useState, useMemo } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Headline, BodyText, Label } from "@/components/atoms/Typography";
import { Button } from "@/components/atoms/Button";
import { useAuth, type User } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { api } from "@/services/api";
import { cn } from "@/utils/utils";

const PREDEFINED_USERS: User[] = [
  { id: 1, name: "Priya Sharma", email: "priya@example.com", role: "CITIZEN", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80" },
  { id: 2, name: "Ananya Gupta", email: "operator@civiclens.gov", role: "OPERATOR", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80" },
  { id: 3, name: "Rahul Verma", email: "rahul.worker@civiclens.gov", role: "WORKER", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80" }
];

const BHUBANESWAR_WARDS = [
  "Ward 23 (Bhouma Nagar)",
  "Ward 24 (Saheed Nagar)",
  "Ward 35 (Rasulgarh)",
  "Ward 42 (Nayapalli)",
  "Ward 12 (Chandrasekharpur)",
  "Ward 31 (Old Town)"
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export function Login() {
  const { login } = useAuth();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  // Citizen Aadhaar Registration Modal State
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [regStep, setRegStep] = useState<1 | 2 | 3>(1);
  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [wardId, setWardId] = useState("Ward 23 (Bhouma Nagar)");
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [verifiedUser, setVerifiedUser] = useState<any | null>(null);

  const handleLogin = (user: User) => {
    login(user);
    const from = (location.state as any)?.from?.pathname;
    if (from && from !== '/') {
      navigate(from, { replace: true });
    } else {
      switch (user.role) {
        case 'CITIZEN': navigate("/dashboard", { replace: true }); break;
        case 'OPERATOR': navigate("/admin", { replace: true }); break;
        case 'WORKER': navigate("/worker", { replace: true }); break;
        default: navigate("/dashboard", { replace: true });
      }
    }
  };

  const handleGenerateTestPdf = async () => {
    const testName = fullName.trim() || "Subhashree Nayak";
    const testDob = dateOfBirth.trim() || "1996-05-18";
    if (!fullName) setFullName(testName);
    if (!dateOfBirth) setDateOfBirth(testDob);
    if (!email) setEmail(`${testName.toLowerCase().replace(/[^a-z0-9]/g, '')}@citizen.civiclens.gov`);
    if (!aadhaarNumber) setAadhaarNumber("9482 1209 8831");

    try {
      const res = await api.generateTestAadhaarPdf({ fullName: testName, dateOfBirth: testDob });
      setFileBase64(res.fileBase64);
      setFileName(res.fileName);
      setVerificationError(null);
      addNotification({
        title: "Test e-Aadhaar PDF Generated",
        message: "Embedded digital signature dictionary attached.",
        type: "info",
        group: "system"
      });
    } catch (err: any) {
      setVerificationError("Failed to generate test PDF: " + err.message);
    }
  };

  const handleFileUpload = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setVerificationError("Please upload a valid e-Aadhaar PDF document.");
      return;
    }
    setFileName(file.name);
    setVerificationError(null);

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setFileBase64(result);
    };
    reader.readAsDataURL(file);
  };

  const handleVerifyAndRegister = async () => {
    if (!fullName.trim() || !dateOfBirth.trim()) {
      setVerificationError("Full Name and Date of Birth are mandatory for Aadhaar verification.");
      return;
    }

    setIsVerifying(true);
    setVerificationError(null);

    try {
      const payload: any = {
        fullName: fullName.trim(),
        dateOfBirth: dateOfBirth.trim(),
        email: email.trim() || undefined,
        mobile: mobile.trim() || undefined,
        wardId: wardId.split(' ')[0] + ' ' + wardId.split(' ')[1],
        aadhaarNumber: aadhaarNumber.trim() || "XXXX-XXXX-9901"
      };

      if (fileBase64) {
        payload.fileBase64 = fileBase64;
      }

      const res = await api.registerCitizen(payload);
      setVerifiedUser(res.user);
      setRegStep(3);

      addNotification({
        title: "e-Aadhaar Verified!",
        message: "Digital signature validated. 100 Welcome Points awarded!",
        type: "success",
        group: "rewards"
      });
    } catch (err: any) {
      const errMsg = err?.response?.data?.error || err.message || "Aadhaar verification failed.";
      setVerificationError(errMsg);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCompleteRegistration = () => {
    if (!verifiedUser) return;
    setIsRegisterModalOpen(false);
    login(verifiedUser);
    navigate("/dashboard", { replace: true });
  };

  const getRoleColor = (role: string) => {
    switch(role) {
      case 'CITIZEN': return "text-primary bg-primary/10 border-primary/20 hover:border-primary/50 hover:bg-primary/20";
      case 'OPERATOR': return "text-secondary bg-secondary/10 border-secondary/20 hover:border-secondary/50 hover:bg-secondary/20";
      case 'WORKER': return "text-tertiary bg-tertiary/10 border-tertiary/20 hover:border-tertiary/50 hover:bg-tertiary/20";
      default: return "";
    }
  };

  const getRoleIcon = (role: string) => {
    switch(role) {
      case 'CITIZEN': return "person";
      case 'OPERATOR': return "admin_panel_settings";
      case 'WORKER': return "engineering";
      default: return "person";
    }
  };

  return (
    <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[20%] left-[20%] w-96 h-96 bg-primary/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[20%] right-[20%] w-96 h-96 bg-secondary/15 blur-[150px] rounded-full pointer-events-none"></div>

      <motion.div 
        variants={containerVariants} 
        initial="hidden" 
        animate="show"
        className="max-w-4xl w-full z-10 space-y-10"
      >
        <div className="text-center space-y-4">
          <Link to="/" className="w-16 h-16 rounded-3xl overflow-hidden mx-auto shadow-[0_0_30px_rgba(192,193,255,0.2)] bg-white flex items-center justify-center p-1 hover:scale-105 transition-transform">
            <img src={`${import.meta.env.BASE_URL}logo.png`} alt="CivicLens Logo" className="w-full h-full object-contain" />
          </Link>
          <Headline level={1} className="text-foreground">Select Your Profile</Headline>
          <BodyText className="text-on-surface-variant max-w-lg mx-auto">
            Welcome to the CivicLens AI Operating System. Sign in with a verified profile or register as a citizen with e-Aadhaar KYC.
          </BodyText>
        </div>

        {/* Predefined Profiles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PREDEFINED_USERS.map((user) => (
            <motion.div key={user.id} variants={itemVariants}>
              <GlassPanel 
                hover 
                onClick={() => handleLogin(user)}
                className={`p-8 text-center cursor-pointer transition-all duration-300 transform hover:-translate-y-2 border-2 ${getRoleColor(user.role).split('hover:')[0]} hover:shadow-2xl`}
              >
                <div className="w-24 h-24 rounded-full mx-auto mb-6 overflow-hidden border-4 border-background shadow-lg relative">
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  <div className={`absolute bottom-0 right-0 w-8 h-8 rounded-full border-2 border-background flex items-center justify-center ${getRoleColor(user.role).split(' ')[1]} ${getRoleColor(user.role).split(' ')[0]}`}>
                    <span className="material-symbols-outlined text-[16px]">{getRoleIcon(user.role)}</span>
                  </div>
                </div>
                <Headline level={3} className="text-foreground mb-1">{user.name}</Headline>
                <p className={`text-xs font-bold uppercase tracking-widest ${getRoleColor(user.role).split(' ')[0]}`}>
                  {user.role} PORTAL
                </p>
                <BodyText className="text-xs text-on-surface-variant mt-4 opacity-80">
                  {user.role === 'CITIZEN' && "Report issues, track real-time demand hotspots & claim civic rewards."}
                  {user.role === 'OPERATOR' && "Dispatch units, review evidence, and optimize development portfolios."}
                  {user.role === 'WORKER' && "Receive tasks, log progress, and resolve city infrastructure issues."}
                </BodyText>
              </GlassPanel>
            </motion.div>
          ))}
        </div>

        {/* First Time Citizen Registration Banner */}
        <motion.div variants={itemVariants}>
          <GlassPanel className="p-6 rounded-3xl border border-primary/30 shadow-xl bg-gradient-to-r from-primary/10 via-surface-container/80 to-secondary/10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/20 text-primary flex items-center justify-center shrink-0 border border-primary/30 shadow-lg">
                <span className="material-symbols-outlined text-3xl">fingerprint</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Headline level={3} className="text-lg">First Time Citizen Registration</Headline>
                  <span className="px-2.5 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs font-bold border border-green-500/30">
                    +100 Welcome Points
                  </span>
                </div>
                <BodyText className="text-xs text-on-surface-variant mt-1">
                  Authenticate your identity using official e-Aadhaar PDF digital signature verification.
                </BodyText>
              </div>
            </div>
            <Button 
              className="bg-gradient-to-r from-primary to-secondary text-on-primary font-bold px-6 shrink-0 shadow-lg"
              onClick={() => {
                setRegStep(1);
                setVerificationError(null);
                setIsRegisterModalOpen(true);
              }}
            >
              <span className="material-symbols-outlined mr-2 text-sm">verified</span>
              Register with e-Aadhaar
            </Button>
          </GlassPanel>
        </motion.div>
        
        <div className="text-center mt-6">
          <button 
            onClick={() => navigate("/")}
            className="text-on-surface-variant hover:text-foreground text-sm flex items-center justify-center gap-2 mx-auto transition-colors"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            Back to Landing Page
          </button>
        </div>
      </motion.div>

      {/* Aadhaar Citizen Registration Modal */}
      <AnimatePresence>
        {isRegisterModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-md"
              onClick={() => !isVerifying && setIsRegisterModalOpen(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto"
            >
              <GlassPanel className="p-8 rounded-3xl border border-primary/40 shadow-2xl bg-surface-container/95 space-y-6">
                
                {/* Stepper Header */}
                <div className="flex items-center justify-between pb-4 border-b border-foreground/10">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-2xl text-primary">shield_person</span>
                    <div>
                      <Headline level={3} className="text-lg">Citizen e-KYC Verification</Headline>
                      <Label className="text-xs text-on-surface-variant normal-case">UIDAI Digital Signature Validation</Label>
                    </div>
                  </div>
                  <button 
                    onClick={() => !isVerifying && setIsRegisterModalOpen(false)}
                    className="text-on-surface-variant hover:text-foreground"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                {/* Stepper Progress */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className={cn("p-2 rounded-xl font-bold border transition-colors", regStep >= 1 ? "bg-primary/20 text-primary border-primary/30" : "bg-foreground/5 text-on-surface-variant border-foreground/10")}>
                    1. Details
                  </div>
                  <div className={cn("p-2 rounded-xl font-bold border transition-colors", regStep >= 2 ? "bg-primary/20 text-primary border-primary/30" : "bg-foreground/5 text-on-surface-variant border-foreground/10")}>
                    2. e-Aadhaar PDF
                  </div>
                  <div className={cn("p-2 rounded-xl font-bold border transition-colors", regStep === 3 ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-foreground/5 text-on-surface-variant border-foreground/10")}>
                    3. Verified (+100 PTS)
                  </div>
                </div>

                {/* Error Banner */}
                {verificationError && (
                  <div className="p-4 rounded-xl bg-error/10 border border-error/30 text-error text-xs flex items-start gap-2 animate-in fade-in">
                    <span className="material-symbols-outlined text-base mt-0.5">error</span>
                    <span>{verificationError}</span>
                  </div>
                )}

                {/* Step 1: Personal Details */}
                {regStep === 1 && (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-xs text-foreground font-semibold block mb-1">Full Legal Name (as per Aadhaar)</Label>
                      <input 
                        type="text" 
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        placeholder="e.g. Subhashree Nayak"
                        className="w-full bg-foreground/5 border border-foreground/10 rounded-xl p-3 text-sm text-foreground focus:border-primary/50 outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs text-foreground font-semibold block mb-1">Date of Birth</Label>
                        <input 
                          type="date" 
                          value={dateOfBirth}
                          onChange={e => setDateOfBirth(e.target.value)}
                          className="w-full bg-foreground/5 border border-foreground/10 rounded-xl p-3 text-sm text-foreground focus:border-primary/50 outline-none"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-foreground font-semibold block mb-1">Aadhaar Number (12 Digits)</Label>
                        <input 
                          type="text" 
                          value={aadhaarNumber}
                          onChange={e => setAadhaarNumber(e.target.value)}
                          placeholder="XXXX-XXXX-8921"
                          maxLength={14}
                          className="w-full bg-foreground/5 border border-foreground/10 rounded-xl p-3 text-sm text-foreground focus:border-primary/50 outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs text-foreground font-semibold block mb-1">Email Address</Label>
                        <input 
                          type="email" 
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          placeholder="citizen@civiclens.gov"
                          className="w-full bg-foreground/5 border border-foreground/10 rounded-xl p-3 text-sm text-foreground focus:border-primary/50 outline-none"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-foreground font-semibold block mb-1">Mobile Number</Label>
                        <input 
                          type="text" 
                          value={mobile}
                          onChange={e => setMobile(e.target.value)}
                          placeholder="+91 98610 12345"
                          className="w-full bg-foreground/5 border border-foreground/10 rounded-xl p-3 text-sm text-foreground focus:border-primary/50 outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs text-foreground font-semibold block mb-1">Bhubaneswar Ward Jurisdiction</Label>
                      <select 
                        value={wardId}
                        onChange={e => setWardId(e.target.value)}
                        className="w-full bg-foreground/5 border border-foreground/10 rounded-xl p-3 text-sm text-foreground focus:border-primary/50 outline-none"
                      >
                        {BHUBANESWAR_WARDS.map(w => (
                          <option key={w} value={w} className="bg-surface-container text-foreground">{w}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                      <Button variant="outline" onClick={() => setIsRegisterModalOpen(false)}>Cancel</Button>
                      <Button 
                        className="bg-primary text-on-primary font-bold px-6"
                        disabled={!fullName.trim() || !dateOfBirth.trim()}
                        onClick={() => setRegStep(2)}
                      >
                        Next: Upload e-Aadhaar <span className="material-symbols-outlined ml-1 text-sm">arrow_forward</span>
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 2: Upload e-Aadhaar & Verification */}
                {regStep === 2 && (
                  <div className="space-y-5">
                    <div className="p-4 bg-foreground/5 rounded-2xl border border-foreground/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-on-surface-variant">Applicant:</span>
                        <strong className="text-xs text-foreground">{fullName}</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-on-surface-variant">DOB:</span>
                        <strong className="text-xs text-foreground">{dateOfBirth}</strong>
                      </div>
                    </div>

                    {/* Drag and Drop / File Input */}
                    <div className="border-2 border-dashed border-primary/30 rounded-2xl p-6 text-center space-y-3 bg-primary/5 hover:bg-primary/10 transition-colors">
                      <span className="material-symbols-outlined text-4xl text-primary">upload_file</span>
                      <div>
                        <p className="text-sm font-bold text-foreground">
                          {fileName ? `Selected: ${fileName}` : "Upload Password-Protected e-Aadhaar PDF"}
                        </p>
                        <p className="text-xs text-on-surface-variant mt-1">
                          CivicLens inspects embedded UIDAI digital signature dictionaries (/Type /Sig, /ByteRange).
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-center gap-3 pt-2">
                        <label className="cursor-pointer">
                          <input 
                            type="file" 
                            accept=".pdf" 
                            className="hidden" 
                            onChange={e => {
                              const f = e.target.files?.[0];
                              if (f) handleFileUpload(f);
                            }} 
                          />
                          <span className="px-4 py-2 rounded-xl bg-foreground/10 hover:bg-foreground/20 text-xs font-semibold text-foreground transition-colors inline-block">
                            Browse Local PDF
                          </span>
                        </label>

                        <button 
                          type="button" 
                          onClick={handleGenerateTestPdf}
                          className="px-4 py-2 rounded-xl bg-primary/20 hover:bg-primary/30 text-xs font-bold text-primary transition-colors border border-primary/30"
                        >
                          ⚡ Generate Valid Test PDF
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between gap-3 pt-4">
                      <Button variant="outline" onClick={() => setRegStep(1)} disabled={isVerifying}>
                        Back
                      </Button>
                      <Button 
                        className="bg-gradient-to-r from-primary to-secondary text-on-primary font-bold px-8"
                        disabled={isVerifying}
                        onClick={handleVerifyAndRegister}
                      >
                        {isVerifying ? (
                          <>
                            <span className="material-symbols-outlined animate-spin mr-2 text-sm">sync</span>
                            Verifying UIDAI Signature...
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined mr-2 text-sm">verified_user</span>
                            Verify & Register
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 3: Success Screen */}
                {regStep === 3 && verifiedUser && (
                  <div className="text-center space-y-6 py-4 animate-in fade-in zoom-in-95">
                    <div className="w-20 h-20 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 flex items-center justify-center mx-auto shadow-xl">
                      <span className="material-symbols-outlined text-4xl">task_alt</span>
                    </div>

                    <div>
                      <Headline level={2} className="text-2xl text-foreground">KYC Verification Complete!</Headline>
                      <BodyText className="text-on-surface-variant max-w-sm mx-auto mt-1">
                        Welcome, <strong>{verifiedUser.name}</strong>. Your e-Aadhaar digital signatures were successfully confirmed.
                      </BodyText>
                    </div>

                    <div className="p-4 rounded-2xl bg-foreground/5 border border-foreground/10 space-y-2 text-left text-xs">
                      <div className="flex justify-between">
                        <span className="text-on-surface-variant">Citizen ID:</span>
                        <strong className="text-foreground">USR_{verifiedUser.id}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-on-surface-variant">Ward Jurisdiction:</span>
                        <strong className="text-foreground">{verifiedUser.ward_id}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-on-surface-variant">Welcome Civic Points:</span>
                        <strong className="text-green-400 font-bold">+100 PTS Credited</strong>
                      </div>
                    </div>

                    <Button 
                      className="w-full bg-gradient-to-r from-primary to-secondary text-on-primary font-bold py-3 text-base shadow-xl"
                      onClick={handleCompleteRegistration}
                    >
                      Enter Citizen Dashboard
                    </Button>
                  </div>
                )}

              </GlassPanel>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
