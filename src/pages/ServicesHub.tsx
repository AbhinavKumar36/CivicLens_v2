import React, { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { Headline, BodyText, Label } from "@/components/atoms/Typography"
import { Button } from "@/components/atoms/Button"
import { ServiceCard, type ServiceData } from "@/components/ui/ServiceCard"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/services/api"
import { useNotifications } from "@/contexts/NotificationContext"
import { useAuth } from "@/contexts/AuthContext"

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export function ServicesHub() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addNotification } = useNotifications()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("All Services")
  const [bookmarks, setBookmarks] = useState<string[]>([])
  
  // Modals state
  const [applyingService, setApplyingService] = useState<ServiceData | null>(null)
  const [applicationStep, setApplicationStep] = useState(1)
  const [isSubmittingApp, setIsSubmittingApp] = useState(false)

  const { data: rawServices = [], isLoading } = useQuery({
    queryKey: ['services'],
    queryFn: api.getServices
  })
  
  const SERVICES = useMemo(() => {
    return rawServices.map((rs: any) => ({
      id: rs.id.toString(),
      title: rs.title,
      icon: rs.icon || 'description',
      desc: rs.description,
      time: rs.processing_time,
      elig: rs.eligibility || 'Registered Residents',
      docs: rs.required_docs || ['article'],
      category: rs.category
    }))
  }, [rawServices])
  
  // Load bookmarks on mount
  useEffect(() => {
    const saved = localStorage.getItem("civiclens_bookmarks")
    if (saved) {
      try {
        setBookmarks(JSON.parse(saved))
      } catch(e){}
    }
  }, [])

  const handleToggleBookmark = (id: string) => {
    setBookmarks(prev => {
      const next = prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
      localStorage.setItem("civiclens_bookmarks", JSON.stringify(next))
      return next
    })
  }

  const handleApply = (service: ServiceData) => {
    setApplyingService(service)
    setApplicationStep(1)
  }

  const handleAskAI = (service: ServiceData) => {
    // Navigate to AI Hub with pre-filled context
    navigate('/ai', { state: { initialPrompt: `I need help understanding the ${service.title} service. Specifically, I have a question about the eligibility or required documents.` } })
  }

  const filteredServices = useMemo(() => {
    return SERVICES.filter(s => {
      const matchCat = activeCategory === "All Services" || activeCategory === "Bookmarks" || s.category === activeCategory
      const matchSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) || s.desc.toLowerCase().includes(searchQuery.toLowerCase())
      const matchBookmark = activeCategory === "Bookmarks" ? bookmarks.includes(s.id) : true
      return matchCat && matchSearch && matchBookmark
    })
  }, [searchQuery, activeCategory, bookmarks])

  const bookmarkedServices = useMemo(() => SERVICES.filter(s => bookmarks.includes(s.id)), [bookmarks])
  
  // Quick Access shows either bookmarks or some defaults if none
  const quickAccessList = bookmarkedServices.length > 0 ? bookmarkedServices.slice(0, 3) : SERVICES.slice(0, 3)

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      
      {/* Hero Search Section */}
      <section className="text-center pt-10">
        <Headline level={1} className="mb-2">Central Services Hub</Headline>
        <BodyText className="text-on-surface-variant mb-10">Empowered by CivicLens AI for seamless governance.</BodyText>
        
        <div className="relative max-w-3xl mx-auto group">
          <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
          <GlassPanel className="relative p-2 flex items-center rounded-full">
            <span className="material-symbols-outlined ml-4 text-on-surface-variant">search</span>
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none focus:ring-0 text-body-lg text-on-surface px-4 py-3 placeholder:text-on-surface-variant/40 outline-none" 
              placeholder="Search city services, permits, or utility bills..." 
              type="text"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="mr-4 text-on-surface-variant hover:text-foreground">
                <span className="material-symbols-outlined">close</span>
              </button>
            )}
          </GlassPanel>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mt-8">
          {["All Services", "Bookmarks", "Certificates", "Payments", "Permits", "Licenses", "Utility Bills"].map(cat => (
            <Button 
              key={cat} 
              variant={activeCategory === cat ? "default" : "glass"} 
              className="rounded-full"
              onClick={() => setActiveCategory(cat)}
            >
              {cat === "Bookmarks" && <span className="material-symbols-outlined text-[16px] mr-2">star</span>}
              {cat}
            </Button>
          ))}
        </div>
      </section>

      {/* Favorites & Recent (Only show if not filtering heavily) */}
      {searchQuery === "" && activeCategory === "All Services" && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <Headline level={3} className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              Quick Access
            </Headline>
          </div>
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {quickAccessList.map((item) => (
              <motion.div key={item.id} variants={itemVariants}>
                <GlassPanel className="p-6 rounded-2xl flex items-start gap-4 border-l-4 relative overflow-hidden group hover:shadow-xl transition-all cursor-pointer border-l-primary/50 hover:border-l-primary" onClick={() => handleApply(item)}>
                  <div className="p-3 rounded-xl bg-primary/10 text-primary">
                    <span className="material-symbols-outlined">{item.icon}</span>
                  </div>
                  <div className="flex-1">
                    <Headline level={4} className="mb-1">{item.title}</Headline>
                    <BodyText variant="sm" className="opacity-70 mb-2 truncate">{item.desc}</BodyText>
                  </div>
                </GlassPanel>
              </motion.div>
            ))}
          </motion.div>
        </section>
      )}

      {/* Service Grid */}
      <section className="pb-24">
        <Headline level={3} className="mb-8">
          {searchQuery ? `Search Results for "${searchQuery}"` : activeCategory} 
          <span className="text-on-surface-variant text-base ml-4 font-normal">({filteredServices.length})</span>
        </Headline>
        
        {filteredServices.length === 0 ? (
          <div className="text-center py-20 bg-foreground/5 rounded-3xl border border-foreground/10">
            <span className="material-symbols-outlined text-6xl text-on-surface-variant mb-4">search_off</span>
            <Headline level={4}>No Services Found</Headline>
            <BodyText className="text-on-surface-variant">Try adjusting your search or category filters.</BodyText>
          </div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredServices.map((s) => (
              <motion.div key={s.id} variants={itemVariants} className="h-full">
                <ServiceCard 
                  service={s} 
                  isBookmarked={bookmarks.includes(s.id)} 
                  onBookmark={handleToggleBookmark}
                  onApply={handleApply}
                  onAskAI={handleAskAI}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      {/* Application Flow Modal */}
      <AnimatePresence>
        {applyingService && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setApplyingService(null)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl"
            >
              <GlassPanel className="p-8 rounded-3xl border border-primary/30 shadow-2xl bg-surface-container/90">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-2xl">{applyingService.icon}</span>
                    </div>
                    <div>
                      <Headline level={3}>{applyingService.title}</Headline>
                      <Label className="text-on-surface-variant">Application Flow</Label>
                    </div>
                  </div>
                  <button onClick={() => setApplyingService(null)} className="text-on-surface-variant hover:text-foreground transition-colors">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
                
                {/* Stepper */}
                <div className="flex items-center justify-between mb-8 relative">
                  <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-foreground/10 -z-10"></div>
                  
                  {[1, 2, 3].map(step => (
                    <div key={step} className="flex flex-col items-center gap-2 bg-surface-container p-2">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors",
                        applicationStep >= step ? "bg-primary text-on-primary" : "bg-surface-container-highest text-on-surface-variant border border-foreground/10"
                      )}>
                        {applicationStep > step ? <span className="material-symbols-outlined text-[16px]">check</span> : step}
                      </div>
                      <span className={cn("text-[10px] uppercase font-bold tracking-wider", applicationStep >= step ? "text-primary" : "text-on-surface-variant")}>
                        {step === 1 ? "Verify" : step === 2 ? "Documents" : "Review"}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Step Content */}
                <div className="min-h-[200px] mb-8">
                  {applicationStep === 1 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                      <Headline level={4}>Eligibility Check</Headline>
                      <BodyText className="text-on-surface-variant">This service requires: <strong className="text-on-surface">{applyingService.elig}</strong>.</BodyText>
                      <div className="bg-primary/10 p-4 rounded-xl border border-primary/20 flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary">verified_user</span>
                        <BodyText variant="sm" className="text-primary">CivicLens verified your digital ID. You meet the requirements.</BodyText>
                      </div>
                    </div>
                  )}
                  {applicationStep === 2 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                      <Headline level={4}>Upload Documents</Headline>
                      <BodyText className="text-on-surface-variant">Please provide the following required documents.</BodyText>
                      <div className="grid grid-cols-1 gap-3">
                        {applyingService.docs.map(doc => (
                          <div key={doc} className="flex items-center justify-between p-3 bg-foreground/5 border border-foreground/10 rounded-xl hover:bg-foreground/10 transition-colors cursor-pointer">
                            <div className="flex items-center gap-3">
                              <span className="material-symbols-outlined text-on-surface-variant">{doc}</span>
                              <span className="text-sm font-medium capitalize">{doc.replace('_', ' ')} Document</span>
                            </div>
                            <Button size="sm" variant="outline">Upload</Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {applicationStep === 3 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 text-center py-8">
                      <div className="w-16 h-16 rounded-full bg-tertiary/20 text-tertiary flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-3xl">task_alt</span>
                      </div>
                      <Headline level={3}>Ready to Submit</Headline>
                      <BodyText className="text-on-surface-variant max-w-sm mx-auto">By submitting, you confirm all provided details are accurate. Processing takes approx {applyingService.time}.</BodyText>
                    </div>
                  )}
                </div>

                <div className="flex justify-between mt-auto pt-6 border-t border-foreground/10">
                  <Button variant="ghost" onClick={() => applicationStep > 1 ? setApplicationStep(s => s - 1) : setApplyingService(null)}>
                    {applicationStep > 1 ? "Back" : "Cancel"}
                  </Button>
                  
                  {applicationStep < 3 ? (
                    <Button className="px-8" onClick={() => setApplicationStep(s => s + 1)}>Continue</Button>
                  ) : (
                    <Button 
                      className="px-8 bg-gradient-to-r from-primary to-secondary text-on-primary" 
                      disabled={isSubmittingApp}
                      onClick={async () => {
                        setIsSubmittingApp(true)
                        try {
                          await api.applyService({
                            serviceId: parseInt(applyingService.id, 10),
                            userId: user?.id || 1,
                            applicantName: user?.name || "Priya Sharma",
                            contactNumber: "+91 94370 12345",
                            details: { category: applyingService.category }
                          })
                          addNotification({
                            title: "Application Submitted",
                            message: `Your application for ${applyingService.title} has been received. +20 civic points credited!`,
                            type: "success",
                            group: "system"
                          })
                          setApplyingService(null)
                        } catch (err: any) {
                          alert("Failed to submit service application: " + err.message)
                        } finally {
                          setIsSubmittingApp(false)
                        }
                      }}
                    >
                      {isSubmittingApp ? "Submitting..." : "Submit Application (+20 pts)"}
                    </Button>
                  )}
                </div>
              </GlassPanel>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}
