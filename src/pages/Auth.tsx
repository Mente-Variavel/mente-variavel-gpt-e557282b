import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { LogIn, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast.error("Erro ao fazer login: " + error.message);
    } else {
      toast.success("Login realizado com sucesso!");
      navigate("/admin/anuncios");
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await signOut();
    toast.success("Logout realizado.");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 flex items-center justify-center pt-20 px-4">
        <div className="w-full max-w-sm">
          {user ? (
            <div className="glass rounded-2xl p-8 border border-primary/20 text-center space-y-4">
              <p className="text-sm text-muted-foreground">Logado como</p>
              <p className="font-semibold text-foreground">{user.email}</p>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => navigate("/admin/anuncios")}>
                  Painel Admin
                </Button>
                <Button variant="destructive" className="flex-1" onClick={handleLogout}>
                  Sair
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="glass rounded-2xl p-8 border border-primary/20 space-y-5">
              <div className="text-center mb-2">
                <LogIn className="w-8 h-8 text-primary mx-auto mb-2" />
                <h1 className="text-xl font-bold">Acesso Administrativo</h1>
                <p className="text-xs text-muted-foreground mt-1">Área restrita</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              <Button type="submit" className="w-full gap-2" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                Entrar
              </Button>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
