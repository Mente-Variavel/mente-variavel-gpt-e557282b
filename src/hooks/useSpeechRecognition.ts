import { useState, useRef, useCallback, useEffect } from "react";
import { convertBlobToWav } from "@/lib/audioUtils";

interface UseSpeechRecognitionReturn {
  isListening: boolean;
  transcript: string;
  isSupported: boolean;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  cancelListening: () => void;
}

const isMediaRecorderSupported = (): boolean => {
  return typeof window !== "undefined" &&
    typeof MediaRecorder !== "undefined" &&
    !!navigator?.mediaDevices?.getUserMedia;
};

const TRANSCRIBE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/transcribe-audio`;

export const useSpeechRecognition = (): UseSpeechRecognitionReturn => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const cancelledRef = useRef(false);

  const isSupported = isMediaRecorderSupported();

  const stopMediaStream = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try { mediaRecorderRef.current.stop(); } catch {}
    }
    mediaRecorderRef.current = null;
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => stopMediaStream();
  }, [stopMediaStream]);

  const startListening = useCallback(async () => {
    if (!isSupported) {
      setError("Microfone não suportado neste navegador.");
      return;
    }

    setError(null);
    setTranscript("");
    cancelledRef.current = false;
    chunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

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
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach((t) => t.stop());
          mediaStreamRef.current = null;
        }
        mediaRecorderRef.current = null;

        if (cancelledRef.current) {
          setIsListening(false);
          return;
        }

        const rawBlob = new Blob(chunksRef.current, { type: mimeType });
        chunksRef.current = [];

        if (rawBlob.size < 100) {
          setError("Não detectei voz. Fale mais perto do microfone.");
          setIsListening(false);
          return;
        }

        setTranscript("Transcrevendo...");

        try {
          // Convert to WAV for API compatibility
          const wavBlob = await convertBlobToWav(rawBlob);

          const formData = new FormData();
          formData.append("audio", wavBlob, "recording.wav");

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
          if (data.no_speech || !data.transcript) {
            setError("Não detectei fala. Tente novamente.");
            setTranscript("");
          } else {
            setTranscript(data.transcript);
            setError(null);
          }
        } catch (e: any) {
          console.error("Transcription error:", e);
          setError(e.message || "Erro ao transcrever áudio.");
          setTranscript("");
        }

        setIsListening(false);
      };

      recorder.onerror = () => {
        setError("Erro ao gravar áudio.");
        stopMediaStream();
        setIsListening(false);
      };

      recorder.start();
      setIsListening(true);
    } catch (e: any) {
      console.error("getUserMedia error:", e);
      if (e.name === "NotAllowedError" || e.name === "PermissionDeniedError") {
        setError("Permissão do microfone negada. Ative nas configurações do navegador.");
      } else if (e.name === "NotFoundError") {
        setError("Microfone não encontrado.");
      } else {
        setError(`Erro ao acessar microfone: ${e.message || e.name}`);
      }
      setIsListening(false);
    }
  }, [isSupported, stopMediaStream]);

  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    } else {
      setIsListening(false);
    }
  }, []);

  const cancelListening = useCallback(() => {
    cancelledRef.current = true;
    stopMediaStream();
    setIsListening(false);
    setTranscript("");
    setError(null);
  }, [stopMediaStream]);

  return { isListening, transcript, isSupported, error, startListening, stopListening, cancelListening };
};
