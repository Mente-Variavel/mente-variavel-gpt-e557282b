import { useState, useRef, useCallback } from "react";

export const useSpeechSynthesis = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const isSupported = typeof window !== "undefined" && "speechSynthesis" in window;

  const speak = useCallback((text: string) => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();

    const cleaned = text.replace(/[#*_`~>\-|]/g, "").replace(/\[.*?\]\(.*?\)/g, "");
    const utterance = new SpeechSynthesisUtterance(cleaned);
    utterance.lang = "pt-BR";

    const voices = window.speechSynthesis.getVoices();
    const ptBR = voices.find((v) => v.lang === "pt-BR");
    const pt = voices.find((v) => v.lang.startsWith("pt"));
    if (ptBR) utterance.voice = ptBR;
    else if (pt) utterance.voice = pt;

    utterance.onend = () => { setIsSpeaking(false); setIsPaused(false); };
    utterance.onerror = () => { setIsSpeaking(false); setIsPaused(false); };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
    setIsPaused(false);
  }, [isSupported]);

  const pause = useCallback(() => { window.speechSynthesis.pause(); setIsPaused(true); }, []);
  const resume = useCallback(() => { window.speechSynthesis.resume(); setIsPaused(false); }, []);
  const stop = useCallback(() => { window.speechSynthesis.cancel(); setIsSpeaking(false); setIsPaused(false); }, []);

  return { isSpeaking, isPaused, isSupported, speak, pause, resume, stop };
};
