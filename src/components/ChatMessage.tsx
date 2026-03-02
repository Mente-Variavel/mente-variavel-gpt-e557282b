import { motion } from "framer-motion";
import { Copy, Check, Bot, User, Volume2, Pause, Square, Download } from "lucide-react";
import { useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  imageUrl?: string;
  attachments?: string[];
}

const CodeBlock = ({ language, children }: { language: string; children: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-3 rounded-xl overflow-hidden border border-border/50 bg-[hsl(222,47%,4%)]">
      <div className="flex items-center justify-between px-4 py-2 bg-secondary/80 border-b border-border/30">
        <span className="text-xs text-muted-foreground font-mono">{language || "code"}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {copied ? <Check className="w-3 h-3 text-accent" /> : <Copy className="w-3 h-3" />}
          {copied ? "Copiado!" : "Copiar código"}
        </button>
      </div>
      <div className="overflow-x-auto">
        <SyntaxHighlighter
          style={oneDark}
          language={language || "text"}
          PreTag="div"
          customStyle={{
            margin: 0,
            padding: "1rem",
            background: "transparent",
            fontSize: "0.8125rem",
            lineHeight: "1.6",
          }}
        >
          {children}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

const ChatMessage = ({ role, content, imageUrl, attachments }: ChatMessageProps) => {
  const [copied, setCopied] = useState(false);
  const isAssistant = role === "assistant";
  const { isSpeaking, isPaused, isSupported: ttsSupported, speak, pause, resume, stop } = useSpeechSynthesis();

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [content]);

  const handleSpeak = useCallback(() => {
    if (isSpeaking && !isPaused) pause();
    else if (isPaused) resume();
    else speak(content);
  }, [isSpeaking, isPaused, content, pause, resume, speak]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 group ${isAssistant ? "" : "flex-row-reverse"}`}
    >
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-1 ${
          isAssistant ? "bg-primary/20 glow-cyan" : "bg-accent/20 glow-green"
        }`}
      >
        {isAssistant ? <Bot className="w-4 h-4 text-primary" /> : <User className="w-4 h-4 text-accent" />}
      </div>

      <div
        className={`relative max-w-[85%] rounded-xl px-5 py-4 ${
          isAssistant ? "bg-secondary border border-border/50" : "bg-primary/10 border border-primary/20"
        }`}
      >
        {isAssistant ? (
          <>
            <div className="mv-markdown text-sm leading-relaxed text-foreground">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-xl font-bold text-primary mt-4 mb-2 first:mt-0">{children}</h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-lg font-bold text-primary mt-4 mb-2 first:mt-0">{children}</h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-base font-semibold text-primary mt-3 mb-1.5 first:mt-0">{children}</h3>
                  ),
                  h4: ({ children }) => (
                    <h4 className="text-sm font-semibold text-accent mt-2 mb-1 first:mt-0">{children}</h4>
                  ),
                  p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>,
                  strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                  em: ({ children }) => <em className="italic text-muted-foreground">{children}</em>,
                  ul: ({ children }) => <ul className="mb-3 ml-1 space-y-1.5 list-none">{children}</ul>,
                  ol: ({ children }) => <ol className="mb-3 ml-4 space-y-1.5 list-decimal">{children}</ol>,
                  li: ({ children, ...props }) => {
                    const parent = (props as any).node?.parentNode?.tagName;
                    if (parent === "ol") {
                      return <li className="leading-relaxed text-foreground/90 pl-1">{children}</li>;
                    }
                    return (
                      <li className="leading-relaxed text-foreground/90 flex items-start gap-2">
                        <span className="text-primary mt-1.5 text-[0.5rem] shrink-0">●</span>
                        <span>{children}</span>
                      </li>
                    );
                  },
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-2 border-primary/50 pl-4 my-3 text-muted-foreground italic">
                      {children}
                    </blockquote>
                  ),
                  hr: () => <hr className="border-border/50 my-4" />,
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
                    >
                      {children}
                    </a>
                  ),
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-3 rounded-lg border border-border/50">
                      <table className="w-full text-sm">{children}</table>
                    </div>
                  ),
                  thead: ({ children }) => <thead className="bg-secondary/80">{children}</thead>,
                  th: ({ children }) => (
                    <th className="px-3 py-2 text-left font-semibold text-foreground border-b border-border/50">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="px-3 py-2 border-b border-border/30 text-foreground/90">{children}</td>
                  ),
                  code: ({ className, children, ...props }) => {
                    const match = /language-(\w+)/.exec(className || "");
                    const codeStr = String(children).replace(/\n$/, "");
                    const isMultiline = codeStr.includes("\n") || match;
                    if (isMultiline) {
                      return <CodeBlock language={match?.[1] || ""}>{codeStr}</CodeBlock>;
                    }
                    return (
                      <code className="bg-muted px-1.5 py-0.5 rounded text-[0.8125rem] font-mono text-primary">
                        {children}
                      </code>
                    );
                  },
                  pre: ({ children }) => <>{children}</>,
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
            {imageUrl && (
              <div className="mt-3 relative group/img">
                <img
                  src={imageUrl}
                  alt="Imagem gerada por IA"
                  className="rounded-lg border border-border/50 max-w-full"
                  loading="lazy"
                />
                <a
                  href={imageUrl}
                  download="imagem-gerada.png"
                  className="absolute bottom-2 right-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium opacity-0 group-hover/img:opacity-100 transition-opacity shadow-lg"
                >
                  <Download className="w-3.5 h-3.5" />
                  Baixar
                </a>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-2">
            {attachments && attachments.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {attachments.map((src, i) => (
                  <img key={i} src={src} alt="Anexo" className="w-32 h-32 rounded-lg object-cover border border-border/50" />
                ))}
              </div>
            )}
            <div className="text-sm leading-relaxed text-foreground">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          </div>
        )}

        <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
          {isAssistant && ttsSupported && (
            <>
              <button
                onClick={handleSpeak}
                className="p-1.5 rounded-md bg-muted hover:bg-muted/80 border border-border/50"
                title={isSpeaking && !isPaused ? "Pausar" : isPaused ? "Continuar" : "Ouvir"}
              >
                {isSpeaking && !isPaused ? (
                  <Pause className="w-3 h-3 text-primary" />
                ) : (
                  <Volume2 className="w-3 h-3 text-primary" />
                )}
              </button>
              {isSpeaking && (
                <button
                  onClick={stop}
                  className="p-1.5 rounded-md bg-muted hover:bg-muted/80 border border-border/50"
                  title="Parar"
                >
                  <Square className="w-3 h-3 text-destructive" />
                </button>
              )}
            </>
          )}
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-md bg-muted hover:bg-muted/80 border border-border/50"
          >
            {copied ? <Check className="w-3 h-3 text-accent" /> : <Copy className="w-3 h-3 text-muted-foreground" />}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatMessage;
