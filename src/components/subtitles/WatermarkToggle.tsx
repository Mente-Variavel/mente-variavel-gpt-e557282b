interface WatermarkToggleProps {
  watermarkEnabled: boolean;
  onToggle: () => void;
  onPlanClick?: () => void;
}

const WatermarkToggle = ({ watermarkEnabled, onToggle }: WatermarkToggleProps) => {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-card p-3">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-foreground">Marca d'água</span>
      </div>
      <button onClick={onToggle}
        className={`relative h-6 w-11 rounded-full border transition-all ${watermarkEnabled ? "border-accent bg-accent/30" : "border-border bg-secondary/50"}`}>
        <span className={`absolute top-0.5 h-4.5 w-4.5 rounded-full transition-all ${watermarkEnabled ? "left-[22px] bg-accent" : "left-0.5 bg-muted-foreground"}`} />
      </button>
    </div>
  );
};

export default WatermarkToggle;
