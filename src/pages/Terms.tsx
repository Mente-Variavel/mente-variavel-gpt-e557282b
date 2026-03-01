import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Terms = () => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="flex-1 pt-16">
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <h1 className="font-display text-3xl font-bold text-primary text-glow-cyan mb-8">Termos de Uso</h1>
        <p className="text-xs text-muted-foreground mb-8">Última atualização: 1 de março de 2026</p>
        <div className="space-y-4 text-foreground/80 text-sm leading-relaxed">
          <p>Ao utilizar o Mente Variável GPT, você concorda com os seguintes termos e condições:</p>

          <h2 className="font-display text-lg font-semibold text-foreground pt-4">1. Aceitação dos Termos</h2>
          <p>
            Ao acessar e utilizar o site Mente Variável GPT e seus serviços, você declara ter lido, compreendido e concordado com estes Termos de Uso. Se não concordar, por favor, não utilize o serviço.
          </p>

          <h2 className="font-display text-lg font-semibold text-foreground pt-4">2. Descrição do Serviço</h2>
          <p>
            O Mente Variável GPT é uma plataforma gratuita que oferece um assistente de Inteligência Artificial para auxiliar com ideias, textos, estudos e soluções criativas, além de conteúdo educacional sobre IA.
          </p>

          <h2 className="font-display text-lg font-semibold text-foreground pt-4">3. Uso Aceitável</h2>
          <p>O serviço deve ser utilizado de forma ética e legal. É proibido:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Usar o assistente para gerar conteúdo ilegal, prejudicial ou que viole direitos de terceiros.</li>
            <li>Tentar acessar sistemas ou dados de forma não autorizada.</li>
            <li>Utilizar o serviço para spam, phishing ou atividades fraudulentas.</li>
            <li>Sobrecarregar o sistema com requisições automatizadas excessivas.</li>
          </ul>

          <h2 className="font-display text-lg font-semibold text-foreground pt-4">4. Limitações da IA</h2>
          <p>
            O assistente de IA utiliza modelos de linguagem que podem gerar informações incorretas, desatualizadas ou incompletas. As respostas não substituem aconselhamento profissional em áreas como saúde, direito, finanças ou qualquer outra especialidade. O usuário é responsável por verificar informações importantes.
          </p>

          <h2 className="font-display text-lg font-semibold text-foreground pt-4">5. Limites de Uso</h2>
          <p>
            Para garantir a qualidade do serviço para todos os usuários, limites de uso podem ser aplicados. Usuários convidados podem enviar até 20 mensagens por dia. Usuários cadastrados podem enviar até 100 mensagens por dia.
          </p>

          <h2 className="font-display text-lg font-semibold text-foreground pt-4">6. Propriedade Intelectual</h2>
          <p>
            O conteúdo do site, incluindo textos, imagens, design e código, é protegido por direitos autorais. O conteúdo gerado pelo assistente pode ser utilizado livremente pelo usuário, mas o Mente Variável GPT não se responsabiliza por seu uso posterior.
          </p>

          <h2 className="font-display text-lg font-semibold text-foreground pt-4">7. Isenção de Responsabilidade</h2>
          <p>
            O serviço é fornecido "como está", sem garantias de qualquer tipo. Não nos responsabilizamos por danos diretos ou indiretos decorrentes do uso do serviço ou das informações fornecidas pelo assistente de IA.
          </p>

          <h2 className="font-display text-lg font-semibold text-foreground pt-4">8. Modificações</h2>
          <p>
            Reservamos o direito de modificar estes termos a qualquer momento. Atualizações serão publicadas nesta página com a data de revisão atualizada. O uso continuado do serviço após alterações constitui aceitação dos novos termos.
          </p>

          <h2 className="font-display text-lg font-semibold text-foreground pt-4">9. Contato</h2>
          <p>Para dúvidas sobre estes termos, utilize nossa <a href="/contato" className="text-primary hover:underline">página de contato</a>.</p>
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export default Terms;
