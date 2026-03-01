import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Privacy = () => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="flex-1 pt-16">
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <h1 className="font-display text-3xl font-bold text-primary text-glow-cyan mb-8">Política de Privacidade</h1>
        <p className="text-xs text-muted-foreground mb-8">Última atualização: 1 de março de 2026</p>
        <div className="space-y-4 text-foreground/80 text-sm leading-relaxed">
          <p>Esta Política de Privacidade descreve como o Mente Variável GPT coleta, utiliza, armazena e protege suas informações pessoais.</p>

          <h2 className="font-display text-lg font-semibold text-foreground pt-4">1. Dados Coletados</h2>
          <p>Coletamos as seguintes informações:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li><strong>Dados de conta:</strong> e-mail e informações de perfil (quando cadastrado).</li>
            <li><strong>Dados de uso:</strong> mensagens enviadas ao assistente, páginas visitadas e tempo de navegação.</li>
            <li><strong>Dados técnicos:</strong> endereço IP, tipo de navegador, sistema operacional e dispositivo.</li>
            <li><strong>Cookies:</strong> utilizamos cookies para melhorar a experiência do usuário e para fins analíticos.</li>
          </ul>

          <h2 className="font-display text-lg font-semibold text-foreground pt-4">2. Uso dos Dados</h2>
          <p>Os dados coletados são utilizados para:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Fornecer e manter o serviço do assistente de IA.</li>
            <li>Melhorar a qualidade e personalização das respostas.</li>
            <li>Análise de uso e desempenho da plataforma.</li>
            <li>Comunicações relacionadas ao serviço.</li>
            <li>Exibição de anúncios relevantes através de parceiros de publicidade.</li>
          </ul>

          <h2 className="font-display text-lg font-semibold text-foreground pt-4">3. Cookies e Tecnologias de Rastreamento</h2>
          <p>
            Utilizamos cookies e tecnologias similares para coletar informações sobre o uso do site. Isso inclui cookies de terceiros para fins de análise e publicidade. Você pode gerenciar suas preferências de cookies nas configurações do seu navegador.
          </p>

          <h2 className="font-display text-lg font-semibold text-foreground pt-4">4. Publicidade</h2>
          <p>
            Podemos utilizar serviços de publicidade de terceiros, como o Google AdSense, para exibir anúncios no site. Esses serviços podem utilizar cookies para exibir anúncios baseados em suas visitas anteriores. Você pode optar por não receber publicidade personalizada visitando as configurações de anúncios do Google.
          </p>

          <h2 className="font-display text-lg font-semibold text-foreground pt-4">5. Compartilhamento de Dados</h2>
          <p>
            Não vendemos suas informações pessoais. Podemos compartilhar dados apenas com:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Provedores de serviço que nos auxiliam na operação da plataforma.</li>
            <li>Parceiros de publicidade para exibição de anúncios relevantes.</li>
            <li>Autoridades competentes quando exigido por lei.</li>
          </ul>

          <h2 className="font-display text-lg font-semibold text-foreground pt-4">6. Segurança</h2>
          <p>
            Adotamos medidas técnicas e organizacionais para proteger seus dados contra acesso não autorizado, alteração, divulgação ou destruição. No entanto, nenhum método de transmissão pela internet é 100% seguro.
          </p>

          <h2 className="font-display text-lg font-semibold text-foreground pt-4">7. Seus Direitos</h2>
          <p>
            Você tem o direito de acessar, corrigir ou excluir seus dados pessoais. Para exercer esses direitos, entre em contato conosco pela página de contato.
          </p>

          <h2 className="font-display text-lg font-semibold text-foreground pt-4">8. Alterações</h2>
          <p>
            Podemos atualizar esta política periodicamente. Recomendamos que você revise esta página regularmente.
          </p>

          <h2 className="font-display text-lg font-semibold text-foreground pt-4">9. Contato</h2>
          <p>Para dúvidas sobre privacidade, utilize nossa <a href="/contato" className="text-primary hover:underline">página de contato</a>.</p>
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export default Privacy;
