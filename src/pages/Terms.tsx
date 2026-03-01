import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Terms = () => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="flex-1 pt-16">
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <h1 className="font-display text-3xl font-bold text-primary text-glow-cyan mb-8">Termos de Uso</h1>
        <div className="space-y-4 text-foreground/80 text-sm leading-relaxed">
          <p>Ao utilizar o Mente Variável GPT, você concorda com os seguintes termos:</p>
          <h2 className="font-display text-lg font-semibold text-foreground pt-4">Uso Aceitável</h2>
          <p>O serviço deve ser utilizado de forma ética e legal. É proibido usar o assistente para gerar conteúdo ilegal, prejudicial ou que viole direitos de terceiros.</p>
          <h2 className="font-display text-lg font-semibold text-foreground pt-4">Limitações</h2>
          <p>O assistente pode cometer erros. As respostas não substituem aconselhamento profissional. Verifique informações importantes.</p>
          <h2 className="font-display text-lg font-semibold text-foreground pt-4">Limites de Uso</h2>
          <p>Usuários convidados podem enviar até 20 mensagens por dia. Usuários cadastrados podem enviar até 100 mensagens por dia.</p>
          <h2 className="font-display text-lg font-semibold text-foreground pt-4">Modificações</h2>
          <p>Reservamos o direito de modificar estes termos a qualquer momento. Atualizações serão publicadas nesta página.</p>
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export default Terms;
