import { create } from 'zustand'

import type { Category, Dot } from '@/types/dotBoard'
import { getActiveCategories, getActiveDots } from '@/db'

export type DotBoardState = {
  categories: Map<string, Category>
  dots: Map<string, Dot>
  isAdminUnlocked: boolean
}

export type DotBoardActions = {
  loadData: () => Promise<void>
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
}))
