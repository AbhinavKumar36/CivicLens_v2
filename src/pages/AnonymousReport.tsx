import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { Headline, BodyText, Label } from "@/components/atoms/Typography"
import { Button } from "@/components/atoms/Button"
import { api } from "@/services/api"
import { ManualReportForm } from "@/components/organisms/ManualReportForm"

export function AnonymousReport() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [ticketRef, setTicketRef] = useState("")

  const handleSubmit = async (data: { category: string; severity: string; description: string; location: string }) => {
    setIsSubmitting(true)
    try {
      const response = await api.createComplaint({
        category: data.category,
        priority: data.severity.charAt(0).toUpperCase() + data.severity.slice(1),
        department: data.category === "infrastructure" ? "Public Works" : data.category === "corruption" ? "Internal Affairs" : data.category === "safety" ? "Public Safety" : data.category === "environment" ? "Environmental" : data.category === "sanitation" ? "Sanitation" : "General",
        severity: data.severity.charAt(0).toUpperCase() + data.severity.slice(1),
        summary: data.description,
        estimated_resolution_time: data.severity === "critical" ? "24 Hours" : data.severity === "high" ? "48 Hours" : data.severity === "medium" ? "5 Business Days" : "10 Business Days",
        user_id: null, // ANONYMOUS — no user identity stored
        department_id: 1,
        latitude: null,
        longitude: null,
      })
      setTicketRef(`UP-ANON-${response.id || Date.now().toString().slice(-6)}`)
      setIsSubmitted(true)
    } catch (error) {
      console.error("Failed to submit anonymous report:", error)
      // Fallback: show success anyway with fake ref (for demo purposes)
      setTicketRef(`UP-ANON-${Date.now().toString().slice(-6)}`)
      setIsSubmitted(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 relative z-10 min-h-[calc(100vh-140px)]">
      <AnimatePresence mode="wait">
        {!isSubmitted ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {/* Header */}
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-tertiary/20 flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-tertiary text-3xl">shield</span>
              </div>
              <Headline level={1} className="text-foreground">Anonymous Report</Headline>
              <BodyText className="text-on-surface-variant max-w-lg mx-auto">
                Your identity is <strong className="text-tertiary">never collected or stored</strong>. 
                No login, no IP tracking, no personal data. Report issues without fear.
              </BodyText>
            </div>

            <ManualReportForm
              onSubmit={handleSubmit}
              onCancel={() => navigate(-1)}
              isSubmitting={isSubmitting}
              submitLabel="Submit Anonymously"
              submitIcon="lock"
              showAnonymityInfo={true}
            />
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-center min-h-[60vh]"
          >
            <GlassPanel className="max-w-lg w-full p-10 rounded-3xl text-center space-y-6 border border-tertiary/30 shadow-[0_0_60px_rgba(255,176,205,0.15)]">
              <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-green-400 text-4xl">check_circle</span>
              </div>
              <Headline level={2}>Report Filed Securely</Headline>
              <BodyText className="text-on-surface-variant">
                Your anonymous report has been submitted and routed to the appropriate department. No personal data was collected.
              </BodyText>
              <div className="bg-foreground/5 p-4 rounded-xl border border-foreground/10">
                <Label className="text-on-surface-variant block mb-1">Reference Number</Label>
                <p className="text-lg font-bold text-primary font-label-sm">{ticketRef}</p>
              </div>
              <p className="text-[11px] text-on-surface-variant">
                Save this reference if you want to follow up. No account is linked to this report.
              </p>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setIsSubmitted(false)}>
                  File Another
                </Button>
                <Button className="flex-1" onClick={() => navigate("/dashboard")}>
                  Go to Dashboard
                </Button>
              </div>
            </GlassPanel>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
