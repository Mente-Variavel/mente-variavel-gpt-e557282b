import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Megaphone, MessageCircle, ExternalLink } from "lucide-react";

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

    return (
      <div className="space-y-2">
        {ad.link_url ? (
          <a href={ad.link_url} target="_blank" rel="noopener noreferrer" className="block">
            {content}
          </a>
        ) : (
          content
        )}
        <div className="flex gap-2">
          {ad.whatsapp_number && (
            <a
              href={`https://wa.me/${ad.whatsapp_number.replace(/\D/g, '')}?text=${encodeURIComponent('Olá! Vi seu anúncio no MenteVariável e gostaria de saber mais.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-[#25D366] hover:bg-[#20BD5A] text-white text-sm font-medium transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Falar no WhatsApp
            </a>
          )}
          {ad.link_url && (
            <a
              href={ad.link_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Visitar Site
            </a>
          )}
        </div>
      </div>
    );
  }

  // No active ad — render nothing
  return null;
};

export default AdPlaceholder;
