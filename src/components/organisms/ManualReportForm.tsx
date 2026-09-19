import React, { useState, useRef } from "react"
import { motion } from "framer-motion"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { BodyText, Label } from "@/components/atoms/Typography"
import { Button } from "@/components/atoms/Button"
import { cn } from "@/utils/utils"

export const CATEGORIES = [
  { id: "infrastructure", icon: "construction", label: "Infrastructure", color: "text-orange-400 bg-orange-500/10 border-orange-500/20" },
  { id: "corruption", icon: "gavel", label: "Corruption", color: "text-red-400 bg-red-500/10 border-red-500/20" },
  { id: "safety", icon: "health_and_safety", label: "Public Safety", color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" },
  { id: "environment", icon: "eco", label: "Environment", color: "text-green-400 bg-green-500/10 border-green-500/20" },
  { id: "sanitation", icon: "delete_outline", label: "Sanitation", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  { id: "other", icon: "more_horiz", label: "Other", color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
]

export const SEVERITY_LEVELS = [
  { id: "critical", label: "Critical", desc: "Immediate danger to life or property", color: "border-red-500 bg-red-500/10 text-red-400" },
  { id: "high", label: "High", desc: "Significant impact, needs urgent attention", color: "border-orange-500 bg-orange-500/10 text-orange-400" },
  { id: "medium", label: "Medium", desc: "Moderate impact, can wait briefly", color: "border-yellow-500 bg-yellow-500/10 text-yellow-400" },
  { id: "low", label: "Low", desc: "Minor issue, not time-sensitive", color: "border-green-500 bg-green-500/10 text-green-400" },
]

interface ManualReportFormProps {
  onSubmit: (data: { category: string; severity: string; description: string; location: string; image: string | null }) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  submitLabel?: string;
  submitIcon?: string;
  showAnonymityInfo?: boolean;
}

export function ManualReportForm({
  onSubmit,
  onCancel,
  isSubmitting,
  submitLabel = "Submit Report",
  submitIcon = "send",
  showAnonymityInfo = false,
}: ManualReportFormProps) {
  const [category, setCategory] = useState("")
  const [severity, setSeverity] = useState("")
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isDetectingLocation, setIsDetectingLocation] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const canSubmit = category && severity && description.trim().length >= 10

  const handleDetectLocation = () => {
    setIsDetectingLocation(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation(`${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
          setIsDetectingLocation(false);
        },
        (error) => {
          console.error("Error getting location", error);
          alert("Unable to retrieve your location.");
          setIsDetectingLocation(false);
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
      setIsDetectingLocation(false);
    }
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = () => {
    if (!canSubmit) return
    onSubmit({ category, severity, description, location, image: imagePreview })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8 w-full max-w-4xl mx-auto"
    >
      {showAnonymityInfo && (
        <GlassPanel className="p-4 rounded-2xl border-l-4 border-l-tertiary flex items-center gap-4">
          <span className="material-symbols-outlined text-tertiary text-2xl">verified_user</span>
          <div>
            <Label className="text-foreground font-semibold block">End-to-End Privacy Protection</Label>
            <BodyText className="text-on-surface-variant text-xs">
              This form does not collect your name, email, user ID, IP address, or any identifying information. 
              Reports are fully decoupled from citizen profiles.
            </BodyText>
          </div>
        </GlassPanel>
      )}

      {/* Category Selection */}
      <div>
        <Label className="text-foreground font-semibold mb-4 block">What type of issue are you reporting?</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={cn(
                "p-4 rounded-xl border flex flex-col items-center gap-2 transition-all text-center",
                category === cat.id 
                  ? `${cat.color} border-current shadow-lg scale-[1.02]`
                  : "border-foreground/10 bg-foreground/5 text-on-surface-variant hover:bg-foreground/10"
              )}
            >
              <span className="material-symbols-outlined text-2xl">{cat.icon}</span>
              <span className="text-xs font-bold">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Severity */}
      <div>
        <Label className="text-foreground font-semibold mb-4 block">How severe is this issue?</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SEVERITY_LEVELS.map(sev => (
            <button
              key={sev.id}
              onClick={() => setSeverity(sev.id)}
              className={cn(
                "p-4 rounded-xl border-l-4 flex items-center gap-4 transition-all text-left",
                severity === sev.id
                  ? `${sev.color} shadow-lg`
                  : "border-l-foreground/10 bg-foreground/5 text-on-surface-variant hover:bg-foreground/10"
              )}
            >
              <div>
                <span className="font-bold text-sm block">{sev.label}</span>
                <span className="text-[11px] opacity-80">{sev.desc}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div>
        <Label className="text-foreground font-semibold mb-3 block">Describe the issue in detail</Label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Provide as much detail as possible — what you saw, when, where, and any relevant context..."
          rows={5}
          className="w-full bg-foreground/5 border border-foreground/10 rounded-2xl p-4 text-sm text-foreground placeholder:text-on-surface-variant/40 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
        />
        <p className="text-[10px] text-on-surface-variant mt-2">{description.length} characters — minimum 10 required</p>
      </div>

      {/* Media Upload */}
      <div>
        <Label className="text-foreground font-semibold mb-3 block">Photo Evidence <span className="text-on-surface-variant font-normal">(Optional)</span></Label>
        <div 
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "relative border-2 border-dashed rounded-2xl cursor-pointer transition-all overflow-hidden flex flex-col items-center justify-center gap-2",
            imagePreview ? "border-primary/30 bg-foreground/5 py-4" : "border-foreground/10 bg-foreground/5 py-8 hover:bg-foreground/10 hover:border-foreground/20"
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
          />
          {imagePreview ? (
            <>
              <img src={imagePreview} alt="Preview" className="max-h-48 rounded-lg shadow-sm" />
              <p className="text-[10px] text-on-surface-variant mt-2">Click to replace image</p>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-3xl opacity-50">add_a_photo</span>
              <p className="text-sm font-medium">Click to attach a photo</p>
            </>
          )}
        </div>
      </div>

      {/* Optional Location */}
      <div>
        <Label className="text-foreground font-semibold mb-3 block">Location <span className="text-on-surface-variant font-normal">(Optional)</span></Label>
        <div className="relative">
          <input
            type="text"
            value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder="e.g. Near 5th Ave & Pine St, or Sector 4 Junction"
            className="w-full bg-foreground/5 border border-foreground/10 rounded-xl p-3 pr-12 text-sm text-foreground placeholder:text-on-surface-variant/40 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          />
          <button 
            type="button"
            className="absolute right-2 top-1.5 bottom-1.5 w-9 flex items-center justify-center bg-foreground/10 hover:bg-foreground/20 rounded-lg text-on-surface-variant transition-colors"
            title="Detect Location"
            onClick={handleDetectLocation}
            disabled={isDetectingLocation}
          >
            {isDetectingLocation ? (
              <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
            ) : (
              <span className="material-symbols-outlined text-[18px]">my_location</span>
            )}
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {[
            { name: "Ward 23 (Bhouma Nagar)", coords: "20.2785, 85.8324" },
            { name: "Ward 24 (Saheed Nagar)", coords: "20.2882, 85.8501" },
            { name: "Ward 35 (Rasulgarh)", coords: "20.2961, 85.8712" },
            { name: "Ward 42 (Nayapalli)", coords: "20.3015, 85.8152" },
            { name: "Ward 12 (Chandrasekharpur)", coords: "20.3245, 85.8182" },
            { name: "Ward 31 (Old Town)", coords: "20.2421, 85.8354" }
          ].map(w => (
            <button
              key={w.name}
              type="button"
              onClick={() => setLocation(`${w.name} - ${w.coords}`)}
              className="text-[11px] px-2 py-0.5 rounded-full bg-foreground/5 hover:bg-primary/20 text-on-surface-variant hover:text-primary transition-colors border border-foreground/10"
            >
              + {w.name}
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <div className="flex gap-4 pt-4">
        <Button variant="outline" className="flex-1" onClick={onCancel}>Cancel</Button>
        <Button
          className={cn(
            "flex-1 font-bold shadow-lg transition-all",
            canSubmit 
              ? "bg-gradient-to-r from-tertiary to-secondary text-on-primary" 
              : "bg-foreground/10 text-on-surface-variant cursor-not-allowed"
          )}
          onClick={handleSubmit}
          disabled={!canSubmit || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="material-symbols-outlined animate-spin mr-2 text-base">sync</span>
              Submitting...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined mr-2 text-base">{submitIcon}</span>
              {submitLabel}
            </>
          )}
        </Button>
      </div>
    </motion.div>
  )
}
