import type { StateCreator } from 'zustand'

import type { DotBoardStore, AuthState, AuthActions } from '../types'
import { getAdminSecret } from '@/utils/env'

export type AuthSlice = AuthState & AuthActions

export const createAuthSlice: StateCreator<DotBoardStore, [], [], AuthSlice> = (
  set,
  get,
) => ({
  isAdminUnlocked: false,

  verifyAdminPassword: (password: string) => {
    const adminSecret = getAdminSecret()

    if (!adminSecret || !password) {
      return false
    }

    return password === adminSecret
  },

  unlockAdmin: (password: string) => {
    const isValid = get().verifyAdminPassword(password)

    if (isValid) {
      set({ isAdminUnlocked: true })
    }

    return isValid
  },

  lockAdmin: () => {
    set({ isAdminUnlocked: false })
  },
})
