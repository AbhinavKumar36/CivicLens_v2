import { useState, useRef } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(API_KEY);

// Try newest models first, fall back to proven audio model
const AUDIO_MODELS = ['gemini-3.5-flash', 'gemini-2.5-flash', 'gemini-2.0-flash'];

export interface GeminiVoiceResult {
  transcript: string;
  category: string;
  severity: string;
  priority: string;
  department: string;
  isEmergency: boolean;
  estimatedResolution: string;
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function callGeminiAudio(audioBlob: Blob, languageName: string): Promise<GeminiVoiceResult> {
  const base64Audio = await blobToBase64(audioBlob);
  const mimeType = audioBlob.type?.split(';')[0] || 'audio/webm';

  const prompt = `You are a multilingual civic issue reporting assistant for an Indian smart city platform.
The citizen has recorded a voice message in ${languageName}.

Your tasks:
1. Transcribe the audio EXACTLY as spoken (keep original language script, do not translate).
2. Analyze the content and fill the civic issue fields below.

Respond ONLY with a valid JSON object — no markdown fences, no commentary:
{
  "transcript": "<exact transcription in ${languageName} script>",
  "category": "<one of: infrastructure, water, sanitation, safety, environment, other>",
  "severity": "<one of: LOW, MEDIUM, HIGH, CRITICAL>",
  "priority": "<one of: Low, Medium, High, Critical>",
  "department": "<e.g. Public Works, Health & Sanitation, Utilities, Public Safety, Environment>",
  "isEmergency": <true if fire / accident / flood / medical crisis detected, else false>,
  "estimatedResolution": "<e.g. 1 Hour, 12 Hours, 48 Hours, 7 Days>"
}`;

  let lastError: any;

  for (const modelName of AUDIO_MODELS) {
    try {
      console.log(`[GeminiVoice] Trying ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });

      const result = await model.generateContent([
        { inlineData: { mimeType, data: base64Audio } },
        { text: prompt },
      ]);

      const raw = result.response.text().trim();
      // Strip any accidental markdown fences
      const jsonStr = raw.replace(/^```json?\s*/i, '').replace(/\s*```$/, '');
      const parsed = JSON.parse(jsonStr) as GeminiVoiceResult;
      console.log(`[GeminiVoice] Success with ${modelName}`);
      return parsed;
    } catch (err: any) {
      lastError = err;
      console.warn(`[GeminiVoice] ${modelName} failed:`, err?.message || err);
    }
  }

  throw lastError ?? new Error('All Gemini models failed for audio transcription.');
}

export function useGeminiVoice() {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = async (): Promise<boolean> => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const recorder = new MediaRecorder(stream);
      mediaRecorder.current = recorder;
      audioChunks.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.current.push(e.data);
      };

      recorder.start(100);
      setIsRecording(true);
      return true;
    } catch (err: any) {
      const msg = 'Could not access microphone. Please grant permission.';
      setError(msg);
      console.error('[GeminiVoice] Mic error:', err);
      return false;
    }
  };

  const stopAndTranscribe = async (
    languageName: string,
    onResult: (result: GeminiVoiceResult) => void,
    onError: (msg: string) => void
  ): Promise<void> => {
    if (!mediaRecorder.current || !isRecording) return;

    setIsRecording(false);
    setIsTranscribing(true);

    const blob: Blob = await new Promise((resolve) => {
      if (!mediaRecorder.current) return;
      mediaRecorder.current.onstop = () => {
        const type = mediaRecorder.current?.mimeType || 'audio/webm';
        resolve(new Blob(audioChunks.current, { type }));
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(t => t.stop());
        }
      };
      mediaRecorder.current.stop();
    });

    try {
      const result = await callGeminiAudio(blob, languageName);
      setTranscript(result.transcript || '');
      onResult(result);
    } catch (err: any) {
      const msg = err?.message?.includes('API_KEY')
        ? 'Invalid Gemini API key. Please check your .env file.'
        : err?.message?.includes('model')
        ? 'Audio model not available. Try a different model.'
        : `Transcription failed: ${err?.message || 'Unknown error'}`;
      setError(msg);
      onError(msg);
    } finally {
      setIsTranscribing(false);
    }
  };

  const clearTranscript = () => {
    setTranscript('');
    setError(null);
  };

  return {
    isRecording,
    isTranscribing,
    transcript,
    error,
    startRecording,
    stopAndTranscribe,
    clearTranscript,
  };
}
