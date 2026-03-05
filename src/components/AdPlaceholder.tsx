import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MessageCircle, ExternalLink } from "lucide-react";
import { useLocation } from "react-router-dom";

interface AdPlaceholderProps {
  placement?: string;
  className?: string;
}

const FORMAT_STYLES: Record<string, string> = {
  horizontal: "w-full aspect-[4/1] max-h-[300px]",
  square: "w-full max-w-[400px] aspect-square mx-auto",
  vertical: "w-full max-w-[320px] aspect-[9/16] max-h-[600px] mx-auto",
};

const PAGE_ROUTE_MAP: Record<string, string[]> = {
  home: ["/"],
  chat: ["/assistente"],
  blog: ["/blog"],
  guias: ["/guias", "/guia"],
  ferramentas: ["/ferramentas"],
  anuncie: ["/anuncie"],
  financas: ["/financas"],
  servicos: ["/servicos"],
  musica: ["/servicos/criador-musica"],
};

const matchesPage = (pageTargets: string[], pathname: string): boolean => {
  if (!pageTargets || pageTargets.length === 0 || pageTargets.includes("all")) return true;
  return pageTargets.some((target) => {
    const routes = PAGE_ROUTE_MAP[target];
    if (!routes) return false;
    return routes.some((route) => pathname === route || pathname.startsWith(route + "/"));
  });
};

const AdPlaceholder = ({ placement = "banner_top", className = "" }: AdPlaceholderProps) => {
  const location = useLocation();

  const { data: ads } = useQuery({
    queryKey: ["ads-by-placement", placement],
    queryFn: async () => {
      const { data } = await supabase
        .from("ads")
        .select("*")
        .eq("placement", placement)
        .eq("is_active", true);
      return data || [];
    },
    staleTime: 60_000,
  });

  const filteredAds = ads?.filter((ad) => {
    const targets = (ad as any).page_targets as string[] | undefined;
    return matchesPage(targets || [], location.pathname);
  });

  if (!filteredAds || filteredAds.length === 0) return null;

  return (
    <div className={`space-y-6 ${className}`}>
      {filteredAds.map((ad) => {
        const format = ad.ad_format || "horizontal";
        const formatStyle = FORMAT_STYLES[format] || FORMAT_STYLES.horizontal;

        const imageBlock = ad.image_url ? (
          <div className={`rounded-xl overflow-hidden border border-border/30 bg-card/30 ${formatStyle}`}>
            <img
              src={ad.image_url}
              alt={ad.title || "Anúncio"}
              className="w-full h-full object-contain"
            />
          </div>
        ) : null;

        const infoBlock = (ad.title || ad.description) ? (
          <div className="text-center space-y-0.5">
            {ad.title && <p className="text-sm font-medium text-foreground">{ad.title}</p>}
            {ad.description && <p className="text-xs text-muted-foreground line-clamp-2">{ad.description}</p>}
          </div>
        ) : null;

        const hasWhatsapp = !!ad.whatsapp_number;
        const hasLink = !!ad.link_url;
        const buttons = (hasWhatsapp || hasLink) ? (
          <div className="flex gap-2 justify-center">
            {hasWhatsapp && (
              <a
                href={`https://wa.me/${ad.whatsapp_number!.replace(/\D/g, '')}?text=${encodeURIComponent('Olá! Vi seu anúncio no MenteVariável e gostaria de saber mais.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-[#25D366]/30 text-[#25D366] hover:bg-[#25D366]/10 transition-colors"
              >
                <MessageCircle className="w-3 h-3" />
                WhatsApp
              </a>
            )}
            {hasLink && (
              <a
                href={ad.link_url!}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-primary/30 text-primary hover:bg-primary/10 transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                Site
              </a>
            )}
          </div>
        ) : null;

        return (
          <div key={ad.id} className="space-y-2">
            {ad.link_url && imageBlock ? (
              <a href={ad.link_url} target="_blank" rel="noopener noreferrer" className="block">
                {imageBlock}
              </a>
            ) : imageBlock}
            {infoBlock}
            {buttons}
          </div>
        );
      })}
    </div>
  );
};

export default AdPlaceholder;
