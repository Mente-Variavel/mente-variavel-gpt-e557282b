import { Link, useLocation } from "react-router-dom";
import { Menu, X, LogOut, LogIn, Megaphone, Settings, Sun, Moon } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { useUserRole } from "@/hooks/useUserRole";
import logo from "@/assets/logo.png";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/assistente", label: "Assistente IA" },
  { to: "/ferramentas", label: "Ferramentas" },
  { to: "/guias", label: "Guias de IA" },
  { to: "/blog", label: "Blog" },
  { to: "/sobre", label: "Sobre" },
  { to: "/contato", label: "Contato" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { isAdmin } = useUserRole();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/30">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <img src={logo} alt="Mente Variável" className="w-9 h-9 rounded-full" />
          <span className="font-display text-sm font-bold text-primary text-glow-cyan hidden sm:inline">
            Mente Variável GPT
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden lg:flex items-center gap-0.5">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                location.pathname === item.to || (item.to !== "/" && location.pathname.startsWith(item.to))
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <Link
            to="/anuncie"
            className={`ml-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
              location.pathname === "/anuncie"
                ? "text-accent bg-accent/10"
                : "text-accent/80 hover:text-accent hover:bg-accent/10"
            }`}
          >
            <Megaphone className="w-4 h-4" /> Seja anunciante
          </Link>
          <button
            onClick={toggleTheme}
            className="ml-1 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
            title={theme === "dark" ? "Modo claro" : "Modo escuro"}
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          {user ? (
            <>
              {isAdmin && (
                <Link
                  to="/admin/anuncios"
                  className="ml-1 p-2 rounded-lg text-muted-foreground/40 hover:text-muted-foreground hover:bg-secondary transition-all"
                  title="Admin"
                >
                  <Settings className="w-4 h-4" />
                </Link>
              )}
              <button
                onClick={() => signOut()}
                className="ml-1 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all flex items-center gap-1.5"
              >
                <LogOut className="w-4 h-4" /> Sair
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              className="ml-2 px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-all flex items-center gap-1.5"
            >
              <LogIn className="w-4 h-4" /> Entrar
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="lg:hidden p-2 text-muted-foreground hover:text-foreground"
        >
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
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    location.pathname === item.to || (item.to !== "/" && location.pathname.startsWith(item.to))
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                to="/anuncie"
                onClick={() => setOpen(false)}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                  location.pathname === "/anuncie"
                    ? "text-accent bg-accent/10"
                    : "text-accent/80 hover:text-accent hover:bg-accent/10"
                }`}
              >
                <Megaphone className="w-4 h-4" /> Seja anunciante
              </Link>
              <button
                onClick={toggleTheme}
                className="px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all text-left flex items-center gap-1.5"
              >
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                {theme === "dark" ? "Modo claro" : "Modo escuro"}
              </button>
              {user ? (
                <>
                  {isAdmin && (
                    <Link
                      to="/admin/anuncios"
                      onClick={() => setOpen(false)}
                      className="px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground/40 hover:text-muted-foreground hover:bg-secondary transition-all flex items-center gap-1.5"
                    >
                      <Settings className="w-4 h-4" /> Admin
                    </Link>
                  )}
                  <button
                    onClick={() => { signOut(); setOpen(false); }}
                    className="px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all text-left flex items-center gap-1.5"
                  >
                    <LogOut className="w-4 h-4" /> Sair
                  </button>
                </>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setOpen(false)}
                  className="px-4 py-3 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-all flex items-center gap-1.5"
                >
                  <LogIn className="w-4 h-4" /> Entrar
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
