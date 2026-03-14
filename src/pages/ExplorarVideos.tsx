import { useState, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Search, Play, Settings, X, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

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
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("yt_api_key") || "");
  const [showConfig, setShowConfig] = useState(false);
  const [tempKey, setTempKey] = useState(apiKey);

  const searchYouTube = useCallback(async (searchQuery: string) => {
    if (!apiKey) {
      setError("Configure sua YouTube API Key antes de pesquisar.");
      setShowConfig(true);
      return;
    }
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError("");
    setSelectedVideo(null);

    try {
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=12&q=${encodeURIComponent(searchQuery)}&key=${apiKey}`;
      const res = await fetch(url);
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error?.message || "Erro ao buscar vídeos");
      }
      const data = await res.json();
      const videos: VideoResult[] = (data.items || []).map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
        channel: item.snippet.channelTitle,
      }));
      setResults(videos);
      if (videos.length === 0) setError("Nenhum vídeo encontrado.");
    } catch (err: any) {
      setError(err.message || "Erro ao buscar vídeos");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [apiKey]);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    searchYouTube(query);
  };

  const saveApiKey = () => {
    localStorage.setItem("yt_api_key", tempKey);
    setApiKey(tempKey);
    setShowConfig(false);
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

          {/* Config button */}
          <div className="flex justify-end mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setTempKey(apiKey); setShowConfig(!showConfig); }}
              className="gap-1.5 text-xs"
            >
              <Settings className="w-3.5 h-3.5" />
              {apiKey ? "API Key configurada" : "Configurar API Key"}
            </Button>
          </div>

          {/* Config panel */}
          <AnimatePresence>
            {showConfig && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 overflow-hidden"
              >
                <div className="glass rounded-xl p-5 border border-border/50">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-foreground">Configuração da API</h3>
                    <button onClick={() => setShowConfig(false)} className="text-muted-foreground hover:text-foreground">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    Insira sua chave da YouTube Data API v3 para habilitar as buscas.
                  </p>
                  <div className="flex gap-2">
                    <Input
                      type="password"
                      value={tempKey}
                      onChange={(e) => setTempKey(e.target.value)}
                      placeholder="Cole sua YouTube API Key aqui"
                      className="flex-1 text-sm"
                    />
                    <Button onClick={saveApiKey} size="sm">Salvar</Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

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
                    <h3 className="text-sm font-medium text-foreground line-clamp-2 leading-snug mb-1" dangerouslySetInnerHTML={{ __html: video.title }} />
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
