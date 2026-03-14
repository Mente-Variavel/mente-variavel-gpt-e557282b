import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import logo from "@/assets/logo.png";

const About = () => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="flex-1 pt-16">
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <div className="flex items-center gap-4 mb-8">
          <img src={logo} alt="Mente Variável GPT" className="w-16 h-16 rounded-full glow-cyan" />
          <h1 className="font-display text-3xl font-bold text-primary text-glow-cyan">Sobre o Projeto</h1>
        </div>

        <div className="space-y-6 text-foreground/80 text-sm leading-relaxed">
          <p>
            O <strong className="text-primary">Mente Variável GPT</strong> é uma plataforma brasileira criada para oferecer ferramentas práticas baseadas em inteligência artificial para o dia a dia.
          </p>

          <p>
            Nosso objetivo é facilitar tarefas como criação de conteúdo, organização financeira, geração de ideias e produção criativa utilizando tecnologias modernas de IA.
          </p>

          <p>
            A plataforma reúne diferentes ferramentas em um único ambiente simples e acessível, incluindo assistentes de texto, geradores criativos e utilidades digitais.
          </p>

          <p>
            O projeto está em constante evolução e novas ferramentas são adicionadas regularmente para ampliar as possibilidades de uso.
          </p>

          <p>
            O Mente Variável GPT é um projeto independente desenvolvido por Carlos Mangas, criado com o objetivo de disponibilizar ferramentas digitais acessíveis que ajudam pessoas a produzir mais, aprender mais rápido e aproveitar melhor os recursos da tecnologia e da inteligência artificial no dia a dia.
          </p>

          <p>
            A plataforma foi criada para estudantes, profissionais, empreendedores e criadores de conteúdo que buscam soluções simples e práticas para aumentar a produtividade e transformar ideias em resultados.
          </p>

          <p>
            Novas ferramentas e melhorias são adicionadas constantemente para tornar a experiência cada vez mais completa e útil para os usuários.
          </p>
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export default About;
