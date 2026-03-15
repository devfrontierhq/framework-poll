import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { DotBoardStore } from '../types'
import { createCategorySlice } from './categorySlice'

vi.mock('@/db', () => ({
  createCategory: vi.fn(),
  createCategoriesAtomic: vi.fn(),
  updateCategory: vi.fn(),
  softDeleteCategory: vi.fn(),
}))

import { createCategoriesAtomic, createCategory } from '@/db'

describe('categorySlice initializeDefaultCategories', () => {
  let store: DotBoardStore
  const mockCreateCategory = vi.mocked(createCategory)
  const mockCreateCategoriesAtomic = vi.mocked(createCategoriesAtomic)

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
    mockCreateCategoriesAtomic.mockImplementation(async (inputs) => {
      const createdCategories = []

      for (const input of inputs) {
        createdCategories.push(await mockCreateCategory(input))
      }

      return createdCategories
    })

    const firstRun = store.initializeDefaultCategories()

    expect(store.isSeedingDefaultCategories).toBe(true)
    expect(store.isAdminUnlocked).toBe(false)
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
    expect(store.isAdminUnlocked).toBe(false)
  })

  it('preserves existing admin state while seeding defaults', async () => {
    let resolveCategories:
      | ((value: Awaited<ReturnType<typeof createCategoriesAtomic>>) => void)
      | undefined

    store.isAdminUnlocked = true
    mockCreateCategoriesAtomic.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveCategories = resolve
        }),
    )

    const initialization = store.initializeDefaultCategories()

    expect(store.isSeedingDefaultCategories).toBe(true)
    expect(store.isAdminUnlocked).toBe(true)

    resolveCategories?.([
      {
        id: 'react-id',
        title: 'React',
        color: '#61dafb',
        createdAt: new Date().toISOString(),
        deletedAt: null,
        isDeleted: 0,
      },
      {
        id: 'vue-id',
        title: 'Vue',
        color: '#42b883',
        createdAt: new Date().toISOString(),
        deletedAt: null,
        isDeleted: 0,
      },
      {
        id: 'angular-id',
        title: 'Angular',
        color: '#dd0031',
        createdAt: new Date().toISOString(),
        deletedAt: null,
        isDeleted: 0,
      },
    ])

    await initialization

    expect(store.isAdminUnlocked).toBe(true)
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
    mockCreateCategoriesAtomic.mockImplementation(async (inputs) => {
      const createdCategories = []

      for (const input of inputs) {
        createdCategories.push(await mockCreateCategory(input))
      }

      return createdCategories
    })

    await store.initializeDefaultCategories()

    expect(mockCreateCategoriesAtomic).toHaveBeenCalledTimes(1)
    expect(mockCreateCategoriesAtomic).toHaveBeenCalledWith([
      {
        title: 'Vue',
        color: '#42b883',
      },
      {
        title: 'Angular',
        color: '#dd0031',
      },
    ])
    expect(
      Array.from(store.categories.values()).map(({ title }) => title),
    ).toEqual(['React', 'Vue', 'Angular'])
  })

  it('does not update store categories when atomic creation fails', async () => {
    mockCreateCategoriesAtomic.mockRejectedValueOnce(
      new Error('storage failed'),
    )

    await expect(store.initializeDefaultCategories()).rejects.toThrow(
      'storage failed',
    )

    expect(store.categories.size).toBe(0)
    expect(store.isSeedingDefaultCategories).toBe(false)
    expect(store.isAdminUnlocked).toBe(false)
  })
})
