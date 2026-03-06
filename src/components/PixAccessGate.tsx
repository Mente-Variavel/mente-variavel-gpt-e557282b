import { usePixAccess } from "@/hooks/usePixAccess";
import { Loader2, Lock, CreditCard, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface PixAccessGateProps {
  children: React.ReactNode;
}

export default function PixAccessGate({ children }: PixAccessGateProps) {
  const { status, trialEnd, loading } = usePixAccess();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (status === "no_auth") {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="max-w-md mx-auto border-primary/30 mt-8">
          <CardContent className="pt-6 text-center space-y-4">
            <LogIn className="w-10 h-10 text-primary mx-auto" />
            <h2 className="text-xl font-bold">Faça login para continuar</h2>
            <p className="text-sm text-muted-foreground">
              Você precisa estar logado para usar o Pix Checkout. Crie sua conta e ganhe 3 dias grátis!
            </p>
            <Link to="/produtos/pix-checkout">
              <Button className="gap-2 w-full">
                <CreditCard className="w-4 h-4" />
                Ver planos e criar conta
              </Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (status === "expired") {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="max-w-md mx-auto border-destructive/30 mt-8">
          <CardContent className="pt-6 text-center space-y-4">
            <Lock className="w-10 h-10 text-destructive mx-auto" />
            <h2 className="text-xl font-bold">Seu período de teste terminou</h2>
            <p className="text-sm text-muted-foreground">
              Assine um plano para continuar usando o Pix Checkout.
            </p>
            <div className="flex flex-col gap-2">
              <Link to="/produtos/pix-checkout">
                <Button className="gap-2 w-full">
                  <CreditCard className="w-4 h-4" />
                  Assinar Plano Mensal — R$ 19,90/mês
                </Button>
              </Link>
              <Link to="/produtos/pix-checkout">
                <Button variant="outline" className="gap-2 w-full">
                  <CreditCard className="w-4 h-4" />
                  Assinar Plano Anual — R$ 79,90/ano
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <>
      {status === "trial" && trialEnd && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary/10 border border-primary/20 rounded-lg px-4 py-2.5 mb-4 text-center text-sm"
        >
          <span className="text-primary font-semibold">🎉 Você está usando o período de teste gratuito.</span>
          <span className="text-muted-foreground ml-1">
            Expira em {trialEnd.toLocaleDateString("pt-BR")}.
          </span>
        </motion.div>
      )}
      {children}
    </>
  );
}
