import { Zap } from "lucide-react";

interface UsageBadgeProps {
  used: number;
  limit: number;
  onPlanClick: () => void;
}

const UsageBadge = ({ used, limit, onPlanClick }: UsageBadgeProps) => {
  const remaining = Math.max(0, limit - used);
  const isLow = remaining <= 1;
  const isOut = remaining === 0;

  // Format as minutes
  const formatMinutes = (val: number) => {
    if (val >= 999) return "∞";
    return `${val.toFixed(1)} min`;
  };

  return (
    <div className={`flex items-center gap-3 rounded-xl border p-3 ${
      isOut ? "border-destructive/40 bg-destructive/10" : isLow ? "border-yellow-500/40 bg-yellow-500/10" : "border-border bg-card"
    }`}>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <Zap className={`h-4 w-4 ${isOut ? "text-destructive" : "text-primary"}`} />
          <span className="text-sm font-medium text-foreground">
            {isOut ? "Limite atingido" : `${formatMinutes(remaining)} restantes`}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">{formatMinutes(used)} / {formatMinutes(limit)} usados este mês (gratuito)</p>
      </div>
      {(isLow || isOut) && (
        <button onClick={onPlanClick} className="shrink-0 rounded-lg bg-gradient-to-r from-primary to-accent px-3 py-1.5 text-xs font-bold text-primary-foreground transition-all hover:shadow-lg">
          Assinar
        </button>
      )}
    </div>
  );
};

export default UsageBadge;
