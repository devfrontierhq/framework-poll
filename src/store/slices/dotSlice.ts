import type { StateCreator } from 'zustand'

import {
  ADMIN_REQUIRED_ERROR,
  DELETE_PASSWORD_REQUIRED_ERROR,
  INVALID_DELETE_PASSWORD_ERROR,
  type DotBoardStore,
  type DotState,
  type DotActions,
} from '../types'
import { createDot, softDeleteDot } from '@/db'

export type DotSlice = DotState & DotActions

export const createDotSlice: StateCreator<DotBoardStore, [], [], DotSlice> = (
  set,
  get,
) => ({
  dots: new Map(),

  addDot: async (
    categoryId: string,
    name: string,
    xRatio: number,
    yRatio: number,
  ) => {
    const dot = await createDot({ categoryId, name, xRatio, yRatio })

    set((state) => ({
      dots: new Map(state.dots).set(dot.id, dot),
    }))

    return dot
  },

  removeDot: async (dotId: string, password: string) => {
    if (!get().isAdminUnlocked) {
      throw new Error(ADMIN_REQUIRED_ERROR)
    }

    if (!dotId) {
      throw new Error('Dot ID is required')
    }

    if (!password) {
      throw new Error(DELETE_PASSWORD_REQUIRED_ERROR)
    }

    if (!get().verifyAdminPassword(password)) {
      throw new Error(INVALID_DELETE_PASSWORD_ERROR)
    }

    const deletedDot = await softDeleteDot(dotId)

    if (deletedDot) {
      set((state) => {
        const dots = new Map(state.dots)
        dots.delete(dotId)
        return { dots }
      })
    }

    return deletedDot
  },
})
