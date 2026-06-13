import { create } from "zustand";

type AngkatanFilterState = {
  angkatan: string; // "semua" atau tahun angkatan
  setAngkatan: (angkatan: string) => void;
};

export const useAngkatanFilterStore = create<AngkatanFilterState>((set) => ({
  angkatan: "semua",
  setAngkatan: (angkatan) => set({ angkatan }),
}));