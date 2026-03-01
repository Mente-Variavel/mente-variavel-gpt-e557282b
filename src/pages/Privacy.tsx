import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Privacy = () => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="flex-1 pt-16">
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <h1 className="font-display text-3xl font-bold text-primary text-glow-cyan mb-8">Política de Privacidade</h1>
        <div className="space-y-4 text-foreground/80 text-sm leading-relaxed">
          <p>Esta política descreve como coletamos e utilizamos seus dados.</p>
          <h2 className="font-display text-lg font-semibold text-foreground pt-4">Dados Coletados</h2>
          <p>Coletamos apenas informações necessárias para o funcionamento do serviço: e-mail (opcional, para login), mensagens enviadas ao assistente e dados de uso.</p>
          <h2 className="font-display text-lg font-semibold text-foreground pt-4">Uso dos Dados</h2>
          <p>Os dados são utilizados exclusivamente para fornecer e melhorar o serviço. Não compartilhamos suas informações pessoais com terceiros.</p>
          <h2 className="font-display text-lg font-semibold text-foreground pt-4">Segurança</h2>
          <p>Adotamos medidas de segurança para proteger seus dados contra acesso não autorizado.</p>
          <h2 className="font-display text-lg font-semibold text-foreground pt-4">Contato</h2>
          <p>Para dúvidas sobre privacidade, entre em contato através da nossa página de contato.</p>
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export default Privacy;
