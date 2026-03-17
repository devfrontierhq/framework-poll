import { beforeEach, describe, expect, it, vi } from 'vitest'

import { buildCategory, buildDot } from '@test/builders'

import type { DotBoardStore } from '../types'
import { createCategorySlice } from './categorySlice'

vi.mock('@/db', () => ({
  createCategory: vi.fn(),
  getActiveDots: vi.fn(),
  initializeDefaultCategoriesAtomic: vi.fn(),
  updateCategory: vi.fn(),
  softDeleteCategory: vi.fn(),
}))

import { getActiveDots, initializeDefaultCategoriesAtomic } from '@/db'

describe('categorySlice initializeDefaultCategories', () => {
  let store: DotBoardStore
  const mockGetActiveDots = vi.mocked(getActiveDots)
  const mockInitializeDefaultCategoriesAtomic = vi.mocked(
    initializeDefaultCategoriesAtomic,
  )

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetActiveDots.mockResolvedValue([])
    mockInitializeDefaultCategoriesAtomic.mockResolvedValue([])

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
    let resolveCategories:
      | ((
          value: Awaited<ReturnType<typeof initializeDefaultCategoriesAtomic>>,
        ) => void)
      | undefined

    mockInitializeDefaultCategoriesAtomic.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveCategories = resolve
        }),
    )

    const firstRun = store.initializeDefaultCategories()

    expect(store.isSeedingDefaultCategories).toBe(true)
    expect(store.isAdminUnlocked).toBe(false)
    await Promise.resolve()
    expect(mockInitializeDefaultCategoriesAtomic).toHaveBeenCalledTimes(1)

    const secondRun = store.initializeDefaultCategories()

    await expect(secondRun).resolves.toBeUndefined()
    expect(mockInitializeDefaultCategoriesAtomic).toHaveBeenCalledTimes(1)

    resolveCategories?.([
      buildCategory({ id: 'react-id', title: 'React', color: '#61dafb' }),
      buildCategory({ id: 'vue-id', title: 'Vue', color: '#42b883' }),
      buildCategory({ id: 'angular-id', title: 'Angular', color: '#dd0031' }),
    ])

    await firstRun

    expect(store.categories.size).toBe(3)
    expect(store.isSeedingDefaultCategories).toBe(false)
    expect(store.isAdminUnlocked).toBe(false)
  })

  it('preserves existing admin state while seeding defaults', async () => {
    let resolveCategories:
      | ((
          value: Awaited<ReturnType<typeof initializeDefaultCategoriesAtomic>>,
        ) => void)
      | undefined

    store.isAdminUnlocked = true
    mockInitializeDefaultCategoriesAtomic.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveCategories = resolve
        }),
    )

    const initialization = store.initializeDefaultCategories()

    expect(store.isSeedingDefaultCategories).toBe(true)
    expect(store.isAdminUnlocked).toBe(true)
    await Promise.resolve()

    resolveCategories?.([
      buildCategory({ id: 'react-id', title: 'React', color: '#61dafb' }),
      buildCategory({ id: 'vue-id', title: 'Vue', color: '#42b883' }),
      buildCategory({ id: 'angular-id', title: 'Angular', color: '#dd0031' }),
    ])

    await initialization

    expect(store.isAdminUnlocked).toBe(true)
  })

  it('loads dots only after category bootstrap finishes', async () => {
    let resolveCategories:
      | ((
          value: Awaited<ReturnType<typeof initializeDefaultCategoriesAtomic>>,
        ) => void)
      | undefined

    mockInitializeDefaultCategoriesAtomic.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveCategories = resolve
        }),
    )

    const initialization = store.initializeDefaultCategories()

    await Promise.resolve()

    expect(mockInitializeDefaultCategoriesAtomic).toHaveBeenCalledTimes(1)
    expect(mockGetActiveDots).not.toHaveBeenCalled()

    resolveCategories?.([
      {
        id: 'react-id',
        title: 'React',
        color: '#61dafb',
        sortOrder: 1,
        createdAt: new Date().toISOString(),
        deletedAt: null,
        isDeleted: 0,
      },
    ])

    await initialization

    expect(mockGetActiveDots).toHaveBeenCalledTimes(1)
  })

  it('does not append defaults when IndexedDB already has active categories', async () => {
    mockInitializeDefaultCategoriesAtomic.mockResolvedValueOnce([
      {
        id: 'svelte-id',
        title: 'Svelte',
        color: '#ff3e00',
        sortOrder: 1,
        createdAt: new Date().toISOString(),
        deletedAt: null,
        isDeleted: 0,
      },
    ])

    store.categories.set('stale-empty-snapshot', {
      id: 'stale-empty-snapshot',
      title: 'React',
      color: '#61dafb',
      sortOrder: 1,
      createdAt: new Date().toISOString(),
      deletedAt: null,
      isDeleted: 0,
    })

    await store.initializeDefaultCategories()

    expect(mockInitializeDefaultCategoriesAtomic).toHaveBeenCalledTimes(1)
    expect(mockInitializeDefaultCategoriesAtomic).toHaveBeenCalledWith([
      {
        title: 'React',
        color: '#61dafb',
        sortOrder: 1,
      },
      {
        title: 'Vue',
        color: '#42b883',
        sortOrder: 2,
      },
      {
        title: 'Angular',
        color: '#dd0031',
        sortOrder: 3,
      },
    ])
    expect(
      Array.from(store.categories.values()).map(({ title }) => title),
    ).toEqual(['Svelte'])
  })

  it('skips creation when defaults already exist in IndexedDB and refreshes stale store', async () => {
    mockInitializeDefaultCategoriesAtomic.mockResolvedValueOnce([
      buildCategory({ id: 'react-id', title: 'React', color: '#61dafb' }),
      buildCategory({ id: 'vue-id', title: 'Vue', color: '#42b883' }),
      buildCategory({ id: 'angular-id', title: 'Angular', color: '#dd0031' }),
    ])

    await store.initializeDefaultCategories()

    expect(mockInitializeDefaultCategoriesAtomic).toHaveBeenCalledTimes(1)
    expect(
      Array.from(store.categories.values()).map(({ title }) => title),
    ).toEqual(['React', 'Vue', 'Angular'])
  })

  it('refreshes active dots when defaults already exist in IndexedDB', async () => {
    mockInitializeDefaultCategoriesAtomic.mockResolvedValueOnce([
      buildCategory({ id: 'react-id', title: 'React', color: '#61dafb' }),
      buildCategory({ id: 'vue-id', title: 'Vue', color: '#42b883' }),
      buildCategory({ id: 'angular-id', title: 'Angular', color: '#dd0031' }),
    ])
    mockGetActiveDots.mockResolvedValueOnce([
      buildDot({
        id: 'dot-1',
        categoryId: 'react-id',
        name: 'Alice',
        xRatio: 0.4,
        yRatio: 0.5,
      }),
    ])

    await store.initializeDefaultCategories()

    expect(mockGetActiveDots).toHaveBeenCalledTimes(1)
    expect(Array.from(store.dots.values()).map(({ name }) => name)).toEqual([
      'Alice',
    ])
  })

  it('preserves seeded categories in store when dot refresh fails', async () => {
    mockInitializeDefaultCategoriesAtomic.mockResolvedValueOnce([
      buildCategory({ id: 'react-id', title: 'React', color: '#61dafb' }),
      buildCategory({ id: 'vue-id', title: 'Vue', color: '#42b883' }),
    ])
    mockGetActiveDots.mockRejectedValueOnce(new Error('dot refresh failed'))

    await expect(store.initializeDefaultCategories()).rejects.toThrow(
      'dot refresh failed',
    )

    expect(
      Array.from(store.categories.values()).map(({ title }) => title),
    ).toEqual(['React', 'Vue'])
    expect(store.dots.size).toBe(0)
    expect(store.isSeedingDefaultCategories).toBe(false)
  })

  it('does not update store categories when atomic creation fails', async () => {
    mockInitializeDefaultCategoriesAtomic.mockRejectedValueOnce(
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
