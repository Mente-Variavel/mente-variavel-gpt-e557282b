import { Send, Mic, MicOff, X, HelpCircle, Paperclip, Image as ImageIcon, FileText } from "lucide-react";
import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import AudioVisualizer from "@/components/AudioVisualizer";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export interface ChatAttachment {
  file: File;
  preview: string;
  type: "image" | "file";
}

interface ChatInputProps {
  onSend: (message: string, attachments?: ChatAttachment[]) => void;
  disabled?: boolean;
}

const ChatInput = ({ onSend, disabled }: ChatInputProps) => {
  const [input, setInput] = useState("");
  const [helpOpen, setHelpOpen] = useState(false);
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isListening, transcript, isSupported, error, mediaStream, startListening, stopListening, cancelListening } =
    useSpeechRecognition();

  useEffect(() => {
    if (transcript) setInput(transcript);
  }, [transcript]);

  const handleSend = () => {
    const trimmed = input.trim();
    if ((!trimmed && attachments.length === 0) || disabled) return;
    if (isListening) stopListening();
    onSend(trimmed, attachments.length > 0 ? attachments : undefined);
    setInput("");
    setAttachments([]);
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (attachments.length >= 5) return; // max 5 files

      const isImage = file.type.startsWith("image/");
      const preview = isImage ? URL.createObjectURL(file) : "";

      setAttachments((prev) => [
        ...prev,
        { file, preview, type: isImage ? "image" : "file" },
      ]);
    });

    // Reset input so same file can be re-selected
    e.target.value = "";
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => {
      const removed = prev[index];
      if (removed.preview) URL.revokeObjectURL(removed.preview);
      return prev.filter((_, i) => i !== index);
    });
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
            className="flex flex-col gap-2 px-2"
          >
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs text-primary font-medium">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Ouvindo...
              </span>
              <button onClick={handleCancel} className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1">
                <X className="w-3 h-3" /> Cancelar
              </button>
            </div>
            <AudioVisualizer stream={mediaStream} isActive={isListening} barCount={32} className="rounded-lg" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Attachment previews */}
      <AnimatePresence>
        {attachments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex gap-2 px-2 flex-wrap"
          >
            {attachments.map((att, i) => (
              <div key={i} className="relative group">
                {att.type === "image" ? (
                  <img
                    src={att.preview}
                    alt={att.file.name}
                    className="w-16 h-16 rounded-lg object-cover border border-border/50"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg border border-border/50 bg-secondary flex flex-col items-center justify-center gap-1 p-1">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                    <span className="text-[8px] text-muted-foreground truncate w-full text-center">
                      {att.file.name.split(".").pop()?.toUpperCase()}
                    </span>
                  </div>
                )}
                <button
                  onClick={() => removeAttachment(i)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="glass rounded-xl p-2 flex items-end gap-2 border border-border/50">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx,.txt"
          onChange={handleFileSelect}
          className="hidden"
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="p-2.5 rounded-lg transition-all shrink-0 bg-secondary text-muted-foreground hover:text-primary hover:bg-secondary/80 disabled:opacity-30 disabled:cursor-not-allowed"
          title="Anexar arquivo"
        >
          <Paperclip className="w-4 h-4" />
        </button>

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
          disabled={disabled || (!input.trim() && attachments.length === 0)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all glow-cyan shrink-0"
        >
          <Send className="w-4 h-4" />
          Enviar
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
