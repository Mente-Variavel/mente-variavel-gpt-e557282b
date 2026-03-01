import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Save, LogIn, Upload, X, Image } from "lucide-react";

const SLOT_LABELS: Record<string, string> = {
  banner_top: "🔝 Banner Topo",
  inline_1: "📄 Inline 1 (meio da página)",
  inline_2: "📄 Inline 2 (meio da página)",
  footer: "🔻 Rodapé",
};

const AdminAds = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: ads, isLoading } = useQuery({
    queryKey: ["admin-ads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ads")
        .select("*")
        .order("slot");
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const updateMutation = useMutation({
    mutationFn: async (ad: { id: string; title: string; description: string; image_url: string; link_url: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("ads")
        .update({
          title: ad.title,
          description: ad.description,
          image_url: ad.image_url,
          link_url: ad.link_url,
          is_active: ad.is_active,
        })
        .eq("id", ad.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-ads"] });
      queryClient.invalidateQueries({ queryKey: ["ad"] });
      toast.success("Anúncio salvo com sucesso!");
    },
    onError: () => toast.error("Erro ao salvar anúncio"),
  });

  if (authLoading || isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-1 flex items-center justify-center pt-20">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center pt-20 gap-4">
          <p className="text-muted-foreground">Faça login para gerenciar os anúncios.</p>
          <Button onClick={() => navigate("/auth")} className="gap-2">
            <LogIn className="w-4 h-4" />
            Fazer login
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 pt-20 container mx-auto px-4 py-8">
        <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-8">
          Gerenciar Anúncios
        </h1>
        <div className="grid gap-6">
          {ads?.map((ad) => (
            <AdEditor
              key={ad.id}
              ad={ad}
              label={SLOT_LABELS[ad.slot] || ad.slot}
              onSave={(updated) => updateMutation.mutate({ ...updated, id: ad.id })}
              saving={updateMutation.isPending}
            />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

interface AdEditorProps {
  ad: {
    id: string;
    slot: string;
    title: string;
    description: string | null;
    image_url: string | null;
    link_url: string | null;
    is_active: boolean;
  };
  label: string;
  onSave: (data: { title: string; description: string; image_url: string; link_url: string; is_active: boolean }) => void;
  saving: boolean;
}

const AdEditor = ({ ad, label, onSave, saving }: AdEditorProps) => {
  const [title, setTitle] = useState(ad.title || "");
  const [description, setDescription] = useState(ad.description || "");
  const [imageUrl, setImageUrl] = useState(ad.image_url || "");
  const [linkUrl, setLinkUrl] = useState(ad.link_url || "");
  const [isActive, setIsActive] = useState(ad.is_active);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTitle(ad.title || "");
    setDescription(ad.description || "");
    setImageUrl(ad.image_url || "");
    setLinkUrl(ad.link_url || "");
    setIsActive(ad.is_active);
  }, [ad]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Selecione um arquivo de imagem");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Imagem deve ter no máximo 5MB");
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const fileName = `${ad.slot}-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("ad-images")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("ad-images")
        .getPublicUrl(fileName);

      setImageUrl(publicUrl);
      toast.success("Imagem enviada com sucesso!");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao enviar imagem");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="glass rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg font-bold text-foreground">{label}</h3>
        <div className="flex items-center gap-2">
          <Label htmlFor={`active-${ad.id}`} className="text-sm text-muted-foreground">
            Ativo
          </Label>
          <Switch
            id={`active-${ad.id}`}
            checked={isActive}
            onCheckedChange={setIsActive}
          />
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div>
            <Label className="text-sm text-muted-foreground">Título do anúncio</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Empresa XYZ" />
          </div>
          <div>
            <Label className="text-sm text-muted-foreground">Descrição curta</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Breve descrição..." rows={2} />
          </div>
          <div>
            <Label className="text-sm text-muted-foreground">Link de destino</Label>
            <Input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://empresa.com.br" />
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <Label className="text-sm text-muted-foreground">Imagem do anúncio</Label>
            <div className="space-y-2">
              {imageUrl ? (
                <div className="relative rounded-lg overflow-hidden border border-border/50 bg-card/50">
                  <img src={imageUrl} alt="Preview" className="w-full h-40 object-contain" />
                  <button
                    onClick={() => setImageUrl("")}
                    className="absolute top-2 right-2 p-1 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="w-full h-40 rounded-lg border-2 border-dashed border-border/50 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                  <Image className="w-8 h-8" />
                  <span className="text-xs">Recomendado: 1080x1080px</span>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full gap-2"
              >
                <Upload className="w-4 h-4" />
                {uploading ? "Enviando..." : "Enviar imagem"}
              </Button>
              <Input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Ou cole a URL da imagem"
                className="text-xs"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-end mt-4">
        <Button
          onClick={() => onSave({ title, description, image_url: imageUrl, link_url: linkUrl, is_active: isActive })}
          disabled={saving}
          className="gap-2"
        >
          <Save className="w-4 h-4" />
          Salvar
        </Button>
      </div>
    </div>
  );
};

export default AdminAds;
