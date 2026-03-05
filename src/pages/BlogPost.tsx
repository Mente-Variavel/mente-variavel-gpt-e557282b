import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdPlaceholder from "@/components/AdPlaceholder";
import { blogPosts } from "@/data/blogPosts";

const BlogPostPage = () => {
  const { slug } = useParams();
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 pt-16 flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold text-foreground mb-4">Artigo não encontrado</h1>
            <Link to="/blog" className="text-primary hover:underline">Voltar ao blog</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 pt-16">
        <div className="container mx-auto px-4 py-16">
          <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto">
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 max-w-3xl"
            >
              <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8">
                <ArrowLeft className="w-4 h-4" /> Voltar ao blog
              </Link>

              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(post.date).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })}
              </div>

              <h1 className="font-display text-3xl md:text-4xl font-bold text-primary text-glow-cyan mb-4">
                {post.title}
              </h1>
              <p className="text-foreground/70 mb-8">{post.description}</p>

              <AdPlaceholder placement="middle" className="mb-8" />

              <div className="prose prose-invert prose-sm max-w-none [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-foreground [&_h2]:mt-10 [&_h2]:mb-4 [&_h3]:font-display [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-foreground [&_h3]:mt-8 [&_h3]:mb-3 [&_p]:text-foreground/75 [&_p]:leading-relaxed [&_p]:mb-4 [&_li]:text-foreground/75 [&_strong]:text-foreground [&_ul]:mb-4 [&_ol]:mb-4">
                <ReactMarkdown>{post.content}</ReactMarkdown>
              </div>

              <AdPlaceholder placement="middle" className="mt-10" />
            </motion.article>

            <aside className="lg:w-72 shrink-0 space-y-6">
              <AdPlaceholder placement="sidebar" />
              <div className="glass rounded-xl p-5">
                <h3 className="font-display text-xs font-bold text-foreground mb-3 uppercase tracking-wider">Outros Artigos</h3>
                <div className="space-y-2">
                  {blogPosts.filter(p => p.slug !== slug).map(p => (
                    <Link
                      key={p.slug}
                      to={`/blog/${p.slug}`}
                      className="block text-sm text-muted-foreground hover:text-primary transition-colors py-1"
                    >
                      {p.title}
                    </Link>
                  ))}
                </div>
              </div>
              <AdPlaceholder placement="sidebar" />
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BlogPostPage;
