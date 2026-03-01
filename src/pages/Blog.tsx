import { Link } from "react-router-dom";
import { Newspaper, ArrowRight, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdPlaceholder from "@/components/AdPlaceholder";
import { blogPosts } from "@/data/blogPosts";

const Blog = () => (
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
            <Newspaper className="w-7 h-7 text-primary" />
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-primary text-glow-cyan mb-4">
            Blog
          </h1>
          <p className="text-foreground/70 max-w-2xl mx-auto">
            Artigos, dicas e novidades sobre Inteligência Artificial, produtividade e tecnologia.
          </p>
        </motion.div>

        <AdPlaceholder format="banner" className="mb-8" />

        <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto">
          <div className="flex-1 space-y-6">
            {blogPosts.map((post, i) => (
              <motion.div
                key={post.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link
                  to={`/blog/${post.slug}`}
                  className="glass rounded-xl p-6 hover:border-primary/30 transition-all block group"
                >
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(post.date).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })}
                  </div>
                  <h2 className="font-display text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                    {post.description}
                  </p>
                  <span className="inline-flex items-center gap-1 text-xs text-primary font-medium">
                    Ler artigo <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
                {i === 1 && <AdPlaceholder format="inline" className="mt-6" />}
              </motion.div>
            ))}
          </div>

          {/* Sidebar */}
          <aside className="lg:w-72 shrink-0 space-y-6">
            <AdPlaceholder format="sidebar" />
            <div className="glass rounded-xl p-5">
              <h3 className="font-display text-xs font-bold text-foreground mb-3 uppercase tracking-wider">Sobre o Blog</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Aqui compartilhamos dicas, tutoriais e reflexões sobre Inteligência Artificial e como ela pode transformar seu dia a dia.
              </p>
            </div>
            <AdPlaceholder format="sidebar" />
          </aside>
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export default Blog;
