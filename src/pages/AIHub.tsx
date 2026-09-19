import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useTranslation } from 'react-i18next';
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Headline, BodyText, Label } from "@/components/atoms/Typography";
import { getGeminiChatSession } from "@/services/gemini";
import { cn } from "@/utils/utils";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useAuth } from "@/contexts/AuthContext";


type Message = {
  id: string;
  role: "user" | "model";
  content: string;
  isStreaming?: boolean;
};

const SYSTEM_INSTRUCTION = `You are CivicLens AI, a highly advanced Smart City Assistant. 
You help citizens report issues, pay taxes, check transit status, and apply for permits.
You are professional, concise, and helpful. Always format your responses using Markdown.
If a user reports an issue, guide them on what details are needed (location, photos) and then summarize it nicely.`;

export function AIHub() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [chatSession, setChatSession] = useState<any>(null);
  const [aiMode, setAiMode] = useState<string>("mock");
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [speechLang, setSpeechLang] = useState("en-US");
  const { isListening, isSupported, toggleListening } = useSpeechRecognition({
    lang: speechLang,
    onResult: (transcript, isFinal) => {
      setInputValue(transcript);
      if (isFinal) {
        setTimeout(() => {
          const form = document.getElementById("ai-chat-form");
          if (form) form.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
        }, 500);
      }
    }
  });

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude }),
        (error) => console.warn("Geolocation failed:", error)
      );
    }
  }, []);

  useEffect(() => {
    try {
      const session = getGeminiChatSession(SYSTEM_INSTRUCTION);
      setChatSession(session);
      setAiMode(session.getCurrentMode?.() || "mock");
    } catch (e) {
      console.error("Failed to initialize Gemini", e);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || !chatSession) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    const modelMessageId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      { id: modelMessageId, role: "model", content: "", isStreaming: true },
    ]);

    try {
      let promptToSend = userMessage.content;
      if (userLocation) {
        promptToSend += `\n\n[System Context: The user's current GPS location is Latitude ${userLocation.lat.toFixed(4)}, Longitude ${userLocation.lng.toFixed(4)}. If they ask for their location, tell them this and you can assume they are in Mumbai, India for context.]`;
      }

      const result = await chatSession.sendMessageStream(promptToSend);
      setAiMode(chatSession.getCurrentMode?.() || "mock");

      let fullContent = "";
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullContent += chunkText;

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === modelMessageId
              ? { ...msg, content: fullContent }
              : msg
          )
        );
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === modelMessageId
            ? { ...msg, isStreaming: false }
            : msg
        )
      );

    } catch (error: any) {
      console.error("Gemini Error:", error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === modelMessageId
            ? { ...msg, content: "⚠️ **Error:** Unable to reach CivicLens AI. Please try again later or check API limits.", isStreaming: false }
            : msg
        )
      );
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickAction = (text: string) => {
    setInputValue(text);
    setTimeout(() => {
      const form = document.getElementById("ai-chat-form");
      if (form) form.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
    }, 50);
  };

  return (
    <div className="flex h-[calc(100vh-72px)] w-full overflow-hidden relative">

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative z-10">

        {/* AI Mode Indicator */}
        <div className="absolute top-4 right-4 z-20">
          <span className={cn(
            "px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider rounded-md border backdrop-blur-md flex items-center gap-2",
            aiMode === "3.5" ? "bg-primary/10 border-primary/20 text-primary" :
              aiMode === "2.5" ? "bg-secondary/10 border-secondary/20 text-secondary" :
                "bg-error/10 border-error/20 text-error"
          )}>
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse shadow-[0_0_8px_currentColor]"></span>
            {aiMode === "3.5" ? "Gemini 3.5 Flash" : aiMode === "2.5" ? "Gemini 2.5 Flash" : "Offline Fallback"}
          </span>
        </div>

        {/* Background Ambient Effect */}
        <div className="absolute inset-0 bg-primary/10 blur-3xl -z-10 rounded-full animate-pulse opacity-30 pointer-events-none"></div>

        {/* Conversational Canvas */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-4 md:px-8 py-8 flex flex-col items-center">

          <AnimatePresence>
            {messages.length === 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center text-center mt-12 mb-16 w-full max-w-4xl"
              >
                <div className="w-32 h-32 md:w-48 md:h-48 relative mb-8 flex items-center justify-center">
                  {/* CSS Orb simulation */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary to-secondary blur-xl opacity-60 animate-pulse"></div>
                  <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full border border-foreground/20 bg-surface/50 backdrop-blur-md flex items-center justify-center shadow-[0_0_40px_rgba(192,193,255,0.3)]">
                    <span className="material-symbols-outlined text-4xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                  </div>
                </div>
                <h2 className="font-display-lg text-3xl md:text-5xl text-on-surface leading-tight mb-8">
                  {t('ai_hub.greeting')}, {user?.name?.split(' ')[0] || 'Citizen'}. <br />
                  <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    {t('ai_hub.help_prompt')}
                  </span>
                </h2>

                {/* Quick Actions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                  {[
                    { title: "Why is Drainage Ranked #1?", desc: "Explain deterministic priority", icon: "leaderboard", color: "text-primary" },
                    { title: "What can we fund with ₹5 crore?", desc: "Optimal portfolio allocation", icon: "account_balance_wallet", color: "text-secondary" },
                    { title: "Compare Ward 23 and Ward 31", desc: "Census & infrastructure gap", icon: "compare_arrows", color: "text-tertiary" },
                    { title: "Show Demand Hotspots", desc: "Citizen priority clusters", icon: "local_fire_department", color: "text-orange-400" },
                  ].map((action, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuickAction(action.title)}
                      className="glass-panel p-5 rounded-2xl text-left hover:bg-foreground/5 hover:-translate-y-1 transition-all group border border-foreground/10"
                    >
                      <span className={cn("material-symbols-outlined mb-3 block scale-110", action.color)}>{action.icon}</span>
                      <p className="font-bold text-xs mb-1 text-foreground">{action.title}</p>
                      <p className="text-[11px] text-on-surface-variant">{action.desc}</p>
                    </button>
                  ))}
                </div>
              </motion.section>
            )}
          </AnimatePresence>

          {/* Chat Messages */}
          <div className="w-full max-w-4xl space-y-6 flex-1 pb-4">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex gap-4 w-full",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {msg.role === "model" && (
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1 border border-primary/30">
                    <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                  </div>
                )}

                <div className={cn(
                  "px-6 py-4 rounded-2xl max-w-[85%]",
                  msg.role === "user"
                    ? "bg-surface-container-highest rounded-tr-none text-on-surface"
                    : "glass-panel rounded-tl-none border-l-2 border-l-primary"
                )}>
                  {msg.role === "user" ? (
                    <BodyText>{msg.content}</BodyText>
                  ) : (
                    <div className="prose prose-invert prose-p:text-on-surface prose-headings:text-on-surface max-w-none prose-sm md:prose-base">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content || "..."}
                      </ReactMarkdown>
                    </div>
                  )}
                  {msg.isStreaming && <span className="inline-block w-2 h-4 bg-primary ml-1 animate-pulse" />}
                </div>

                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 text-on-secondary mt-1">
                    <span className="material-symbols-outlined text-sm">person</span>
                  </div>
                )}
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </div>

        </div>

        {/* Chat Input Area */}
        <div className="w-full max-w-4xl mx-auto px-4 md:px-8 pb-8 pt-4">
          <form id="ai-chat-form" onSubmit={handleSendMessage} className="glass-panel p-2 rounded-[2rem] shadow-2xl relative border border-foreground/10">
            <div className="flex items-center gap-2 px-2 md:px-4 py-2">
              <button type="button" className="p-2 text-on-surface-variant hover:text-primary transition-colors hidden sm:block">
                <span className="material-symbols-outlined">add_circle</span>
              </button>

              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  disabled={isTyping || !chatSession}
                  className="w-full bg-transparent border-none focus:ring-0 text-base md:text-lg placeholder:text-on-surface-variant/50 text-on-surface outline-none"
                  placeholder={
                    !isSupported ? "Speech not supported. Type message..." :
                      isListening ? "Listening..." :
                        chatSession ? "Message CivicLens..." : "Connecting to AI..."
                  }
                />
              </div>

              {/* Language Selector for Speech */}
              {/* Language Selector for Speech */}
              {isSupported && (
                <select
                  value={speechLang}
                  onChange={(e) => setSpeechLang(e.target.value)}
                  className="hidden md:block bg-transparent text-xs text-on-surface-variant border-none outline-none cursor-pointer hover:text-primary transition-colors"
                  title="Speech Language"
                >
                  <option value="en-US">English</option>
                  <option value="or-IN">ଓଡ଼ିଆ (Odia)</option>
                  <option value="hi-IN">हिंदी (Hindi)</option>
                  <option value="bn-IN">বাংলা (Bengali)</option>
                  <option value="ta-IN">தமிழ் (Tamil)</option>
                  <option value="te-IN">తెలుగు (Telugu)</option>
                </select>
              )}

              <div className="flex items-center gap-1 bg-surface-container/80 rounded-full px-2 py-1 mr-2">
                <button
                  type="button"
                  onClick={toggleListening}
                  className={cn(
                    "p-2 transition-all scale-90 hover:scale-100 rounded-full flex items-center justify-center",
                    isListening ? "bg-error/20 text-error animate-pulse" : "text-on-surface-variant hover:text-primary",
                    !isSupported && "opacity-50 cursor-not-allowed"
                  )}
                  title={!isSupported ? "Speech recognition not supported in this browser" : isListening ? "Stop listening" : "Start speaking"}
                >
                  <span className="material-symbols-outlined text-xl">mic</span>
                </button>
                <button type="button" className="hidden md:flex p-2 text-on-surface-variant hover:text-primary transition-all scale-90 hover:scale-100">
                  <span className="material-symbols-outlined text-xl">image</span>
                </button>
              </div>
              <button
                type="submit"
                disabled={!inputValue.trim() || isTyping || !chatSession}
                className="bg-primary text-on-primary w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center hover:shadow-[0px_0px_20px_rgba(192,193,255,0.6)] transition-all disabled:opacity-50"
              >
                <span className="material-symbols-outlined">arrow_upward</span>
              </button>
            </div>
          </form>
          <p className="text-center text-[10px] text-on-surface-variant mt-4 opacity-50 uppercase tracking-widest">
            CivicLens AI can make mistakes. Verify critical city infrastructure data.
          </p>
        </div>
      </div>

      {/* Right Sidebar (Conversations) */}
      <aside className="w-72 glass-panel border-l border-foreground/5 p-6 hidden xl:flex flex-col bg-surface/30 relative z-20">
        <h4 className="font-bold text-xs uppercase tracking-widest text-on-surface-variant mb-6 flex items-center justify-between">
          Recent
          <span className="material-symbols-outlined text-base">history</span>
        </h4>

        <div className="flex-1 space-y-6 overflow-y-auto custom-scrollbar pr-2">
          <div className="cursor-pointer group">
            <p className="text-xs text-on-surface-variant mb-1">Today</p>
            <p className="text-sm font-medium group-hover:text-primary transition-colors text-on-surface">Utility Bill Dispute</p>
            <p className="text-[10px] opacity-40 text-on-surface-variant">2 hours ago</p>
          </div>
          <div className="cursor-pointer group">
            <p className="text-sm font-medium group-hover:text-primary transition-colors text-on-surface">Zoning Laws District 4</p>
            <p className="text-[10px] opacity-40 text-on-surface-variant">5 hours ago</p>
          </div>

          <div className="cursor-pointer group border-t border-foreground/5 pt-4">
            <p className="text-xs text-on-surface-variant mb-1">Yesterday</p>
            <p className="text-sm font-medium group-hover:text-primary transition-colors text-on-surface">School Bus Routes</p>
            <p className="text-[10px] opacity-40 text-on-surface-variant">Yesterday, 14:20</p>
          </div>
          <div className="cursor-pointer group">
            <p className="text-sm font-medium group-hover:text-primary transition-colors text-on-surface">Park Renovation Plan</p>
            <p className="text-[10px] opacity-40 text-on-surface-variant">Yesterday, 09:12</p>
          </div>
        </div>

        <button className="mt-6 text-xs text-primary font-bold hover:underline flex items-center gap-1">
          View Archive <span className="material-symbols-outlined text-xs">arrow_forward</span>
        </button>
      </aside>
    </div>
  );
}
