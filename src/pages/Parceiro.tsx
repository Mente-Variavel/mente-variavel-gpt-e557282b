import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Handshake, Clock } from "lucide-react";
import { motion } from "framer-motion";

const Parceiro = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 pt-20 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Handshake className="w-10 h-10 text-primary" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-4">
            Seja um <span className="text-primary">Parceiro</span>
          </h1>
          <div className="flex items-center justify-center gap-2 text-muted-foreground mb-4">
            <Clock className="w-4 h-4" />
            <p className="text-sm">Em breve, mais informações.</p>
          </div>
          <p className="text-sm text-muted-foreground">
            Estamos preparando o programa de parcerias. Volte em breve para conferir as novidades!
          </p>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default Parceiro;
