import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { QrCode, Copy, CheckCircle, ChevronDown, ChevronUp, ShieldCheck, Loader2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { generatePixPayload } from "@/lib/pixEmv";
import { supabase } from "@/integrations/supabase/client";
import logoMv from "@/assets/logo-mv.png";
import PixAccessGate from "@/components/PixAccessGate";

interface PixConfig {
  pixKey: string;
  receiverName: string;
  receiverCity: string;
  amount: string;
  description: string;
  txid: string;
}

export default function PixCheckout() {
  const [copied, setCopied] = useState(false);
  const [showDiag, setShowDiag] = useState(false);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<PixConfig>({
    pixKey: "", receiverName: "", receiverCity: "", amount: "", description: "", txid: "EBOOK",
  });

  useEffect(() => {
    const fetchConfig = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", ["pix_key", "pix_receiver_name", "pix_receiver_city", "pix_amount", "pix_description", "pix_txid"]);

      if (data) {
        const map: Record<string, string> = {};
        data.forEach((r) => { map[r.key] = r.value; });
        setConfig({
          pixKey: map["pix_key"] || "",
          receiverName: map["pix_receiver_name"] || "",
          receiverCity: map["pix_receiver_city"] || "",
          amount: (map["pix_amount"] || "").replace(",", "."),
          description: map["pix_description"] || "",
          txid: map["pix_txid"] || "EBOOK",
        });
      }
      setLoading(false);
    };
    fetchConfig();
  }, []);

  const isConfigured = !!(config.pixKey && config.receiverName && config.receiverCity);

  const pixPayload = useMemo(() => {
    if (!isConfigured) return null;
    try {
      return generatePixPayload({
        chave: config.pixKey,
        nomeRecebedor: config.receiverName,
        cidade: config.receiverCity,
        valor: config.amount || undefined,
        descricao: config.description || undefined,
        txid: config.txid || undefined,
      });
    } catch {
      return null;
    }
  }, [isConfigured, config]);

  const crcValue = useMemo(() => {
    if (!pixPayload) return null;
    return pixPayload.slice(-4);
  }, [pixPayload]);

  const handleCopy = () => {
    if (!pixPayload) return;
    navigator.clipboard.writeText(pixPayload);
    setCopied(true);
    toast.success("Pix copiado com sucesso!");
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 pt-24 pb-16 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-lg">
          <PixAccessGate>
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-3">
              <img src={logoMv} alt="Mente Variável" className="w-10 h-10 rounded-full" />
              <h1 className="text-2xl md:text-3xl font-bold font-[Orbitron]">
                Pagamento via <span className="text-primary">Pix</span>
              </h1>
            </div>
            {config.amount && parseFloat(config.amount) > 0 && (
              <p className="text-3xl font-bold text-primary mt-2">
                R$ {parseFloat(config.amount).toFixed(2)}
              </p>
            )}
            {config.description && (
              <p className="text-muted-foreground text-sm mt-1">{config.description}</p>
            )}
          </motion.div>

          {!isConfigured ? (
            <Card className="border-destructive/50">
              <CardContent className="pt-6 text-center">
                <p className="text-destructive font-semibold">⚠️ Pix não configurado</p>
                <p className="text-muted-foreground text-sm mt-2">
                  O administrador precisa configurar os dados do Pix no painel administrativo.
                </p>
                <ul className="text-xs text-muted-foreground mt-3 space-y-1">
                  {!config.pixKey && <li>❌ Chave Pix não definida</li>}
                  {!config.receiverName && <li>❌ Nome do recebedor não definido</li>}
                  {!config.receiverCity && <li>❌ Cidade do recebedor não definida</li>}
                </ul>
              </CardContent>
            </Card>
          ) : pixPayload ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="border-primary/30">
                <CardContent className="pt-6">
                  {/* QR Code */}
                  <div className="flex flex-col items-center mb-6">
                    <div className="p-4 bg-white rounded-xl border border-border mb-3">
                      <QRCodeSVG value={pixPayload} size={260} level="M" includeMargin={false} />
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <QrCode className="w-3.5 h-3.5" />
                      Escaneie o QR Code com o app do seu banco
                    </div>
                  </div>

                  {/* Pix Copia e Cola */}
                  <div className="bg-secondary/50 rounded-lg p-3 mb-4">
                    <p className="text-xs text-muted-foreground mb-1.5 text-center font-medium">Pix Copia e Cola</p>
                    <textarea
                      readOnly
                      value={pixPayload}
                      rows={3}
                      className="w-full bg-transparent font-mono text-xs break-all text-center resize-none focus:outline-none text-foreground leading-relaxed"
                    />
                  </div>

                  {/* Copy button */}
                  <Button onClick={handleCopy} className="w-full gap-2 mb-6" size="lg">
                    {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? "Copiado!" : "Copiar Pix Copia e Cola"}
                  </Button>

                  {/* Instructions */}
                  <div className="border-t border-border pt-5">
                    <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-primary" />
                      Como pagar
                    </p>
                    <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                      <li>Abra o app do seu banco e escolha <strong className="text-foreground">Pagar com Pix</strong>.</li>
                      <li>Aponte a câmera para o QR Code ou copie o código Pix.</li>
                      <li>Confirme o pagamento e aguarde a validação.</li>
                    </ol>
                  </div>

                  {/* Diagnóstico */}
                  <div className="mt-5 border-t border-border pt-4">
                    <button
                      onClick={() => setShowDiag(!showDiag)}
                      className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors w-full"
                    >
                      {showDiag ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      Diagnóstico
                    </button>
                    {showDiag && (
                      <div className="mt-3 space-y-2 text-xs">
                        <div>
                          <p className="text-muted-foreground mb-1">Payload completo:</p>
                          <pre className="bg-secondary/50 rounded p-2 font-mono break-all whitespace-pre-wrap text-foreground">{pixPayload}</pre>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">CRC16:</p>
                          <code className="bg-secondary/50 rounded px-2 py-1 font-mono text-foreground">{crcValue}</code>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">Tamanho:</p>
                          <code className="bg-secondary/50 rounded px-2 py-1 font-mono text-foreground">{pixPayload.length} chars</code>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : null}
          </PixAccessGate>
        </div>
      </main>
      <Footer />
    </div>
  );
}
