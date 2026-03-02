import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Chat from "./pages/Chat";
import Auth from "./pages/Auth";
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Contact from "./pages/Contact";
import Guides from "./pages/Guides";
import GuideArticle from "./pages/GuideArticle";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Tools from "./pages/Tools";
import Anuncie from "./pages/Anuncie";
import AdminAds from "./pages/AdminAds";
import LogoRender from "./pages/LogoRender";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/assistente" element={<Chat />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/ferramentas" element={<Tools />} />
            <Route path="/guias" element={<Guides />} />
            <Route path="/guias/:slug" element={<GuideArticle />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/sobre" element={<About />} />
            <Route path="/privacidade" element={<Privacy />} />
            <Route path="/termos" element={<Terms />} />
            <Route path="/contato" element={<Contact />} />
            <Route path="/anuncie" element={<Anuncie />} />
            <Route path="/admin/anuncios" element={<AdminAds />} />
            <Route path="/logo-render" element={<LogoRender />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
