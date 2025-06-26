import { create } from "zustand";
import { persist } from "zustand/middleware";
type data = {
  token: string | null;
  siteID: string | null;
  setToken: (token: string) => void;
  setSiteID: (token: string) => void;
};

const userStore = create<data>()(
  persist(
    (set) => ({
      token: null,
      siteID: null,
      setToken: (token: string) => set({ token }),
      setSiteID: (siteID: string) => set({ siteID }),
    }),
    { name: "userStore" }
  )
);

export default userStore;
