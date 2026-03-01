import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Megaphone } from "lucide-react";

interface AdPlaceholderProps {
  format?: "banner" | "sidebar" | "inline" | "footer";
  slot?: string;
  className?: string;
}

const sizeMap = {
  banner: "h-24 md:h-28",
  sidebar: "h-64",
  inline: "h-32",
  footer: "h-20",
};

const slotMap: Record<string, string> = {
  banner: "banner_top",
  sidebar: "inline_1",
  inline: "inline_1",
  footer: "footer",
};

const AdPlaceholder = ({ format = "inline", slot, className = "" }: AdPlaceholderProps) => {
  const resolvedSlot = slot || slotMap[format] || "inline_1";

  const { data: ad } = useQuery({
    queryKey: ["ad", resolvedSlot],
    queryFn: async () => {
      const { data } = await supabase
        .from("ads")
        .select("*")
        .eq("slot", resolvedSlot)
        .eq("is_active", true)
        .maybeSingle();
      return data;
    },
    staleTime: 60_000,
  });

  // Se há anúncio ativo com conteúdo, exibe ele
  if (ad && (ad.title || ad.image_url)) {
    const content = (
      <div
        className={`w-full ${sizeMap[format]} rounded-xl border border-primary/20 bg-card/50 flex items-center justify-center gap-4 px-4 overflow-hidden hover:border-primary/40 transition-colors ${className}`}
      >
        {ad.image_url && (
          <img src={ad.image_url} alt={ad.title || "Anúncio"} className="h-full max-h-[80%] object-contain rounded-lg" />
        )}
        {ad.title && (
          <div className="flex flex-col items-center text-center">
            <span className="text-sm font-semibold text-foreground">{ad.title}</span>
            {ad.description && <span className="text-xs text-muted-foreground">{ad.description}</span>}
          </div>
        )}
      </div>
    );

    if (ad.link_url) {
      return (
        <a href={ad.link_url} target="_blank" rel="noopener noreferrer" className="block">
          {content}
        </a>
      );
    }
    return content;
  }

  // CTA padrão: "Anuncie aqui"
  return (
    <Link
      to="/anuncie"
      className={`w-full ${sizeMap[format]} rounded-xl border border-dashed border-primary/30 bg-card/30 flex items-center justify-center gap-3 hover:border-primary/60 hover:bg-card/50 transition-all group cursor-pointer ${className}`}
    >
      <Megaphone className="w-5 h-5 text-primary/50 group-hover:text-primary transition-colors" />
      <span className="text-sm text-muted-foreground/60 group-hover:text-primary/80 transition-colors font-medium">
        Anuncie sua empresa aqui
      </span>
    </Link>
  );
};

export default AdPlaceholder;
