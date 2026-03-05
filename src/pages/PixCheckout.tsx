import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { QrCode, Copy, CheckCircle, ChevronDown, ChevronUp, ShieldCheck } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { generatePixPayload } from "@/lib/pixEmv";
import { PIX_CONFIG } from "@/lib/pixConfig";
import logoMv from "@/assets/logo-mv.png";

export default function PixCheckout() {
  const [copied, setCopied] = useState(false);
  const [showDiag, setShowDiag] = useState(false);

  const isConfigured =
    PIX_CONFIG.PIX_KEY !== "COLOCAR_AQUI" &&
    PIX_CONFIG.RECEIVER_NAME !== "COLOCAR_AQUI" &&
    PIX_CONFIG.RECEIVER_CITY !== "COLOCAR_AQUI";

  const pixPayload = useMemo(() => {
    if (!isConfigured) return null;
    try {
      return generatePixPayload({
        chave: PIX_CONFIG.PIX_KEY,
        nomeRecebedor: PIX_CONFIG.RECEIVER_NAME,
        cidade: PIX_CONFIG.RECEIVER_CITY,
        valor: PIX_CONFIG.AMOUNT || undefined,
        descricao: PIX_CONFIG.DESCRIPTION || undefined,
        txid: PIX_CONFIG.TXID || undefined,
      });
    } catch {
      return null;
    }
  }, [isConfigured]);

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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-lg">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-3">
              <img src={logoMv} alt="Mente Variável" className="w-10 h-10 rounded-full" />
              <h1 className="text-2xl md:text-3xl font-bold font-[Orbitron]">
                Pagamento via <span className="text-primary">Pix</span>
              </h1>
            </div>
            {PIX_CONFIG.AMOUNT && (
              <p className="text-3xl font-bold text-primary mt-2">
                R$ {parseFloat(PIX_CONFIG.AMOUNT).toFixed(2)}
              </p>
            )}
            {PIX_CONFIG.DESCRIPTION && (
              <p className="text-muted-foreground text-sm mt-1">{PIX_CONFIG.DESCRIPTION}</p>
            )}
          </motion.div>

          {!isConfigured ? (
            <Card className="border-destructive/50">
              <CardContent className="pt-6 text-center">
                <p className="text-destructive font-semibold">⚠️ Pix não configurado</p>
                <p className="text-muted-foreground text-sm mt-2">
                  O proprietário precisa editar <code className="text-xs bg-secondary px-1 py-0.5 rounded">src/lib/pixConfig.ts</code> com os dados reais.
                </p>
              </CardContent>
            </Card>
          ) : pixPayload ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="border-primary/30">
                <CardContent className="pt-6">
                  {/* QR Code */}
                  <div className="flex flex-col items-center mb-6">
                    <div className="p-4 bg-white rounded-xl border border-border mb-3">
                      <QRCodeSVG
                        value={pixPayload}
                        size={260}
                        level="M"
                        includeMargin={false}
                      />
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

                  {/* Diagnóstico (collapsible, owner-facing) */}
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
                          <pre className="bg-secondary/50 rounded p-2 font-mono break-all whitespace-pre-wrap text-foreground">
                            {pixPayload}
                          </pre>
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
        </div>
      </main>
      <Footer />
    </div>
  );
}
