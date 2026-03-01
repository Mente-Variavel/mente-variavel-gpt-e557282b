import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";

const Footer = () => (
  <footer className="border-t border-border/30 bg-card/50 backdrop-blur-sm">
    <div className="container mx-auto px-4 py-10">
      <div className="grid md:grid-cols-4 gap-8 mb-8">
        {/* Brand */}
        <div className="md:col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <img src={logo} alt="Mente Variável" className="w-8 h-8 rounded-full" />
            <span className="font-display text-sm font-bold text-primary">MV GPT</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Plataforma gratuita de Inteligência Artificial para ajudar você com ideias, textos, estudos e soluções.
          </p>
        </div>

        {/* Navigation */}
        <div>
          <h4 className="font-display text-xs font-bold text-foreground mb-3 uppercase tracking-wider">Navegação</h4>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <Link to="/assistente" className="hover:text-primary transition-colors">Assistente IA</Link>
            <Link to="/guias" className="hover:text-primary transition-colors">Guias de IA</Link>
            <Link to="/blog" className="hover:text-primary transition-colors">Blog</Link>
          </div>
        </div>

        {/* Info */}
        <div>
          <h4 className="font-display text-xs font-bold text-foreground mb-3 uppercase tracking-wider">Informações</h4>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <Link to="/sobre" className="hover:text-primary transition-colors">Sobre</Link>
            <Link to="/contato" className="hover:text-primary transition-colors">Contato</Link>
          </div>
        </div>

        {/* Legal */}
        <div>
          <h4 className="font-display text-xs font-bold text-foreground mb-3 uppercase tracking-wider">Legal</h4>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <Link to="/privacidade" className="hover:text-primary transition-colors">Política de Privacidade</Link>
            <Link to="/termos" className="hover:text-primary transition-colors">Termos de Uso</Link>
          </div>
        </div>
      </div>

      <div className="border-t border-border/30 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-xs text-muted-foreground">
          © 2026 Mente Variável GPT. Todos os direitos reservados.
        </p>
        <p className="text-xs text-muted-foreground/60 text-center max-w-lg">
          Este site utiliza Inteligência Artificial para auxiliar usuários. As respostas geradas pelo assistente podem conter limitações e não substituem aconselhamento profissional.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
