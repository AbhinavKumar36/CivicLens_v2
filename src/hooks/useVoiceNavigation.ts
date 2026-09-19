import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSpeechRecognition } from './useSpeechRecognition';

// Global Voice Navigation Engine
export function useVoiceNavigation(isEnabled: boolean) {
  const navigate = useNavigate();
  const [lastCommand, setLastCommand] = useState<string | null>(null);

  const handleResult = (transcript: string, isFinal: boolean) => {
    if (!isFinal) return;
    
    const text = transcript.toLowerCase();
    
    // Pattern match routing commands
    if (text.includes("go to dashboard") || text.includes("open dashboard") || text.includes("home")) {
      navigate('/');
      setLastCommand("Navigating to Dashboard");
    } else if (text.includes("report issue") || text.includes("report an issue")) {
      navigate('/report');
      setLastCommand("Opening Report Issue");
    } else if (text.includes("open settings") || text.includes("go to settings")) {
      navigate('/settings');
      setLastCommand("Navigating to Settings");
    } else if (text.includes("show map") || text.includes("open map")) {
      navigate('/map');
      setLastCommand("Opening Map");
    } else if (text.includes("admin center") || text.includes("admin dashboard")) {
      navigate('/admin');
      setLastCommand("Navigating to Admin Center");
    } else if (text.includes("services hub") || text.includes("find a service")) {
      navigate('/services');
      setLastCommand("Opening Services Hub");
    }
    
    // Clear command after a short delay
    setTimeout(() => setLastCommand(null), 3000);
  };

  const { isSupported, isListening, startListening, stopListening, toggleListening } = useSpeechRecognition({
    onResult: handleResult,
    lang: 'en-US'
  });

  // Hotkey to trigger voice navigation globally (Ctrl+Shift+V or similar)
  useEffect(() => {
    if (!isEnabled || !isSupported) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Use Ctrl+M (Mic) or Alt+M to trigger
      if (e.ctrlKey && (e.key === 'm' || e.key === 'M')) {
        e.preventDefault();
        toggleListening();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEnabled, isSupported, toggleListening]);

  return {
    isSupported,
    isListening,
    toggleListening,
    lastCommand
  };
}
