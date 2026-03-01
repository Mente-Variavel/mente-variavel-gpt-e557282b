import { useState, useRef, useCallback, useEffect } from "react";

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
  const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null;
  console.log("SpeechRecognition supported:", !!SR);
  return SR;
};

export const useSpeechRecognition = (): UseSpeechRecognitionReturn => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false);
  const isSupported = useRef(!!getSpeechRecognitionAPI()).current;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
        recognitionRef.current = null;
      }
    };
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognitionAPI = getSpeechRecognitionAPI();
    if (!SpeechRecognitionAPI) {
      setError("Ditado por voz não suportado neste navegador. Use Google Chrome.");
      return;
    }

    // Cleanup previous instance
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch {}
      recognitionRef.current = null;
    }

    setError(null);
    setTranscript("");

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = "pt-BR";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log("SpeechRecognition started");
      isListeningRef.current = true;
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      let finalText = "";
      let interimText = "";
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript;
        } else {
          interimText += result[0].transcript;
        }
      }
      const text = finalText || interimText;
      console.log("SpeechRecognition result:", { finalText, interimText });
      setTranscript(text);
    };

    recognition.onspeechend = () => {
      console.log("SpeechRecognition speech ended");
      try { recognition.stop(); } catch {}
    };

    recognition.onend = () => {
      console.log("SpeechRecognition ended");
      isListeningRef.current = false;
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognition.onerror = (event: any) => {
      console.error("Speech error:", event.error);
      let msg: string;
      switch (event.error) {
        case "not-allowed":
        case "permission-denied":
          msg = "Permissão do microfone negada. Ative nas configurações do navegador.";
          break;
        case "service-not-allowed":
          msg = "Ditado bloqueado pelo navegador. Teste no Google Chrome.";
          break;
        case "no-speech":
          msg = "Não detectei voz. Fale mais perto do microfone e tente novamente.";
          break;
        case "audio-capture":
          msg = "Microfone não encontrado. Verifique se está conectado.";
          break;
        case "network":
          msg = "Falha de rede no reconhecimento. Tente novamente.";
          break;
        case "aborted":
          // User cancelled, no error to show
          return;
        default:
          msg = `Erro de voz: ${event.error}. Verifique permissões do microfone e HTTPS.`;
      }
      setError(msg);
      isListeningRef.current = false;
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    try {
      // CRITICAL: Called inside user click handler
      recognition.start();
    } catch (e: any) {
      console.error("Error starting recognition:", e);
      setError(`Erro ao iniciar reconhecimento: ${e.message || e.name}. Verifique permissões e HTTPS.`);
      recognitionRef.current = null;
    }
  }, []);

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
    setError(null);
  }, []);

  return { isListening, transcript, isSupported, error, startListening, stopListening, cancelListening };
};
