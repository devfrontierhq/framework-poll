import type { StateCreator } from 'zustand'

import type { DotBoardStore, DataActions } from '../types'
import { getActiveCategories, getActiveDots } from '@/db'

export type DataSlice = DataActions

export const createDataSlice: StateCreator<DotBoardStore, [], [], DataSlice> = (
  set,
) => ({
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
})
