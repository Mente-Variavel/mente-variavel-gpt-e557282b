import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { generatePixPayload, formatCurrency, generateTxId } from "@/lib/pixEmv";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Check, QrCode, ArrowLeft, Lock, Key, FileText, Share2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PixAccessGate from "@/components/PixAccessGate";
import logoMv from "@/assets/logo-mv.png";

function sanitizeBrCode(raw: string): string {
  return raw.replace(/[\r\n\t\u00A0\u200B\u200C\u200D\uFEFF]+/g, "").trim();
}

export default function PixCheckout() {
  const navigate = useNavigate();
  const isFromPlan = useRef(false);
  const [step, setStep] = useState<"form" | "qr">("form");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [pixKey, setPixKey] = useState("");
  const [merchantName, setMerchantName] = useState("");
  const [merchantCity] = useState("SAO PAULO");
  const [payload, setPayload] = useState("");
  const [qrKey, setQrKey] = useState(0); // Incremented each generation to force fresh QR
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [brCodeRaw, setBrCodeRaw] = useState("");
  const [useBrCode, setUseBrCode] = useState(false);

  // Locks
  const [lockPixKey, setLockPixKey] = useState(false);
  const [lockName, setLockName] = useState(false);

  const sanitizedBrCode = useMemo(() => sanitizeBrCode(brCodeRaw), [brCodeRaw]);
  const brCodeValid = sanitizedBrCode.length >= 20 && sanitizedBrCode.startsWith("000201") && sanitizedBrCode.includes("6304");

  const buildShareUrl = () => {
    const baseUrl = `${window.location.origin}/pix-checkout`;
    if (step !== "qr" || !payload) return baseUrl;

    const params = new URLSearchParams();
    params.set("pix_payload", payload);
    params.set("pix_mode", useBrCode ? "br" : "manual");

    if (!useBrCode) {
      if (pixKey) params.set("pix_key", pixKey);
      if (merchantName) params.set("pix_name", merchantName);
      if (amount) params.set("pix_amount", amount);
      if (description) params.set("pix_desc", description);
    }

    return `${baseUrl}?${params.toString()}`;
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedPayload = params.get("pix_payload");
    if (!sharedPayload) return;

    const payloadLooksValid = sharedPayload.startsWith("000201") && sharedPayload.includes("6304");
    if (!payloadLooksValid) return;

    const sharedMode = params.get("pix_mode");
    const isBrMode = sharedMode === "br";

    const desc = params.get("pix_desc") ?? "";
    if (desc.includes("Plano")) {
      isFromPlan.current = true;
    }

    setUseBrCode(isBrMode);
    setPayload(sharedPayload);
    setQrKey(1);
    setStep("qr");

    if (isBrMode) {
      setBrCodeRaw(sharedPayload);
      return;
    }

    setPixKey(params.get("pix_key") ?? "");
    setMerchantName(params.get("pix_name") ?? "");
    setAmount(params.get("pix_amount") ?? "");
    setDescription(desc);
  }, []);

  const handleSharePage = async () => {
    const shareUrl = buildShareUrl();
    try {
      if (navigator.share) {
        await navigator.share({ title: "Pix Checkout", url: shareUrl });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Link copiado!");
      }
    } catch { /* user cancelled */ }
  };

  const handleShareKey = async () => {
    if (!pixKey) return;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Chave Pix", text: `Chave Pix: ${pixKey}` });
      } else {
        await navigator.clipboard.writeText(pixKey);
        toast.success("Chave copiada!");
      }
    } catch { /* user cancelled */ }
  };

  // Generation ID for debugging
  const [generationId, setGenerationId] = useState(0);

  const handleGenerate = () => {
    // Full reset of previous generation state
    setPayload("");
    setCopiedPayload(false);
    setCopiedKey(false);

    const newGenId = Date.now();
    setGenerationId(newGenId);
    console.log("[PixCheckout] New generation started, ID:", newGenId);

    if (useBrCode) {
      if (!brCodeRaw.trim()) {
        toast.error("Cole o código Pix Copia e Cola");
        return;
      }
      if (!brCodeValid) {
        toast.error("Código Pix inválido. Cole o Pix Copia e Cola completo (BR Code).");
        return;
      }
      const freshPayload = sanitizedBrCode;
      console.log("[PixCheckout] BR Code payload:", freshPayload);
      console.log("[PixCheckout] QR generation input (BR):", freshPayload);

      setQrKey(newGenId);
      setPayload(freshPayload);
    } else {
      if (!pixKey) {
        toast.error("Informe a chave Pix");
        return;
      }

      const numAmount = parseFloat(amount.replace(",", "."));
      if (amount && (isNaN(numAmount) || numAmount <= 0)) {
        toast.error("Valor inválido");
        return;
      }

      // Build brand new payload from scratch
      const txid = generateTxId();
      console.log("[PixCheckout] Fresh TXID:", txid);

      const freshPayload = generatePixPayload({
        chave: pixKey,
        nomeRecebedor: merchantName || "RECEBEDOR",
        cidade: merchantCity,
        valor: numAmount ? numAmount.toFixed(2) : undefined,
        txid,
        descricao: description || undefined,
      });

      console.log("[PixCheckout] Payload before CRC (approx):", freshPayload.slice(0, -8));
      console.log("[PixCheckout] Final payload with CRC:", freshPayload);
      console.log("[PixCheckout] QR generation input:", freshPayload);

      setQrKey(newGenId);
      setPayload(freshPayload);
    }

    console.log("[PixCheckout] Generation complete, ID:", newGenId);
    setStep("qr");
  };

  const handleCopyPayload = async () => {
    try {
      await navigator.clipboard.writeText(payload);
      setCopiedPayload(true);
      toast.success("Pix copiado com sucesso!");
      setTimeout(() => setCopiedPayload(false), 2000);
    } catch {
      toast.error("Erro ao copiar. Tente manualmente.");
    }
  };

  const handleCopyKey = async () => {
    try {
      await navigator.clipboard.writeText(pixKey);
      setCopiedKey(true);
      toast.success("Chave Pix copiada!");
      setTimeout(() => setCopiedKey(false), 2000);
    } catch {
      toast.error("Erro ao copiar. Tente manualmente.");
    }
  };

  const handleReset = () => {
    setStep("form");
    setPayload("");
    setQrKey(0);
    if (!useBrCode) {
      setAmount("");
      setDescription("");
    }
    setCopiedPayload(false);
    setCopiedKey(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-24 pb-16 flex items-center justify-center px-4">
        <PixAccessGate>
          <div className="w-full max-w-md">
            {/* Header */}
            <div className="flex flex-col items-center mb-8">
              <img src={logoMv} alt="Mente Variável" className="w-16 h-16 rounded-full mb-4" />
              <h1 className="text-2xl font-bold font-[Orbitron]">
                Pix <span className="text-primary">Checkout</span>
              </h1>
              <p className="text-muted-foreground text-sm mt-1">Pagamento instantâneo via QR Code</p>
            </div>

            {/* Card */}
            <div className="bg-card rounded-xl p-6 border border-border shadow-lg">
              {step === "form" ? (
                <div className="space-y-5">
                  {/* Toggle: Gerar ou Colar */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-secondary border border-border">
                    <Label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-primary" />
                      Usar Copia e Cola pronto
                    </Label>
                    <Switch checked={useBrCode} onCheckedChange={setUseBrCode} />
                  </div>

                  {useBrCode ? (
                    <div className="space-y-2">
                      <Label htmlFor="brCode" className="text-sm font-medium text-foreground">
                        Pix Copia e Cola (BR Code)
                      </Label>
                      <Textarea
                        id="brCode"
                        placeholder="Cole aqui o código Pix Copia e Cola completo..."
                        value={brCodeRaw}
                        onChange={(e) => setBrCodeRaw(e.target.value)}
                        className="bg-secondary border-border focus:ring-primary font-mono text-xs min-h-[100px]"
                      />
                      {brCodeRaw && !brCodeValid && (
                        <p className="text-destructive text-xs">
                          Código inválido. Cole o Pix Copia e Cola completo (deve começar com 000201).
                        </p>
                      )}
                    </div>
                  ) : (
                    <>
                      {/* Chave Pix */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="pixKey" className="text-sm font-medium text-foreground">
                            Chave Pix
                          </Label>
                          <div className="flex items-center gap-2">
                            <Lock className={`h-3 w-3 ${lockPixKey ? "text-primary" : "text-muted-foreground"}`} />
                            <span className="text-xs text-muted-foreground">Fixar</span>
                            <Switch checked={lockPixKey} onCheckedChange={setLockPixKey} className="scale-75" />
                          </div>
                        </div>
                        <Input
                          id="pixKey"
                          placeholder="CPF, e-mail, telefone ou chave aleatória"
                          value={pixKey}
                          onChange={(e) => setPixKey(e.target.value)}
                          disabled={lockPixKey && !!pixKey}
                          className="bg-secondary border-border focus:ring-primary"
                        />
                      </div>

                      {/* Nome do Recebedor */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="merchantName" className="text-sm font-medium text-foreground">
                            Nome do Recebedor
                          </Label>
                          <div className="flex items-center gap-2">
                            <Lock className={`h-3 w-3 ${lockName ? "text-primary" : "text-muted-foreground"}`} />
                            <span className="text-xs text-muted-foreground">Fixar</span>
                            <Switch checked={lockName} onCheckedChange={setLockName} className="scale-75" />
                          </div>
                        </div>
                        <Input
                          id="merchantName"
                          placeholder="Nome que aparecerá no Pix"
                          value={merchantName}
                          onChange={(e) => setMerchantName(e.target.value)}
                          disabled={lockName && !!merchantName}
                          className="bg-secondary border-border focus:ring-primary"
                        />
                      </div>

                      {/* Valor */}
                      <div className="space-y-2">
                        <Label htmlFor="amount" className="text-sm font-medium text-foreground">
                          Valor (R$)
                        </Label>
                        <Input
                          id="amount"
                          placeholder="0,00 (opcional)"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="bg-secondary border-border focus:ring-primary font-mono"
                        />
                      </div>

                      {/* Descrição */}
                      <div className="space-y-2">
                        <Label htmlFor="description" className="text-sm font-medium text-foreground">
                          Descrição
                        </Label>
                        <Input
                          id="description"
                          placeholder="Ex: Pagamento serviço (opcional)"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="bg-secondary border-border focus:ring-primary"
                          maxLength={50}
                        />
                      </div>
                    </>
                  )}

                  <Button onClick={handleGenerate} className="w-full font-semibold h-12 text-base gap-2" size="lg">
                    <QrCode className="h-5 w-5" />
                    Gerar QR Code Pix
                  </Button>
                </div>
              ) : (
                <div className="space-y-5">
                  <button
                    onClick={() => {
                      if (isFromPlan.current) {
                        navigate("/produtos/pix-checkout");
                      } else {
                        handleReset();
                      }
                    }}
                    className="flex items-center text-muted-foreground hover:text-foreground text-sm transition-colors"
                  >
                    <ArrowLeft className="mr-1 h-4 w-4" />
                    {isFromPlan.current ? "Voltar para planos" : "Voltar"}
                  </button>

                  {!useBrCode && amount && (
                    <div className="text-center">
                      <p className="text-muted-foreground text-sm">Valor a pagar</p>
                      <p className="text-3xl font-bold text-primary font-mono">
                        {formatCurrency(parseFloat(amount.replace(",", ".")))}
                      </p>
                    </div>
                  )}

                  {!useBrCode && description && (
                    <p className="text-center text-sm text-muted-foreground">{description}</p>
                  )}

                  {/* QR Code — key forces complete remount on every generation */}
                  <div className="flex justify-center">
                    <div className="bg-white p-4 rounded-xl">
                      <QRCodeSVG key={qrKey} value={payload} size={220} level="M" includeMargin={false} />
                    </div>
                  </div>

                  {/* Chave Pix Tradicional */}
                  {!useBrCode && pixKey && (
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground flex items-center gap-1.5">
                        <Key className="h-3.5 w-3.5" />
                        Chave Pix
                      </Label>
                      <div className="relative">
                        <input
                          readOnly
                          value={pixKey}
                          className="w-full bg-secondary text-foreground text-sm font-mono p-3 pr-12 rounded-lg border border-border"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={handleCopyKey}
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-primary hover:text-primary"
                        >
                          {copiedKey ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Pix Copia e Cola */}
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground flex items-center gap-1.5">
                      <QrCode className="h-3.5 w-3.5" />
                      Pix Copia e Cola
                    </Label>
                    <div className="relative">
                      <input
                        readOnly
                        value={payload}
                        className="w-full bg-secondary text-foreground text-xs font-mono p-3 pr-12 rounded-lg border border-border truncate"
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={handleCopyPayload}
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-primary hover:text-primary"
                      >
                        {copiedPayload ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  {/* Share buttons */}
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 text-sm" onClick={handleSharePage}>
                      <Share2 className="mr-1.5 h-4 w-4" />
                      Compartilhar página
                    </Button>
                    {!useBrCode && pixKey && (
                      <Button variant="outline" className="flex-1 text-sm" onClick={handleShareKey}>
                        <Key className="mr-1.5 h-4 w-4" />
                        Compartilhar chave
                      </Button>
                    )}
                  </div>

                  {/* Novo Pix - only show when NOT from a plan */}
                  {!isFromPlan.current && (
                    <Button variant="secondary" className="w-full text-sm gap-2" onClick={handleReset}>
                      <RefreshCw className="h-4 w-4" />
                      Novo Pix
                    </Button>
                  )}

                  <p className="text-center text-xs text-muted-foreground">
                    Escaneie o QR Code{!useBrCode && pixKey ? ", copie a chave" : ""} ou use o Copia e Cola para pagar
                  </p>
                </div>
              )}
            </div>
          </div>
        </PixAccessGate>
      </main>
      <Footer />
    </div>
  );
}
