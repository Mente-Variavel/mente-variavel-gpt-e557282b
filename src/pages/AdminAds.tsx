import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdEditor from "@/components/admin/AdEditor";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { LogIn, AlertTriangle, Clock } from "lucide-react";

const SLOT_LABELS: Record<string, string> = {
  banner_top: "🔝 Banner Topo",
  inline_1: "📄 Inline 1 (meio da página)",
  inline_2: "📄 Inline 2 (meio da página)",
  footer: "🔻 Rodapé",
};

const getAdStatus = (planEnd: string | null) => {
  if (!planEnd) return null;
  const end = new Date(planEnd);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return "expired";
  if (diffDays <= 3) return "expiring";
  return "active";
};

const AdminAds = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: ads, isLoading } = useQuery({
    queryKey: ["admin-ads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ads")
        .select("*")
        .order("slot");
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const updateMutation = useMutation({
    mutationFn: async (ad: {
      id: string; title: string; description: string; image_url: string;
      link_url: string; whatsapp_number: string; is_active: boolean;
      plan_name: string; plan_start: string; plan_end: string;
      plan_value: string; client_name: string;
    }) => {
      const { error } = await supabase
        .from("ads")
        .update({
          title: ad.title,
          description: ad.description,
          image_url: ad.image_url,
          link_url: ad.link_url,
          whatsapp_number: ad.whatsapp_number,
          is_active: ad.is_active,
          plan_name: ad.plan_name || null,
          plan_start: ad.plan_start || null,
          plan_end: ad.plan_end || null,
          plan_value: ad.plan_value ? parseFloat(ad.plan_value) : null,
          client_name: ad.client_name || null,
        })
        .eq("id", ad.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-ads"] });
      queryClient.invalidateQueries({ queryKey: ["ad"] });
      toast.success("Anúncio salvo com sucesso!");
    },
    onError: () => toast.error("Erro ao salvar anúncio"),
  });

  if (authLoading || isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-1 flex items-center justify-center pt-20">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center pt-20 gap-4">
          <p className="text-muted-foreground">Faça login para gerenciar os anúncios.</p>
          <Button onClick={() => navigate("/auth")} className="gap-2">
            <LogIn className="w-4 h-4" />
            Fazer login
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const expiringAds = ads?.filter((ad) => {
    const status = getAdStatus(ad.plan_end);
    return status === "expiring" || status === "expired";
  }) || [];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 pt-20 container mx-auto px-4 py-8">
        <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
          Gerenciar Anúncios
        </h1>

        {expiringAds.length > 0 && (
          <div className="mb-6 space-y-2">
            {expiringAds.map((ad) => {
              const status = getAdStatus(ad.plan_end);
              const isExpired = status === "expired";
              const clientName = ad.client_name || ad.title || ad.slot;
              const daysLeft = ad.plan_end
                ? Math.ceil((new Date(ad.plan_end).getTime() - new Date().setHours(0,0,0,0)) / (1000*60*60*24))
                : 0;

              return (
                <div
                  key={`alert-${ad.id}`}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    isExpired
                      ? "border-destructive/50 bg-destructive/10"
                      : "border-yellow-500/50 bg-yellow-500/10"
                  }`}
                >
                  {isExpired ? (
                    <AlertTriangle className="w-5 h-5 text-destructive shrink-0" />
                  ) : (
                    <Clock className="w-5 h-5 text-yellow-500 shrink-0" />
                  )}
                  <span className="text-sm flex-1">
                    {isExpired
                      ? `⚠️ Plano de "${clientName}" VENCIDO!`
                      : `⏰ Plano de "${clientName}" vence em ${daysLeft} dia${daysLeft !== 1 ? "s" : ""}`}
                  </span>
                  {ad.whatsapp_number && (
                    <a
                      href={`https://wa.me/${ad.whatsapp_number.replace(/\D/g, "")}?text=${encodeURIComponent(
                        isExpired
                          ? `Olá ${clientName}! Seu plano de anúncio no MenteVariável venceu. Gostaria de renovar?`
                          : `Olá ${clientName}! Seu plano de anúncio no MenteVariável vence em ${daysLeft} dia${daysLeft !== 1 ? "s" : ""}. Gostaria de renovar?`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 px-3 py-1.5 rounded-md bg-[#25D366] hover:bg-[#20BD5A] text-white text-xs font-medium transition-colors"
                    >
                      Avisar no WhatsApp
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="grid gap-6">
          {ads?.map((ad) => (
            <AdEditor
              key={ad.id}
              ad={ad}
              label={SLOT_LABELS[ad.slot] || ad.slot}
              planStatus={getAdStatus(ad.plan_end)}
              onSave={(updated) => updateMutation.mutate({ ...updated, id: ad.id })}
              saving={updateMutation.isPending}
            />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminAds;
