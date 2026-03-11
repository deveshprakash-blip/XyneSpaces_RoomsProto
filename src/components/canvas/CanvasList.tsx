"use client";

import { useMemo } from "react";
import { FileText, Plus, BookOpen } from "lucide-react";
import { useCanvasStore } from "@/stores/canvasStore";
import { useUIStore } from "@/stores/uiStore";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { cn } from "@/lib/utils";

interface CanvasListProps {
  roomId: string;
}

export function CanvasList({ roomId }: CanvasListProps) {
  const allCanvases = useCanvasStore((s) => s.canvases);
  const canvases = useMemo(
    () => allCanvases.filter((c) => c.roomId === roomId),
    [allCanvases, roomId]
  );
  const selectedCanvasId = useUIStore((s) => s.selectedCanvasId);
  const setSelectedCanvas = useUIStore((s) => s.setSelectedCanvas);
  const addCanvas = useCanvasStore((s) => s.addCanvas);

  const indexCanvas = canvases.find((c) => c.type === "index");
  const docCanvases = canvases.filter((c) => c.type === "doc");

  // Group docs by category
  const grouped: Record<string, typeof docCanvases> = {};
  docCanvases.forEach((c) => {
    const cat = c.category || "Other";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(c);
  });

  const handleNewCanvas = () => {
    const canvas = addCanvas(roomId, "Untitled Document", "# Untitled Document\n\nStart writing...", "doc");
    setSelectedCanvas(canvas.id);
  };

  return (
    <div className="w-60 border-r border-gray-200 bg-gray-50 flex flex-col flex-shrink-0 overflow-hidden">
      <div className="p-3 border-b border-gray-200 flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Canvases</span>
        <button
          onClick={handleNewCanvas}
          className="p-1 text-gray-400 hover:text-accent hover:bg-gray-200 rounded transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto py-1">
        {/* Index Canvas */}
        {indexCanvas && (
          <button
            onClick={() => setSelectedCanvas(indexCanvas.id)}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors",
              selectedCanvasId === indexCanvas.id
                ? "bg-accent/10 text-accent border-r-2 border-accent"
                : "text-gray-700 hover:bg-gray-100"
            )}
          >
            <BookOpen className="w-4 h-4 flex-shrink-0" />
            <span className="truncate font-medium">{indexCanvas.title}</span>
          </button>
        )}

        {/* Grouped doc canvases */}
        {Object.entries(grouped).map(([category, docs]) => (
          <div key={category} className="mt-2">
            <div className="px-3 py-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              {category}
            </div>
            {docs.map((canvas) => (
              <button
                key={canvas.id}
                onClick={() => setSelectedCanvas(canvas.id)}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors",
                  selectedCanvasId === canvas.id
                    ? "bg-accent/10 text-accent border-r-2 border-accent"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <FileText className="w-4 h-4 flex-shrink-0" />
                <div className="flex-1 min-w-0 text-left">
                  <div className="truncate">{canvas.title}</div>
                  <StatusBadge status={canvas.status} className="mt-0.5 scale-75 origin-left" />
                </div>
              </button>
            ))}
          </div>
        ))}

        {canvases.length === 0 && (
          <div className="p-4 text-center text-sm text-gray-400">
            No canvases yet. Click + to create one.
          </div>
        )}
      </div>
    </div>
  );
}
