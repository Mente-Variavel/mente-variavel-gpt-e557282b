import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Upload, Trash2, Video, Loader2 } from "lucide-react";

export default function VideoUploadAdmin() {
  const [videoUrl, setVideoUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "pix_product_video_url")
        .maybeSingle();
      if (data?.value) setVideoUrl(data.value);
      setLoading(false);
    };
    fetch();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      toast.error("Arquivo muito grande. Máximo: 50MB");
      return;
    }

    const allowedTypes = ["video/mp4", "video/webm", "video/ogg"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Formato não suportado. Use MP4, WebM ou OGG.");
      return;
    }

    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `pix-checkout-demo.${ext}`;

    // Remove old file if exists
    await supabase.storage.from("product-videos").remove([path]);

    const { error } = await supabase.storage
      .from("product-videos")
      .upload(path, file, { upsert: true });

    if (error) {
      toast.error("Erro ao fazer upload: " + error.message);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("product-videos")
      .getPublicUrl(path);

    const publicUrl = urlData.publicUrl;

    await supabase.from("site_settings").upsert({
      key: "pix_product_video_url",
      value: publicUrl,
      updated_at: new Date().toISOString(),
    });

    setVideoUrl(publicUrl);
    setUploading(false);
    toast.success("Vídeo enviado com sucesso!");
  };

  const handleRemove = async () => {
    if (!confirm("Remover o vídeo?")) return;

    const fileName = videoUrl.split("/").pop();
    if (fileName) {
      await supabase.storage.from("product-videos").remove([fileName]);
    }

    await supabase.from("site_settings").upsert({
      key: "pix_product_video_url",
      value: "",
      updated_at: new Date().toISOString(),
    });

    setVideoUrl("");
    toast.success("Vídeo removido.");
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        <Loader2 className="w-4 h-4 animate-spin" /> Carregando...
      </div>
    );
  }

  return (
    <div className="glass rounded-xl border border-border/50 p-5 space-y-4">
      <h3 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
        <Video className="w-5 h-5 text-primary" />
        Vídeo do Pix Checkout (Página de Produto)
      </h3>

      <p className="text-xs text-muted-foreground">
        Faça upload de um vídeo demonstrativo do Pix Checkout. Formatos aceitos: <strong>MP4, WebM ou OGG</strong>. Tamanho máximo: <strong>50MB</strong>. 
        Recomendação: vídeo curto (30s a 2min), 720p ou 1080p, formato paisagem (16:9).
      </p>

      {videoUrl ? (
        <div className="space-y-3">
          <video
            src={videoUrl}
            controls
            className="w-full rounded-lg border border-border max-h-[300px]"
          />
          <div className="flex items-center gap-2">
            <Input value={videoUrl} readOnly className="text-xs font-mono bg-secondary" />
            <Button variant="destructive" size="icon" onClick={handleRemove} title="Remover vídeo">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        <Label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg p-8 cursor-pointer hover:border-primary/50 transition-colors">
          {uploading ? (
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
          ) : (
            <Upload className="w-8 h-8 text-muted-foreground mb-2" />
          )}
          <span className="text-sm text-muted-foreground">
            {uploading ? "Enviando..." : "Clique para enviar um vídeo"}
          </span>
          <input
            type="file"
            accept="video/mp4,video/webm,video/ogg"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
        </Label>
      )}
    </div>
  );
}
