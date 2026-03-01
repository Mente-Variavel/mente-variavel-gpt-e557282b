import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdPlaceholder from "@/components/AdPlaceholder";
import logo from "@/assets/logo.png";

const About = () => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="flex-1 pt-16">
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <div className="flex items-center gap-4 mb-8">
          <img src={logo} alt="Mente Variável GPT" className="w-16 h-16 rounded-full glow-cyan" />
          <h1 className="font-display text-3xl font-bold text-primary text-glow-cyan">Sobre Nós</h1>
        </div>

        <div className="space-y-6 text-foreground/80 text-sm leading-relaxed">
          <p>
            O <strong className="text-primary">Mente Variável GPT</strong> é uma plataforma gratuita de Inteligência Artificial, criada com a missão de democratizar o acesso à tecnologia de IA para todos os brasileiros.
          </p>

          <h2 className="font-display text-lg font-semibold text-foreground pt-4">Nossa Missão</h2>
          <p>
            Acreditamos que a Inteligência Artificial deve ser acessível a todas as pessoas, independentemente de sua formação técnica ou condição financeira. Por isso, oferecemos um assistente de IA completo e gratuito, disponível 24 horas por dia.
          </p>

          <h2 className="font-display text-lg font-semibold text-foreground pt-4">O que Oferecemos</h2>
          <p>
            Nossa plataforma combina um assistente de chat inteligente com conteúdo educacional de qualidade sobre Inteligência Artificial. Aqui você encontra:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Um assistente de IA gratuito para ajudar com ideias, textos, estudos e soluções.</li>
            <li>Guias completos e educacionais sobre Inteligência Artificial.</li>
            <li>Artigos e dicas práticas sobre como usar IA no dia a dia.</li>
            <li>Conteúdo atualizado sobre as últimas tendências em tecnologia e IA.</li>
          </ul>

          <h2 className="font-display text-lg font-semibold text-foreground pt-4">Nossos Valores</h2>
          <p>
            <strong>Acessibilidade:</strong> Todo nosso conteúdo e ferramentas são gratuitos e em português.
          </p>
          <p>
            <strong>Privacidade:</strong> Respeitamos seus dados e nunca os compartilhamos com terceiros.
          </p>
          <p>
            <strong>Transparência:</strong> Somos claros sobre as capacidades e limitações da nossa tecnologia.
          </p>
          <p>
            <strong>Qualidade:</strong> Buscamos oferecer a melhor experiência possível em cada interação.
          </p>

          <AdPlaceholder format="inline" className="my-8" />

          <h2 className="font-display text-lg font-semibold text-foreground pt-4">Compromisso com o Usuário</h2>
          <p>
            Estamos constantemente melhorando nossa plataforma para oferecer uma experiência cada vez melhor. Se você tiver sugestões, dúvidas ou feedback, não hesite em entrar em contato conosco pela nossa página de contato.
          </p>
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export default About;
