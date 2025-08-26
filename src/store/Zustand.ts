import { create } from "zustand";

type SidebarMode = "main" | "interview";

interface SidebarState {
  mode: SidebarMode;
  setMode: (mode: SidebarMode) => void;
  toggleMode: () => void;
  hydrateMode: () => void;
}

export const useSidebarStore = create<SidebarState>((set, get) => ({
  mode: "main", // Always start with "main" for SSR consistency
  setMode: (mode) => {
    set({ mode });
    if (typeof window !== "undefined") {
      localStorage.setItem("sidebar-mode", mode);
    }
  },
  toggleMode: () => {
    const newMode = get().mode === "main" ? "interview" : "main";
    set({ mode: newMode });
    if (typeof window !== "undefined") {
      localStorage.setItem("sidebar-mode", newMode);
    }
  },
  hydrateMode: () => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("sidebar-mode");
      if (stored === "interview" || stored === "main") {
        set({ mode: stored });
      }
    }
  },
}));