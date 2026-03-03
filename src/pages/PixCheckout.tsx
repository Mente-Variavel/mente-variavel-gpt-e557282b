import { useState } from "react";
import { motion } from "framer-motion";
import { CreditCard, Copy, Share2, QrCode, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";

export default function PixCheckout() {
  const [nome, setNome] = useState("");
  const [chave, setChave] = useState("");
  const [valor, setValor] = useState("");
  const [qrImage, setQrImage] = useState<string | null>(null);

  const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setQrImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const copyChave = () => {
    if (!chave) { toast.error("Insira uma chave Pix."); return; }
    navigator.clipboard.writeText(chave);
    toast.success("Chave Pix copiada!");
  };

  const shareLink = () => {
    const text = `💰 Pagamento via Pix\nRecebedor: ${nome}\nChave: ${chave}${valor ? `\nValor: R$ ${valor}` : ""}\n\nCopie a chave acima e pague pelo app do seu banco.`;
    if (navigator.share) {
      navigator.share({ title: "Pagamento Pix", text });
    } else {
      navigator.clipboard.writeText(text);
      toast.success("Link copiado para compartilhar!");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-lg">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-bold mb-2">Pix Checkout</h1>
            <p className="text-muted-foreground mb-8">Gere cobranças via Pix de forma profissional.</p>
          </motion.div>

          <Card>
            <CardContent className="pt-6 space-y-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Nome do recebedor</label>
                <Input value={nome} onChange={e => setNome(e.target.value)} placeholder="Seu nome ou empresa" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Chave Pix</label>
                <Input value={chave} onChange={e => setChave(e.target.value)} placeholder="CPF, e-mail, telefone ou chave aleatória" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Valor (opcional)</label>
                <Input type="number" value={valor} onChange={e => setValor(e.target.value)} placeholder="0,00" />
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">QR Code (upload opcional)</label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border cursor-pointer hover:bg-secondary/50 transition-colors text-sm">
                    <Upload className="w-4 h-4" /> Enviar QR
                    <input type="file" accept="image/*" onChange={handleQrUpload} className="hidden" />
                  </label>
                  {qrImage && <span className="text-xs text-accent">✓ QR enviado</span>}
                </div>
              </div>

              {qrImage && (
                <div className="flex justify-center p-4">
                  <img src={qrImage} alt="QR Code Pix" className="max-w-48 rounded-xl border border-border" />
                </div>
              )}

              {(nome || chave) && (
                <div className="p-5 rounded-xl bg-card border border-border/50">
                  <div className="text-center mb-4">
                    <CreditCard className="w-8 h-8 mx-auto text-primary mb-2" />
                    <p className="font-semibold">{nome || "Recebedor"}</p>
                    {valor && <p className="text-2xl font-bold text-primary mt-1">R$ {parseFloat(valor).toFixed(2)}</p>}
                  </div>
                  <div className="bg-secondary/50 rounded-lg p-3 text-center mb-4">
                    <p className="text-xs text-muted-foreground mb-1">Chave Pix</p>
                    <p className="font-mono text-sm break-all">{chave}</p>
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={copyChave} className="flex-1"><Copy className="w-4 h-4 mr-2" /> Copiar Chave</Button>
                    <Button variant="outline" onClick={shareLink}><Share2 className="w-4 h-4 mr-2" /> Compartilhar</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
