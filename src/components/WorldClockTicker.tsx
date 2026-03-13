import { useState, useEffect } from "react";

const ZONES = [
  { flag: "🇧🇷", label: "Brasil", tz: "America/Sao_Paulo" },
  { flag: "🇵🇹", label: "Portugal", tz: "Europe/Lisbon" },
  { flag: "🇺🇸", label: "New York", tz: "America/New_York" },
  { flag: "🇨🇳", label: "China", tz: "Asia/Shanghai" },
];

const fmt = (tz: string) =>
  new Date().toLocaleTimeString("pt-BR", { timeZone: tz, hour: "2-digit", minute: "2-digit", hour12: false });

const WorldClockTicker = () => {
  const [times, setTimes] = useState(() => ZONES.map((z) => fmt(z.tz)));

  useEffect(() => {
    const id = setInterval(() => setTimes(ZONES.map((z) => fmt(z.tz))), 10_000);
    return () => clearInterval(id);
  }, []);

  const content = ZONES.map((z, i) => (
    <span key={z.tz} className="whitespace-nowrap">
      {z.flag} {z.label}{" "}
      <span className="font-mono text-primary/90">{times[i]}</span>
      {i < ZONES.length - 1 && <span className="mx-3 text-primary/30">•</span>}
    </span>
  ));

  return (
    <div className="w-full bg-[hsl(222,47%,4%)] border-b border-primary/10 overflow-hidden group">
      <div className="flex animate-[ticker_30s_linear_infinite] group-hover:[animation-play-state:paused] w-max gap-0 py-1.5 text-[11px] text-muted-foreground tracking-wide">
        <div className="flex items-center px-6">{content}</div>
        <div className="flex items-center px-6" aria-hidden>{content}</div>
      </div>
    </div>
  );
};

export default WorldClockTicker;
