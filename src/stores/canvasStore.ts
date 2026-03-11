import { create } from "zustand";
import { Canvas, CanvasAnnotation } from "@/types";
import { canvases } from "@/data/seed";
import { generateId } from "@/lib/utils";

interface CanvasStore {
  canvases: Canvas[];
  getCanvas: (id: string) => Canvas | undefined;
  getCanvasesByRoom: (roomId: string) => Canvas[];
  updateCanvasStatus: (canvasId: string, status: Canvas["status"], approvedBy?: string) => void;
  updateCanvasContent: (canvasId: string, content: string) => void;
  addCanvas: (roomId: string, title: string, content: string, type?: "index" | "doc", category?: string) => Canvas;
  addAnnotation: (canvasId: string, annotation: Omit<CanvasAnnotation, "id" | "createdAt">) => void;
}

export const useCanvasStore = create<CanvasStore>((set, get) => ({
  canvases: canvases,
  getCanvas: (id) => get().canvases.find((c) => c.id === id),
  getCanvasesByRoom: (roomId) => get().canvases.filter((c) => c.roomId === roomId),
  updateCanvasStatus: (canvasId, status, approvedBy) => {
    set((s) => ({
      canvases: s.canvases.map((c) =>
        c.id === canvasId
          ? {
              ...c,
              status,
              approvedBy: approvedBy || c.approvedBy,
              approvedAt: status === "approved" ? Date.now() : c.approvedAt,
              updatedAt: Date.now(),
            }
          : c
      ),
    }));
  },
  updateCanvasContent: (canvasId, content) => {
    set((s) => ({
      canvases: s.canvases.map((c) =>
        c.id === canvasId ? { ...c, content, updatedAt: Date.now() } : c
      ),
    }));
  },
  addCanvas: (roomId, title, content, type = "doc", category = "Engineering") => {
    const newCanvas: Canvas = {
      id: `canvas-${generateId()}`,
      roomId,
      title,
      type,
      content,
      status: "draft",
      linkedTickets: [],
      annotations: [],
      category,
      createdBy: "user-rishabh",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    set((s) => ({ canvases: [...s.canvases, newCanvas] }));
    return newCanvas;
  },
  addAnnotation: (canvasId, annotation) => {
    const newAnn: CanvasAnnotation = {
      ...annotation,
      id: `ann-${generateId()}`,
      createdAt: Date.now(),
    };
    set((s) => ({
      canvases: s.canvases.map((c) =>
        c.id === canvasId ? { ...c, annotations: [...c.annotations, newAnn] } : c
      ),
    }));
  },
}));
