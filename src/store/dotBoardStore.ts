import { create } from 'zustand'

import type { Category, Dot } from '@/types/dotBoard'
import { getActiveCategories, getActiveDots } from '@/db'
import { getAdminSecret } from '@/utils/env'

export type DotBoardState = {
  categories: Map<string, Category>
  dots: Map<string, Dot>
  isAdminUnlocked: boolean
}

export type DotBoardActions = {
  loadData: () => Promise<void>
  unlockAdmin: (password: string) => boolean
  lockAdmin: () => void
}

export type DotBoardStore = DotBoardState & DotBoardActions

const initialState: DotBoardState = {
  categories: new Map(),
  dots: new Map(),
  isAdminUnlocked: false,
}

export const useDotBoardStore = create<DotBoardStore>((set) => ({
  ...initialState,
  loadData: async () => {
    const [categories, dots] = await Promise.all([
      getActiveCategories(),
      getActiveDots(),
    ])

    set({
      categories: new Map(categories.map((cat) => [cat.id, cat])),
      dots: new Map(dots.map((dot) => [dot.id, dot])),
    })
  },
  unlockAdmin: (password: string) => {
    const adminSecret = getAdminSecret()

    // Edge cases: no admin secret configured or empty password
    if (!adminSecret || !password) {
      return false
    }

    const isValid = password === adminSecret

    if (isValid) {
      set({ isAdminUnlocked: true })
    }

    return isValid
  },
  lockAdmin: () => {
    set({ isAdminUnlocked: false })
  },
}))
