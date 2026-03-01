import { motion } from "framer-motion";
import { Copy, Check, Bot, User } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
}

const ChatMessage = ({ role, content }: ChatMessageProps) => {
  const [copied, setCopied] = useState(false);
  const isAssistant = role === "assistant";

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 group ${isAssistant ? "" : "flex-row-reverse"}`}
    >
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
          isAssistant ? "bg-primary/20 glow-cyan" : "bg-accent/20 glow-green"
        }`}
      >
        {isAssistant ? (
          <Bot className="w-4 h-4 text-primary" />
        ) : (
          <User className="w-4 h-4 text-accent" />
        )}
      </div>

      <div
        className={`relative max-w-[80%] rounded-xl px-4 py-3 ${
          isAssistant
            ? "bg-secondary border border-border/50"
            : "bg-primary/10 border border-primary/20"
        }`}
      >
        <div className="prose prose-sm prose-invert max-w-none text-foreground text-sm leading-relaxed">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>

        <button
          onClick={handleCopy}
          className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md bg-muted hover:bg-muted/80 border border-border/50"
        >
          {copied ? (
            <Check className="w-3 h-3 text-accent" />
          ) : (
            <Copy className="w-3 h-3 text-muted-foreground" />
          )}
        </button>
      </div>
    </motion.div>
  );
};

export default ChatMessage;
