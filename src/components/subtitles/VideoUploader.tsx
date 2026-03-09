import { useCallback, useState } from "react";
import { Upload, Film, X } from "lucide-react";

interface VideoUploaderProps {
  onVideoSelect: (file: File, url: string) => void;
  videoFile: File | null;
  onClear: () => void;
}

const VideoUploader = ({ onVideoSelect, videoFile, onClear }: VideoUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const MAX_SIZE_MB = 100;

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("video/")) return;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      alert(`Arquivo muito grande. Máximo permitido: ${MAX_SIZE_MB}MB`);
      return;
    }
    const url = URL.createObjectURL(file);
    onVideoSelect(file, url);
  }, [onVideoSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  if (videoFile) {
    return (
      <div className="relative rounded-xl border border-border bg-secondary p-4">
        <button onClick={onClear} className="absolute right-3 top-3 z-10 rounded-full bg-background/80 p-1.5 text-muted-foreground transition-colors hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Film className="h-6 w-6 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{videoFile.name}</p>
            <p className="text-xs text-muted-foreground">{(videoFile.size / (1024 * 1024)).toFixed(1)} MB</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <label
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 transition-all duration-300 ${
        isDragging ? "border-primary bg-primary/5 glow-cyan" : "border-border bg-secondary/50 hover:border-primary/50 hover:bg-secondary"
      }`}
    >
      <input type="file" accept="video/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} className="hidden" />
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
        <Upload className="h-7 w-7 text-primary" />
      </div>
      <p className="text-base font-medium text-foreground mb-1">Arraste seu vídeo aqui</p>
      <p className="text-sm text-muted-foreground">ou clique para selecionar • MP4, MOV, WEBM</p>
      <p className="mt-2 text-xs text-muted-foreground">Máximo 100MB • Até 5 minutos</p>
    </label>
  );
};

export default VideoUploader;
