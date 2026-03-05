import { Link } from "react-router-dom";
import { BookOpen, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdPlaceholder from "@/components/AdPlaceholder";
import { guides } from "@/data/guides";

const Guides = () => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="flex-1 pt-16">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-7 h-7 text-primary" />
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-primary text-glow-cyan mb-4">
            Guias de Inteligência Artificial
          </h1>
          <p className="text-foreground/70 max-w-2xl mx-auto">
            Aprenda sobre Inteligência Artificial com nossos guias completos e gratuitos. Conteúdo educacional de qualidade em português.
          </p>
        </motion.div>

        <AdPlaceholder placement="banner_top" className="mb-8" />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {guides.map((guide, i) => (
            <motion.div
              key={guide.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link
                to={`/guias/${guide.slug}`}
                className="glass rounded-xl p-6 hover:border-primary/30 transition-all block h-full group"
              >
                <h2 className="font-display text-base font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                  {guide.title}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {guide.description}
                </p>
                <span className="inline-flex items-center gap-1 text-xs text-primary font-medium">
                  Ler guia completo <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>

        <AdPlaceholder placement="middle" className="mt-12" />
      </div>
    </main>
    <Footer />
  </div>
);

export default Guides;
