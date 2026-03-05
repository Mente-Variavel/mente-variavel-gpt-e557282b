import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Save, Upload, X, Image, AlertTriangle, Clock, CheckCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const SLOT_PRICES: Record<string, number> = {
  ferramentas_topo: 189.90,
  ferramentas_rodape: 99.90,
  blog_topo: 169.90,
  blog_inline: 129.90,
  blog_sidebar: 109.90,
  blog_rodape: 89.90,
  guias_topo: 159.90,
  guias_inline: 119.90,
  guias_rodape: 89.90,
  banner_top: 189.90,
  inline_1: 129.90,
  footer: 89.90,
};

const PLAN_OPTIONS = [
  { value: "mensal", label: "Mensal", multiplier: 1 },
  { value: "trimestral", label: "Trimestral (3 meses)", multiplier: 3 },
  { value: "semestral", label: "Semestral (6 meses)", multiplier: 6 },
  { value: "anual", label: "Anual (12 meses)", multiplier: 12 },
  { value: "vitalicio", label: "Vitalício", fixedPrice: 3499.90 },
];

const AD_FORMATS = [
  { value: "horizontal", label: "Banner Horizontal", desc: "Recomendado: 1200×300px" },
  { value: "square", label: "Anúncio Quadrado", desc: "Recomendado: 1080×1080px" },
  { value: "vertical", label: "Vertical / Stories", desc: "Recomendado: 1080×1350px" },
];

const PLACEMENTS = [
  { value: "banner_top", label: "🔝 Topo da página" },
  { value: "middle", label: "📄 Meio do conteúdo" },
  { value: "sidebar", label: "📎 Barra lateral" },
  { value: "tools", label: "🛠️ Página de Ferramentas" },
  { value: "footer", label: "🔻 Rodapé" },
];

interface AdEditorProps {
  ad: {
    id: string;
    slot: string;
    title: string;
    description: string | null;
    image_url: string | null;
    link_url: string | null;
    whatsapp_number: string | null;
    is_active: boolean;
    plan_name: string | null;
    plan_start: string | null;
    plan_end: string | null;
    plan_value: number | null;
    client_name: string | null;
    ad_format?: string;
    placement?: string;
  };
  label: string;
  planStatus: "active" | "expiring" | "expired" | null;
  onSave: (data: {
    title: string; description: string; image_url: string; link_url: string;
    whatsapp_number: string; is_active: boolean;
    plan_name: string; plan_start: string; plan_end: string;
    plan_value: string; client_name: string;
    ad_format: string; placement: string;
  }) => void;
  saving: boolean;
}

const statusBadge = {
  active: { icon: CheckCircle, text: "Plano ativo", className: "text-green-500" },
  expiring: { icon: Clock, text: "Vencendo", className: "text-yellow-500" },
  expired: { icon: AlertTriangle, text: "Vencido", className: "text-destructive" },
};

