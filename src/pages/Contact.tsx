import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Mail, Send, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
  email: z.string().trim().email("E-mail inválido").max(255, "E-mail muito longo"),
  message: z.string().trim().min(1, "Mensagem é obrigatória").max(2000, "Mensagem muito longa"),
});

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = contactSchema.safeParse({ name, email, message });
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }

    setSending(true);
    const { error } = await supabase
      .from("contact_messages")
      .insert({ name: result.data.name, email: result.data.email, message: result.data.message });

    setSending(false);

    if (error) {
      toast.error("Erro ao enviar mensagem. Tente novamente.");
      return;
    }

    setSent(true);
    toast.success("Mensagem enviada com sucesso!");
  };

  return (
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

            {sent ? (
              <div className="flex flex-col items-center gap-4 py-8 text-center">
                <CheckCircle className="w-12 h-12 text-green-500" />
                <h3 className="font-display text-lg font-semibold text-foreground">Mensagem Enviada!</h3>
                <p className="text-sm text-muted-foreground">Obrigado pelo contato. Retornaremos em breve.</p>
                <button
                  onClick={() => { setSent(false); setName(""); setEmail(""); setMessage(""); }}
                  className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all glow-cyan"
                >
                  Enviar Nova Mensagem
                </button>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={handleSubmit}>
                <input
                  type="text"
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={100}
                  className="w-full bg-input rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary/50"
                />
                <input
                  type="email"
                  placeholder="Seu e-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  maxLength={255}
                  className="w-full bg-input rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary/50"
                />
                <textarea
                  rows={4}
                  placeholder="Sua mensagem"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={2000}
                  className="w-full bg-input rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary/50 resize-none"
                />
                <button
                  type="submit"
                  disabled={sending}
                  className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all glow-cyan flex items-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {sending ? "Enviando..." : "Enviar Mensagem"}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
