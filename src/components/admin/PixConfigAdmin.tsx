import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Save, Loader2, QrCode } from "lucide-react";

const PIX_KEYS = [
  { key: "pix_key", label: "Chave Pix *", placeholder: "email, CPF, telefone ou chave aleatória", required: true },
  { key: "pix_receiver_name", label: "Nome do Recebedor (máx. 25) *", placeholder: "Seu nome ou empresa", maxLength: 25, required: true },
  { key: "pix_receiver_city", label: "Cidade do Recebedor (máx. 15) *", placeholder: "SAO PAULO", maxLength: 15, required: true },
  { key: "pix_amount", label: "Valor (use ponto: 19.90)", placeholder: "19.90" },
  { key: "pix_description", label: "Descrição (opcional)", placeholder: "E-book Envelopamento" },
  { key: "pix_txid", label: "TXID / Identificador", placeholder: "EBOOK" },
];

export default function PixConfigAdmin() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", PIX_KEYS.map((k) => k.key));
      if (data) {
        const map: Record<string, string> = {};
        data.forEach((r) => { map[r.key] = r.value; });
        setValues(map);
      }
      setLoading(false);
    };
    fetch();
  }, []);

  const handleSave = async () => {
    // Validate required fields
    const requiredKeys = PIX_KEYS.filter(k => k.required);
    const missing = requiredKeys.filter(k => !values[k.key]?.trim());
    if (missing.length > 0) {
      toast.error(`Preencha os campos obrigatórios: ${missing.map(k => k.label.replace(' *', '')).join(', ')}`);
      return;
    }

    // Normalize amount: comma → dot
    const normalizedValues = { ...values };
    if (normalizedValues["pix_amount"]) {
      normalizedValues["pix_amount"] = normalizedValues["pix_amount"].replace(",", ".");
    }

    setSaving(true);
    try {
      for (const { key } of PIX_KEYS) {
        const val = normalizedValues[key] || "";
        await supabase
          .from("site_settings")
          .upsert({ key, value: val, updated_at: new Date().toISOString() }, { onConflict: "key" });
      }
      setValues(normalizedValues);
      toast.success("Configuração do Pix salva com sucesso!");
    } catch {
      toast.error("Erro ao salvar configuração.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="border-border/60">
      <CardContent className="pt-6 space-y-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <QrCode className="w-5 h-5 text-primary" />
          Configuração do Pix Checkout
        </h3>
        <p className="text-xs text-muted-foreground">
          Configure os dados reais do Pix para o checkout de pagamento. Esses dados são usados para gerar o QR Code e o código Copia e Cola.
        </p>

        {PIX_KEYS.map(({ key, label, placeholder, maxLength }) => (
          <div key={key}>
            <Label className="text-xs">{label}</Label>
            <Input
              value={values[key] || ""}
              onChange={(e) => setValues({ ...values, [key]: maxLength ? e.target.value.slice(0, maxLength) : e.target.value })}
              placeholder={placeholder}
              maxLength={maxLength}
            />
          </div>
        ))}

        <Button onClick={handleSave} disabled={saving} className="w-full gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Salvar Configuração do Pix
        </Button>
      </CardContent>
    </Card>
  );
}
