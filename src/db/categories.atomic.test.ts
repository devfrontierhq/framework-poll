import { beforeEach, describe, expect, it, vi } from 'vitest'

import { buildCategory } from '@test/builders'

import type { Category } from '@/types/dotBoard'

const { committedCategories, getDb, resetTransactionQueue } = vi.hoisted(() => {
  const committedCategories = new Map<string, Category>()
  let transactionQueue = Promise.resolve()

  type FakeTransaction = {
    objectStore: (storeName: string) => {
      add: (category: Category) => Promise<void>
      index: (indexName: string) => {
        getAll: (query: 0 | 1) => Promise<Category[]>
      }
    }
    done: Promise<void>
  }

  const getDb = vi.fn(async () => ({
    transaction: (storeName: string) => {
      expect(storeName).toBe('categories')

      const pendingCategories = new Map<string, Category>()
      let failedError: Error | null = null
      const start = transactionQueue
      const done = (async () => {
        await start
        await new Promise((resolve) => setTimeout(resolve, 0))

        if (failedError) {
          throw new Error('transaction aborted')
        }

        pendingCategories.forEach((category, categoryId) => {
          committedCategories.set(categoryId, category)
        })
      })()
      transactionQueue = done.catch(() => undefined)

      const transaction: FakeTransaction = {
        objectStore: () => ({
          add: async (category) => {
            await start

            if (
              committedCategories.has(category.id) ||
              pendingCategories.has(category.id)
            ) {
              failedError = new Error(
                `A mutation operation in the transaction failed: ${category.id}`,
              )
              throw failedError
            }

            pendingCategories.set(category.id, category)
          },
          index: (indexName) => ({
            getAll: async (query) => {
              await start
              expect(indexName).toBe('isDeleted')

              return Array.from(committedCategories.values()).filter(
                (category) => category.isDeleted === query,
              )
            },
          }),
        }),
        done,
      }

      return transaction
    },
    getAllFromIndex: async () =>
      Array.from(committedCategories.values()).filter(
        (category) => category.isDeleted === 0,
      ),
  }))

  return {
    committedCategories,
    getDb,
    resetTransactionQueue: () => {
      transactionQueue = Promise.resolve()
    },
  }
})

vi.mock('@/db/client', () => ({
  getDb,
}))

import {
  createCategoriesAtomic,
  initializeDefaultCategoriesAtomic,
  getActiveCategories,
} from '@/db/categories'
import * as idUtils from '@/utils/id'

describe('createCategoriesAtomic', () => {
  beforeEach(() => {
    committedCategories.clear()
    resetTransactionQueue()
    getDb.mockClear()
    vi.restoreAllMocks()
  })

  it('rolls back all writes when one add fails mid-transaction', async () => {
    vi.spyOn(idUtils, 'createId')
      .mockReturnValueOnce('react-id')
      .mockReturnValueOnce('react-id')

    await expect(
      createCategoriesAtomic([
        { title: 'React', color: '#61dafb' },
        { title: 'Vue', color: '#42b883' },
      ]),
    ).rejects.toThrow(/create categories/i)

    await expect(getActiveCategories()).resolves.toEqual([])
  })
})

describe('initializeDefaultCategoriesAtomic', () => {
  beforeEach(() => {
    committedCategories.clear()
    resetTransactionQueue()
    getDb.mockClear()
    vi.restoreAllMocks()
  })

  it('serializes concurrent callers so defaults are seeded only once', async () => {
    vi.spyOn(idUtils, 'createId')
      .mockReturnValueOnce('react-id')
      .mockReturnValueOnce('vue-id')
      .mockReturnValueOnce('angular-id')

    const inputs = [
      { title: 'React', color: '#61dafb' },
      { title: 'Vue', color: '#42b883' },
      { title: 'Angular', color: '#dd0031' },
    ]

    const [firstResult, secondResult] = await Promise.all([
      initializeDefaultCategoriesAtomic(inputs),
      initializeDefaultCategoriesAtomic(inputs),
    ])

    expect(firstResult.map(({ title }) => title)).toEqual([
      'React',
      'Vue',
      'Angular',
    ])
    expect(secondResult.map(({ title }) => title)).toEqual([
      'React',
      'Vue',
      'Angular',
    ])
    expect(Array.from(committedCategories.values())).toHaveLength(3)
    expect(
      Array.from(committedCategories.values()).map(({ title }) => title),
    ).toEqual(['React', 'Vue', 'Angular'])
  })

  it('does not append defaults when active categories already exist', async () => {
    committedCategories.set(
      'svelte-id',
      buildCategory({
        id: 'svelte-id',
        title: 'Svelte',
        color: '#ff3e00',
      }),
    )

    const result = await initializeDefaultCategoriesAtomic([
      { title: 'React', color: '#61dafb' },
      { title: 'Vue', color: '#42b883' },
      { title: 'Angular', color: '#dd0031' },
    ])

    expect(result.map(({ title }) => title)).toEqual(['Svelte'])
    expect(
      Array.from(committedCategories.values()).map(({ title }) => title),
    ).toEqual(['Svelte'])
  })
})