const AdEditor = ({ ad, label, planStatus, onSave, saving }: AdEditorProps) => {
  const [title, setTitle] = useState(ad.title || "");
  const [description, setDescription] = useState(ad.description || "");
  const [imageUrl, setImageUrl] = useState(ad.image_url || "");
  const [linkUrl, setLinkUrl] = useState(ad.link_url || "");
  const [whatsappNumber, setWhatsappNumber] = useState(ad.whatsapp_number || "");
  const [isActive, setIsActive] = useState(ad.is_active);
  const [planName, setPlanName] = useState(ad.plan_name || "");
  const [planStart, setPlanStart] = useState(ad.plan_start || "");
  const [planEnd, setPlanEnd] = useState(ad.plan_end || "");
  const [planValue, setPlanValue] = useState(ad.plan_value?.toString() || "");
  const [clientName, setClientName] = useState(ad.client_name || "");
  const [adFormat, setAdFormat] = useState(ad.ad_format || "horizontal");
  const [placement, setPlacement] = useState(ad.placement || "banner_top");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTitle(ad.title || "");
    setDescription(ad.description || "");
    setImageUrl(ad.image_url || "");
    setLinkUrl(ad.link_url || "");
    setWhatsappNumber(ad.whatsapp_number || "");
    setIsActive(ad.is_active);
    setPlanName(ad.plan_name || "");
    setPlanStart(ad.plan_start || "");
    setPlanEnd(ad.plan_end || "");
    setPlanValue(ad.plan_value?.toString() || "");
    setClientName(ad.client_name || "");
    setAdFormat(ad.ad_format || "horizontal");
    setPlacement(ad.placement || "banner_top");
  }, [ad]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Selecione um arquivo de imagem"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Imagem deve ter no máximo 5MB"); return; }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const fileName = `${ad.slot}-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("ad-images").upload(fileName, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from("ad-images").getPublicUrl(fileName);
      setImageUrl(publicUrl);
      toast.success("Imagem enviada com sucesso!");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao enviar imagem");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const badge = planStatus ? statusBadge[planStatus] : null;
  const selectedFormat = AD_FORMATS.find(f => f.value === adFormat);

  return (
    <div className={`glass rounded-xl p-6 ${planStatus === "expired" ? "ring-2 ring-destructive/30" : planStatus === "expiring" ? "ring-2 ring-yellow-500/30" : ""}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="font-display text-lg font-bold text-foreground">{label}</h3>
          {badge && (
            <span className={`flex items-center gap-1 text-xs font-medium ${badge.className}`}>
              <badge.icon className="w-3.5 h-3.5" />
              {badge.text}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor={`active-${ad.id}`} className="text-sm text-muted-foreground">Ativo</Label>
          <Switch id={`active-${ad.id}`} checked={isActive} onCheckedChange={setIsActive} />
        </div>
      </div>

      {/* Format & Placement */}
      <div className="mb-4 p-4 rounded-lg border border-primary/20 bg-primary/5">
        <h4 className="text-sm font-semibold text-foreground mb-3">🎨 Formato e Posição</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs text-muted-foreground">Formato do Anúncio</Label>
            <Select value={adFormat} onValueChange={setAdFormat}>
              <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {AD_FORMATS.map(f => (
                  <SelectItem key={f.value} value={f.value}>
                    {f.label} — <span className="text-muted-foreground">{f.desc}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedFormat && (
              <p className="text-xs text-muted-foreground mt-1">📐 {selectedFormat.desc}</p>
            )}
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Onde exibir</Label>
            <Select value={placement} onValueChange={setPlacement}>
              <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {PLACEMENTS.map(p => (
                  <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Plan section */}
      <div className="mb-4 p-4 rounded-lg border border-border/50 bg-card/30">
        <h4 className="text-sm font-semibold text-foreground mb-3">📋 Dados do Plano</h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground">Cliente</Label>
            <Input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Nome do cliente" className="text-sm" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Plano</Label>
            <Select
              value={planName}
              onValueChange={(val) => {
                setPlanName(val);
                const plan = PLAN_OPTIONS.find(p => p.value === val);
                if (plan) {
                  if ('fixedPrice' in plan && plan.fixedPrice) {
                    setPlanValue(plan.fixedPrice.toFixed(2));
                  } else if ('multiplier' in plan) {
                    const basePrice = SLOT_PRICES[ad.slot] || 0;
                    if (basePrice > 0) {
                      setPlanValue((basePrice * (plan as any).multiplier).toFixed(2));
                    }
                  }
                }
              }}
            >
              <SelectTrigger className="text-sm"><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {PLAN_OPTIONS.map(p => (
                  <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Início</Label>
            <Input type="date" value={planStart} onChange={(e) => setPlanStart(e.target.value)} className="text-sm" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Vencimento</Label>
            {planName === "vitalicio" ? (
              <Input type="text" value="Sem vencimento" disabled className="text-sm bg-muted" />
            ) : (
              <Input type="date" value={planEnd} onChange={(e) => setPlanEnd(e.target.value)} className="text-sm" />
            )}
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Valor (R$)</Label>
            <Input type="number" step="0.01" value={planValue} onChange={(e) => setPlanValue(e.target.value)} placeholder="0,00" className="text-sm" />
          </div>
        </div>
      </div>

      {/* Ad content section */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div>
            <Label className="text-sm text-muted-foreground">Título do anúncio</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Empresa XYZ" />
          </div>
          <div>
            <Label className="text-sm text-muted-foreground">Descrição curta ({description.length}/500 caracteres)</Label>
            <Textarea value={description} onChange={(e) => { if (e.target.value.length <= 500) setDescription(e.target.value); }} placeholder="Breve descrição (máx. 500 caracteres)" rows={2} />
          </div>
          <div>
            <Label className="text-sm text-muted-foreground">Link de destino</Label>
            <Input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://empresa.com.br" />
          </div>
          <div>
            <Label className="text-sm text-muted-foreground">WhatsApp (com DDD, ex: 5511999999999)</Label>
            <Input value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} placeholder="5511999999999" />
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <Label className="text-sm text-muted-foreground">Imagem do anúncio</Label>
            <div className="space-y-2">
              {imageUrl ? (
                <div className="relative rounded-lg overflow-hidden border border-border/50 bg-card/50">
                  <img src={imageUrl} alt="Preview" className="w-full h-40 object-contain" />
                  <button onClick={() => setImageUrl("")} className="absolute top-2 right-2 p-1 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="w-full h-40 rounded-lg border-2 border-dashed border-border/50 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                  <Image className="w-8 h-8" />
                  <span className="text-xs">{selectedFormat?.desc || "Recomendado: 1080x1080px"}</span>
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              <Button type="button" variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="w-full gap-2">
                <Upload className="w-4 h-4" />
                {uploading ? "Enviando..." : "Enviar imagem"}
              </Button>
              <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="Ou cole a URL da imagem" className="text-xs" />
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-end mt-4">
        <Button
          onClick={() => onSave({
            title, description, image_url: imageUrl, link_url: linkUrl,
            whatsapp_number: whatsappNumber, is_active: isActive,
            plan_name: planName, plan_start: planStart,
            plan_end: planName === "vitalicio" ? "" : planEnd,
            plan_value: planValue, client_name: clientName,
            ad_format: adFormat, placement,
          })}
          disabled={saving}
          className="gap-2"
        >
          <Save className="w-4 h-4" />
          Salvar
        </Button>
      </div>
    </div>
  );
};

export default AdEditor;
