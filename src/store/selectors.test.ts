import { describe, expect, it } from 'vitest'

import { buildCategory, buildDot } from '@test/builders'

import {
  selectCategoryDotCount,
  selectCategoryDots,
  selectCategoryList,
  selectDotsByCategory,
} from './selectors'
import type { DotBoardStore } from './types'

function buildStore(overrides: Partial<DotBoardStore> = {}): DotBoardStore {
  return {
    categories: new Map(),
    dots: new Map(),
    isAdminUnlocked: false,
    isInitialized: true,
    isLoading: false,
    loadError: null,
    verifyAdminPassword: () => false,
    unlockAdmin: () => false,
    lockAdmin: () => {},
    addCategory: async () => {
      throw new Error('Not implemented in test')
    },
    editCategory: async () => undefined,
    removeCategory: async () => undefined,
    addDot: async () => {
      throw new Error('Not implemented in test')
    },
    removeDot: async () => undefined,
    loadData: async () => {},
    exportCsv: async () => {},
    ...overrides,
  }
}

describe('store selectors', () => {
  it('selectCategoryList returns categories in insertion order', () => {
    const reactCategory = buildCategory({ id: 'react', title: 'React' })
    const vueCategory = buildCategory({ id: 'vue', title: 'Vue' })
    const store = buildStore({
      categories: new Map([
        [reactCategory.id, reactCategory],
        [vueCategory.id, vueCategory],
      ]),
    })

    expect(selectCategoryList(store).map((category) => category.title)).toEqual(
      ['React', 'Vue'],
    )
  })

  it('selectDotsByCategory groups only active dots by category', () => {
    const store = buildStore({
      dots: new Map([
        [
          'dot-1',
          buildDot({
            id: 'dot-1',
            categoryId: 'react',
            name: 'Alice',
          }),
        ],
        [
          'dot-2',
          buildDot({
            id: 'dot-2',
            categoryId: 'vue',
            name: 'Bob',
          }),
        ],
        [
          'dot-3',
          buildDot({
            id: 'dot-3',
            categoryId: 'react',
            name: 'Carol',
            deletedAt: new Date().toISOString(),
            isDeleted: 1,
          }),
        ],
      ]),
    })

    const dotsByCategory = selectDotsByCategory(store)

    expect(dotsByCategory.get('react')?.map((dot) => dot.name)).toEqual([
      'Alice',
    ])
    expect(dotsByCategory.get('vue')?.map((dot) => dot.name)).toEqual(['Bob'])
  })

  it('selectCategoryDots and selectCategoryDotCount read grouped dots', () => {
    const store = buildStore({
      dots: new Map([
        [
          'dot-1',
          buildDot({
            id: 'dot-1',
            categoryId: 'react',
            name: 'Alice',
          }),
        ],
        [
          'dot-2',
          buildDot({
            id: 'dot-2',
            categoryId: 'react',
            name: 'Bob',
          }),
        ],
      ]),
    })

    expect(selectCategoryDots('react')(store).map((dot) => dot.name)).toEqual([
      'Alice',
      'Bob',
    ])
    expect(selectCategoryDotCount('react')(store)).toBe(2)
    expect(selectCategoryDotCount('vue')(store)).toBe(0)
  })
})
