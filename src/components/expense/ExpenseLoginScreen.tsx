import { useState } from "react";
import { Loader2, LogIn, UserPlus, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { hashPin } from "@/lib/pin-hash";
import { toast } from "sonner";

interface ExpenseLoginScreenProps {
  onLogin: (profileId: string, nick: string) => void;
}

export default function ExpenseLoginScreen({ onLogin }: ExpenseLoginScreenProps) {
  const [nick, setNick] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!nick.trim() || !pin.trim()) {
      toast.error("Preencha o nick e o PIN.");
      return;
    }
    setLoading(true);
    try {
      const pinHash = await hashPin(pin.trim());
      const { data, error } = await supabase
        .from("expense_profiles")
        .select("id, pin_hash")
        .eq("nick", nick.trim().toLowerCase())
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        toast.error("Nick ou PIN incorreto. Tente novamente.");
        return;
      }

      if (data.pin_hash !== pinHash) {
        toast.error("Nick ou PIN incorreto. Tente novamente.");
        return;
      }

      toast.success("Bem-vindo de volta!");
      onLogin(data.id, nick.trim().toLowerCase());
    } catch (err) {
      console.error(err);
      toast.error("Erro ao acessar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!nick.trim() || !pin.trim()) {
      toast.error("Preencha o nick e o PIN.");
      return;
    }
    if (pin.trim().length < 4) {
      toast.error("O PIN deve ter pelo menos 4 caracteres.");
      return;
    }
    setLoading(true);
    try {
      const normalizedNick = nick.trim().toLowerCase();
      const pinHash = await hashPin(pin.trim());

      // Check if nick exists
      const { data: existing } = await supabase
        .from("expense_profiles")
        .select("id")
        .eq("nick", normalizedNick)
        .maybeSingle();

      if (existing) {
        toast.error("Esse nick já está em uso. Escolha outro ou faça login.");
        return;
      }

      const { data, error } = await supabase
        .from("expense_profiles")
        .insert({ nick: normalizedNick, pin_hash: pinHash })
        .select("id")
        .single();

      if (error) throw error;

      toast.success("Histórico criado com sucesso!");
      onLogin(data.id, normalizedNick);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao criar perfil. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md border-primary/20">
        <CardContent className="pt-8 pb-8">
          <div className="text-center mb-8">
            <div className="mb-4 inline-flex items-center justify-center rounded-full bg-primary/10 p-3">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Controle de Gastos</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Digite seu nick ou apelido e crie seu PIN para salvar seu histórico com privacidade.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Nick ou apelido</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={nick}
                  onChange={(e) => setNick(e.target.value)}
                  placeholder="Seu apelido"
                  className="pl-10"
                  maxLength={30}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">PIN pessoal</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Mínimo 4 caracteres"
                  className="pl-10"
                  maxLength={20}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <Button onClick={handleLogin} disabled={loading} className="w-full gap-2">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
                Entrar no meu histórico
              </Button>
              <Button onClick={handleCreate} disabled={loading} variant="outline" className="w-full gap-2">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                Criar novo histórico
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
