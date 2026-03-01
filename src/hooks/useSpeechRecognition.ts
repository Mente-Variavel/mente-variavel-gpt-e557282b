import { useState, useRef, useCallback } from "react";

interface UseSpeechRecognitionReturn {
  isListening: boolean;
  transcript: string;
  isSupported: boolean;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  cancelListening: () => void;
}

const getSpeechRecognitionAPI = (): (new () => any) | null => {
  if (typeof window === "undefined") return null;
  return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null;
};

export const useSpeechRecognition = (): UseSpeechRecognitionReturn => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false);
  const transcriptRef = useRef("");

  const isSupported = !!getSpeechRecognitionAPI();

  const createRecognition = useCallback(() => {
    const SpeechRecognitionAPI = getSpeechRecognitionAPI();
    if (!SpeechRecognitionAPI) return null;

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = "pt-BR";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      let text = "";
      for (let i = 0; i < event.results.length; i++) {
        text += event.results[i][0].transcript;
      }
      transcriptRef.current = text;
      setTranscript(text);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      if (event.error === "not-allowed" || event.error === "permission-denied") {
        setError("Permissão do microfone negada. Ative o microfone nas configurações do navegador.");
        isListeningRef.current = false;
        setIsListening(false);
      } else if (event.error === "no-speech") {
        // Auto-restart will happen via onend
      } else if (event.error === "aborted") {
        // User cancelled
      } else {
        setError("Erro ao reconhecer voz. Tente novamente.");
        isListeningRef.current = false;
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      if (isListeningRef.current) {
        // Auto-restart to keep listening
        try {
          const newRecog = createRecognition();
          if (newRecog) {
            recognitionRef.current = newRecog;
            newRecog.start();
          }
        } catch {
          isListeningRef.current = false;
          setIsListening(false);
        }
      } else {
        setIsListening(false);
        recognitionRef.current = null;
      }
    };

    return recognition;
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognitionAPI = getSpeechRecognitionAPI();
    if (!SpeechRecognitionAPI) {
      setError("Seu navegador não suporta ditado por voz. Tente no Google Chrome.");
      return;
    }

    // Cleanup previous
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch {}
      recognitionRef.current = null;
    }

    setError(null);
    setTranscript("");
    transcriptRef.current = "";

    const recognition = createRecognition();
    if (!recognition) return;

    recognitionRef.current = recognition;
    isListeningRef.current = true;

    try {
      recognition.start();
      setIsListening(true);
    } catch (e) {
      console.error("Failed to start speech recognition:", e);
      setError("Erro ao iniciar reconhecimento de voz. Tente novamente.");
      isListeningRef.current = false;
      recognitionRef.current = null;
    }
  }, [createRecognition]);

  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }
    setIsListening(false);
  }, []);

  const cancelListening = useCallback(() => {
    isListeningRef.current = false;
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch {}
      recognitionRef.current = null;
    }
    setIsListening(false);
    setTranscript("");
    transcriptRef.current = "";
  }, []);

  return { isListening, transcript, isSupported, error, startListening, stopListening, cancelListening };
};
