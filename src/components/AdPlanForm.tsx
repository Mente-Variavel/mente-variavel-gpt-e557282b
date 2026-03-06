import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { generatePixPayload, generateTxId } from "@/lib/pixEmv";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { X, Megaphone, Loader2, FileText, QrCode } from "lucide-react";
import { Link } from "react-router-dom";
import type { SelectedPlan } from "@/pages/Anuncie";

interface AdPlanFormProps {
  plan: SelectedPlan;
  onClose: () => void;
}

export default function AdPlanForm({ plan, onClose }: AdPlanFormProps) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    companyName: "",
    cnpj: "",
    contactName: "",
    email: "",
    phone: "",
    website: "",
    segment: "",
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const isConsulta = !plan.priceNum;

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const isValid = form.companyName && form.contactName && form.email && form.phone && acceptedTerms;

  const handleSubmit = async () => {
    if (!isValid) {
      toast.error("Preencha todos os campos obrigatórios e aceite os termos.");
      return;
    }

    setLoading(true);
    try {
      // Save the ad request as a notification for admin
      await supabase.from("admin_notifications").insert({
        type: "ad_request",
        title: `Novo pedido de anúncio: ${plan.label}`,
        message: `Empresa: ${form.companyName} | Contato: ${form.contactName} | Email: ${form.email} | Tel: ${form.phone} | Site: ${form.website || "—"} | Segmento: ${form.segment || "—"} | Plano: ${plan.label} (${plan.price})`,
        metadata: {
          company_name: form.companyName,
          cnpj: form.cnpj,
          contact_name: form.contactName,
          email: form.email,
          phone: form.phone,
          website: form.website,
          segment: form.segment,
          plan_label: plan.label,
          plan_price: plan.price,
          plan_price_num: plan.priceNum,
        },
      });

      // If it's "sob consulta", just notify and show success
      if (isConsulta) {
        toast.success("Solicitação enviada! Entraremos em contato em breve.");
        onClose();
        setLoading(false);
        return;
      }

      // Fetch pix config
      const { data: settings } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", ["pix_key", "pix_receiver_name", "pix_receiver_city"]);

      const config: Record<string, string> = {};
      settings?.forEach((s) => { config[s.key] = s.value; });

      const pixKey = config.pix_key;
      const receiverName = config.pix_receiver_name || "MENTE VARIAVEL";
      const city = config.pix_receiver_city || "SAO PAULO";

      if (!pixKey) {
        toast.error("Configuração de pagamento não encontrada.");
        setLoading(false);
        return;
      }

      // Generate Pix payload
      const txid = generateTxId();
      const payload = generatePixPayload({
        chave: pixKey,
        nomeRecebedor: receiverName,
        cidade: city,
        valor: plan.priceNum,
        txid,
        descricao: `Anuncio ${plan.label.substring(0, 25)}`,
      });

      // Navigate to pix-checkout with pre-filled data
      const params = new URLSearchParams();
      params.set("pix_payload", payload);
      params.set("pix_mode", "manual");
      params.set("pix_key", pixKey);
      params.set("pix_name", receiverName);
      params.set("pix_amount", plan.priceNum);
      params.set("pix_desc", `Plano ${plan.label}`);

      navigate(`/pix-checkout?${params.toString()}`);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao processar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-primary/30 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />
      <CardContent className="pt-6 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Megaphone className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold text-foreground">Contratar Anúncio</h3>
            </div>
            <p className="text-sm text-muted-foreground">{plan.label}</p>
            <p className="text-xl font-bold text-primary mt-1">{plan.price}{plan.priceNum ? "/mês" : ""}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs">Nome da Empresa *</Label>
            <Input
              value={form.companyName}
              onChange={(e) => handleChange("companyName", e.target.value)}
              placeholder="Sua empresa"
              className="bg-secondary border-border"
            />
          </div>
          <div>
            <Label className="text-xs">CNPJ</Label>
            <Input
              value={form.cnpj}
              onChange={(e) => handleChange("cnpj", e.target.value)}
              placeholder="00.000.000/0000-00"
              className="bg-secondary border-border"
            />
          </div>
          <div>
            <Label className="text-xs">Nome do Responsável *</Label>
            <Input
              value={form.contactName}
              onChange={(e) => handleChange("contactName", e.target.value)}
              placeholder="Seu nome"
              className="bg-secondary border-border"
            />
          </div>
          <div>
            <Label className="text-xs">E-mail *</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="email@empresa.com"
              className="bg-secondary border-border"
            />
          </div>
          <div>
            <Label className="text-xs">Telefone / WhatsApp *</Label>
            <Input
              value={form.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              placeholder="(11) 99999-9999"
              className="bg-secondary border-border"
            />
          </div>
          <div>
            <Label className="text-xs">Site</Label>
            <Input
              value={form.website}
              onChange={(e) => handleChange("website", e.target.value)}
              placeholder="https://..."
              className="bg-secondary border-border"
            />
          </div>
          <div className="sm:col-span-2">
            <Label className="text-xs">Segmento de atuação</Label>
            <Input
              value={form.segment}
              onChange={(e) => handleChange("segment", e.target.value)}
              placeholder="Ex: Tecnologia, Marketing Digital, SaaS..."
              className="bg-secondary border-border"
            />
          </div>
        </div>

        {/* Terms */}
        <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50 border border-border">
          <Checkbox
            id="terms"
            checked={acceptedTerms}
            onCheckedChange={(v) => setAcceptedTerms(v === true)}
            className="mt-0.5"
          />
          <label htmlFor="terms" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
            Li e aceito os{" "}
            <Link to="/termos" className="text-primary hover:underline" target="_blank">
              Termos de Uso
            </Link>{" "}
            e a{" "}
            <Link to="/privacidade" className="text-primary hover:underline" target="_blank">
              Política de Privacidade
            </Link>
            . Declaro que as informações fornecidas são verdadeiras e autorizo o contato para fins de contratação do plano de anúncio selecionado.
          </label>
        </div>

        {/* Submit */}
        <Button
          onClick={handleSubmit}
          disabled={!isValid || loading}
          className="w-full gap-2 h-12 text-base font-semibold"
          size="lg"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : isConsulta ? (
            <FileText className="w-5 h-5" />
          ) : (
            <QrCode className="w-5 h-5" />
          )}
          {loading
            ? "Processando..."
            : isConsulta
            ? "Enviar solicitação para análise"
            : `Gerar Pix — ${plan.price}`}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          {isConsulta
            ? "Após o envio, nossa equipe entrará em contato para discutir os detalhes."
            : "Ao clicar, você será redirecionado para a tela de pagamento via Pix."}
        </p>
      </CardContent>
    </Card>
  );
}
