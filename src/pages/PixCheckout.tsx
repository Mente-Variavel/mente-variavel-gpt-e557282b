import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { QrCode, Copy, Trash2, CheckCircle, Zap, Lock, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { generatePixPayload } from "@/lib/pixEmv";
import logoMv from "@/assets/logo-mv.png";

type PixKeyType = "cpf" | "cnpj" | "email" | "telefone" | "evp";

const keyPlaceholder: Record<PixKeyType, string> = {
  cpf: "000.000.000-00",
  cnpj: "00.000.000/0000-00",
  email: "email@exemplo.com",
  telefone: "+5511999999999",
  evp: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
};

export default function PixCheckout() {
  const [chave, setChave] = useState(() => localStorage.getItem("mv_pix_chave") || "");
  const [keyType, setKeyType] = useState<PixKeyType>(() => (localStorage.getItem("mv_pix_keyType") as PixKeyType) || "evp");
  const [nome, setNome] = useState(() => localStorage.getItem("mv_pix_nome") || "");
  const [chaveLocked, setChaveLocked] = useState(() => !!localStorage.getItem("mv_pix_chave"));
  const [nomeLocked, setNomeLocked] = useState(() => !!localStorage.getItem("mv_pix_nome"));
  const [cidade, setCidade] = useState("");
  const [valor, setValor] = useState("");
  const [descricao, setDescricao] = useState("");
  const [generated, setGenerated] = useState(false);
  const [copied, setCopied] = useState(false);

  const toggleChaveLock = () => {
    if (chaveLocked) {
      localStorage.removeItem("mv_pix_chave");
      localStorage.removeItem("mv_pix_keyType");
      setChaveLocked(false);
      toast("Chave Pix desafixada.");
    } else {
      if (!chave.trim()) { toast.error("Preencha a chave antes de fixar."); return; }
      localStorage.setItem("mv_pix_chave", chave);
      localStorage.setItem("mv_pix_keyType", keyType);
      setChaveLocked(true);
      toast.success("Chave Pix fixada!");
    }
  };

  const toggleNomeLock = () => {
    if (nomeLocked) {
      localStorage.removeItem("mv_pix_nome");
      setNomeLocked(false);
      toast("Nome desafixado.");
    } else {
      if (!nome.trim()) { toast.error("Preencha o nome antes de fixar."); return; }
      localStorage.setItem("mv_pix_nome", nome);
      setNomeLocked(true);
      toast.success("Nome fixado!");
    }
  };

  const pixPayload = useMemo(() => {
    if (!generated || !chave || !nome) return null;
    try {
      return generatePixPayload({
        chave: chave.trim(),
        nomeRecebedor: nome.trim(),
        cidade: (cidade.trim() || "SAO PAULO"),
        valor: valor || undefined,
        descricao: descricao || undefined,
      });
    } catch {
      return null;
    }
  }, [generated, chave, nome, cidade, valor, descricao]);

  const qrCodeUrl = useMemo(() => {
    if (!pixPayload) return null;
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(pixPayload)}&margin=10`;
  }, [pixPayload]);

  const handleGenerate = () => {
    if (!chave.trim()) { toast.error("Insira a chave Pix."); return; }
    if (!nome.trim()) { toast.error("Insira o nome do recebedor."); return; }
    setGenerated(true);
    toast.success("Pix gerado com sucesso!");
  };

  const handleCopy = () => {
    if (!pixPayload) return;
    navigator.clipboard.writeText(pixPayload);
    setCopied(true);
    toast.success("Pix Copia e Cola copiado!");
    setTimeout(() => setCopied(false), 2500);
  };

  const handleClear = () => {
    if (!chaveLocked) setChave("");
    if (!nomeLocked) setNome("");
    setCidade("");
    setValor("");
    setDescricao("");
    setGenerated(false);
    setCopied(false);
    toast("Campos limpos.");
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
                Gerador de <span className="text-primary">Pix</span>
              </h1>
            </div>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Gere um Pix Copia e Cola e um QR Code válido para receber pagamentos. Funciona com aplicativos de bancos no Brasil.
            </p>
          </motion.div>

          {/* Form */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border-border/60">
              <CardContent className="pt-6 space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Tipo de chave</label>
                  <Select value={keyType} onValueChange={(v) => { setKeyType(v as PixKeyType); setGenerated(false); }}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cpf">CPF</SelectItem>
                      <SelectItem value="cnpj">CNPJ</SelectItem>
                      <SelectItem value="email">E-mail</SelectItem>
                      <SelectItem value="telefone">Telefone</SelectItem>
                      <SelectItem value="evp">Chave aleatória (EVP)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Chave Pix *</label>
                  <div className="flex gap-2">
                    <Input
                      value={chave}
                      onChange={e => { setChave(e.target.value); setGenerated(false); }}
                      placeholder={keyPlaceholder[keyType]}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant={chaveLocked ? "default" : "outline"}
                      onClick={toggleChaveLock}
                      title={chaveLocked ? "Desafixar chave" : "Fixar chave para uso recorrente"}
                    >
                      {chaveLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Nome do recebedor * (máx. 25 caracteres)</label>
                  <div className="flex gap-2">
                    <Input
                      value={nome}
                      onChange={e => { setNome(e.target.value.slice(0, 25)); setGenerated(false); }}
                      placeholder="Seu nome ou empresa"
                      maxLength={25}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant={nomeLocked ? "default" : "outline"}
                      onClick={toggleNomeLock}
                      title={nomeLocked ? "Desafixar nome" : "Fixar nome para uso recorrente"}
                    >
                      {nomeLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Cidade (máx. 15 caracteres)</label>
                  <Input
                    value={cidade}
                    onChange={e => { setCidade(e.target.value.slice(0, 15)); setGenerated(false); }}
                    placeholder="São Paulo"
                    maxLength={15}
                  />
                </div>

                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Valor (opcional)</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={valor}
                    onChange={e => { setValor(e.target.value); setGenerated(false); }}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Descrição / Identificador (opcional)</label>
                  <Input
                    value={descricao}
                    onChange={e => { setDescricao(e.target.value.slice(0, 25)); setGenerated(false); }}
                    placeholder="Ex: pedido123"
                    maxLength={25}
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                  <Button onClick={handleGenerate} className="flex-1 gap-2">
                    <Zap className="w-4 h-4" /> Gerar Pix
                  </Button>
                  <Button onClick={handleClear} variant="outline" className="gap-2">
                    <Trash2 className="w-4 h-4" /> Limpar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Result */}
          {pixPayload && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
              <Card className="border-primary/30">
                <CardContent className="pt-6">
                  <div className="text-center mb-5">
                    <QrCode className="w-7 h-7 mx-auto text-primary mb-2" />
                    <p className="font-semibold text-lg">{nome}</p>
                    {valor && parseFloat(valor) > 0 && (
                      <p className="text-2xl font-bold text-primary mt-1">
                        R$ {parseFloat(valor).toFixed(2)}
                      </p>
                    )}
                  </div>

                  {/* QR Code */}
                  {qrCodeUrl && (
                    <div className="flex flex-col items-center mb-5">
                      <div className="p-3 bg-white rounded-xl border border-border mb-2">
                        <img src={qrCodeUrl} alt="QR Code Pix" className="w-52 h-52" />
                      </div>
                      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <QrCode className="w-3.5 h-3.5" />
                        Escaneie o QR Code com o app do seu banco
                      </p>
                    </div>
                  )}

                  {/* Pix Copia e Cola */}
                  <div className="bg-secondary/50 rounded-lg p-3 mb-4">
                    <p className="text-xs text-muted-foreground mb-1 text-center">Pix Copia e Cola</p>
                    <p className="font-mono text-xs break-all text-center select-all leading-relaxed">
                      {pixPayload}
                    </p>
                  </div>

                  <Button onClick={handleCopy} className="w-full gap-2">
                    {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? "Copiado!" : "Copiar Pix Copia e Cola"}
                  </Button>
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
