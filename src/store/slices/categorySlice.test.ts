import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { DotBoardStore } from '../types'
import { createCategorySlice } from './categorySlice'

vi.mock('@/db', () => ({
  createCategory: vi.fn(),
  updateCategory: vi.fn(),
  softDeleteCategory: vi.fn(),
}))

import { createCategory } from '@/db'

describe('categorySlice initializeDefaultCategories', () => {
  let store: DotBoardStore
  const mockCreateCategory = vi.mocked(createCategory)

  beforeEach(() => {
    vi.clearAllMocks()

    const setState = vi.fn((updater) => {
      if (typeof updater === 'function') {
        const newState = updater(store)
        Object.assign(store, newState)
        return
      }

      Object.assign(store, updater)
    })

    const getState = () => store

    store = {
      dots: new Map(),
      isAdminUnlocked: false,
      verifyAdminPassword: vi.fn(() => false),
      unlockAdmin: vi.fn(() => false),
      lockAdmin: vi.fn(),
      isInitialized: false,
      isLoading: false,
      loadError: null,
      addDot: vi.fn(),
      removeDot: vi.fn(),
      loadData: vi.fn(),
      exportCsv: vi.fn(),
      ...createCategorySlice(setState, getState, {
        setState,
        getState,
        subscribe: vi.fn(),
        getInitialState: vi.fn(),
      }),
    } as unknown as DotBoardStore
  })

  it('prevents duplicate initialization while a request is already in flight', async () => {
    let resolveFirstCategory:
      | ((value: Awaited<ReturnType<typeof createCategory>>) => void)
      | undefined

    mockCreateCategory
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveFirstCategory = resolve
          }),
      )
      .mockResolvedValueOnce({
        id: 'vue-id',
        title: 'Vue',
        color: '#42b883',
        createdAt: new Date().toISOString(),
        deletedAt: null,
        isDeleted: 0,
      })
      .mockResolvedValueOnce({
        id: 'angular-id',
        title: 'Angular',
        color: '#dd0031',
        createdAt: new Date().toISOString(),
        deletedAt: null,
        isDeleted: 0,
      })

    const firstRun = store.initializeDefaultCategories()

    expect(store.isSeedingDefaultCategories).toBe(true)
    expect(mockCreateCategory).toHaveBeenCalledTimes(1)

    const secondRun = store.initializeDefaultCategories()

    await expect(secondRun).resolves.toBeUndefined()
    expect(mockCreateCategory).toHaveBeenCalledTimes(1)

    resolveFirstCategory?.({
      id: 'react-id',
      title: 'React',
      color: '#61dafb',
      createdAt: new Date().toISOString(),
      deletedAt: null,
      isDeleted: 0,
    })

    await firstRun

    expect(store.categories.size).toBe(3)
    expect(store.isSeedingDefaultCategories).toBe(false)
  })

  it('creates only missing default categories', async () => {
    store.categories.set('existing-react', {
      id: 'existing-react',
      title: 'React',
      color: '#61dafb',
      createdAt: new Date().toISOString(),
      deletedAt: null,
      isDeleted: 0,
    })

    mockCreateCategory
      .mockResolvedValueOnce({
        id: 'vue-id',
        title: 'Vue',
        color: '#42b883',
        createdAt: new Date().toISOString(),
        deletedAt: null,
        isDeleted: 0,
      })
      .mockResolvedValueOnce({
        id: 'angular-id',
        title: 'Angular',
        color: '#dd0031',
        createdAt: new Date().toISOString(),
        deletedAt: null,
        isDeleted: 0,
      })

    await store.initializeDefaultCategories()

    expect(mockCreateCategory).toHaveBeenCalledTimes(2)
    expect(mockCreateCategory).toHaveBeenNthCalledWith(1, {
      title: 'Vue',
      color: '#42b883',
    })
    expect(mockCreateCategory).toHaveBeenNthCalledWith(2, {
      title: 'Angular',
      color: '#dd0031',
    })
    expect(
      Array.from(store.categories.values()).map(({ title }) => title),
    ).toEqual(['React', 'Vue', 'Angular'])
  })
})
