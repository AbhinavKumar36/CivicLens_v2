import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { Headline, BodyText, Label } from "@/components/atoms/Typography"
import { Button } from "@/components/atoms/Button"
import { cn } from "@/utils/utils"

interface FAQItem {
  question: string
  answer: string
}

const FAQS: FAQItem[] = [
  {
    question: "How do I report a new infrastructure issue?",
    answer: "You can navigate to the 'AI Hub' or click 'Report Issue' in the quick actions menu. Use natural language (typing or voice command by pressing Ctrl+M) to explain the issue. Our AI Assistant will extract details like category, priority, and department, and prepare the report for your submission."
  },
  {
    question: "How long does it take for a reported issue to be resolved?",
    answer: "Resolution times vary by category and severity. Critical emergencies (like water main bursts or seismic events) are triaged instantly with responder dispatch within minutes. Standard infrastructure repairs (like potholes) typically take 24 to 72 hours."
  },
  {
    question: "Where can I view active and past services applications?",
    answer: "Go to the 'Services' tab to view catalog directories, renew permits, pay utility bills, or apply for licenses. Your active and completed permit applications can be tracked inside the 'Profile' tab under 'Municipal Timeline'."
  },
  {
    question: "How do I activate voice commands?",
    answer: "CivicLens features a hands-free global voice navigation system. Simply press Ctrl+M to activate your microphone, and speak navigation directions like 'Go to Dashboard', 'Report an Issue', or 'Go to Map' to control the interface."
  }
]

export function Support() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [ticketSubject, setSubject] = useState("")
  const [ticketMessage, setMessage] = useState("")
  const [ticketSubmitted, setSubmitted] = useState(false)

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault()
    if (!ticketSubject.trim() || !ticketMessage.trim()) return
    setSubmitted(true)
    setSubject("")
    setMessage("")
    setTimeout(() => {
      setSubmitted(false)
    }, 4000)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12 pt-8 pb-32">
      
      {/* Header */}
      <div>
        <Headline level={1} className="text-3xl text-primary font-bold">Help & Support</Headline>
        <BodyText className="text-on-surface-variant mt-1">Get immediate assistance or contact municipal operations.</BodyText>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* FAQs Accordion */}
        <section className="md:col-span-7 space-y-6">
          <Headline level={3} className="text-xl">Frequently Asked Questions</Headline>
          
          <div className="space-y-4">
            {FAQS.map((faq, idx) => {
              const isOpen = openIndex === idx
              return (
                <GlassPanel key={idx} className="p-5 rounded-2xl overflow-hidden cursor-pointer" onClick={() => handleToggle(idx)}>
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-base text-on-surface">{faq.question}</h4>
                    <span className={cn("material-symbols-outlined text-primary transition-transform duration-300", isOpen ? "rotate-180" : "")}>
                      keyboard_arrow_down
                    </span>
                  </div>
                  
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mt-3 overflow-hidden text-sm text-on-surface-variant leading-relaxed"
                      >
                        {faq.answer}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </GlassPanel>
              )
            })}
          </div>
        </section>

        {/* Submit Ticket Form */}
        <section className="md:col-span-5 space-y-6">
          <Headline level={3} className="text-xl">Submit Support Ticket</Headline>
          
          <GlassPanel className="p-6 rounded-2xl">
            <AnimatePresence mode="wait">
              {ticketSubmitted ? (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-8 space-y-4"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                    <span className="material-symbols-outlined">check_circle</span>
                  </div>
                  <h4 className="font-bold text-base">Ticket Submitted!</h4>
                  <BodyText variant="sm" className="text-on-surface-variant">CivicLens AI has assigned your request to Citizen Services. We will respond shortly.</BodyText>
                </motion.div>
              ) : (
                <motion.form key="form" onSubmit={handleSubmitTicket} className="space-y-4">
                  <div>
                    <Label className="mb-1.5 block">Subject</Label>
                    <input 
                      type="text"
                      required
                      value={ticketSubject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g. Utility bill discrepancy"
                      className="w-full bg-foreground/5 border border-foreground/10 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-primary text-sm text-on-surface"
                    />
                  </div>
                  
                  <div>
                    <Label className="mb-1.5 block">Message Details</Label>
                    <textarea 
                      required
                      rows={4}
                      value={ticketMessage}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Provide details about your query..."
                      className="w-full bg-foreground/5 border border-foreground/10 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-primary text-sm text-on-surface resize-none"
                    />
                  </div>

                  <Button type="submit" className="w-full justify-center bg-gradient-to-r from-primary to-secondary text-on-primary font-bold shadow-lg shadow-primary/20">
                    <span className="material-symbols-outlined text-sm mr-2">send</span>
                    Send Request
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>
          </GlassPanel>
        </section>

      </div>
    </div>
  )
}
