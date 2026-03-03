import { Link, useLocation } from "react-router-dom";
import { Menu, X, Sun, Moon, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/hooks/useTheme";
import logo from "@/assets/logo.png";

const financasItems = [
  { to: "/financas/educacao", label: "Educação Financeira" },
  { to: "/financas/controle", label: "Controle de Gastos" },
  { to: "/financas/conversor", label: "Conversor de Moedas" },
];

const servicosItems = [
  { to: "/servicos/removedor-fundo", label: "Removedor de Fundo" },
  { to: "/servicos/gerador-slides", label: "Gerador de Slides & E-book" },
  { to: "/servicos/pix-checkout", label: "Pix Checkout" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [financasOpen, setFinancasOpen] = useState(false);
  const [servicosOpen, setServicosOpen] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const financasRef = useRef<HTMLDivElement>(null);
  const servicosRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (financasRef.current && !financasRef.current.contains(e.target as Node)) setFinancasOpen(false);
      if (servicosRef.current && !servicosRef.current.contains(e.target as Node)) setServicosOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isActive = (path: string) => location.pathname === path;
  const isInSection = (prefix: string) => location.pathname.startsWith(prefix);

  const DropdownMenu = ({ items, isOpen, label, prefix, toggle, dropdownRef }: {
    items: typeof financasItems; isOpen: boolean; label: string; prefix: string;
    toggle: () => void; dropdownRef: React.RefObject<HTMLDivElement>;
  }) => (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={toggle}
        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1 ${
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
            className="absolute top-full left-0 mt-1 w-56 glass rounded-xl shadow-lg border border-border/50 overflow-hidden z-50"
          >
            {items.map((item) => (
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
            ))}
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
          <Link
            to="/"
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              isActive("/") ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            Início
          </Link>

          <DropdownMenu
            items={financasItems}
            isOpen={financasOpen}
            label="Finanças"
            prefix="/financas"
            toggle={() => { setFinancasOpen(!financasOpen); setServicosOpen(false); }}
            dropdownRef={financasRef}
          />

          <DropdownMenu
            items={servicosItems}
            isOpen={servicosOpen}
            label="Serviços"
            prefix="/servicos"
            toggle={() => { setServicosOpen(!servicosOpen); setFinancasOpen(false); }}
            dropdownRef={servicosRef}
          />

          <Link
            to="/criador-prompt"
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              isActive("/criador-prompt") ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            Criador de Prompt
          </Link>

          <Link
            to="/contato"
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              isActive("/contato") ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            Contato
          </Link>

          <button
            onClick={toggleTheme}
            className="ml-1 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
            title={theme === "dark" ? "Modo claro" : "Modo escuro"}
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
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
              <Link to="/criador-prompt" onClick={() => setOpen(false)} className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${isActive("/criador-prompt") ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}>
                Criador de Prompt
              </Link>
              <Link to="/contato" onClick={() => setOpen(false)} className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${isActive("/contato") ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}>
                Contato
              </Link>
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
