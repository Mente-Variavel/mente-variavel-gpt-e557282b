import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import PixConfigAdmin from "@/components/admin/PixConfigAdmin";
import VideoUploadAdmin from "@/components/admin/VideoUploadAdmin";
import AdminNotifications from "@/components/admin/AdminNotifications";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { LogIn, AlertTriangle, Clock, Plus, Sparkles, Trash2, Save, Mail, MailOpen, ChevronDown, ChevronUp, Users, Bug, BarChart3, Image, MessageSquare, DollarSign, Settings, Globe, Eye } from "lucide-react";

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

  const isLoading = false;

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
      const { data, error } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: registeredUsers } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // API Usage stats
  const { data: apiUsage } = useQuery({
    queryKey: ["admin-api-usage"],
    queryFn: async () => {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const { data, error } = await supabase
        .from("api_usage")
        .select("*")
        .gte("created_at", todayStart.toISOString())
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
    refetchInterval: 30_000,
  });
  const [visitorDays, setVisitorDays] = useState(7);

  // Visitor logs
  const { data: visitorLogs } = useQuery({
    queryKey: ["admin-visitor-logs", visitorDays],
    queryFn: async () => {
      const since = new Date();
      since.setDate(since.getDate() - visitorDays);
      const { data, error } = await supabase
        .from("visitor_logs")
        .select("*")
        .gte("created_at", since.toISOString())
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Google Analytics setting
  const { data: gaSettings } = useQuery({
    queryKey: ["site-settings-ga"],
    queryFn: async () => {
      const { data } = await supabase.from("site_settings").select("*").eq("key", "google_analytics_id").single();
      return data;
    },
    enabled: !!user,
  });

  const [gaId, setGaId] = useState("");
  useEffect(() => {
    if (gaSettings?.value) setGaId(gaSettings.value);
  }, [gaSettings]);

  const saveGaId = async () => {
    const { error } = await supabase.from("site_settings").upsert({ key: "google_analytics_id", value: gaId, updated_at: new Date().toISOString() });
    if (error) toast.error("Erro ao salvar");
    else toast.success("Google Analytics ID salvo!");
  };

  const markAsRead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("contact_messages").update({ is_read: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-contact-messages"] }),
  });

  const [showMessages, setShowMessages] = useState(true);
  const [showUsers, setShowUsers] = useState(false);
  const [showVisitors, setShowVisitors] = useState(false);
  const [showStats, setShowStats] = useState(true);
  const [showSettings, setShowSettings] = useState(true);
  const [expandedMessage, setExpandedMessage] = useState<string | null>(null);


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
            <LogIn className="w-4 h-4" /> Fazer login
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const expiringTools = sponsoredTools?.filter((t) => {
    const status = getAdStatus(t.plan_end);
    return status === "expiring" || status === "expired";
  }) || [];

  const allAlerts = [
    ...expiringTools.map((t) => ({ ...t, type: "tool" as const, label: t.client_name || t.name })),
  ];

  // Usage stats
  const usageByTool: Record<string, { count: number; cost: number }> = {};
  apiUsage?.forEach(u => {
    if (!usageByTool[u.tool]) usageByTool[u.tool] = { count: 0, cost: 0 };
    usageByTool[u.tool].count += u.request_count;
    usageByTool[u.tool].cost += Number(u.estimated_cost || 0);
  });
  const totalRequests = apiUsage?.length || 0;
  const totalCost = apiUsage?.reduce((sum, u) => sum + Number(u.estimated_cost || 0), 0) || 0;
  const imageCount = usageByTool["image_generation"]?.count || 0;

  const toolLabels: Record<string, string> = {
    chat: "Chat IA",
    image_generation: "Geração de Imagens",
    ai_generate: "Gerador IA (Prompts/Slides)",
    prompt_generator: "Criador de Prompt",
    slide_generator: "Gerador de Slides",
  };

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
        <div className="sm:col-span-2"><Label>Descrição ({value.description.length}/500)</Label><Textarea value={value.description} onChange={(e) => { if (e.target.value.length <= 500) onChange({ ...value, description: e.target.value }); }} placeholder="Breve descrição" rows={2} /></div>
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
            <Trash2 className="w-3.5 h-3.5" /> Excluir
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
          Painel Administrativo
        </h1>

        {/* === Notificações === */}
        <AdminNotifications />

        {/* === API Usage Stats === */}
        <div className="mb-6">
          <button
            onClick={() => setShowStats(!showStats)}
            className="flex items-center gap-2 font-display text-xl font-bold text-foreground mb-3 hover:text-primary transition-colors"
          >
            <BarChart3 className="w-5 h-5 text-primary" />
            Estatísticas de Uso (Hoje)
            {showStats ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {showStats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="glass rounded-xl p-4 border border-border/50 text-center">
                <Image className="w-6 h-6 mx-auto mb-1 text-primary" />
                <p className="text-2xl font-bold text-foreground">{imageCount}</p>
                <p className="text-xs text-muted-foreground">Imagens geradas</p>
              </div>
              <div className="glass rounded-xl p-4 border border-border/50 text-center">
                <MessageSquare className="w-6 h-6 mx-auto mb-1 text-primary" />
                <p className="text-2xl font-bold text-foreground">{totalRequests}</p>
                <p className="text-xs text-muted-foreground">Requisições IA</p>
              </div>
              <div className="glass rounded-xl p-4 border border-border/50 text-center">
                <DollarSign className="w-6 h-6 mx-auto mb-1 text-primary" />
                <p className="text-2xl font-bold text-foreground">US$ {totalCost.toFixed(3)}</p>
                <p className="text-xs text-muted-foreground">Custo estimado</p>
              </div>
              <div className="glass rounded-xl p-4 border border-border/50 text-center">
                <Users className="w-6 h-6 mx-auto mb-1 text-primary" />
                <p className="text-2xl font-bold text-foreground">{registeredUsers?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Usuários</p>
              </div>
            </div>
          )}
          {showStats && Object.keys(usageByTool).length > 0 && (
            <div className="glass rounded-xl p-4 border border-border/50 mb-4">
              <h4 className="text-sm font-semibold text-foreground mb-2">Custo por ferramenta (hoje)</h4>
              <div className="space-y-1">
                {Object.entries(usageByTool).map(([tool, stats]) => (
                  <div key={tool} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{toolLabels[tool] || tool}</span>
                    <span className="text-foreground font-medium">{stats.count} req · US$ {stats.cost.toFixed(4)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* === Settings === */}
        <div className="mb-6">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-2 font-display text-xl font-bold text-foreground mb-3 hover:text-primary transition-colors"
          >
            <Settings className="w-5 h-5 text-primary" />
            Configurações
            {showSettings ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {showSettings && (
            <div className="glass rounded-xl p-4 border border-border/50 space-y-3">
              <div>
                <Label className="text-sm">Google Analytics ID</Label>
                <div className="flex gap-2 mt-1">
                  <Input value={gaId} onChange={(e) => setGaId(e.target.value)} placeholder="G-XXXXXXXXXX" className="max-w-xs" />
                  <Button size="sm" onClick={saveGaId}>Salvar</Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">ID de acompanhamento GA4 para o site</p>
              </div>
            </div>
          )}
        </div>


        {/* === Alerts === */}
        {allAlerts.length > 0 && (
          <div className="mb-6 space-y-2">
            {allAlerts.map((item) => {
              const status = getAdStatus(item.plan_end);
              const isExpired = status === "expired";
              const daysLeft = item.plan_end
                ? Math.ceil((new Date(item.plan_end).getTime() - new Date().setHours(0,0,0,0)) / (1000*60*60*24))
                : 0;
              return (
                <div key={`alert-${item.id}`} className={`flex items-center gap-3 p-3 rounded-lg border ${isExpired ? "border-destructive/50 bg-destructive/10" : "border-yellow-500/50 bg-yellow-500/10"}`}>
                  {isExpired ? <AlertTriangle className="w-5 h-5 text-destructive shrink-0" /> : <Clock className="w-5 h-5 text-yellow-500 shrink-0" />}
                  <span className="text-sm flex-1">
                    {isExpired
                      ? `⚠️ Plano de "${item.label}" VENCIDO! ${item.type === "tool" ? "(Ferramenta)" : ""}`
                      : `⏰ Plano de "${item.label}" vence em ${daysLeft} dia${daysLeft !== 1 ? "s" : ""} ${item.type === "tool" ? "(Ferramenta)" : ""}`}
                  </span>
                  {item.whatsapp_number && (
                    <a
                      href={`https://wa.me/${item.whatsapp_number.replace(/\D/g, "")}?text=${encodeURIComponent(isExpired ? `Olá ${item.label}! Seu plano no MenteVariável venceu. Gostaria de renovar?` : `Olá ${item.label}! Seu plano vence em ${daysLeft} dia(s). Gostaria de renovar?`)}`}
                      target="_blank" rel="noopener noreferrer"
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

        {/* === Mensagens de Contato === */}
        <div className="mb-8">
          <button
            onClick={() => setShowMessages(!showMessages)}
            className="flex items-center gap-2 font-display text-xl font-bold text-foreground mb-4 hover:text-primary transition-colors"
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
                    className={`glass rounded-xl p-4 border cursor-pointer transition-all ${msg.is_read ? "border-border/50 opacity-70" : "border-primary/30 bg-primary/5"}`}
                    onClick={() => {
                      setExpandedMessage(expandedMessage === msg.id ? null : msg.id);
                      if (!msg.is_read) markAsRead.mutate(msg.id);
                    }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {msg.is_read ? <MailOpen className="w-4 h-4 text-muted-foreground shrink-0" /> : <Mail className="w-4 h-4 text-primary shrink-0" />}
                        <div className="min-w-0">
                          <span className={`text-sm font-semibold ${msg.is_read ? "text-muted-foreground" : "text-foreground"}`}>{msg.name}</span>
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
                        <a href={`mailto:${msg.email}?subject=Re: Contato MenteVariável`} className="inline-flex items-center gap-1 mt-3 text-xs text-primary hover:underline" onClick={(e) => e.stopPropagation()}>
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

        {/* === Usuários === */}
        <div className="mb-8">
          <button
            onClick={() => setShowUsers(!showUsers)}
            className="flex items-center gap-2 font-display text-xl font-bold text-foreground mb-4 hover:text-primary transition-colors"
          >
            <Users className="w-5 h-5 text-primary" />
            Usuários Cadastrados
            {registeredUsers && <Badge className="ml-2">{registeredUsers.length}</Badge>}
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

        {/* === Visitantes (Leads) === */}
        <div className="mb-8">
          <button
            onClick={() => setShowVisitors(!showVisitors)}
            className="flex items-center gap-2 font-display text-xl font-bold text-foreground mb-4 hover:text-primary transition-colors"
          >
            <Globe className="w-5 h-5 text-primary" />
            Visitantes / Leads
            {visitorLogs && <Badge className="ml-2">{visitorLogs.length}</Badge>}
            {showVisitors ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {showVisitors && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs text-muted-foreground">Período:</span>
                {[1, 7, 30].map((d) => (
                  <button
                    key={d}
                    onClick={() => setVisitorDays(d)}
                    className={`px-3 py-1 text-xs rounded-lg transition-colors ${visitorDays === d ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}
                  >
                    {d === 1 ? "Hoje" : `${d} dias`}
                  </button>
                ))}
              </div>

              {/* Summary cards */}
              {visitorLogs && visitorLogs.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                  <div className="glass rounded-xl p-3 border border-border/50 text-center">
                    <Eye className="w-5 h-5 mx-auto mb-1 text-primary" />
                    <p className="text-xl font-bold text-foreground">{visitorLogs.length}</p>
                    <p className="text-[10px] text-muted-foreground">Acessos</p>
                  </div>
                  <div className="glass rounded-xl p-3 border border-border/50 text-center">
                    <Users className="w-5 h-5 mx-auto mb-1 text-primary" />
                    <p className="text-xl font-bold text-foreground">
                      {new Set(visitorLogs.map((v: any) => v.ip_address)).size}
                    </p>
                    <p className="text-[10px] text-muted-foreground">IPs únicos</p>
                  </div>
                  <div className="glass rounded-xl p-3 border border-border/50 text-center">
                    <Globe className="w-5 h-5 mx-auto mb-1 text-primary" />
                    <p className="text-xl font-bold text-foreground">
                      {new Set(visitorLogs.map((v: any) => v.page)).size}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Páginas visitadas</p>
                  </div>
                </div>
              )}

              {!visitorLogs || visitorLogs.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum registro de visitante no período.</p>
              ) : (
                <div className="glass rounded-xl border border-border/50 overflow-hidden">
                  <div className="overflow-x-auto max-h-96 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-card">
                        <tr className="border-b border-border/50 bg-muted/30">
                          <th className="text-left px-4 py-3 font-medium text-muted-foreground">IP</th>
                          <th className="text-left px-4 py-3 font-medium text-muted-foreground">Página</th>
                          <th className="text-left px-4 py-3 font-medium text-muted-foreground">Dispositivo</th>
                          <th className="text-left px-4 py-3 font-medium text-muted-foreground">Data/Hora</th>
                        </tr>
                      </thead>
                      <tbody>
                        {visitorLogs.map((v: any) => {
                          const ua = v.user_agent || "";
                          const isMobile = /mobile|android|iphone/i.test(ua);
                          const browser = /chrome/i.test(ua) ? "Chrome" : /firefox/i.test(ua) ? "Firefox" : /safari/i.test(ua) ? "Safari" : /edge/i.test(ua) ? "Edge" : "Outro";
                          return (
                            <tr key={v.id} className="border-b border-border/30 last:border-0 hover:bg-muted/20 transition-colors">
                              <td className="px-4 py-2 text-foreground font-mono text-xs">{v.ip_address}</td>
                              <td className="px-4 py-2 text-muted-foreground text-xs max-w-[200px] truncate">{v.page}</td>
                              <td className="px-4 py-2 text-muted-foreground text-xs">
                                {isMobile ? "📱 Mobile" : "💻 Desktop"} · {browser}
                              </td>
                              <td className="px-4 py-2 text-muted-foreground text-xs whitespace-nowrap">
                                {new Date(v.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* === Ferramentas Patrocinadas === */}
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

        {/* Pix Checkout Config */}
        <div className="mt-10">
          <PixConfigAdmin />
        </div>

        {/* Video Upload */}
        <div className="mt-6">
          <VideoUploadAdmin />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminAds;
