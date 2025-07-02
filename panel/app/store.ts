import { create } from "zustand";
import { persist } from "zustand/middleware";
type Theme =
  | "autumn"
  | "light"
  | "dark"
  | "dim"
  | "business"
  | "pastel"
  | "garden";
type data = {
  token: string | null;
  siteID: string | null;
  setToken: (token: string) => void;
  setSiteID: (token: string) => void;
  siteTheme: Theme;
  setSiteTheme?: (theme: Theme) => void;
};

const userStore = create<data>()(
  persist(
    (set) => ({
      token: null,
      siteID: null,
      setToken: (token: string) => set({ token }),
      setSiteID: (siteID: string) => set({ siteID }),
      siteTheme: "autumn", // Default theme
      setSiteTheme: (theme: Theme) => set({ siteTheme: theme }),
    }),
    { name: "userStore" }
  )
);

export default userStore;
