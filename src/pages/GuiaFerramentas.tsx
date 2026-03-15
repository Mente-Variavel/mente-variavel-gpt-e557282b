import { motion } from "framer-motion";
import { MessageSquare, Music, Video, BookOpen, Wallet, ArrowLeftRight, Calculator, Bitcoin, Wand2, ImageOff, Layers, Mic, Languages, Layout, FileVideo, CreditCard, Subtitles, Gamepad2, CloudSun } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface ToolInfo {
  icon: React.ComponentType<any>;
  name: string;
  description: string;
}

const sections: { title: string; tools: ToolInfo[] }[] = [
  {
    title: "Ferramentas de IA",
    tools: [
      { icon: MessageSquare, name: "Chat IA", description: "Assistente de IA capaz de responder perguntas, gerar imagens e ajudar com diversas tarefas usando inteligência artificial." },
      { icon: Music, name: "Criador de Música", description: "Ferramenta que ajuda a gerar letras e ideias para músicas usando inteligência artificial." },
      { icon: Video, name: "Explorar Vídeos", description: "Ferramenta projetada para ajudar a descobrir e explorar conteúdo de vídeo útil." },
    ],
  },
  {
    title: "Ferramentas de Finanças",
    tools: [
      { icon: BookOpen, name: "Educação Financeira", description: "Seção educacional focada em melhorar o conhecimento financeiro e ajudar os usuários a tomar melhores decisões financeiras." },
      { icon: Wallet, name: "Controle de Gastos", description: "Ferramenta que ajuda a rastrear despesas e gerenciar o orçamento pessoal." },
      { icon: ArrowLeftRight, name: "Conversor de Moedas", description: "Conversor de moedas em tempo real para cálculos financeiros rápidos." },
      { icon: Calculator, name: "Calculadora de Preço", description: "Ferramenta que ajuda a calcular preços de produtos e margens de lucro." },
      { icon: Bitcoin, name: "Cripto Monitor", description: "Ferramenta de monitoramento de criptomoedas baseada em dados do CoinGecko, permitindo acompanhar preços do mercado cripto." },
    ],
  },
  {
    title: "Ferramentas de Criação de Conteúdo",
    tools: [
      { icon: Wand2, name: "Criador de Prompt", description: "Ferramenta que ajuda a gerar prompts otimizados para plataformas de inteligência artificial." },
      { icon: ImageOff, name: "Removedor de Fundo", description: "Remove fundos de imagens automaticamente usando IA." },
      { icon: Layers, name: "Gerador de Slides", description: "Cria apresentações e estruturas de slides automaticamente." },
      { icon: Mic, name: "Transcrição de Áudio", description: "Transforma áudio em texto rapidamente." },
      { icon: Languages, name: "Tradutor", description: "Ferramenta de tradução simples para múltiplos idiomas." },
      { icon: Layout, name: "Criador de Landing Page", description: "Ajuda a gerar estruturas de landing pages para projetos e negócios." },
      { icon: FileVideo, name: "Compressor de Vídeo", description: "Reduz o tamanho de arquivos de vídeo para upload e compartilhamento mais fácil." },
    ],
  },
  {
    title: "Ferramentas de Produto",
    tools: [
      { icon: CreditCard, name: "Pix Checkout", description: "Ferramenta projetada para gerar checkouts de pagamento Pix para transações online simples." },
      { icon: Subtitles, name: "Gerador de Legendas", description: "Cria legendas automaticamente para vídeos. Inclui um recurso exclusivo: uma barra anti-marca d'água que pode ser posicionada para cobrir marcas d'água em vídeos." },
      { icon: Gamepad2, name: "Mente Simulator", description: "Ferramenta simuladora projetada para experimentação e experiências interativas." },
    ],
  },
  {
    title: "Outras Ferramentas",
    tools: [
      { icon: CloudSun, name: "Previsão do Tempo", description: "Ferramenta de previsão do tempo que fornece informações climáticas em uma interface simples." },
    ],
  },
];

export default function GuiaFerramentas() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-center">
              Guia das <span className="text-primary">Ferramentas</span>
            </h1>
            <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">
              A Mente Variável é uma plataforma brasileira que oferece ferramentas online úteis com inteligência artificial para ajudar com produtividade, gestão financeira e criação de conteúdo. O objetivo é fornecer ferramentas simples que resolvam problemas do dia a dia rapidamente.
            </p>
          </motion.div>

          {sections.map((section, si) => (
            <motion.section
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: si * 0.1 }}
              className="mb-12"
            >
              <h2 className="text-xl font-bold mb-6 text-primary border-b border-border/30 pb-2">
                {section.title}
              </h2>
              <div className="grid gap-4">
                {section.tools.map((tool) => (
                  <div
                    key={tool.name}
                    className="flex items-start gap-4 p-4 rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <tool.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">{tool.name}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{tool.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
