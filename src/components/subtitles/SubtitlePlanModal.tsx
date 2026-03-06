import { X, Check, Sparkles, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useState } from "react";

interface SubtitlePlanModalProps {
  open: boolean;
  onClose: () => void;
}

const features = [
  "Até 300 vídeos por mês",
  "Máximo 60 segundos por vídeo",
  "Marca d'água removida",
  "Exportar MP4 e SRT",
  "Processamento prioritário",
];

const SubtitlePlanModal = ({ open, onClose }: SubtitlePlanModalProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSubscribe = async () => {
    if (!user) {
      toast.error("Faça login para assinar o plano.");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-subtitle-checkout", {
        body: {},
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (err: any) {
      toast.error(err.message || "Erro ao iniciar checkout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="relative mx-4 w-full max-w-lg rounded-2xl border border-border bg-card p-8">
        <button onClick={onClose} className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground transition-colors hover:text-foreground">
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-xs font-bold text-accent">
            <Sparkles className="h-3.5 w-3.5" /> PLANO PREMIUM
          </div>
          <h2 className="font-display text-2xl font-bold text-primary text-glow-cyan">Plano Criador</h2>
        </div>

        <div className="mb-6 text-center">
          <div className="flex items-baseline justify-center gap-1">
            <span className="font-display text-5xl font-bold text-foreground">$5</span>
            <span className="text-lg text-muted-foreground">/mês</span>
          </div>
        </div>

        <div className="mb-6 space-y-3">
          {features.map((feature) => (
            <div key={feature} className="flex items-center gap-3">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/20">
                <Check className="h-3 w-3 text-accent" />
              </div>
              <span className="text-sm text-foreground">{feature}</span>
            </div>
          ))}
        </div>

        <div className="mb-6 rounded-xl border border-border bg-secondary/30 p-4 text-sm leading-relaxed text-muted-foreground">
          <p>Por apenas <span className="font-semibold text-foreground">$5 por mês</span> você pode gerar até <span className="font-semibold text-primary">300 vídeos</span> com legendas automáticas.</p>
          <p className="mt-2">Cada vídeo pode ter até 60 segundos. Isso equivale a mais de <span className="font-semibold text-accent">5 horas</span> de vídeos legendados todos os meses usando inteligência artificial.</p>
          <p className="mt-2">Ideal para quem cria conteúdo frequentemente e precisa de uma solução rápida e profissional.</p>
        </div>

        <button onClick={handleSubscribe} disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent py-4 font-display text-sm font-bold uppercase tracking-wider text-primary-foreground transition-all hover:shadow-lg hover:shadow-primary/20 disabled:opacity-50">
          <Zap className="h-5 w-5" />
          {loading ? "Processando..." : user ? "Assinar Plano Criador" : "Faça login para assinar"}
        </button>

        <p className="mt-3 text-center text-xs text-muted-foreground">Cancele a qualquer momento • Créditos renovam mensalmente</p>
      </div>
    </div>
  );
};

export default SubtitlePlanModal;
