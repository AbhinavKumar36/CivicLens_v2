import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Headline, BodyText } from "@/components/atoms/Typography";
import { useOfflineWhisper } from "@/hooks/useOfflineWhisper";
import { useNotifications } from "@/contexts/NotificationContext";
import { api } from "@/services/api";

export function VoiceReportForm({ onExtractedData, isAnonymous, lat, lng }: any) {
  const { addNotification } = useNotifications();
  const { loadModel, isReady, isDownloading, progress, transcribe, transcript, setTranscript } = useOfflineWhisper();
  
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const handleStartRecording = async () => {
    if (!isReady) {
      await loadModel();
      return; // return and let them click again once ready
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.current.push(e.data);
      };

      mediaRecorder.current.onstop = async () => {
        setIsProcessing(true);
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        
        addNotification({ title: "Processing Audio", message: "Running offline Whisper transcription...", type: "info" });
        const text = await transcribe(audioBlob);
        
        if (text) {
          processTranscript(text);
        } else {
          addNotification({ title: "Transcription Failed", message: "Could not transcribe audio.", type: "error" });
          setIsProcessing(false);
        }
        
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(t => t.stop());
        }
      };

      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (e) {
      console.error(e);
      addNotification({ title: "Microphone Error", message: "Could not access microphone.", type: "error" });
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
    }
  };

  const processTranscript = async (text: string) => {
    try {
      const lowerText = text.toLowerCase();
      const isEmergency = lowerText.includes("fire") || lowerText.includes("accident") || lowerText.includes("emergency");
      
      let category = "infrastructure";
      if (lowerText.includes("fire")) category = "safety";
      if (lowerText.includes("accident")) category = "safety";
      if (lowerText.includes("water")) category = "water";
      if (lowerText.includes("garbage")) category = "sanitation";

      const priority = isEmergency ? "Critical" : "Medium";
      const severity = isEmergency ? "Critical" : "Medium";
      
      const reportData = {
        summary: text,
        category,
        priority,
        severity,
        department: category === "safety" ? "Public Safety" : "Public Works",
        estimated_resolution_time: isEmergency ? "1 Hour" : "48 Hours"
      };

      if (isEmergency) {
        addNotification({
          title: "SOS Triggered",
          message: "Crucial keyword detected! Alerting operators and nearby workers.",
          type: "error",
          group: "emergency"
        });
        
        try {
          await fetch('http://localhost:3000/api/emergency/sos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              type: lowerText.includes("fire") ? "Fire" : "Accident", 
              location: `${lat}, ${lng} (${text})`,
              severity: "Critical"
            })
          });
        } catch (e) {
          console.error("SOS trigger failed", e);
        }
      }

      onExtractedData(reportData);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Headline level={4} className="mb-2">Offline Voice Report</Headline>
        <BodyText className="text-on-surface-variant text-sm">
          Speak your issue. Our on-device AI will transcribe and categorize it locally for complete privacy. Mention crucial words like "fire" or "accident" to trigger emergency routing.
        </BodyText>
      </div>

      {!isReady && !isDownloading && (
        <div className="flex justify-center mt-6">
          <button 
            onClick={loadModel}
            className="px-6 py-3 rounded-full bg-primary/20 text-primary font-bold border border-primary/30 hover:bg-primary/30 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined">download</span>
            Load Whisper Model (80MB)
          </button>
        </div>
      )}

      {isDownloading && (
        <div className="bg-surface-container/50 p-6 rounded-2xl border border-foreground/10 text-center">
          <span className="material-symbols-outlined animate-spin text-3xl text-primary mb-3">sync</span>
          <h3 className="font-bold mb-2">Downloading Whisper AI</h3>
          <div className="w-full bg-foreground/10 h-2 rounded-full overflow-hidden">
            <div className="bg-primary h-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
          </div>
          <p className="text-sm text-on-surface-variant mt-2">{progress}% completed</p>
        </div>
      )}

      {isReady && (
        <div className="flex flex-col items-center justify-center space-y-6 py-4">
          <button
            onClick={isRecording ? handleStopRecording : handleStartRecording}
            disabled={isProcessing}
            className={`w-24 h-24 rounded-full flex items-center justify-center shadow-2xl transition-all ${
              isRecording 
                ? 'bg-error text-white scale-110 shadow-error/50 animate-pulse' 
                : isProcessing
                ? 'bg-foreground/10 text-on-surface-variant'
                : 'bg-primary text-on-primary shadow-primary/50 hover:scale-105'
            }`}
          >
            <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              {isRecording ? "stop" : isProcessing ? "hourglass_empty" : "mic"}
            </span>
          </button>
          
          <div className="text-center h-12">
            <AnimatePresence mode="wait">
              {isRecording && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-error font-bold tracking-widest uppercase">
                  Recording...
                </motion.p>
              )}
              {isProcessing && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-primary font-bold animate-pulse">
                  Transcribing & Categorizing...
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {transcript && (
            <GlassPanel className="w-full p-4 mt-4 bg-surface-container/30">
              <Label className="text-xs text-on-surface-variant uppercase tracking-wider mb-2 block">Transcription</Label>
              <p className="text-on-surface italic">"{transcript}"</p>
            </GlassPanel>
          )}
        </div>
      )}
    </div>
  );
}
