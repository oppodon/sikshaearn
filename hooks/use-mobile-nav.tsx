"use client"

import { create } from "zustand"

interface MobileNavState {
  isOpen: boolean
  toggle: () => void
  setIsOpen: (open: boolean) => void
}

export const useMobileNav = create<MobileNavState>((set) => ({
  isOpen: false,
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  setIsOpen: (open) => set({ isOpen: open }),
}))
