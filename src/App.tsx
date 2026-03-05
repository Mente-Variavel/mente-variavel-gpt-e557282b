import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Chat from "./pages/Chat";
import Tools from "./pages/Tools";
import LogoRender from "./pages/LogoRender";
import EducacaoFinanceira from "./pages/EducacaoFinanceira";
import ControleGastos from "./pages/ControleGastos";
import ConversorMoedas from "./pages/ConversorMoedas";
import RemovedorFundo from "./pages/RemovedorFundo";
import GeradorSlides from "./pages/GeradorSlides";
import CriadorMusica from "./pages/CriadorMusica";
import CriadorPrompt from "./pages/CriadorPrompt";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Guides from "./pages/Guides";
import GuideArticle from "./pages/GuideArticle";
import Anuncie from "./pages/Anuncie";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import AdminAds from "./pages/AdminAds";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";
import GoogleAnalytics from "./components/GoogleAnalytics";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <GoogleAnalytics />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/assistente" element={<Chat />} />
            <Route path="/ferramentas" element={<Tools />} />
            <Route path="/logo-render" element={<LogoRender />} />
            <Route path="/financas/educacao" element={<EducacaoFinanceira />} />
            <Route path="/financas/controle" element={<ControleGastos />} />
            <Route path="/financas/conversor" element={<ConversorMoedas />} />
            <Route path="/servicos/removedor-fundo" element={<RemovedorFundo />} />
            <Route path="/servicos/gerador-slides" element={<GeradorSlides />} />
            <Route path="/servicos/criador-musica" element={<CriadorMusica />} />
            <Route path="/criador-prompt" element={<CriadorPrompt />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/guias" element={<Guides />} />
            <Route path="/guias/:slug" element={<GuideArticle />} />
            <Route path="/anuncie" element={<Anuncie />} />
            <Route path="/sobre" element={<About />} />
            <Route path="/contato" element={<Contact />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/admin/anuncios" element={<AdminAds />} />
            <Route path="/privacidade" element={<Privacy />} />
            <Route path="/termos" element={<Terms />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
