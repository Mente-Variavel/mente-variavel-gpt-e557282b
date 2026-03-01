const TypingIndicator = () => (
  <div className="flex gap-3">
    <div className="w-8 h-8 rounded-lg bg-primary/20 glow-cyan flex items-center justify-center shrink-0">
      <div className="w-4 h-4 rounded-full bg-primary animate-pulse-glow" />
    </div>
    <div className="bg-secondary border border-border/50 rounded-xl px-4 py-3 flex items-center gap-1.5">
      <span className="w-2 h-2 rounded-full bg-primary animate-typing-dot-1" />
      <span className="w-2 h-2 rounded-full bg-primary animate-typing-dot-2" />
      <span className="w-2 h-2 rounded-full bg-primary animate-typing-dot-3" />
    </div>
  </div>
);

export default TypingIndicator;
