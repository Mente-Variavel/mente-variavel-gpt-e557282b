import { Send, Mic, MicOff, X, HelpCircle } from "lucide-react";
import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

const ChatInput = ({ onSend, disabled }: ChatInputProps) => {
  const [input, setInput] = useState("");
  const [helpOpen, setHelpOpen] = useState(false);
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

      <div className="flex items-center justify-center gap-2">
        {isSupported && (
          <button
            onClick={() => setHelpOpen(true)}
            className="flex items-center gap-1 text-[10px] text-muted-foreground/60 hover:text-muted-foreground transition-colors"
          >
            <HelpCircle className="w-3 h-3" />
            Como habilitar microfone
          </button>
        )}
      </div>

      {/* Help Modal */}
      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Como habilitar o microfone</DialogTitle>
            <DialogDescription>
              Siga os passos abaixo para usar o ditado por voz.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm text-foreground/80">
            <div className="flex gap-3 items-start">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">1</span>
              <p><strong>Use HTTPS:</strong> O reconhecimento de voz só funciona em sites seguros (HTTPS). Verifique se a URL começa com <code className="text-xs bg-secondary px-1 rounded">https://</code></p>
            </div>
            <div className="flex gap-3 items-start">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">2</span>
              <p><strong>Permita o microfone:</strong> Quando o navegador pedir permissão, clique em "Permitir". Se já negou, clique no ícone de cadeado na barra de endereço e ative o microfone.</p>
            </div>
            <div className="flex gap-3 items-start">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">3</span>
              <p><strong>Use o Google Chrome:</strong> O ditado por voz funciona melhor no Chrome para Android e Desktop. Safari e Firefox têm suporte limitado.</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChatInput;
