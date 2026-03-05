import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MessageCircle, ExternalLink } from "lucide-react";

interface AdPlaceholderProps {
  placement?: string;
  className?: string;
}

const FORMAT_STYLES: Record<string, string> = {
  horizontal: "w-full aspect-[4/1] max-h-[300px]",
  square: "w-full max-w-[400px] aspect-square mx-auto",
  vertical: "w-full max-w-[320px] aspect-[9/16] max-h-[600px] mx-auto",
};

const AdPlaceholder = ({ placement = "banner_top", className = "" }: AdPlaceholderProps) => {
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

  if (!ads || ads.length === 0) return null;

  return (
    <div className={`space-y-6 ${className}`}>
      {ads.map((ad) => {
        const format = (ad as any).ad_format || "horizontal";
        const formatStyle = FORMAT_STYLES[format] || FORMAT_STYLES.horizontal;

        const imageBlock = ad.image_url ? (
          <div className={`rounded-xl overflow-hidden border border-primary/20 bg-card/50 hover:border-primary/40 transition-colors ${formatStyle}`}>
            <img
              src={ad.image_url}
              alt={ad.title || "Anúncio"}
              className="w-full h-full object-contain"
            />
          </div>
        ) : null;

        const infoBlock = (ad.title || ad.description) ? (
          <div className="text-center space-y-1">
            {ad.title && <p className="text-sm font-semibold text-foreground">{ad.title}</p>}
            {ad.description && <p className="text-xs text-muted-foreground">{ad.description}</p>}
          </div>
        ) : null;

        const buttons = (ad.whatsapp_number || ad.link_url) ? (
          <div className="flex gap-2 justify-center">
            {ad.whatsapp_number && (
              <a
                href={`https://wa.me/${ad.whatsapp_number.replace(/\D/g, '')}?text=${encodeURIComponent('Olá! Vi seu anúncio no MenteVariável e gostaria de saber mais.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#25D366] hover:bg-[#20BD5A] text-white text-sm font-medium transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </a>
            )}
            {ad.link_url && (
              <a
                href={ad.link_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Visitar Site
              </a>
            )}
          </div>
        ) : null;

        const content = (
          <div key={ad.id} className="space-y-3">
            {ad.link_url && imageBlock ? (
              <a href={ad.link_url} target="_blank" rel="noopener noreferrer" className="block">
                {imageBlock}
              </a>
            ) : imageBlock}
            {infoBlock}
            {buttons}
          </div>
        );

        return content;
      })}
    </div>
  );
};

export default AdPlaceholder;
