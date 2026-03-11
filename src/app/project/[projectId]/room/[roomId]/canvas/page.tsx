"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { RoomHeader } from "@/components/layout/RoomHeader";
import { TabBar } from "@/components/layout/TabBar";
import { CanvasList } from "@/components/canvas/CanvasList";
import { CanvasStatusBar } from "@/components/canvas/CanvasStatusBar";
import { CanvasAnnotations } from "@/components/canvas/CanvasAnnotations";
import { useCanvasStore } from "@/stores/canvasStore";
import { useUIStore } from "@/stores/uiStore";
import { FileText } from "lucide-react";

const CanvasEditor = dynamic(
  () => import("@/components/canvas/CanvasEditor").then((m) => ({ default: m.CanvasEditor })),
  { ssr: false, loading: () => <div className="flex-1 p-6 text-gray-400">Loading editor...</div> }
);

export default function CanvasPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const roomId = params.roomId as string;
  const allCanvases = useCanvasStore((s) => s.canvases);
  const canvases = useMemo(
    () => allCanvases.filter((c) => c.roomId === roomId),
    [allCanvases, roomId]
  );
  const selectedCanvasId = useUIStore((s) => s.selectedCanvasId);
  const setSelectedCanvas = useUIStore((s) => s.setSelectedCanvas);
  const [showAnnotations, setShowAnnotations] = useState(true);

  // Auto-select first canvas
  useEffect(() => {
    if (!selectedCanvasId && canvases.length > 0) {
      setSelectedCanvas(canvases[0].id);
    }
  }, [canvases, selectedCanvasId, setSelectedCanvas]);

  const selectedCanvas = canvases.find((c) => c.id === selectedCanvasId);

  return (
    <>
      <RoomHeader roomId={roomId} />
      <TabBar projectId={projectId} roomId={roomId} />
      <div className="flex-1 flex overflow-hidden">
        {/* Canvas list sidebar */}
        <CanvasList roomId={roomId} />

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedCanvas ? (
            <>
              <CanvasStatusBar canvas={selectedCanvas} projectId={projectId} roomId={roomId} />
              <div className="flex-1 flex overflow-hidden">
                <CanvasEditor canvas={selectedCanvas} />
                {showAnnotations && selectedCanvas.annotations.length > 0 && (
                  <CanvasAnnotations
                    annotations={selectedCanvas.annotations}
                    onClose={() => setShowAnnotations(false)}
                  />
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Select a canvas or create a new one</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
