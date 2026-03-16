import type { StateCreator } from 'zustand'

import type { DotBoardStore, DataActions, DataState } from '../types'
import { getActiveCategories, getActiveDots } from '@/db'

export type DataSlice = DataState & DataActions

export const createDataSlice: StateCreator<DotBoardStore, [], [], DataSlice> = (
  set,
  get,
) => ({
  // Initial state
  isInitialized: false,
  isLoading: false,
  loadError: null,

  // Actions
  loadData: async () => {
    const { isInitialized, isLoading } = get()

    // Guard: prevent duplicate loads
    if (isInitialized || isLoading) {
      return
    }

    try {
      set({ isLoading: true, loadError: null })

      const [categories, dots] = await Promise.all([
        getActiveCategories(),
        getActiveDots(),
      ])

      set({
        categories: new Map(categories.map((cat) => [cat.id, cat])),
        dots: new Map(dots.map((dot) => [dot.id, dot])),
        isInitialized: true,
      })
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to load data'

      set({ loadError: errorMessage })
    } finally {
      set({ isLoading: false })
    }
  },
})
