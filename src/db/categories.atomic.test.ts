import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { Category } from '@/types/dotBoard'

const { committedCategories, getDb } = vi.hoisted(() => {
  const committedCategories = new Map<string, Category>()

  type FakeTransaction = {
    objectStore: (storeName: string) => {
      add: (category: Category) => Promise<void>
    }
    done: Promise<void>
  }

  const getDb = vi.fn(async () => ({
    transaction: (storeName: string) => {
      expect(storeName).toBe('categories')

      const pendingCategories = new Map<string, Category>()
      let failed = false

      const done = new Promise<void>((resolve, reject) => {
        setTimeout(() => {
          if (failed) {
            reject(new Error('transaction aborted'))
            return
          }

          pendingCategories.forEach((category, categoryId) => {
            committedCategories.set(categoryId, category)
          })
          resolve()
        }, 0)
      })
      void done.catch(() => {})

      const transaction: FakeTransaction = {
        objectStore: () => ({
          add: async (category) => {
            if (
              committedCategories.has(category.id) ||
              pendingCategories.has(category.id)
            ) {
              failed = true
              throw new Error(
                `A mutation operation in the transaction failed: ${category.id}`,
              )
            }

            pendingCategories.set(category.id, category)
          },
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
  }
})

vi.mock('@/db/client', () => ({
  getDb,
}))

import { createCategoriesAtomic, getActiveCategories } from '@/db/categories'
import * as idUtils from '@/utils/id'

describe('createCategoriesAtomic', () => {
  beforeEach(() => {
    committedCategories.clear()
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
