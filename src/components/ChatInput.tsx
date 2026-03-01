import { Send } from "lucide-react";
import { useState, useRef, KeyboardEvent } from "react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

const ChatInput = ({ onSend, disabled }: ChatInputProps) => {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
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

  return (
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
      <button
        onClick={handleSend}
        disabled={disabled || !input.trim()}
        className="p-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all glow-cyan shrink-0"
      >
        <Send className="w-4 h-4" />
      </button>
    </div>
  );
};

export default ChatInput;
