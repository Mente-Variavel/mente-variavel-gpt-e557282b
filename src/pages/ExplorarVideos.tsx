import { useState, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Search, Play, X, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

const CATEGORIES = [
  "Música", "Culinária", "Educação", "Tecnologia",
  "Inteligência Artificial", "Negócios", "Esportes",
  "Jogos", "Notícias", "Humor", "Entretenimento", "Viagens",
];

interface VideoResult {
  id: string;
  title: string;
  thumbnail: string;
  channel: string;
}

const ExplorarVideos = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<VideoResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  const searchYouTube = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError("");
    setSelectedVideo(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("youtube-search", {
        body: { query: searchQuery.trim() },
      });

      if (fnError) throw new Error(fnError.message);
      if (data?.error) throw new Error(data.error);

      setResults(data?.videos || []);
      if ((data?.videos || []).length === 0) setError("Nenhum vídeo encontrado.");
    } catch (err: any) {
      setError(err.message || "Erro ao buscar vídeos");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    searchYouTube(query);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 pt-16">
        <div className="container mx-auto px-4 py-12 max-w-6xl">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Youtube className="w-8 h-8 text-primary" />
              <h1 className="font-display text-3xl md:text-4xl font-bold text-primary text-glow-cyan">
                Explorar Vídeos
              </h1>
            </div>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Pesquise qualquer vídeo e assista sem sair da Mente Variável
            </p>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2 mb-6">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="O que você quer assistir?"
              className="flex-1"
            />
            <Button type="submit" disabled={loading} className="gap-1.5">
              <Search className="w-4 h-4" />
              Pesquisar
            </Button>
          </form>

          {/* Categories */}
          <div className="flex flex-wrap gap-2 mb-8">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => { setQuery(cat); searchYouTube(cat); }}
                className="px-3 py-1.5 rounded-full text-xs font-medium border border-border/50 text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all"
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="text-center py-4 text-sm text-destructive">{error}</div>
          )}

          {/* Loading */}
          {loading && (
            <div className="text-center py-12 text-muted-foreground text-sm">Buscando vídeos...</div>
          )}

          {/* Embedded player */}
          <AnimatePresence>
            {selectedVideo && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-8"
              >
                <div className="relative w-full rounded-xl overflow-hidden border border-border/50 bg-black aspect-video">
                  <iframe
                    src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=1`}
                    title="YouTube video player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                </div>
                <div className="flex justify-end mt-2">
                  <Button variant="ghost" size="sm" onClick={() => setSelectedVideo(null)} className="text-xs gap-1">
                    <X className="w-3 h-3" /> Fechar player
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results grid */}
          {!loading && results.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((video, i) => (
                <motion.button
                  key={video.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => setSelectedVideo(video.id)}
                  className={`group text-left rounded-xl border overflow-hidden transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 ${
                    selectedVideo === video.id ? "border-primary/60 bg-primary/5" : "border-border/50 bg-card/50"
                  }`}
                >
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                      <Play className="w-10 h-10 text-white drop-shadow-lg" />
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-medium text-foreground line-clamp-2 leading-snug mb-1">{video.title}</h3>
                    <p className="text-xs text-muted-foreground truncate">{video.channel}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && results.length === 0 && !error && (
            <div className="text-center py-16 text-muted-foreground text-sm">
              <Youtube className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>Pesquise ou selecione uma categoria para explorar vídeos</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ExplorarVideos;
