import { beforeEach, describe, expect, it, vi } from 'vitest'

import { buildDot } from '@test/builders'

import type { DotBoardStore } from '../../types'
import {
  ADMIN_REQUIRED_ERROR,
  DELETE_PASSWORD_REQUIRED_ERROR,
  INVALID_DELETE_PASSWORD_ERROR,
} from '../../types'
import { createDotSlice } from '../dotSlice'

// Mock the database module
vi.mock('@/db', () => ({
  createDot: vi.fn(),
  softDeleteDot: vi.fn(),
}))

import { createDot, softDeleteDot } from '@/db'

describe('dotSlice', () => {
  let store: DotBoardStore
  const mockCreateDot = vi.mocked(createDot)
  const mockSoftDeleteDot = vi.mocked(softDeleteDot)

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks()

    // Create a minimal store with dot slice
    const setState = vi.fn((updater) => {
      if (typeof updater === 'function') {
        const newState = updater(store)
        Object.assign(store, newState)
      } else {
        Object.assign(store, updater)
      }
    })

    const getState = () => store

    // Initialize store with dot slice and minimal required state
    store = {
      ...createDotSlice(setState, getState, {
        setState,
        getState,
        subscribe: vi.fn(),
        getInitialState: vi.fn(),
      }),
      isAdminUnlocked: false,
      verifyAdminPassword: vi.fn(),
    } as unknown as DotBoardStore
  })

  describe('addDot', () => {
    it('should add a new dot to the store', async () => {
      const mockDot = buildDot({
        id: 'dot-1',
        categoryId: 'cat-1',
        name: 'John',
        xRatio: 0.5,
        yRatio: 0.7,
      })

      mockCreateDot.mockResolvedValue(mockDot)

      const result = await store.addDot('cat-1', 'John', 0.5, 0.7)

      expect(result).toEqual(mockDot)
      expect(mockCreateDot).toHaveBeenCalledWith({
        categoryId: 'cat-1',
        name: 'John',
        xRatio: 0.5,
        yRatio: 0.7,
      })
      expect(store.dots.get('dot-1')).toEqual(mockDot)
    })

    it('should add multiple dots without overwriting', async () => {
      const dot1 = buildDot({
        id: 'dot-1',
        categoryId: 'cat-1',
        name: 'Alice',
        xRatio: 0.3,
        yRatio: 0.4,
      })

      const dot2 = buildDot({
        id: 'dot-2',
        categoryId: 'cat-1',
        name: 'Bob',
        xRatio: 0.6,
        yRatio: 0.8,
      })

      mockCreateDot.mockResolvedValueOnce(dot1).mockResolvedValueOnce(dot2)

      await store.addDot('cat-1', 'Alice', 0.3, 0.4)
      await store.addDot('cat-1', 'Bob', 0.6, 0.8)

      expect(store.dots.size).toBe(2)
      expect(store.dots.get('dot-1')).toEqual(dot1)
      expect(store.dots.get('dot-2')).toEqual(dot2)
    })

    it('should handle database errors gracefully', async () => {
      mockCreateDot.mockRejectedValue(new Error('Database error'))

      await expect(store.addDot('cat-1', 'Test', 0.5, 0.5)).rejects.toThrow(
        'Database error',
      )
    })
  })

  describe('removeDot', () => {
    beforeEach(() => {
      // Add a test dot to the store
      const testDot = buildDot({
        id: 'dot-1',
        categoryId: 'cat-1',
        name: 'Test Dot',
      })
      store.dots = new Map([['dot-1', testDot]])
    })

    it('should throw error if admin is not unlocked', async () => {
      store.isAdminUnlocked = false

      await expect(store.removeDot('dot-1', 'password')).rejects.toThrow(
        ADMIN_REQUIRED_ERROR,
      )
    })

    it('should throw error if dot ID is missing', async () => {
      store.isAdminUnlocked = true

      await expect(store.removeDot('', 'password')).rejects.toThrow(
        'Dot ID is required',
      )
    })

    it('should throw error if password is missing', async () => {
      store.isAdminUnlocked = true

      await expect(store.removeDot('dot-1', '')).rejects.toThrow(
        DELETE_PASSWORD_REQUIRED_ERROR,
      )
    })

    it('should throw error if password is invalid', async () => {
      store.isAdminUnlocked = true
      store.verifyAdminPassword = vi.fn().mockReturnValue(false)

      await expect(store.removeDot('dot-1', 'wrong-password')).rejects.toThrow(
        INVALID_DELETE_PASSWORD_ERROR,
      )

      expect(store.verifyAdminPassword).toHaveBeenCalledWith('wrong-password')
    })

    it('should successfully remove dot with valid password', async () => {
      store.isAdminUnlocked = true
      store.verifyAdminPassword = vi.fn().mockReturnValue(true)

      const deletedDot = buildDot({
        id: 'dot-1',
        categoryId: 'cat-1',
        name: 'Test Dot',
        deletedAt: new Date().toISOString(),
        isDeleted: 1,
      })

      mockSoftDeleteDot.mockResolvedValue(deletedDot)

      const result = await store.removeDot('dot-1', 'correct-password')

      expect(result).toEqual(deletedDot)
      expect(mockSoftDeleteDot).toHaveBeenCalledWith('dot-1')
      expect(store.dots.has('dot-1')).toBe(false)
    })

    it('should handle database errors during deletion', async () => {
      store.isAdminUnlocked = true
      store.verifyAdminPassword = vi.fn().mockReturnValue(true)

      mockSoftDeleteDot.mockRejectedValue(new Error('Database error'))

      await expect(
        store.removeDot('dot-1', 'correct-password'),
      ).rejects.toThrow('Database error')
    })

    it('should not remove dot if soft delete returns undefined', async () => {
      store.isAdminUnlocked = true
      store.verifyAdminPassword = vi.fn().mockReturnValue(true)

      mockSoftDeleteDot.mockResolvedValue(undefined)

      const result = await store.removeDot('dot-1', 'correct-password')

      expect(result).toBeUndefined()
      expect(store.dots.has('dot-1')).toBe(true) // Dot should still be in store
    })
  })
})
