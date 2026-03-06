import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Bell, Check, X, CreditCard, ChevronDown, ChevronUp, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  metadata: Record<string, string>;
  is_read: boolean;
  created_at: string;
}

export default function AdminNotifications() {
  const [expanded, setExpanded] = useState(true);
  const queryClient = useQueryClient();

  const { data: notifications } = useQuery({
    queryKey: ["admin-notifications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as Notification[];
    },
    refetchInterval: 15_000,
  });

  const unreadCount = notifications?.filter((n) => !n.is_read).length || 0;

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("admin_notifications").update({ is_read: true }).eq("id", id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-notifications"] }),
  });

  const approveSubscription = useMutation({
    mutationFn: async (notification: Notification) => {
      const meta = notification.metadata as Record<string, string>;
      const subscriptionId = meta?.subscription_id;
      const plan = meta?.plan;
      if (!subscriptionId) throw new Error("Sem ID de assinatura");

      const now = new Date();
      const end = new Date(now);
      if (plan === "anual") {
        end.setFullYear(end.getFullYear() + 1);
      } else {
        end.setMonth(end.getMonth() + 1);
      }

      const { error } = await supabase
        .from("pix_checkout_subscriptions")
        .update({
          status: "active",
          subscription_start: now.toISOString(),
          subscription_end: end.toISOString(),
          updated_at: now.toISOString(),
        })
        .eq("id", subscriptionId);

      if (error) throw error;

      await supabase
        .from("admin_notifications")
        .update({ is_read: true })
        .eq("id", notification.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
      toast.success("Assinatura ativada com sucesso!");
    },
    onError: () => toast.error("Erro ao ativar assinatura"),
  });

  const rejectSubscription = useMutation({
    mutationFn: async (notification: Notification) => {
      const meta = notification.metadata as Record<string, string>;
      const subscriptionId = meta?.subscription_id;
      if (subscriptionId) {
        await supabase
          .from("pix_checkout_subscriptions")
          .update({ status: "expired", updated_at: new Date().toISOString() })
          .eq("id", subscriptionId);
      }
      await supabase
        .from("admin_notifications")
        .update({ is_read: true })
        .eq("id", notification.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
      toast.success("Assinatura rejeitada.");
    },
  });

  return (
    <div className="mb-6">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 font-display text-xl font-bold text-foreground mb-3 hover:text-primary transition-colors"
      >
        <Bell className="w-5 h-5 text-primary" />
        Notificações
        {unreadCount > 0 && (
          <Badge variant="destructive" className="ml-1 animate-pulse">
            {unreadCount}
          </Badge>
        )}
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {expanded && (
        <div className="space-y-3">
          {!notifications || notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma notificação.</p>
          ) : (
            notifications.map((n) => {
              const meta = n.metadata as Record<string, string>;
              const isSubscription = n.type === "subscription";
              const isAdRequest = n.type === "ad_request";
              const isPending = isSubscription && !n.is_read;
              const Icon = isAdRequest ? Megaphone : CreditCard;

              return (
                <div
                  key={n.id}
                  className={`glass rounded-xl p-4 border transition-all ${
                    n.is_read
                      ? "border-border/50 opacity-60"
                      : isAdRequest
                      ? "border-accent/30 bg-accent/5"
                      : "border-primary/30 bg-primary/5"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${n.is_read ? "text-muted-foreground" : isAdRequest ? "text-accent" : "text-primary"}`} />
                      <div className="min-w-0">
                        <p className={`text-sm font-semibold ${n.is_read ? "text-muted-foreground" : "text-foreground"}`}>
                          {n.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 whitespace-pre-wrap">{n.message}</p>
                        {meta?.user_email && (
                          <p className="text-xs text-muted-foreground mt-1">
                            👤 {meta.user_email}
                          </p>
                        )}
                        {meta?.email && isAdRequest && (
                          <p className="text-xs text-muted-foreground mt-1">
                            📧 {meta.email} {meta.phone ? `| 📱 ${meta.phone}` : ""}
                          </p>
                        )}
                        {meta?.plan && (
                          <Badge variant="outline" className="mt-1 text-xs">
                            Plano {meta.plan === "anual" ? "Anual — R$ 79,90" : "Mensal — R$ 19,90"}
                          </Badge>
                        )}
                        {meta?.plan_price && isAdRequest && (
                          <Badge variant="outline" className="mt-1 text-xs">
                            {meta.plan_label} — {meta.plan_price}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {new Date(n.created_at).toLocaleDateString("pt-BR", {
                        day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
                      })}
                    </span>
                  </div>

                  {isPending && (
                    <div className="flex gap-2 mt-3 pt-3 border-t border-border/50">
                      <Button
                        size="sm"
                        className="gap-1 flex-1"
                        onClick={() => approveSubscription.mutate(n)}
                        disabled={approveSubscription.isPending}
                      >
                        <Check className="w-3.5 h-3.5" />
                        Aprovar (Pago)
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="gap-1 flex-1"
                        onClick={() => rejectSubscription.mutate(n)}
                        disabled={rejectSubscription.isPending}
                      >
                        <X className="w-3.5 h-3.5" />
                        Rejeitar
                      </Button>
                    </div>
                  )}

                  {!n.is_read && !isPending && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="mt-2 text-xs"
                      onClick={() => markRead.mutate(n.id)}
                    >
                      Marcar como lida
                    </Button>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
