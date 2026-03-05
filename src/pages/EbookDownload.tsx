import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Download, CheckCircle, BookOpen, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSearchParams, Link } from "react-router-dom";

export default function EbookDownload() {
  const [searchParams] = useSearchParams();
  const [title, setTitle] = useState("Seu E-book");

  useEffect(() => {
    const savedTitle = localStorage.getItem("mv_project_title");
    if (savedTitle) setTitle(savedTitle);

    // Mark as paid when arriving from PicCheckout
    const paid = searchParams.get("paid");
    if (paid === "true") {
      localStorage.setItem("mv_ebook_paid", "true");
    }
  }, [searchParams]);

  const isPaid = localStorage.getItem("mv_ebook_paid") === "true";

  const handleDownload = () => {
    // Trigger the PDF export by redirecting to generator with export flag
    const savedSlides = localStorage.getItem("mv_slides_data");
    const savedChapters = localStorage.getItem("mv_chapters_data");

    if (!savedSlides && !savedChapters) {
      return;
    }

    // Build HTML for download
    const projectTitle = localStorage.getItem("mv_project_title") || "E-book";
    const projectTema = localStorage.getItem("mv_project_tema") || "";
    const projectTom = localStorage.getItem("mv_project_tom") || "Profissional";

    let items: any[] = [];
    let isSlides = false;
    if (savedSlides) {
      try { items = JSON.parse(savedSlides); isSlides = true; } catch {}
    } else if (savedChapters) {
      try { items = JSON.parse(savedChapters); } catch {}
    }

    const htmlContent = `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<style>
  body { font-family: 'Segoe UI', sans-serif; padding: 40px; color: #222; max-width: 800px; margin: 0 auto; }
  h1 { font-size: 28px; margin-bottom: 8px; color: #111; }
  h2 { font-size: 20px; margin-top: 32px; border-bottom: 2px solid #0ff; padding-bottom: 4px; }
  .slide-card { page-break-inside: avoid; margin: 24px 0; padding: 16px; border: 1px solid #ddd; border-radius: 8px; }
  .slide-num { font-size: 12px; color: #888; font-weight: bold; }
  ul { padding-left: 20px; }
  li { margin: 4px 0; }
  .visual { font-style: italic; color: #666; font-size: 13px; margin-top: 8px; }
  .notes { background: #f5f5f5; padding: 8px 12px; border-radius: 4px; font-size: 13px; margin-top: 8px; }
  img { max-width: 100%; height: auto; border-radius: 8px; margin: 12px 0; }
  .chapter { margin: 32px 0; }
  .chapter p { line-height: 1.7; }
</style>
</head><body>
<h1>${projectTitle}</h1>
<p style="color:#666">${projectTema} • Tom: ${projectTom}</p>
<hr />
${isSlides
  ? items.map((s: any, i: number) => `
    <div class="slide-card">
      <span class="slide-num">SLIDE ${i + 1}</span>
      <h2>${s.title}</h2>
      ${s.imageUrl ? `<img src="${s.imageUrl}" alt="${s.title}" />` : ""}
      <ul>${(s.bullets || []).map((b: string) => `<li>${b}</li>`).join("")}</ul>
      ${s.visual ? `<p class="visual">🎨 ${s.visual}</p>` : ""}
      ${s.notes ? `<div class="notes">📝 ${s.notes}</div>` : ""}
    </div>`).join("")
  : items.map((c: any) => `
    <div class="chapter">
      <h2>${c.title}</h2>
      ${c.imageUrl ? `<img src="${c.imageUrl}" alt="${c.title}" />` : ""}
      <p>${(c.content || "").replace(/\n/g, "<br/>")}</p>
      ${(c.subchapters || []).length ? `<ul>${c.subchapters.map((sc: string) => `<li>${sc}</li>`).join("")}</ul>` : ""}
    </div>`).join("")
}
</body></html>`;

    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const printWindow = window.open(url, "_blank");
    if (printWindow) {
      printWindow.onload = () => { printWindow.print(); };
    }
  };

  if (!isPaid) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 pt-24 pb-16 flex items-center justify-center">
          <div className="text-center max-w-md px-4">
            <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">Acesso não autorizado</h1>
            <p className="text-muted-foreground mb-6">
              Você precisa concluir o pagamento para acessar o download do e-book.
            </p>
            <Link to="/gerador-slides">
              <Button className="gap-2">
                <ArrowLeft className="w-4 h-4" /> Voltar ao Gerador
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-24 pb-16 flex items-center justify-center">
        <div className="max-w-lg px-4 w-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-16 h-16 rounded-full bg-green-500/10 border-2 border-green-500/30 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>

            <h1 className="text-2xl md:text-3xl font-bold mb-3">
              E-book liberado com sucesso!
            </h1>

            <p className="text-muted-foreground mb-8">
              Obrigado pela sua compra. Seu download está disponível abaixo.
            </p>

            <Button
              size="lg"
              onClick={handleDownload}
              className="gap-2 h-14 px-8 text-base"
            >
              <Download className="w-5 h-5" /> Baixar E-book
            </Button>

            <div className="mt-8">
              <Link to="/gerador-slides" className="text-sm text-muted-foreground hover:text-foreground transition-colors underline">
                Voltar ao gerador
              </Link>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
