import { beforeEach, describe, expect, it, vi } from 'vitest'

import { buildCategory, buildDot } from '@test/builders'

import type { DotBoardStore } from '../../types'
import { createDataSlice } from '../dataSlice'

// Mock the database module
vi.mock('@/db', () => ({
  getActiveCategories: vi.fn(),
  getActiveDots: vi.fn(),
}))

import { getActiveCategories, getActiveDots } from '@/db'

describe('dataSlice', () => {
  let store: DotBoardStore
  const mockGetActiveCategories = vi.mocked(getActiveCategories)
  const mockGetActiveDots = vi.mocked(getActiveDots)

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks()

    // Create a minimal store with data slice
    const setState = vi.fn((updater) => {
      if (typeof updater === 'function') {
        const newState = updater(store)
        Object.assign(store, newState)
      } else {
        Object.assign(store, updater)
      }
    })

    const getState = () => store

    // Initialize store with data slice
    store = createDataSlice(setState, getState, {
      setState,
      getState,
      subscribe: vi.fn(),
      getInitialState: vi.fn(),
    }) as unknown as DotBoardStore
  })

  describe('loadData', () => {
    it('should load categories and dots from database', async () => {
      const mockCategories = [
        buildCategory({ id: 'cat-1', title: 'React', color: '#61dafb' }),
        buildCategory({ id: 'cat-2', title: 'Vue', color: '#42b883' }),
      ]

      const mockDots = [
        buildDot({ id: 'dot-1', categoryId: 'cat-1', name: 'Alice' }),
        buildDot({
          id: 'dot-2',
          categoryId: 'cat-2',
          name: 'Bob',
          xRatio: 0.3,
          yRatio: 0.7,
        }),
      ]

      mockGetActiveCategories.mockResolvedValue(mockCategories)
      mockGetActiveDots.mockResolvedValue(mockDots)

      await store.loadData()

      expect(store.isInitialized).toBe(true)
      expect(store.isLoading).toBe(false)
      expect(store.loadError).toBeNull()
      expect(store.categories?.size).toBe(2)
      expect(store.dots?.size).toBe(2)
      expect(store.categories?.get('cat-1')).toEqual(mockCategories[0])
      expect(store.dots?.get('dot-1')).toEqual(mockDots[0])
    })

    it('should set isLoading to true during load', async () => {
      mockGetActiveCategories.mockImplementation(
        () =>
          new Promise((resolve) => {
            // Check loading state before resolving
            expect(store.isLoading).toBe(true)
            setTimeout(() => resolve([]), 10)
          }),
      )
      mockGetActiveDots.mockResolvedValue([])

      await store.loadData()

      expect(store.isLoading).toBe(false)
    })

    it('should handle empty database gracefully', async () => {
      mockGetActiveCategories.mockResolvedValue([])
      mockGetActiveDots.mockResolvedValue([])

      await store.loadData()

      expect(store.isInitialized).toBe(true)
      expect(store.categories?.size).toBe(0)
      expect(store.dots?.size).toBe(0)
    })

    it('should prevent duplicate loads when already initialized', async () => {
      mockGetActiveCategories.mockResolvedValue([])
      mockGetActiveDots.mockResolvedValue([])

      // First load
      await store.loadData()
      expect(mockGetActiveCategories).toHaveBeenCalledTimes(1)
      expect(mockGetActiveDots).toHaveBeenCalledTimes(1)

      // Second load should be prevented
      await store.loadData()
      expect(mockGetActiveCategories).toHaveBeenCalledTimes(1) // Still 1
      expect(mockGetActiveDots).toHaveBeenCalledTimes(1) // Still 1
    })

    it('should prevent duplicate loads when already loading', async () => {
      mockGetActiveCategories.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve([]), 50)),
      )
      mockGetActiveDots.mockResolvedValue([])

      // Start first load (don't await)
      const firstLoad = store.loadData()

      // Try to start second load immediately
      const secondLoad = store.loadData()

      await Promise.all([firstLoad, secondLoad])

      // Should only call database once
      expect(mockGetActiveCategories).toHaveBeenCalledTimes(1)
      expect(mockGetActiveDots).toHaveBeenCalledTimes(1)
    })

    it('should handle database errors and set loadError', async () => {
      const errorMessage = 'Failed to fetch categories'
      mockGetActiveCategories.mockRejectedValue(new Error(errorMessage))
      mockGetActiveDots.mockResolvedValue([])

      await store.loadData()

      expect(store.isInitialized).toBe(false)
      expect(store.isLoading).toBe(false)
      expect(store.loadError).toBe(errorMessage)
    })

    it('should handle non-Error exceptions', async () => {
      mockGetActiveCategories.mockRejectedValue('String error')
      mockGetActiveDots.mockResolvedValue([])

      await store.loadData()

      expect(store.loadError).toBe('Failed to load data')
    })

    it('should clear previous errors on successful load', async () => {
      // First load fails
      mockGetActiveCategories.mockRejectedValueOnce(new Error('First error'))
      mockGetActiveDots.mockResolvedValue([])

      await store.loadData()
      expect(store.loadError).toBe('First error')

      // Reset isInitialized to allow retry
      store.isInitialized = false

      // Second load succeeds
      mockGetActiveCategories.mockResolvedValue([])
      await store.loadData()

      expect(store.loadError).toBeNull()
      expect(store.isInitialized).toBe(true)
    })

    it('should load categories and dots in parallel', async () => {
      const started: string[] = []
      let resolveCategories!: (value: []) => void
      let resolveDots!: (value: []) => void

      mockGetActiveCategories.mockImplementation(() => {
        started.push('categories')
        return new Promise((resolve) => {
          resolveCategories = resolve
        })
      })
      mockGetActiveDots.mockImplementation(() => {
        started.push('dots')
        return new Promise((resolve) => {
          resolveDots = resolve
        })
      })

      const loadPromise = store.loadData()

      expect(started).toEqual(['categories', 'dots'])

      resolveCategories([])
      await Promise.resolve()

      expect(store.isInitialized).toBe(false)

      resolveDots([])
      await loadPromise

      expect(store.isInitialized).toBe(true)
    })
  })
})
