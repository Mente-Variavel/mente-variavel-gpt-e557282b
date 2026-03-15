import { useEffect } from "react";
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
import EbookDownload from "./pages/EbookDownload";
import PixCheckout from "./pages/PixCheckout";
import CriadorMusica from "./pages/CriadorMusica";
import CriadorPrompt from "./pages/CriadorPrompt";
import GeradorLegendas from "./pages/GeradorLegendas";
import PixCheckoutProduct from "./pages/PixCheckoutProduct";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Guides from "./pages/Guides";
import GuideArticle from "./pages/GuideArticle";
import Parceiro from "./pages/Parceiro";
import About from "./pages/About";
import Contact from "./pages/Contact";
import CalculadoraPreco from "./pages/CalculadoraPreco";
import ExplorarVideos from "./pages/ExplorarVideos";

import Auth from "./pages/Auth";
import AdminAds from "./pages/AdminAds";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";
import GoogleAnalytics from "./components/GoogleAnalytics";
import { useVisitorTracking } from "./hooks/useVisitorTracking";

const queryClient = new QueryClient();

function AppContent() {
  useVisitorTracking();
  return (
    <>
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
        <Route path="/ebook-download" element={<EbookDownload />} />
        <Route path="/pix-checkout" element={<PixCheckout />} />
        <Route path="/produtos/pix-checkout" element={<PixCheckoutProduct />} />
        <Route path="/servicos/criador-musica" element={<CriadorMusica />} />
        <Route path="/servicos/criador-prompt" element={<CriadorPrompt />} />
        <Route path="/criador-prompt" element={<CriadorPrompt />} />
        <Route path="/produtos/gerador-legendas" element={<GeradorLegendas />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/guias" element={<Guides />} />
        <Route path="/guias/:slug" element={<GuideArticle />} />
        <Route path="/parceiro" element={<Parceiro />} />
        <Route path="/anuncie" element={<Parceiro />} />
        <Route path="/sobre" element={<About />} />
        <Route path="/contato" element={<Contact />} />
        <Route path="/ferramentas/calculadora-preco" element={<CalculadoraPreco />} />
        <Route path="/servicos/explorar-videos" element={<ExplorarVideos />} />
        <Route path="/guia-ferramentas" element={<GuiaFerramentas />} />

        <Route path="/auth" element={<Auth />} />
        <Route path="/admin/anuncios" element={<AdminAds />} />
        <Route path="/privacidade" element={<Privacy />} />
        <Route path="/termos" element={<Terms />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
