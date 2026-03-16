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
    const adminSecret = getAdminSecret()?.trim()
    const normalizedPassword = password.trim()

    if (!adminSecret || !normalizedPassword) {
      return false
    }

    return normalizedPassword === adminSecret
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
