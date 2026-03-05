import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";

const Footer = () => (
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
          </div>
        </div>
        <div>
          <h4 className="font-display text-xs font-bold text-foreground mb-3 uppercase tracking-wider">Plataforma</h4>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <Link to="/criador-prompt" className="hover:text-primary transition-colors">Criador de Prompt</Link>
            <Link to="/sobre" className="hover:text-primary transition-colors">Sobre o Projeto</Link>
            <Link to="/contato" className="hover:text-primary transition-colors">Contato</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-border/30 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-xs text-muted-foreground">© 2026 Mente Variável. Todos os direitos reservados.</p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <Link to="/privacidade" className="hover:text-primary transition-colors">Política de Privacidade</Link>
          <Link to="/termos" className="hover:text-primary transition-colors">Termos de Uso</Link>
        </div>
      </div>
      <p className="text-xs text-muted-foreground/60 text-center mt-4 max-w-lg mx-auto">
        Este site utiliza Inteligência Artificial. As respostas geradas podem conter limitações e não substituem aconselhamento profissional.
      </p>
    </div>
  </footer>
);

export default Footer;
