import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="border-t border-border/30 bg-card/50 backdrop-blur-sm">
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          © 2026 Mente Variável GPT. Todos os direitos reservados.
        </p>
        <div className="flex gap-6 text-sm text-muted-foreground">
          <Link to="/privacidade" className="hover:text-primary transition-colors">
            Privacidade
          </Link>
          <Link to="/termos" className="hover:text-primary transition-colors">
            Termos de Uso
          </Link>
          <Link to="/contato" className="hover:text-primary transition-colors">
            Contato
          </Link>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
