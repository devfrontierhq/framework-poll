import { create } from 'zustand'

import type { Category, Dot } from '@/types/dotBoard'

export type DotBoardState = {
  categories: Map<string, Category>
  dots: Map<string, Dot>
  isAdminUnlocked: boolean
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type DotBoardActions = {
  // Actions 將在後續任務中實作
}

export type DotBoardStore = DotBoardState & DotBoardActions

const initialState: DotBoardState = {
  categories: new Map(),
  dots: new Map(),
  isAdminUnlocked: false,
}

export const useDotBoardStore = create<DotBoardStore>(() => ({
  ...initialState,
}))
