import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Headline, BodyText, Label } from "@/components/atoms/Typography";
import { useGeminiVoice } from "@/hooks/useGeminiVoice";
import { useNotifications } from "@/contexts/NotificationContext";
import { useTranslation } from 'react-i18next';
import { cn } from "@/utils/utils";

const LANGUAGES = [
  { code: 'en', label: 'EN', name: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'HI', name: 'Hindi',   flag: '🇮🇳' },
  { code: 'ta', label: 'TA', name: 'Tamil',   flag: '🇮🇳' },
  { code: 'or', label: 'OR', name: 'Odia',    flag: '🇮🇳' },
  { code: 'bn', label: 'BN', name: 'Bengali', flag: '🇮🇳' },
];

export function VoiceReportForm({ onExtractedData, lat, lng }: any) {
  const { addNotification } = useNotifications();
  const { i18n } = useTranslation();
  const { isRecording, isTranscribing, transcript, error, startRecording, stopAndTranscribe, clearTranscript } = useGeminiVoice();

  const [selectedLang, setSelectedLang] = useState(
    LANGUAGES.find(l => l.code === i18n.language) ?? LANGUAGES[0]
  );

  // Sync if app language changes from outside
  useEffect(() => {
    const match = LANGUAGES.find(l => l.code === i18n.language);
    if (match) setSelectedLang(match);
  }, [i18n.language]);

  const handleLangChange = (lang: typeof LANGUAGES[0]) => {
    setSelectedLang(lang);
    i18n.changeLanguage(lang.code);
  };

  const handleMicClick = async () => {
    if (isTranscribing) return;

    if (isRecording) {
      // Stop → send to Gemini
      await stopAndTranscribe(
        selectedLang.name,
        (result) => {
          // Emergency detection
          if (result.isEmergency) {
            addNotification({
              title: "🚨 SOS Triggered",
              message: "Emergency keyword detected! Alerting operators.",
              type: "error",
              group: "emergency"
            });
            fetch('http://localhost:3000/api/emergency/sos', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: result.category === "safety" ? "Accident" : "Emergency",
                location: lat && lng ? `${lat}, ${lng}` : "Unknown",
                severity: "Critical"
              })
            }).catch(console.error);
          }

          addNotification({
            title: "✅ Voice Report Ready",
            message: `Transcribed in ${selectedLang.name} — form pre-filled by Gemini.`,
            type: "success"
          });

          onExtractedData({
            summary: result.transcript,
            category: result.category,
            priority: result.priority,
            severity: result.severity,
            department: result.department,
            estimated_resolution_time: result.estimatedResolution,
            language: selectedLang.name,
          });
        },
        (errMsg) => {
          addNotification({ title: "Transcription Failed", message: errMsg, type: "error" });
        }
      );
    } else {
      // Start recording
      const ok = await startRecording();
      if (ok) {
        addNotification({
          title: "🎙️ Recording",
          message: `Speak in ${selectedLang.name}. Tap the mic again when done.`,
          type: "info"
        });
      }
    }
  };

  const micState = isTranscribing ? "processing" : isRecording ? "recording" : "idle";

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="text-center space-y-1.5">
        <Headline level={4}>Voice Report</Headline>
        <BodyText className="text-on-surface-variant text-sm">
          Speak in your language — Gemini AI transcribes and categorises instantly.
        </BodyText>
        {/* Gemini badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary uppercase tracking-widest">
          <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
          Powered by Gemini
        </div>
      </div>

      {/* Language Selector */}
      <div className="space-y-2">
        <Label className="text-[10px] uppercase tracking-widest text-on-surface-variant block text-center">
          Speaking Language
        </Label>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => handleLangChange(lang)}
              disabled={isRecording || isTranscribing}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all duration-200",
                selectedLang.code === lang.code
                  ? "bg-primary text-on-primary border-primary shadow-lg shadow-primary/30 scale-105"
                  : "bg-surface-container/50 text-on-surface-variant border-foreground/10 hover:border-primary/40 hover:text-primary hover:bg-primary/5",
                (isRecording || isTranscribing) && "opacity-40 cursor-not-allowed"
              )}
            >
              <span className="text-base leading-none">{lang.flag}</span>
              <span className="uppercase tracking-wider">{lang.label}</span>
            </button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.p
            key={selectedLang.code}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="text-center text-[11px] text-on-surface-variant"
          >
            Gemini will transcribe your voice in{" "}
            <strong className="text-primary">{selectedLang.name}</strong>
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Mic Button */}
      <div className="flex flex-col items-center justify-center space-y-4 py-2">
        <div className="relative">
          {/* Ripple rings while recording */}
          {isRecording && (
            <>
              <span className="absolute inset-0 rounded-full bg-error/25 animate-ping" style={{ animationDuration: '1.2s' }} />
              <span className="absolute inset-[-8px] rounded-full bg-error/10 animate-ping" style={{ animationDuration: '1.8s', animationDelay: '0.3s' }} />
            </>
          )}
          {/* Spinning ring while Gemini processes */}
          {isTranscribing && (
            <span className="absolute inset-[-6px] rounded-full border-2 border-primary/40 border-t-primary animate-spin" />
          )}
          <button
            onClick={handleMicClick}
            disabled={isTranscribing}
            className={cn(
              "relative w-24 h-24 rounded-full flex items-center justify-center shadow-2xl transition-all duration-200 select-none",
              micState === "recording"
                ? "bg-error text-white scale-110 shadow-error/40"
                : micState === "processing"
                ? "bg-surface-container text-on-surface-variant cursor-not-allowed"
                : "bg-primary text-on-primary shadow-primary/40 hover:scale-105 active:scale-95"
            )}
          >
            <span
              className="material-symbols-outlined text-4xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {micState === "recording" ? "stop" : micState === "processing" ? "hourglass_empty" : "mic"}
            </span>
          </button>
        </div>

        {/* Status line */}
        <div className="text-center h-10 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {micState === "recording" && (
              <motion.div key="rec" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-error animate-pulse block" />
                <span className="text-error font-bold tracking-widest uppercase text-sm">
                  Recording in {selectedLang.name}...
                </span>
              </motion.div>
            )}
            {micState === "processing" && (
              <motion.div key="proc" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-base animate-spin">auto_awesome</span>
                <span className="text-primary font-bold text-sm">Gemini is transcribing...</span>
              </motion.div>
            )}
            {micState === "idle" && !error && (
              <motion.p key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-on-surface-variant">
                Tap the mic to start · tap again to stop &amp; transcribe
              </motion.p>
            )}
            {micState === "idle" && error && (
              <motion.p key="err" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-error text-center max-w-xs">
                {error}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Transcript box */}
        <AnimatePresence>
          {transcript && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <GlassPanel className="w-full p-4 bg-surface-container/30 border border-primary/20 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] text-on-surface-variant uppercase tracking-widest">
                    Transcription · {selectedLang.name}
                  </Label>
                  <button
                    onClick={clearTranscript}
                    className="text-on-surface-variant hover:text-error transition-colors"
                    title="Clear"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
                <p className="text-on-surface italic text-sm leading-relaxed">"{transcript}"</p>
                <p className="text-[10px] text-primary/70 flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">auto_awesome</span>
                  Form fields pre-filled by Gemini AI
                </p>
              </GlassPanel>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer tip */}
      <p className="text-center text-[10px] text-on-surface-variant opacity-50">
        Audio is sent to Google Gemini for transcription. Not stored locally.
      </p>
    </div>
  );
}
