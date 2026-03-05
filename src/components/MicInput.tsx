import { useState, useEffect, useRef, useCallback } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const TRANSCRIBE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/transcribe-audio`;

interface MicInputProps {
  onTranscript: (text: string) => void;
  className?: string;
}

const isMediaRecorderSupported = (): boolean => {
  return typeof window !== "undefined" &&
    typeof MediaRecorder !== "undefined" &&
    !!navigator?.mediaDevices?.getUserMedia;
};

export default function MicInput({ onTranscript, className = "" }: MicInputProps) {
  const [state, setState] = useState<"idle" | "listening" | "transcribing" | "error">("idle");
  const supported = isMediaRecorderSupported();
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const stopStream = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      try { recorderRef.current.stop(); } catch {}
    }
    recorderRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => () => stopStream(), [stopStream]);

  const toggle = async () => {
    if (state === "listening") {
      if (recorderRef.current?.state === "recording") recorderRef.current.stop();
      return;
    }
    if (state === "transcribing") return;

    setState("idle");
    chunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus" : MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4";
      const recorder = new MediaRecorder(stream, { mimeType });
      recorderRef.current = recorder;

      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };

      recorder.onstop = async () => {
        streamRef.current?.getTracks().forEach(t => t.stop());
        streamRef.current = null;
        recorderRef.current = null;

        const blob = new Blob(chunksRef.current, { type: mimeType });
        chunksRef.current = [];
        if (blob.size < 100) { setState("idle"); return; }

        setState("transcribing");
        try {
          const { convertBlobToWav } = await import("@/lib/audioUtils");
          const wavBlob = await convertBlobToWav(blob);
          const fd = new FormData();
          fd.append("audio", wavBlob, "recording.wav");
          const resp = await fetch(TRANSCRIBE_URL, {
            method: "POST",
            headers: { Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
            body: fd,
          });
          if (!resp.ok) throw new Error("Erro na transcrição");
          const data = await resp.json();
          if (data.transcript && !data.no_speech) {
            onTranscript(data.transcript);
          }
          setState("idle");
        } catch {
          setState("error");
          setTimeout(() => setState("idle"), 2000);
        }
      };

      recorder.onerror = () => { stopStream(); setState("error"); setTimeout(() => setState("idle"), 2000); };
      recorder.start();
      setState("listening");
    } catch {
      setState("error");
      setTimeout(() => setState("idle"), 2000);
    }
  };

  if (!supported) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className={`inline-flex items-center justify-center h-8 w-8 text-muted-foreground/40 ${className}`}>
              <MicOff className="w-4 h-4" />
            </span>
          </TooltipTrigger>
          <TooltipContent><p>Seu navegador não suporta ditado por voz</p></TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={toggle}
      className={`h-8 w-8 shrink-0 ${state === "listening" ? "text-red-500 animate-pulse" : state === "transcribing" ? "text-primary" : state === "error" ? "text-destructive" : "text-muted-foreground hover:text-foreground"} ${className}`}
      title={state === "listening" ? "Parar gravação" : state === "transcribing" ? "Transcrevendo..." : "Ditar por voz"}
    >
      {state === "transcribing" ? <Loader2 className="w-4 h-4 animate-spin" /> : state === "listening" ? <Mic className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
    </Button>
  );
}
