import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import EducacaoFinanceira from "./pages/EducacaoFinanceira";
import ControleGastos from "./pages/ControleGastos";
import ConversorMoedas from "./pages/ConversorMoedas";
import RemovedorFundo from "./pages/RemovedorFundo";
import GeradorSlides from "./pages/GeradorSlides";
import PixCheckout from "./pages/PixCheckout";
import CriadorPrompt from "./pages/CriadorPrompt";
import Contact from "./pages/Contact";
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
            <Route path="/financas/educacao" element={<EducacaoFinanceira />} />
            <Route path="/financas/controle" element={<ControleGastos />} />
            <Route path="/financas/conversor" element={<ConversorMoedas />} />
            <Route path="/servicos/removedor-fundo" element={<RemovedorFundo />} />
            <Route path="/servicos/gerador-slides" element={<GeradorSlides />} />
            <Route path="/servicos/pix-checkout" element={<PixCheckout />} />
            <Route path="/criador-prompt" element={<CriadorPrompt />} />
            <Route path="/contato" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
