import { useState } from "react";
import { MessageSquare, Plus, Trash2, Edit3, Check, X, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export interface ChatConversation {
  id: string;
  title: string;
  updatedAt: string;
  messageCount: number;
}

interface ChatSidebarProps {
  conversations: ChatConversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  isCollapsed: boolean;
  onToggle: () => void;
}

const ChatSidebar = ({
  conversations,
  activeId,
  onSelect,
  onNew,
  onRename,
  onDelete,
  isCollapsed,
  onToggle,
}: ChatSidebarProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const startEdit = (conv: ChatConversation) => {
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const saveEdit = () => {
    if (editingId && editTitle.trim()) {
      onRename(editingId, editTitle.trim());
    }
    setEditingId(null);
    setEditTitle("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
  };

  return (
    <motion.div
      initial={false}
      animate={{ width: isCollapsed ? 48 : 260 }}
      transition={{ duration: 0.2 }}
      className="relative h-full border-r border-border/50 bg-card/50 flex flex-col"
    >
      {/* Toggle button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-background text-muted-foreground hover:text-foreground transition-colors shadow-sm"
      >
        {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
      </button>

      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border/30">
        {!isCollapsed && (
          <span className="font-display text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Conversas
          </span>
        )}
        <button
          onClick={onNew}
          className={cn(
            "flex items-center gap-1.5 rounded-lg text-xs text-primary hover:bg-primary/10 transition-all",
            isCollapsed ? "p-2" : "px-2 py-1.5"
          )}
          title="Novo Chat"
        >
          <Plus className="h-4 w-4" />
          {!isCollapsed && <span>Novo</span>}
        </button>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto py-2">
        <AnimatePresence mode="popLayout">
          {conversations.map((conv) => (
            <motion.div
              key={conv.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className={cn(
                "group relative mx-2 mb-1 rounded-lg transition-all cursor-pointer",
                activeId === conv.id
                  ? "bg-primary/10 border border-primary/30"
                  : "hover:bg-secondary/50 border border-transparent"
              )}
            >
              {editingId === conv.id ? (
                <div className="flex items-center gap-1 p-2">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveEdit();
                      if (e.key === "Escape") cancelEdit();
                    }}
                    className="flex-1 bg-background border border-border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                    autoFocus
                  />
                  <button onClick={saveEdit} className="p-1 text-green-500 hover:bg-green-500/10 rounded">
                    <Check className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={cancelEdit} className="p-1 text-muted-foreground hover:bg-secondary rounded">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => onSelect(conv.id)}
                  className={cn("flex items-center gap-2 p-2", isCollapsed && "justify-center")}
                >
                  <MessageSquare className={cn("h-4 w-4 flex-shrink-0", activeId === conv.id ? "text-primary" : "text-muted-foreground")} />
                  {!isCollapsed && (
                    <>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">
                          {conv.title}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {conv.messageCount} msgs
                        </p>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity">
                        <button
                          onClick={(e) => { e.stopPropagation(); startEdit(conv); }}
                          className="p-1 text-muted-foreground hover:text-foreground hover:bg-secondary rounded"
                          title="Renomear"
                        >
                          <Edit3 className="h-3 w-3" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); onDelete(conv.id); }}
                          className="p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded"
                          title="Excluir"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {conversations.length === 0 && !isCollapsed && (
          <p className="px-4 py-8 text-center text-xs text-muted-foreground">
            Nenhuma conversa ainda.
            <br />
            Comece um novo chat!
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default ChatSidebar;
