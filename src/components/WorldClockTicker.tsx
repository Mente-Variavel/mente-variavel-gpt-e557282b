import { useState, useEffect } from "react";

const ZONES = [
  { flag: "🇧🇷", label: "Brasil", tz: "America/Sao_Paulo" },
  { flag: "🇵🇹", label: "Portugal", tz: "Europe/Lisbon" },
  { flag: "🇺🇸", label: "New York", tz: "America/New_York" },
  { flag: "🇨🇳", label: "China", tz: "Asia/Shanghai" },
];

const formatTime = (tz: string): string =>
  new Date().toLocaleTimeString("pt-BR", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

const WorldClockTicker = () => {
  const [times, setTimes] = useState<string[]>(() =>
    ZONES.map((z) => formatTime(z.tz))
  );

  useEffect(() => {
    const id = setInterval(() => {
      setTimes(ZONES.map((z) => formatTime(z.tz)));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const renderContent = () =>
    ZONES.map((z, i) => (
      <span key={z.tz} className="whitespace-nowrap inline-flex items-center">
        <span>{z.flag}</span>
        <span className="ml-1">{z.label}</span>
        <span className="ml-1.5 font-mono text-primary/90">{times[i]}</span>
        {i < ZONES.length - 1 && (
          <span className="mx-4 text-primary/30">•</span>
        )}
      </span>
    ));

  return (
    <div className="fixed top-16 left-0 right-0 z-40 bg-[hsl(222,47%,4%)] border-b border-primary/10 overflow-hidden group">
      <div
        className="flex w-max py-1.5 text-[11px] text-muted-foreground tracking-wide"
        style={{ animation: "ticker 30s linear infinite" }}
      >
        <div className="flex items-center px-8">{renderContent()}</div>
        <div className="flex items-center px-8" aria-hidden="true">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default WorldClockTicker;
