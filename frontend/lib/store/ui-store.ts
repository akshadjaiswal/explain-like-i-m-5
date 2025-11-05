/**
 * Zustand store for UI preferences
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ViewMode } from "@/types";

interface UIStore {
  viewMode: ViewMode;
  theme: "light" | "dark" | "system";
  setViewMode: (mode: ViewMode) => void;
  setTheme: (theme: "light" | "dark" | "system") => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      viewMode: "tabs",
      theme: "system",
      setViewMode: (mode) => set({ viewMode: mode }),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: "explain-levels-ui",
    }
  )
);
