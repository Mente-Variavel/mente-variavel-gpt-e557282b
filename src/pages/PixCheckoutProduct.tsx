import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { QrCode, Zap, Shield, Copy, CreditCard, CheckCircle, Play, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const vantagens = [
  { icon: Zap, text: "Geração rápida de QR Code Pix" },
  { icon: Copy, text: "Código Pix copia e cola" },
  { icon: Shield, text: "Interface simples e fácil de usar" },
  { icon: ShoppingBag, text: "Ideal para vendas online e serviços" },
  { icon: CheckCircle, text: "Sem intermediários" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1 } }),
};

export default function PixCheckoutProduct() {
  const [videoUrl, setVideoUrl] = useState("");

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "pix_product_video_url")
        .maybeSingle();
      if (data?.value) setVideoUrl(data.value);
    };
    fetch();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
              <QrCode className="w-4 h-4" />
              Produto
            </div>
            <h1 className="text-3xl md:text-5xl font-bold font-[Orbitron] mb-4">
              Pix <span className="text-primary">Checkout</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              O Pix Checkout é uma ferramenta simples e eficiente para gerar cobranças via Pix com QR Code e código copia e cola.
            </p>
          </motion.div>

          {/* Ideal para */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12"
          >
            <Card className="border-primary/20">
              <CardContent className="pt-6">
                <h2 className="text-xl font-bold mb-4">Ideal para:</h2>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                    Prestadores de serviço
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                    Vendedores de produtos digitais
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                    Pequenos negócios
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                    Quem deseja receber pagamentos de forma rápida e direta na conta
                  </li>
                </ul>
                <p className="mt-4 text-sm text-muted-foreground">
                  Com o Pix Checkout você pode gerar cobranças Pix com aparência profissional, de forma simples e sem complicação.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Vantagens */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold text-center mb-6">Principais vantagens</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {vantagens.map((v, i) => (
                <motion.div
                  key={i}
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  variants={fadeUp}
                >
                  <Card className="h-full hover:border-primary/40 transition-colors">
                    <CardContent className="pt-6 flex items-start gap-3">
                      <v.icon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <p className="text-sm">{v.text}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Pricing */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold text-center mb-2">Planos</h2>
            <p className="text-center text-muted-foreground text-sm mb-6">
              Teste grátis por 3 dias. Depois, escolha o plano ideal.
            </p>
            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              {/* Mensal */}
              <Card className="border-primary/30 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-lg">Plano Mensal</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-4xl font-bold text-primary mb-1">
                    R$ 19,90
                  </p>
                  <p className="text-sm text-muted-foreground mb-6">por mês</p>
                  <Link to="/pix-checkout">
                    <Button className="w-full gap-2" size="lg">
                      <CreditCard className="w-4 h-4" />
                      Assinar Plano Mensal
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Anual */}
              <Card className="border-green-500/30 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-green-500" />
                <div className="absolute top-3 right-3 bg-green-500/10 text-green-500 text-xs font-bold px-2 py-0.5 rounded-full">
                  Economia
                </div>
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-lg">Plano Anual</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-4xl font-bold text-green-500 mb-1">
                    R$ 79,90
                  </p>
                  <p className="text-sm text-muted-foreground mb-6">por ano</p>
                  <Link to="/pix-checkout">
                    <Button className="w-full gap-2 bg-green-600 hover:bg-green-700" size="lg">
                      <CreditCard className="w-4 h-4" />
                      Assinar Plano Anual
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Video */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold text-center mb-6">Veja como funciona</h2>
            <Card className="border-border/50 overflow-hidden">
              <CardContent className="p-0">
                {videoUrl ? (
                  <video
                    src={videoUrl}
                    controls
                    className="w-full aspect-video"
                    preload="metadata"
                  />
                ) : (
                  <div className="aspect-video bg-secondary/30 flex flex-col items-center justify-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Play className="w-8 h-8 text-primary ml-1" />
                    </div>
                    <p className="text-sm text-muted-foreground">Vídeo em breve</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center"
          >
            <Link to="/pix-checkout">
              <Button size="lg" className="gap-2">
                <QrCode className="w-5 h-5" />
                Experimentar Grátis por 3 Dias
              </Button>
            </Link>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
