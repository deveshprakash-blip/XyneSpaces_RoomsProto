import { create } from "zustand";
import { Project } from "@/types";
import { projects } from "@/data/seed";
import { generateId } from "@/lib/utils";

interface ProjectStore {
  projects: Project[];
  getProject: (id: string) => Project | undefined;
  addProject: (name: string, description?: string) => Project;
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: projects,
  getProject: (id) => get().projects.find((p) => p.id === id),
  addProject: (name, description) => {
    const newProject: Project = {
      id: `proj-${generateId()}`,
      name,
      description,
      createdBy: "user-rishabh",
      members: [
        {
          userId: "user-rishabh",
          name: "Rishabh",
          email: "rishabh@juspay.in",
          role: "owner",
          team: "product",
          joinedAt: Date.now(),
        },
      ],
      roomIds: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    set((s) => ({ projects: [...s.projects, newProject] }));
    return newProject;
  },
}));
