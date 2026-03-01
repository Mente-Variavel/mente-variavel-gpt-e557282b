import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ExternalLink, ImageMinus, Mail, Wallet } from "lucide-react";
import { motion } from "framer-motion";

const tools = [
  {
    name: "Removedor de Fundos de Imagens",
    description: "Remova o fundo de qualquer imagem de forma rápida e gratuita usando Inteligência Artificial.",
    url: "https://mentevariavelremove.lovable.app/",
    icon: ImageMinus,
  },
  {
    name: "Gerador de E-mails",
    description: "Crie e-mails profissionais em segundos com ajuda da IA.",
    url: "https://gamil-rover.lovable.app/",
    icon: Mail,
  },
  {
    name: "Controle de Finanças",
    description: "Organize suas finanças pessoais de forma simples e inteligente.",
    url: "https://mentevariavelfinancas.base44.app/",
    icon: Wallet,
  },
];

const Tools = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Ferramentas <span className="text-primary text-glow-cyan">Gratuitas</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Acesse nossas ferramentas de Inteligência Artificial criadas para facilitar seu dia a dia.
            </p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool, i) => (
              <motion.a
                key={tool.name}
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-xl p-6 border border-border/50 hover:border-primary/50 transition-all group flex flex-col gap-4"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:glow-cyan transition-all">
                  <tool.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="font-display text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {tool.name}
                  </h2>
                  <p className="text-sm text-muted-foreground">{tool.description}</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
                  Acessar <ExternalLink className="w-3.5 h-3.5" />
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Tools;
