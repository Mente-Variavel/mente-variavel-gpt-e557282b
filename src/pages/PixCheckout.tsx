import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { CreditCard, Copy, Share2, QrCode, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";

type PixKeyType = "cpf" | "cnpj" | "email" | "telefone" | "aleatoria";

function generatePixPayload(chave: string, nome: string, valor: string, cidade: string = "SAO PAULO"): string {
  // Simplified EMV QR Code for Pix static
  const pad = (id: string, val: string) => `${id}${val.length.toString().padStart(2, "0")}${val}`;

  const gui = pad("00", "br.gov.bcb.pix");
  const pixKey = pad("01", chave);
  const mai = pad("26", gui + pixKey);

  const mcc = pad("52", "0000");
  const currency = pad("53", "986");
  const valorField = valor && parseFloat(valor) > 0 ? pad("54", parseFloat(valor).toFixed(2)) : "";
  const country = pad("58", "BR");
  const merchantName = pad("59", nome.substring(0, 25).toUpperCase());
  const merchantCity = pad("60", cidade.substring(0, 15).toUpperCase());

  const payload = pad("00", "01") + mai + mcc + currency + valorField + country + merchantName + merchantCity;

  // CRC16 placeholder — add "6304" then compute
  const forCrc = payload + "6304";
  const crc = crc16(forCrc);
  return forCrc.slice(0, -4) + pad("63", crc);
}

function crc16(str: string): string {
  let crc = 0xFFFF;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) crc = (crc << 1) ^ 0x1021;
      else crc <<= 1;
    }
    crc &= 0xFFFF;
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

export default function PixCheckout() {
  const [nome, setNome] = useState("");
  const [chave, setChave] = useState("");
  const [keyType, setKeyType] = useState<PixKeyType>("aleatoria");
  const [valor, setValor] = useState("");
  const [cidade, setCidade] = useState("");
  const [copied, setCopied] = useState(false);

  const pixPayload = useMemo(() => {
    if (!chave || !nome) return null;
    try {
      return generatePixPayload(chave, nome, valor, cidade || "SAO PAULO");
    } catch {
      return null;
    }
  }, [chave, nome, valor, cidade]);

  const qrCodeUrl = useMemo(() => {
    if (!pixPayload) return null;
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(pixPayload)}`;
  }, [pixPayload]);

  const copyChave = () => {
    if (!chave) { toast.error("Insira uma chave Pix."); return; }
    navigator.clipboard.writeText(chave);
    toast.success("Chave Pix copiada!");
  };

  const copyPayload = () => {
    if (!pixPayload) return;
    navigator.clipboard.writeText(pixPayload);
    setCopied(true);
    toast.success("Código Pix Copia e Cola copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLink = () => {
    const text = `💰 Pagamento via Pix\nRecebedor: ${nome}\nChave: ${chave}${valor ? `\nValor: R$ ${parseFloat(valor).toFixed(2)}` : ""}\n\nCopie a chave acima e pague pelo app do seu banco.`;
    if (navigator.share) {
      navigator.share({ title: "Pagamento Pix", text });
    } else {
      navigator.clipboard.writeText(text);
      toast.success("Dados copiados para compartilhar!");
    }
  };

  const keyPlaceholder: Record<PixKeyType, string> = {
    cpf: "000.000.000-00",
    cnpj: "00.000.000/0000-00",
    email: "email@exemplo.com",
    telefone: "+5511999999999",
    aleatoria: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-lg">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-bold mb-2">Pix Checkout</h1>
            <p className="text-muted-foreground mb-8">Gere cobranças via Pix com QR Code automático.</p>
          </motion.div>

          <Card>
            <CardContent className="pt-6 space-y-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Nome do recebedor *</label>
                <Input value={nome} onChange={e => setNome(e.target.value)} placeholder="Seu nome ou empresa" />
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Tipo de chave</label>
                <Select value={keyType} onValueChange={(v) => setKeyType(v as PixKeyType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cpf">CPF</SelectItem>
                    <SelectItem value="cnpj">CNPJ</SelectItem>
                    <SelectItem value="email">E-mail</SelectItem>
                    <SelectItem value="telefone">Telefone</SelectItem>
                    <SelectItem value="aleatoria">Chave aleatória</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Chave Pix *</label>
                <Input value={chave} onChange={e => setChave(e.target.value)} placeholder={keyPlaceholder[keyType]} />
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Valor (opcional)</label>
                <Input type="number" min="0" step="0.01" value={valor} onChange={e => setValor(e.target.value)} placeholder="0.00" />
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Cidade (opcional)</label>
                <Input value={cidade} onChange={e => setCidade(e.target.value)} placeholder="São Paulo" />
              </div>
            </CardContent>
          </Card>

          {/* Preview da cobrança */}
          {nome && chave && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center mb-5">
                    <CreditCard className="w-8 h-8 mx-auto text-primary mb-2" />
                    <p className="font-semibold text-lg">{nome}</p>
                    {valor && parseFloat(valor) > 0 && (
                      <p className="text-2xl font-bold text-primary mt-1">R$ {parseFloat(valor).toFixed(2)}</p>
                    )}
                  </div>

                  {/* QR Code automático */}
                  {qrCodeUrl && (
                    <div className="flex flex-col items-center mb-5">
                      <div className="p-3 bg-white rounded-xl border border-border mb-2">
                        <img src={qrCodeUrl} alt="QR Code Pix" className="w-48 h-48" />
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <QrCode className="w-3.5 h-3.5" />
                        Escaneie o QR Code com o app do seu banco
                      </div>
                    </div>
                  )}

                  {/* Chave Pix */}
                  <div className="bg-secondary/50 rounded-lg p-3 text-center mb-4">
                    <p className="text-xs text-muted-foreground mb-1">Chave Pix ({keyType.toUpperCase()})</p>
                    <p className="font-mono text-sm break-all">{chave}</p>
                  </div>

                  {/* Botões */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <Button onClick={copyChave} variant="outline" className="gap-2">
                      <Copy className="w-4 h-4" /> Copiar Chave
                    </Button>
                    <Button onClick={shareLink} variant="outline" className="gap-2">
                      <Share2 className="w-4 h-4" /> Compartilhar
                    </Button>
                  </div>

                  {pixPayload && (
                    <Button onClick={copyPayload} className="w-full gap-2">
                      {copied ? <CheckCircle className="w-4 h-4" /> : <QrCode className="w-4 h-4" />}
                      {copied ? "Copiado!" : "Copiar Pix Copia e Cola"}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
