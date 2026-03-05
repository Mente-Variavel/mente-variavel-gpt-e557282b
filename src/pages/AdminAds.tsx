import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdEditor from "@/components/admin/AdEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { LogIn, AlertTriangle, Clock, Plus, Sparkles, Trash2, Save, Mail, MailOpen, Eye, ChevronDown, ChevronUp, Users, Bug } from "lucide-react";

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

const emptyTool = {
  name: "", description: "", url: "", icon_url: "", client_name: "",
  plan_type: "mensal", plan_start: "", plan_end: "", plan_value: "",
  display_order: "0", whatsapp_number: "", is_active: false,
};

const AdminAds = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: ads, isLoading } = useQuery({
    queryKey: ["admin-ads"],
    queryFn: async () => {
      const { data, error } = await supabase.from("ads").select("*").order("slot");
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: sponsoredTools, isLoading: toolsLoading } = useQuery({
    queryKey: ["admin-sponsored-tools"],
    queryFn: async () => {
      const { data, error } = await supabase.from("sponsored_tools").select("*").order("display_order");
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: contactMessages } = useQuery({
    queryKey: ["admin-contact-messages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const markAsRead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("contact_messages").update({ is_read: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-contact-messages"] }),
  });

  const [showMessages, setShowMessages] = useState(true);
  const [showUsers, setShowUsers] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [expandedMessage, setExpandedMessage] = useState<string | null>(null);

  const { data: registeredUsers } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
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
      ad_format: string; placement: string;
      page_targets: string[];
    }) => {
      const { error } = await supabase.from("ads").update({
        title: ad.title, description: ad.description, image_url: ad.image_url,
        link_url: ad.link_url, whatsapp_number: ad.whatsapp_number, is_active: ad.is_active,
        plan_name: ad.plan_name || null, plan_start: ad.plan_start || null,
        plan_end: ad.plan_end || null, plan_value: ad.plan_value ? parseFloat(ad.plan_value) : null,
        client_name: ad.client_name || null,
        ad_format: ad.ad_format, placement: ad.placement,
        page_targets: ad.page_targets,
      }).eq("id", ad.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-ads"] });
      queryClient.invalidateQueries({ queryKey: ["ads-by-placement"] });
      toast.success("Anúncio salvo com sucesso!");
    },
    onError: () => toast.error("Erro ao salvar anúncio"),
  });

  // Sponsored tools mutations
  const saveTool = useMutation({
    mutationFn: async (tool: typeof emptyTool & { id?: string }) => {
      const payload = {
        name: tool.name, description: tool.description, url: tool.url,
        icon_url: tool.icon_url || null, client_name: tool.client_name || null,
        plan_type: tool.plan_type, plan_start: tool.plan_start || null,
        plan_end: tool.plan_end || null,
        plan_value: tool.plan_value ? parseFloat(tool.plan_value) : null,
        display_order: parseInt(tool.display_order) || 0,
        whatsapp_number: tool.whatsapp_number || null,
        is_active: tool.is_active,
      };
      if (tool.id) {
        const { error } = await supabase.from("sponsored_tools").update(payload).eq("id", tool.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("sponsored_tools").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-sponsored-tools"] });
      queryClient.invalidateQueries({ queryKey: ["sponsored-tools"] });
      toast.success("Ferramenta patrocinada salva!");
    },
    onError: () => toast.error("Erro ao salvar ferramenta"),
  });

  const deleteTool = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("sponsored_tools").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-sponsored-tools"] });
      queryClient.invalidateQueries({ queryKey: ["sponsored-tools"] });
      toast.success("Ferramenta removida!");
    },
    onError: () => toast.error("Erro ao remover ferramenta"),
  });

  const [newTool, setNewTool] = useState(emptyTool);
  const [editingTools, setEditingTools] = useState<Record<string, typeof emptyTool>>({});

  useEffect(() => {
    if (sponsoredTools) {
      const map: Record<string, typeof emptyTool> = {};
      sponsoredTools.forEach((t) => {
        map[t.id] = {
          name: t.name, description: t.description, url: t.url,
          icon_url: t.icon_url || "", client_name: t.client_name || "",
          plan_type: t.plan_type, plan_start: t.plan_start || "",
          plan_end: t.plan_end || "", plan_value: t.plan_value?.toString() || "",
          display_order: t.display_order?.toString() || "0",
          whatsapp_number: t.whatsapp_number || "", is_active: t.is_active,
        };
      });
      setEditingTools(map);
    }
  }, [sponsoredTools]);

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

  const expiringTools = sponsoredTools?.filter((t) => {
    const status = getAdStatus(t.plan_end);
    return status === "expiring" || status === "expired";
  }) || [];

  const allAlerts = [
    ...expiringAds.map((ad) => ({ ...ad, type: "ad" as const, label: ad.client_name || ad.title || ad.slot })),
    ...expiringTools.map((t) => ({ ...t, type: "tool" as const, label: t.client_name || t.name })),
  ];

  // Debug info
  const activeAds = ads?.filter(a => a.is_active) || [];
  const placementCounts: Record<string, number> = {};
  activeAds.forEach(a => {
    placementCounts[a.placement] = (placementCounts[a.placement] || 0) + 1;
  });

  const ToolForm = ({ value, onChange, onSave, onDelete, saving }: {
    value: typeof emptyTool;
    onChange: (v: typeof emptyTool) => void;
    onSave: () => void;
    onDelete?: () => void;
    saving: boolean;
  }) => (
    <div className="glass rounded-xl p-5 border border-border/50 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div><Label>Nome da ferramenta</Label><Input value={value.name} onChange={(e) => onChange({ ...value, name: e.target.value })} /></div>
        <div><Label>URL</Label><Input value={value.url} onChange={(e) => onChange({ ...value, url: e.target.value })} /></div>
        <div className="sm:col-span-2"><Label>Descrição ({value.description.length}/500 caracteres)</Label><Textarea value={value.description} onChange={(e) => { if (e.target.value.length <= 500) onChange({ ...value, description: e.target.value }); }} placeholder="Breve descrição (máx. 500 caracteres)" rows={2} /></div>
        <div><Label>URL do Ícone</Label><Input value={value.icon_url} onChange={(e) => onChange({ ...value, icon_url: e.target.value })} placeholder="https://..." /></div>
        <div><Label>Nome do cliente</Label><Input value={value.client_name} onChange={(e) => onChange({ ...value, client_name: e.target.value })} /></div>
        <div><Label>WhatsApp</Label><Input value={value.whatsapp_number} onChange={(e) => onChange({ ...value, whatsapp_number: e.target.value })} placeholder="5511999999999" /></div>
        <div>
          <Label>Tipo de plano</Label>
          <Select value={value.plan_type} onValueChange={(v) => onChange({ ...value, plan_type: v, plan_end: v === "vitalicio" ? "" : value.plan_end })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="mensal">Mensal</SelectItem>
              <SelectItem value="vitalicio">Vitalício</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div><Label>Início do plano</Label><Input type="date" value={value.plan_start} onChange={(e) => onChange({ ...value, plan_start: e.target.value })} /></div>
        {value.plan_type !== "vitalicio" && (
          <div><Label>Fim do plano</Label><Input type="date" value={value.plan_end} onChange={(e) => onChange({ ...value, plan_end: e.target.value })} /></div>
        )}
        <div><Label>Valor (R$)</Label><Input type="number" value={value.plan_value} onChange={(e) => onChange({ ...value, plan_value: e.target.value })} /></div>
        <div><Label>Ordem de exibição</Label><Input type="number" value={value.display_order} onChange={(e) => onChange({ ...value, display_order: e.target.value })} /></div>
        <div className="flex items-center gap-2 pt-5">
          <Switch checked={value.is_active} onCheckedChange={(v) => onChange({ ...value, is_active: v })} />
          <Label>{value.is_active ? "Ativo" : "Inativo"}</Label>
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        {onDelete && (
          <Button variant="destructive" size="sm" onClick={onDelete} className="gap-1">
            <Trash2 className="w-3.5 h-3.5" /> Remover
          </Button>
        )}
        <Button size="sm" onClick={onSave} disabled={saving || !value.name || !value.url} className="gap-1">
          <Save className="w-3.5 h-3.5" /> Salvar
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 pt-20 container mx-auto px-4 py-8">
        <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
          Gerenciar Anúncios
        </h1>

        {/* Debug Panel */}
        <div className="mb-6">
          <button
            onClick={() => setShowDebug(!showDebug)}
            className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-primary transition-colors mb-2"
          >
            <Bug className="w-3.5 h-3.5" />
            Debug / Diagnóstico
            {showDebug ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          {showDebug && (
            <div className="p-4 rounded-lg border border-border/50 bg-card/30 text-xs space-y-2">
              <p><strong>Total de anúncios:</strong> {ads?.length || 0}</p>
              <p><strong>Anúncios ativos:</strong> {activeAds.length}</p>
              <p><strong>Por posição:</strong></p>
              {Object.entries(placementCounts).map(([k, v]) => (
                <p key={k} className="ml-4">• {k}: {v} anúncio(s)</p>
              ))}
              {activeAds.length === 0 && (
                <p className="text-yellow-500">⚠ Nenhum anúncio ativo. Ative pelo menos um para exibir no site.</p>
              )}
              {activeAds.map(ad => {
                const targets = (ad as any).page_targets as string[] || [];
                return (
                  <div key={ad.id} className="ml-4 border-l-2 border-primary/30 pl-3 py-1">
                    <p>✅ <strong>{ad.client_name || ad.title || ad.slot}</strong></p>
                    <p className="text-muted-foreground">Posição: {ad.placement} | Formato: {ad.ad_format} | Páginas: {targets.length === 0 ? "todas (padrão)" : targets.join(", ")}</p>
                  </div>
                );
              })}
              {ads?.filter(a => !a.is_active).map(ad => (
                <div key={ad.id} className="ml-4 border-l-2 border-muted/30 pl-3 py-1 opacity-50">
                  <p>❌ <strong>{ad.client_name || ad.title || ad.slot}</strong> — desativado</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Contact Messages Section */}
        <div className="mb-8">
          <button
            onClick={() => setShowMessages(!showMessages)}
            className="flex items-center gap-2 font-display text-xl md:text-2xl font-bold text-foreground mb-4 hover:text-primary transition-colors"
          >
            <Mail className="w-5 h-5 text-primary" />
            Mensagens de Contato
            {contactMessages && contactMessages.filter((m) => !m.is_read).length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {contactMessages.filter((m) => !m.is_read).length} nova{contactMessages.filter((m) => !m.is_read).length !== 1 ? "s" : ""}
              </Badge>
            )}
            {showMessages ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showMessages && (
            <div className="space-y-3">
              {!contactMessages || contactMessages.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma mensagem recebida.</p>
              ) : (
                contactMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`glass rounded-xl p-4 border cursor-pointer transition-all ${
                      msg.is_read ? "border-border/50 opacity-70" : "border-primary/30 bg-primary/5"
                    }`}
                    onClick={() => {
                      setExpandedMessage(expandedMessage === msg.id ? null : msg.id);
                      if (!msg.is_read) markAsRead.mutate(msg.id);
                    }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {msg.is_read ? (
                          <MailOpen className="w-4 h-4 text-muted-foreground shrink-0" />
                        ) : (
                          <Mail className="w-4 h-4 text-primary shrink-0" />
                        )}
                        <div className="min-w-0">
                          <span className={`text-sm font-semibold ${msg.is_read ? "text-muted-foreground" : "text-foreground"}`}>
                            {msg.name}
                          </span>
                          <span className="text-xs text-muted-foreground ml-2">{msg.email}</span>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {new Date(msg.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    {expandedMessage === msg.id && (
                      <div className="mt-3 pt-3 border-t border-border/50">
                        <p className="text-sm text-foreground whitespace-pre-wrap">{msg.message}</p>
                        <a
                          href={`mailto:${msg.email}?subject=Re: Contato MenteVariável`}
                          className="inline-flex items-center gap-1 mt-3 text-xs text-primary hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Mail className="w-3 h-3" /> Responder por e-mail
                        </a>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Registered Users Section */}
        <div className="mb-8">
          <button
            onClick={() => setShowUsers(!showUsers)}
            className="flex items-center gap-2 font-display text-xl md:text-2xl font-bold text-foreground mb-4 hover:text-primary transition-colors"
          >
            <Users className="w-5 h-5 text-primary" />
            Usuários Cadastrados
            {registeredUsers && (
              <Badge className="ml-2">{registeredUsers.length}</Badge>
            )}
            {showUsers ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showUsers && (
            <div className="space-y-3">
              {!registeredUsers || registeredUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum usuário cadastrado.</p>
              ) : (
                <div className="glass rounded-xl border border-border/50 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border/50 bg-muted/30">
                          <th className="text-left px-4 py-3 font-medium text-muted-foreground">Nome</th>
                          <th className="text-left px-4 py-3 font-medium text-muted-foreground">Email</th>
                          <th className="text-left px-4 py-3 font-medium text-muted-foreground">Cadastro</th>
                        </tr>
                      </thead>
                      <tbody>
                        {registeredUsers.map((u) => (
                          <tr key={u.id} className="border-b border-border/30 last:border-0 hover:bg-muted/20 transition-colors">
                            <td className="px-4 py-3 text-foreground">{u.full_name || "—"}</td>
                            <td className="px-4 py-3 text-muted-foreground">{u.email || "—"}</td>
                            <td className="px-4 py-3 text-muted-foreground">
                              {new Date(u.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {allAlerts.length > 0 && (
          <div className="mb-6 space-y-2">
            {allAlerts.map((item) => {
              const status = getAdStatus(item.plan_end);
              const isExpired = status === "expired";
              const daysLeft = item.plan_end
                ? Math.ceil((new Date(item.plan_end).getTime() - new Date().setHours(0,0,0,0)) / (1000*60*60*24))
                : 0;
              return (
                <div
                  key={`alert-${item.id}`}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    isExpired ? "border-destructive/50 bg-destructive/10" : "border-yellow-500/50 bg-yellow-500/10"
                  }`}
                >
                  {isExpired ? <AlertTriangle className="w-5 h-5 text-destructive shrink-0" /> : <Clock className="w-5 h-5 text-yellow-500 shrink-0" />}
                  <span className="text-sm flex-1">
                    {isExpired
                      ? `⚠️ Plano de "${item.label}" VENCIDO! ${item.type === "tool" ? "(Ferramenta)" : ""}`
                      : `⏰ Plano de "${item.label}" vence em ${daysLeft} dia${daysLeft !== 1 ? "s" : ""} ${item.type === "tool" ? "(Ferramenta)" : ""}`}
                  </span>
                  {item.whatsapp_number && (
                    <a
                      href={`https://wa.me/${item.whatsapp_number.replace(/\D/g, "")}?text=${encodeURIComponent(
                        isExpired
                          ? `Olá ${item.label}! Seu plano no MenteVariável venceu. Gostaria de renovar?`
                          : `Olá ${item.label}! Seu plano no MenteVariável vence em ${daysLeft} dia${daysLeft !== 1 ? "s" : ""}. Gostaria de renovar?`
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

        {/* Ads Section */}
        <div className="grid gap-6 mb-12">
          {ads?.map((ad) => (
            <AdEditor
              key={ad.id}
              ad={{
                ...ad,
                page_targets: (ad as any).page_targets || [],
              }}
              label={ad.client_name || ad.title || ad.slot}
              planStatus={getAdStatus(ad.plan_end)}
              onSave={(updated) => updateMutation.mutate({ ...updated, id: ad.id })}
              saving={updateMutation.isPending}
            />
          ))}
        </div>

        {/* Sponsored Tools Section */}
        <h2 className="font-display text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Ferramentas Patrocinadas
        </h2>

        <div className="grid gap-6 mb-8">
          {sponsoredTools?.map((tool) => {
            const val = editingTools[tool.id];
            if (!val) return null;
            return (
              <ToolForm
                key={tool.id}
                value={val}
                onChange={(v) => setEditingTools((prev) => ({ ...prev, [tool.id]: v }))}
                onSave={() => saveTool.mutate({ ...val, id: tool.id })}
                onDelete={() => { if (confirm("Remover esta ferramenta patrocinada?")) deleteTool.mutate(tool.id); }}
                saving={saveTool.isPending}
              />
            );
          })}
        </div>

        {/* Add New Tool */}
        <div className="mb-8">
          <h3 className="font-display text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <Plus className="w-4 h-4" /> Adicionar nova ferramenta patrocinada
          </h3>
          <ToolForm
            value={newTool}
            onChange={setNewTool}
            onSave={() => { saveTool.mutate(newTool); setNewTool(emptyTool); }}
            saving={saveTool.isPending}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminAds;
