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
  return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null;
};

const isMediaRecorderSupported = (): boolean => {
  return typeof window !== "undefined" && typeof MediaRecorder !== "undefined";
};

const TRANSCRIBE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/transcribe-audio`;

export const useSpeechRecognition = (): UseSpeechRecognitionReturn => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const cancelledRef = useRef(false);

  // Support native OR MediaRecorder fallback
  const hasNative = !!getSpeechRecognitionAPI();
  const isSupported = hasNative || isMediaRecorderSupported();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
        recognitionRef.current = null;
      }
      stopMediaStream();
    };
  }, []);

  const stopMediaStream = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try { mediaRecorderRef.current.stop(); } catch {}
    }
    mediaRecorderRef.current = null;
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
  };

  // ---- MediaRecorder fallback ----
  const startMediaRecorder = useCallback(async () => {
    setError(null);
    setTranscript("");
    cancelledRef.current = false;
    chunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      // Pick a supported MIME type
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "audio/mp4";

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stopMediaStream();
        if (cancelledRef.current) return;

        const blob = new Blob(chunksRef.current, { type: mimeType });
        chunksRef.current = [];

        if (blob.size < 100) {
          setError("Não detectei voz. Fale mais perto do microfone e tente novamente.");
          setIsListening(false);
          return;
        }

        // Send to edge function for transcription
        setTranscript("Transcrevendo...");
        try {
          const formData = new FormData();
          formData.append("audio", blob, `audio.${mimeType.includes("mp4") ? "mp4" : "webm"}`);

          const resp = await fetch(TRANSCRIBE_URL, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: formData,
          });

          if (!resp.ok) {
            const errData = await resp.json().catch(() => ({ error: "Erro na transcrição" }));
            throw new Error(errData.error || `Erro ${resp.status}`);
          }

          const data = await resp.json();
          if (data.no_speech) {
            setError("Não detectei voz. Fale mais perto do microfone e tente novamente.");
            setTranscript("");
          } else {
            setTranscript(data.transcript);
          }
        } catch (e: any) {
          console.error("Transcription error:", e);
          setError(e.message || "Erro ao transcrever áudio.");
          setTranscript("");
        }

        setIsListening(false);
      };

      recorder.onerror = () => {
        setError("Erro ao gravar áudio. Verifique permissões do microfone.");
        stopMediaStream();
        setIsListening(false);
      };

      recorder.start();
      setIsListening(true);
    } catch (e: any) {
      console.error("MediaRecorder error:", e);
      if (e.name === "NotAllowedError" || e.name === "PermissionDeniedError") {
        setError("Permissão do microfone negada. Ative nas configurações do navegador.");
      } else if (e.name === "NotFoundError") {
        setError("Microfone não encontrado. Verifique se está conectado.");
      } else {
        setError(`Erro ao acessar microfone: ${e.message || e.name}`);
      }
      setIsListening(false);
    }
  }, []);

  // ---- Native Web Speech API ----
  const startNative = useCallback(() => {
    const SpeechRecognitionAPI = getSpeechRecognitionAPI();
    if (!SpeechRecognitionAPI) return;

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

    let hadNetworkError = false;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event: any) => {
      let finalText = "";
      let interimText = "";
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) finalText += result[0].transcript;
        else interimText += result[0].transcript;
      }
      setTranscript(finalText || interimText);
    };

    recognition.onspeechend = () => {
      try { recognition.stop(); } catch {}
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
      // If native failed with network error, try MediaRecorder fallback
      if (hadNetworkError && isMediaRecorderSupported()) {
        console.log("Native speech failed, falling back to MediaRecorder + AI");
        startMediaRecorder();
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech error:", event.error);
      let msg: string | null = null;
      switch (event.error) {
        case "not-allowed":
        case "permission-denied":
          msg = "Permissão do microfone negada. Ative nas configurações do navegador.";
          break;
        case "service-not-allowed":
          msg = "Ditado bloqueado pelo navegador. Tentando via IA...";
          hadNetworkError = true;
          break;
        case "no-speech":
          msg = "Não detectei voz. Fale mais perto do microfone e tente novamente.";
          break;
        case "audio-capture":
          msg = "Microfone não encontrado. Verifique se está conectado.";
          break;
        case "network":
          msg = "Reconhecimento nativo falhou. Tentando via IA...";
          hadNetworkError = true;
          break;
        case "aborted":
          return;
        default:
          msg = `Erro de voz: ${event.error}`;
      }
      if (msg) setError(msg);
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (e: any) {
      console.error("Error starting recognition:", e);
      // Fallback to MediaRecorder
      if (isMediaRecorderSupported()) {
        startMediaRecorder();
      } else {
        setError("Reconhecimento de voz não disponível neste navegador.");
      }
    }
  }, [startMediaRecorder]);

  const startListening = useCallback(() => {
    if (hasNative) {
      startNative();
    } else if (isMediaRecorderSupported()) {
      startMediaRecorder();
    } else {
      setError("Reconhecimento de voz não suportado neste navegador.");
    }
  }, [hasNative, startNative, startMediaRecorder]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop(); // will trigger onstop -> transcription
    } else {
      setIsListening(false);
    }
  }, []);

  const cancelListening = useCallback(() => {
    cancelledRef.current = true;
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch {}
      recognitionRef.current = null;
    }
    stopMediaStream();
    setIsListening(false);
    setTranscript("");
    setError(null);
  }, []);

  return { isListening, transcript, isSupported, error, startListening, stopListening, cancelListening };
};
