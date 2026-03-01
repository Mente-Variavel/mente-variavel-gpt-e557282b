import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const About = () => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="flex-1 pt-16">
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <h1 className="font-display text-3xl font-bold text-primary text-glow-cyan mb-8">Sobre</h1>
        <div className="space-y-4 text-foreground/80 text-sm leading-relaxed">
          <p>
            O <strong className="text-primary">Mente Variável GPT</strong> é um assistente de inteligência artificial gratuito, criado para ajudar você com ideias, textos, código e soluções criativas.
          </p>
          <p>
            Nossa missão é democratizar o acesso à inteligência artificial, oferecendo uma ferramenta poderosa, intuitiva e gratuita para todos.
          </p>
          <p>
            Utilizamos modelos de linguagem avançados para fornecer respostas precisas, criativas e úteis em português brasileiro.
          </p>
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export default About;
