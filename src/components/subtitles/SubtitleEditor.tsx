import { useState } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";

export interface SubtitleLine {
  id: string;
  start: number;
  end: number;
  text: string;
}

interface SubtitleEditorProps {
  subtitles: SubtitleLine[];
  onUpdate: (subtitles: SubtitleLine[]) => void;
  currentTime?: number;
}

const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
};

const SubtitleEditor = ({ subtitles, onUpdate, currentTime = 0 }: SubtitleEditorProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleTextChange = (id: string, newText: string) => {
    onUpdate(subtitles.map((s) => (s.id === id ? { ...s, text: newText } : s)));
  };

  const handleDelete = (id: string) => {
    onUpdate(subtitles.filter((s) => s.id !== id));
  };

  const handleAdd = () => {
    const lastSub = subtitles[subtitles.length - 1];
    const start = lastSub ? lastSub.end + 0.1 : 0;
    onUpdate([
      ...subtitles,
      { id: crypto.randomUUID(), start, end: start + 2, text: "Nova legenda" },
    ]);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold font-display uppercase tracking-wider text-primary">
          Legendas
        </h3>
        <button
          onClick={handleAdd}
          className="flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
        >
          <Plus className="h-3 w-3" />
          Adicionar
        </button>
      </div>

      <div className="max-h-[400px] overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
        {subtitles.map((sub) => {
          const isActive = currentTime >= sub.start && currentTime <= sub.end;
          return (
            <div
              key={sub.id}
              className={`group flex items-start gap-3 rounded-lg border p-3 transition-all ${
                isActive
                  ? "border-primary/50 bg-primary/5 glow-cyan"
                  : "border-border bg-secondary/30 hover:border-border hover:bg-secondary/50"
              }`}
            >
              <div className="flex-shrink-0 pt-0.5">
                <span className="block text-[10px] font-mono text-muted-foreground">{formatTime(sub.start)}</span>
                <span className="block text-[10px] font-mono text-muted-foreground">{formatTime(sub.end)}</span>
              </div>
              <div className="min-w-0 flex-1">
                {editingId === sub.id ? (
                  <textarea
                    autoFocus
                    value={sub.text}
                    onChange={(e) => handleTextChange(sub.id, e.target.value)}
                    onBlur={() => setEditingId(null)}
                    className="w-full resize-none rounded bg-background/50 p-1 text-sm text-foreground outline-none ring-1 ring-primary/30 focus:ring-primary"
                    rows={2}
                  />
                ) : (
                  <p className="text-sm text-foreground leading-relaxed">{sub.text}</p>
                )}
              </div>
              <div className="flex flex-shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button onClick={() => setEditingId(sub.id)} className="rounded p-1 text-muted-foreground hover:text-primary">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => handleDelete(sub.id)} className="rounded p-1 text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {subtitles.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-8 text-center">
          <p className="text-sm text-muted-foreground">Nenhuma legenda gerada ainda</p>
        </div>
      )}
    </div>
  );
};

export default SubtitleEditor;
