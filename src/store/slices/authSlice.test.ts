import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { DotBoardStore } from '../types'
import { createAuthSlice } from './authSlice'

// Mock the env utility
vi.mock('@/utils/env', () => ({
  getAdminSecret: vi.fn(),
}))

import { getAdminSecret } from '@/utils/env'

describe('Admin Password Verification Logic', () => {
  let store: DotBoardStore
  const mockGetAdminSecret = vi.mocked(getAdminSecret)

  beforeEach(() => {
    // Reset mock
    vi.clearAllMocks()

    // Create a minimal store with auth slice
    const setState = vi.fn((updater) => {
      if (typeof updater === 'function') {
        const newState = updater(store)
        Object.assign(store, newState)
      } else {
        Object.assign(store, updater)
      }
    })

    const getState = () => store

    // Initialize store with auth slice
    store = createAuthSlice(setState, getState, {
      setState,
      getState,
      subscribe: vi.fn(),
      getInitialState: vi.fn(),
    }) as unknown as DotBoardStore
  })

  describe('verifyAdminPassword', () => {
    it('should return true when password matches admin secret', () => {
      mockGetAdminSecret.mockReturnValue('correct-password')

      const result = store.verifyAdminPassword('correct-password')

      expect(result).toBe(true)
      expect(mockGetAdminSecret).toHaveBeenCalledOnce()
    })

    it('should return false when password does not match admin secret', () => {
      mockGetAdminSecret.mockReturnValue('correct-password')

      const result = store.verifyAdminPassword('wrong-password')

      expect(result).toBe(false)
    })

    it('should return false when password is empty', () => {
      mockGetAdminSecret.mockReturnValue('correct-password')

      const result = store.verifyAdminPassword('')

      expect(result).toBe(false)
    })

    it('should return false when admin secret is not set', () => {
      mockGetAdminSecret.mockReturnValue(undefined)

      const result = store.verifyAdminPassword('any-password')

      expect(result).toBe(false)
    })

    it('should return false when both password and admin secret are empty', () => {
      mockGetAdminSecret.mockReturnValue(undefined)

      const result = store.verifyAdminPassword('')

      expect(result).toBe(false)
    })

    it('should perform exact string comparison', () => {
      mockGetAdminSecret.mockReturnValue('MySecret123')

      // Exact match
      expect(store.verifyAdminPassword('MySecret123')).toBe(true)

      // Case sensitive - should fail
      expect(store.verifyAdminPassword('mysecret123')).toBe(false)
      expect(store.verifyAdminPassword('MYSECRET123')).toBe(false)

      // Whitespace matters
      expect(store.verifyAdminPassword('MySecret123 ')).toBe(false)
      expect(store.verifyAdminPassword(' MySecret123')).toBe(false)
    })
  })

  describe('unlockAdmin', () => {
    it('should enable admin mode when correct password is provided', () => {
      mockGetAdminSecret.mockReturnValue('correct-password')

      expect(store.isAdminUnlocked).toBe(false)

      const result = store.unlockAdmin('correct-password')

      expect(result).toBe(true)
      expect(store.isAdminUnlocked).toBe(true)
    })

    it('should not enable admin mode when incorrect password is provided', () => {
      mockGetAdminSecret.mockReturnValue('correct-password')

      expect(store.isAdminUnlocked).toBe(false)

      const result = store.unlockAdmin('wrong-password')

      expect(result).toBe(false)
      expect(store.isAdminUnlocked).toBe(false)
    })

    it('should not enable admin mode when empty password is provided', () => {
      mockGetAdminSecret.mockReturnValue('correct-password')

      const result = store.unlockAdmin('')

      expect(result).toBe(false)
      expect(store.isAdminUnlocked).toBe(false)
    })

    it('should not enable admin mode when admin secret is not configured', () => {
      mockGetAdminSecret.mockReturnValue(undefined)

      const result = store.unlockAdmin('any-password')

      expect(result).toBe(false)
      expect(store.isAdminUnlocked).toBe(false)
    })

    it('should use verifyAdminPassword for validation', () => {
      mockGetAdminSecret.mockReturnValue('test-secret')

      // First attempt with wrong password
      store.unlockAdmin('wrong')
      expect(store.isAdminUnlocked).toBe(false)

      // Second attempt with correct password
      store.unlockAdmin('test-secret')
      expect(store.isAdminUnlocked).toBe(true)
    })
  })

  describe('lockAdmin', () => {
    it('should disable admin mode', () => {
      mockGetAdminSecret.mockReturnValue('correct-password')

      // First unlock admin mode
      store.unlockAdmin('correct-password')
      expect(store.isAdminUnlocked).toBe(true)

      // Then lock it
      store.lockAdmin()
      expect(store.isAdminUnlocked).toBe(false)
    })

    it('should work even when admin mode is already locked', () => {
      expect(store.isAdminUnlocked).toBe(false)

      store.lockAdmin()

      expect(store.isAdminUnlocked).toBe(false)
    })

    it('should require password again after lock', () => {
      mockGetAdminSecret.mockReturnValue('correct-password')

      // Unlock
      store.unlockAdmin('correct-password')
      expect(store.isAdminUnlocked).toBe(true)

      // Lock
      store.lockAdmin()
      expect(store.isAdminUnlocked).toBe(false)

      // Should need password again to unlock
      const stillLocked = store.verifyAdminPassword('wrong-password')
      expect(stillLocked).toBe(false)
      expect(store.isAdminUnlocked).toBe(false)

      // Correct password should unlock again
      store.unlockAdmin('correct-password')
      expect(store.isAdminUnlocked).toBe(true)
    })
  })

  describe('Admin Mode State Transitions', () => {
    it('should follow complete unlock/lock cycle', () => {
      mockGetAdminSecret.mockReturnValue('my-secret')

      // Initial state: locked
      expect(store.isAdminUnlocked).toBe(false)

      // Attempt unlock with wrong password
      expect(store.unlockAdmin('wrong')).toBe(false)
      expect(store.isAdminUnlocked).toBe(false)

      // Unlock with correct password
      expect(store.unlockAdmin('my-secret')).toBe(true)
      expect(store.isAdminUnlocked).toBe(true)

      // Lock admin mode
      store.lockAdmin()
      expect(store.isAdminUnlocked).toBe(false)

      // Verify password without unlocking
      expect(store.verifyAdminPassword('my-secret')).toBe(true)
      expect(store.isAdminUnlocked).toBe(false) // Still locked

      // Unlock again
      expect(store.unlockAdmin('my-secret')).toBe(true)
      expect(store.isAdminUnlocked).toBe(true)
    })
  })

  describe('Password Storage from Environment Variable', () => {
    it('should read password from VITE_ADMIN_SECRET environment variable', () => {
      mockGetAdminSecret.mockReturnValue('env-secret')

      store.verifyAdminPassword('env-secret')

      expect(mockGetAdminSecret).toHaveBeenCalledOnce()
    })

    it('should handle missing environment variable gracefully', () => {
      mockGetAdminSecret.mockReturnValue(undefined)

      const result = store.verifyAdminPassword('any-password')

      expect(result).toBe(false)
      expect(mockGetAdminSecret).toHaveBeenCalledOnce()
    })

    it('should call getAdminSecret on each verification', () => {
      mockGetAdminSecret.mockReturnValue('secret')

      store.verifyAdminPassword('secret')
      store.verifyAdminPassword('secret')
      store.verifyAdminPassword('secret')

      expect(mockGetAdminSecret).toHaveBeenCalledTimes(3)
    })
  })
})
