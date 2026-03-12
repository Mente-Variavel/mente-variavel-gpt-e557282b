import { useState } from "react";
import { Link } from "react-router-dom";
import { Newspaper, ArrowRight, Calendar, Tag } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { blogPosts, blogCategories } from "@/data/blogPosts";

const Blog = () => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = activeCategory
    ? blogPosts.filter((p) => p.category === activeCategory)
    : blogPosts;

  return (
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
              Artigos, dicas e novidades sobre trabalho online, marketing digital, produtividade e tecnologia.
            </p>
          </motion.div>

          {/* Category filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-10 max-w-3xl mx-auto">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                !activeCategory
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              Todos
            </button>
            {blogCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto">
            <div className="flex-1 space-y-6">
              {filtered.map((post, i) => (
                <motion.div
                  key={post.slug}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                >
                  <Link
                    to={`/blog/${post.slug}`}
                    className="glass rounded-xl p-6 hover:border-primary/30 transition-all block group"
                  >
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3 flex-wrap">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(post.date).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold">
                        <Tag className="w-2.5 h-2.5" />
                        {post.category}
                      </span>
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
                </motion.div>
              ))}
            </div>

            {/* Sidebar */}
            <aside className="lg:w-72 shrink-0 space-y-6">
              <div className="glass rounded-xl p-5">
                <h3 className="font-display text-xs font-bold text-foreground mb-3 uppercase tracking-wider">Sobre o Blog</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Aqui compartilhamos dicas, tutoriais e reflexões sobre trabalho online, marketing digital, produtividade e ferramentas da internet.
                </p>
              </div>
              <div className="glass rounded-xl p-5">
                <h3 className="font-display text-xs font-bold text-foreground mb-3 uppercase tracking-wider">Categorias</h3>
                <div className="space-y-1">
                  {blogCategories.map((cat) => {
                    const count = blogPosts.filter((p) => p.category === cat).length;
                    return (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                        className={`w-full text-left text-sm py-1.5 px-2 rounded-lg transition-all flex justify-between items-center ${
                          activeCategory === cat
                            ? "text-primary bg-primary/10"
                            : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                        }`}
                      >
                        {cat}
                        <span className="text-[10px] opacity-60">{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Blog;
