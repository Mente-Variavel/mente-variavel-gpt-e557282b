import { Link, useLocation } from "react-router-dom";
import { Menu, X, Sun, Moon, ChevronDown, Settings, MessageSquare, Handshake, Music, ExternalLink } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import logo from "@/assets/logo.png";

type NavItem = { to: string; label: string; external: boolean; badge?: string };

const financasItems: NavItem[] = [
  { to: "/financas/educacao", label: "Educação Financeira", external: false },
  { to: "/financas/controle", label: "Controle de Gastos", external: false },
  { to: "/financas/conversor", label: "Conversor de Moedas", external: false },
];

const servicosItems: NavItem[] = [
  { to: "/servicos/criador-prompt", label: "Criador de Prompt", external: false },
  { to: "/servicos/removedor-fundo", label: "Removedor de Fundo", external: false },
  { to: "/servicos/gerador-slides", label: "Gerador de Slides & E-book", external: false },
  { to: "/ferramentas/calculadora-preco", label: "Calculadora de Lucro", external: false },
];

const produtosItems: NavItem[] = [
  { to: "/produtos/pix-checkout", label: "Pix Checkout", external: false },
  { to: "/produtos/gerador-legendas", label: "Gerador de Legendas", external: false },
  { to: "https://mentesimulator.online", label: "Analisador e Simulador de YouTube", badge: "3 testes grátis", external: true },
];



