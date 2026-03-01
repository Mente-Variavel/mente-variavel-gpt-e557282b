import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Mail } from "lucide-react";

const Contact = () => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="flex-1 pt-16">
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <h1 className="font-display text-3xl font-bold text-primary text-glow-cyan mb-8">Contato</h1>
        <div className="glass rounded-xl p-8 border border-border/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-display text-sm font-semibold text-foreground">Fale Conosco</h2>
              <p className="text-xs text-muted-foreground">Responderemos o mais breve possível.</p>
            </div>
          </div>
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <input
              type="text"
              placeholder="Seu nome"
              className="w-full bg-input rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary/50"
            />
            <input
              type="email"
              placeholder="Seu e-mail"
              className="w-full bg-input rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary/50"
            />
            <textarea
              rows={4}
              placeholder="Sua mensagem"
              className="w-full bg-input rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary/50 resize-none"
            />
            <button className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all glow-cyan">
              Enviar Mensagem
            </button>
          </form>
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export default Contact;
