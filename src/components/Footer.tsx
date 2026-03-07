import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Settings, Loader2, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import logo from "@/assets/logo.png";

const ADMIN_EMAIL = "mentevariavel@gmail.com";

const Footer = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: ADMIN_EMAIL,
      password,
    });
    if (error) {
      toast.error("Senha incorreta.");
    } else {
      toast.success("Login realizado!");
      setShowLogin(false);
      setPassword("");
      navigate("/");
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await signOut();
    toast.success("Logout realizado.");
    setShowLogin(false);
  };

  return (
    <footer className="border-t border-border/30 bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-10">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <img src={logo} alt="Mente Variável" className="w-8 h-8 rounded-full" />
              <span className="font-display text-sm font-bold text-primary">Mente Variável</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Plataforma brasileira de ferramentas com Inteligência Artificial para produtividade, finanças e criação de conteúdo.
            </p>
          </div>
          <div>
            <h4 className="font-display text-xs font-bold text-foreground mb-3 uppercase tracking-wider">Finanças</h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link to="/financas/educacao" className="hover:text-primary transition-colors">Educação Financeira</Link>
              <Link to="/financas/controle" className="hover:text-primary transition-colors">Controle de Gastos</Link>
              <Link to="/financas/conversor" className="hover:text-primary transition-colors">Conversor de Moedas</Link>
            </div>
          </div>
          <div>
            <h4 className="font-display text-xs font-bold text-foreground mb-3 uppercase tracking-wider">Serviços</h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link to="/servicos/removedor-fundo" className="hover:text-primary transition-colors">Removedor de Fundo</Link>
              <Link to="/servicos/gerador-slides" className="hover:text-primary transition-colors">Gerador de Slides & E-book</Link>
              <Link to="/servicos/criador-musica" className="hover:text-primary transition-colors">Criador de Música IA</Link>
              <Link to="/ferramentas/calculadora-preco" className="hover:text-primary transition-colors">Calculadora de Lucro</Link>
            </div>
          </div>
          <div>
            <h4 className="font-display text-xs font-bold text-foreground mb-3 uppercase tracking-wider">Produtos</h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link to="/produtos/gerador-legendas" className="hover:text-primary transition-colors">Gerador de Legendas</Link>
              <Link to="/produtos/pix-checkout" className="hover:text-primary transition-colors">Pix Checkout</Link>
              <Link to="/criador-prompt" className="hover:text-primary transition-colors">Criador de Prompt</Link>
              <Link to="/guias" className="hover:text-primary transition-colors">Guias</Link>
              <Link to="/blog" className="hover:text-primary transition-colors">Blog</Link>
              <Link to="/sobre" className="hover:text-primary transition-colors">Sobre o Projeto</Link>
              <Link to="/contato" className="hover:text-primary transition-colors">Contato</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-border/30 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">© 2026 Mente Variável. Todos os direitos reservados.</p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
            <Link to="/privacidade" className="hover:text-primary transition-colors">Política de Privacidade</Link>
            <Link to="/termos" className="hover:text-primary transition-colors">Termos de Uso</Link>
            <Link to="/sobre" className="hover:text-primary transition-colors">Sobre o Projeto</Link>
            <Link to="/contato" className="hover:text-primary transition-colors">Contato</Link>
          </div>
        </div>

        {/* Admin gear + login */}
        <div className="flex items-center justify-center mt-4 gap-2">
          {user ? (
            <div className="flex items-center gap-2">
              <Link to="/admin/anuncios" className="text-xs text-muted-foreground/40 hover:text-primary transition-colors">
                <Settings className="w-3.5 h-3.5" />
              </Link>
              <button onClick={handleLogout} className="text-muted-foreground/40 hover:text-destructive transition-colors">
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => setShowLogin(!showLogin)}
                className="text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors"
                title=""
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
              {showLogin && (
                <form onSubmit={handleLogin} className="flex items-center gap-2">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Senha"
                    className="h-7 w-32 text-xs bg-secondary/50 border border-border/50 rounded px-2 outline-none focus:border-primary/40 text-foreground placeholder:text-muted-foreground/50"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={loading || !password.trim()}
                    className="h-7 px-3 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : "OK"}
                  </button>
                </form>
              )}
            </>
          )}
        </div>

        <p className="text-xs text-muted-foreground/60 text-center mt-4 max-w-lg mx-auto">
          Este site utiliza Inteligência Artificial. As respostas geradas podem conter limitações e não substituem aconselhamento profissional.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