const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [financasOpen, setFinancasOpen] = useState(false);
  const [servicosOpen, setServicosOpen] = useState(false);
  const [produtosOpen, setProdutosOpen] = useState(false);
  
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const financasRef = useRef<HTMLDivElement>(null);
  const servicosRef = useRef<HTMLDivElement>(null);
  const produtosRef = useRef<HTMLDivElement>(null);
  

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (financasRef.current && !financasRef.current.contains(e.target as Node)) setFinancasOpen(false);
      if (servicosRef.current && !servicosRef.current.contains(e.target as Node)) setServicosOpen(false);
      if (produtosRef.current && !produtosRef.current.contains(e.target as Node)) setProdutosOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const closeAll = () => { setFinancasOpen(false); setServicosOpen(false); setProdutosOpen(false); };

  const isActive = (path: string) => location.pathname === path;
  const isInSection = (prefix: string) => location.pathname.startsWith(prefix);

  const navLinkClass = (path: string) =>
    `px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
      isActive(path) ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
    }`;

  const DropdownMenu = ({ items, isOpen, label, prefix, toggle, dropdownRef }: {
    items: typeof financasItems; isOpen: boolean; label: string; prefix: string;
    toggle: () => void; dropdownRef: React.RefObject<HTMLDivElement>;
  }) => (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={toggle}
        className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-1 ${
          isInSection(prefix) ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
        }`}
      >
        {label}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute top-full left-0 mt-1 w-64 glass rounded-xl shadow-lg border border-border/50 overflow-hidden z-50"
          >
            {items.map((item) =>
              item.external ? (
                <a
                  key={item.to}
                  href={item.to}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => { toggle(); }}
                  className="flex items-center justify-between px-4 py-2.5 text-sm transition-all text-muted-foreground hover:text-foreground hover:bg-secondary/60 group"
                >
                  <span className="flex items-center gap-1.5">
                    {item.label}
                    <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100" />
                  </span>
                  {"badge" in item && item.badge && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-primary/20 text-primary shrink-0 ml-2">
                      {item.badge}
                    </span>
                  )}
                </a>
              ) : (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => { toggle(); }}
                  className={`block px-4 py-2.5 text-sm transition-all ${
                    isActive(item.to)
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                  }`}
                >
                  {item.label}
                </Link>
              )
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/30">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <img src={logo} alt="MV" className="w-9 h-9 rounded-full" />
          <span className="font-display text-sm font-bold text-primary text-glow-cyan hidden sm:inline">
            Mente Variável
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden lg:flex items-center gap-0.5">
          <Link to="/" className={navLinkClass("/")}>Início</Link>

          <Link to="/assistente" className={`${navLinkClass("/assistente")} flex items-center gap-1`}>
            <MessageSquare className="w-3.5 h-3.5" />
            Chat IA
          </Link>

          <Link to="/servicos/criador-musica" className={`${navLinkClass("/servicos/criador-musica")} flex items-center gap-1`}>
            <Music className="w-3.5 h-3.5" />
            Criador de Música
          </Link>

          <DropdownMenu
            items={financasItems}
            isOpen={financasOpen}
            label="Finanças"
            prefix="/financas"
            toggle={() => { closeAll(); setFinancasOpen(!financasOpen); }}
            dropdownRef={financasRef}
          />

          <DropdownMenu
            items={servicosItems}
            isOpen={servicosOpen}
            label="Serviços"
            prefix="/servicos"
            toggle={() => { closeAll(); setServicosOpen(!servicosOpen); }}
            dropdownRef={servicosRef}
          />

          <DropdownMenu
            items={produtosItems}
            isOpen={produtosOpen}
            label="Produtos"
            prefix="/produtos"
            toggle={() => { closeAll(); setProdutosOpen(!produtosOpen); }}
            dropdownRef={produtosRef}
          />


          <Link to="/parceiro" className={`${navLinkClass("/parceiro")} flex items-center gap-1.5`}>
            <Handshake className="w-4 h-4 text-primary" />
            Seja um parceiro
          </Link>

          <button
            onClick={toggleTheme}
            className="ml-1 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
            title={theme === "dark" ? "Modo claro" : "Modo escuro"}
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {user && isAdmin && (
            <Link
              to="/admin/anuncios"
              className="ml-1 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
              title="Painel Admin"
            >
              <Settings className="w-4 h-4" />
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setOpen(!open)} className="lg:hidden p-2 text-muted-foreground hover:text-foreground">
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden glass border-t border-border/30"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-1">
              <Link to="/" onClick={() => setOpen(false)} className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${isActive("/") ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}>
                Início
              </Link>
              <Link to="/assistente" onClick={() => setOpen(false)} className={`px-4 py-3 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${isActive("/assistente") ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}>
                <MessageSquare className="w-4 h-4" />
                Chat IA
              </Link>
              <Link to="/servicos/criador-musica" onClick={() => setOpen(false)} className={`px-4 py-3 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${isActive("/servicos/criador-musica") ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}>
                <Music className="w-4 h-4" />
                Criador de Música
              </Link>

              <p className="px-4 pt-3 pb-1 text-xs font-bold text-muted-foreground uppercase tracking-wider">Finanças</p>
              {financasItems.map((item) => (
                <Link key={item.to} to={item.to} onClick={() => setOpen(false)} className={`px-6 py-2.5 rounded-lg text-sm transition-all ${isActive(item.to) ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}>
                  {item.label}
                </Link>
              ))}

              <p className="px-4 pt-3 pb-1 text-xs font-bold text-muted-foreground uppercase tracking-wider">Serviços</p>
              {servicosItems.map((item) => (
                <Link key={item.to} to={item.to} onClick={() => setOpen(false)} className={`px-6 py-2.5 rounded-lg text-sm transition-all ${isActive(item.to) ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}>
                  {item.label}
                </Link>
              ))}

              <p className="px-4 pt-3 pb-1 text-xs font-bold text-muted-foreground uppercase tracking-wider">Produtos</p>
              {produtosItems.map((item) => (
                <Link key={item.to} to={item.to} onClick={() => setOpen(false)} className={`px-6 py-2.5 rounded-lg text-sm transition-all ${isActive(item.to) ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}>
                  {item.label}
                </Link>
              ))}


              <Link to="/parceiro" onClick={() => setOpen(false)} className={`px-4 py-3 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${isActive("/parceiro") ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}>
                <Handshake className="w-4 h-4 text-primary" />
                Seja um parceiro
              </Link>

              {user && isAdmin && (
                <Link to="/admin/anuncios" onClick={() => setOpen(false)} className={`px-4 py-3 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${isActive("/admin/anuncios") ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}>
                  <Settings className="w-4 h-4" />
                  Painel Admin
                </Link>
              )}

              <button onClick={toggleTheme} className="px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all text-left flex items-center gap-1.5">
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                {theme === "dark" ? "Modo claro" : "Modo escuro"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
