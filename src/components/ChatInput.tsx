import { Send, Mic, MicOff, X } from "lucide-react";
import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { motion, AnimatePresence } from "framer-motion";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

const ChatInput = ({ onSend, disabled }: ChatInputProps) => {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { isListening, transcript, isSupported, error, startListening, stopListening, cancelListening } =
    useSpeechRecognition();

  useEffect(() => {
    if (transcript) setInput(transcript);
  }, [transcript]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || disabled) return;
    if (isListening) stopListening();
    onSend(trimmed);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = Math.min(ta.scrollHeight, 150) + "px";
    }
  };

  const toggleMic = () => {
    if (isListening) stopListening();
    else startListening();
  };

  const handleCancel = () => {
    cancelListening();
    setInput("");
  };

  return (
    <div className="space-y-1">
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="text-xs text-destructive px-2"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 px-2"
          >
            <span className="flex items-center gap-1.5 text-xs text-primary font-medium">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Ouvindo...
            </span>
            <button onClick={handleCancel} className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1">
              <X className="w-3 h-3" /> Cancelar
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="glass rounded-xl p-2 flex items-end gap-2 border border-border/50">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder="Digite sua mensagem..."
          disabled={disabled}
          rows={1}
          className="flex-1 bg-transparent resize-none outline-none text-sm text-foreground placeholder:text-muted-foreground px-2 py-2 max-h-[150px]"
        />

        {isSupported && (
          <button
            onClick={toggleMic}
            disabled={disabled}
            className={`p-2.5 rounded-lg transition-all shrink-0 ${
              isListening
                ? "bg-destructive text-destructive-foreground animate-pulse"
                : "bg-secondary text-muted-foreground hover:text-primary hover:bg-secondary/80"
            } disabled:opacity-30 disabled:cursor-not-allowed`}
            title={isListening ? "Parar de ouvir" : "Falar"}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
        )}

        <button
          onClick={handleSend}
          disabled={disabled || !input.trim()}
          className="p-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all glow-cyan shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      <p className="text-center text-[10px] text-muted-foreground/60">
        {isSupported ? "Toque no microfone e fale. Toque novamente para parar." : ""}
      </p>
    </div>
  );
};

export default ChatInput;
