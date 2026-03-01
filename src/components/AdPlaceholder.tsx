interface AdPlaceholderProps {
  format?: "banner" | "sidebar" | "inline" | "footer";
  className?: string;
}

const sizeMap = {
  banner: "h-24 md:h-28",
  sidebar: "h-64",
  inline: "h-32",
  footer: "h-20",
};

const AdPlaceholder = ({ format = "inline", className = "" }: AdPlaceholderProps) => (
  <div
    className={`w-full ${sizeMap[format]} rounded-xl border border-dashed border-border/40 bg-card/30 flex items-center justify-center ${className}`}
    aria-hidden="true"
  >
    <span className="text-xs text-muted-foreground/40 select-none">Espaço reservado para anúncio</span>
  </div>
);

export default AdPlaceholder;
