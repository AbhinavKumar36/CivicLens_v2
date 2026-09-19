import { useState, useRef, useCallback } from 'react';
import { pipeline, env } from '@xenova/transformers';

// Disable local models loading to ensure it fetches from hub if not cached
env.allowLocalModels = false;

export function useOfflineWhisper() {
  const [isReady, setIsReady] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [transcript, setTranscript] = useState("");
  const transcriberRef = useRef<any>(null);

  const loadModel = useCallback(async () => {
    if (transcriberRef.current) return;
    setIsDownloading(true);
    try {
      transcriberRef.current = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny.en', {
        progress_callback: (data: any) => {
          if (data.status === "progress" && data.loaded && data.total) {
            setProgress(Math.round((data.loaded / data.total) * 100));
          } else if (data.status === "ready") {
            setProgress(100);
          }
        }
      });
      setIsReady(true);
    } catch (e) {
      console.error("Failed to load whisper model:", e);
    } finally {
      setIsDownloading(false);
    }
  }, []);

  const transcribe = useCallback(async (audioBlob: Blob) => {
    if (!transcriberRef.current) return null;
    try {
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      const audioData = audioBuffer.getChannelData(0); // Float32Array

      const result = await transcriberRef.current(audioData, {
        chunk_length_s: 30,
        stride_length_s: 5,
        language: 'english',
        task: 'transcribe',
      });
      
      setTranscript(result.text);
      return result.text;
    } catch (e) {
      console.error("Transcription error:", e);
      return null;
    }
  }, []);

  return { loadModel, isReady, isDownloading, progress, transcribe, transcript, setTranscript };
}
