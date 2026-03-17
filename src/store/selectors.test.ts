import { describe, expect, it } from 'vitest'

import { buildCategory, buildDot } from '@test/builders'
import { createMockDotBoardStore } from '@test/store'

import {
  selectCategoryDotCount,
  selectCategoryDots,
  selectCategoryList,
  selectDotsByCategory,
} from './selectors'

describe('store selectors', () => {
  it('selectCategoryList returns categories from Map', () => {
    const reactCategory = buildCategory({ id: 'react', title: 'React' })
    const vueCategory = buildCategory({ id: 'vue', title: 'Vue' })
    const store = createMockDotBoardStore({
      categories: new Map([
        [reactCategory.id, reactCategory],
        [vueCategory.id, vueCategory],
      ]),
    })

    const result = selectCategoryList(store)

    expect(result.map((category) => category.title)).toEqual(['React', 'Vue'])
  })

  it('selectCategoryList memoizes results', () => {
    const categoriesMap = new Map([
      ['react', buildCategory({ id: 'react', title: 'React' })],
    ])

    const store = createMockDotBoardStore({ categories: categoriesMap })

    const result1 = selectCategoryList(store)
    const result2 = selectCategoryList(store)

    // Same input Map → same output array reference (memoization)
    expect(result1).toBe(result2)
  })

  it('selectDotsByCategory groups only active dots', () => {
    const dot1 = buildDot({
      id: 'dot-1',
      categoryId: 'react',
      name: 'Alice',
    })
    const dot2 = buildDot({
      id: 'dot-2',
      categoryId: 'vue',
      name: 'Bob',
    })
    const dot3 = buildDot({
      id: 'dot-3',
      categoryId: 'react',
      name: 'Carol',
      deletedAt: new Date().toISOString(),
      isDeleted: 1,
    })

    const store = createMockDotBoardStore({
      dots: new Map([
        ['dot-1', dot1],
        ['dot-2', dot2],
        ['dot-3', dot3],
      ]),
    })

    const dotsByCategory = selectDotsByCategory(store)

    // Only active dots (Carol is deleted)
    expect(dotsByCategory.get('react')?.map((dot) => dot.name)).toEqual([
      'Alice',
    ])
    expect(dotsByCategory.get('vue')?.map((dot) => dot.name)).toEqual(['Bob'])
  })

  it('selectDotsByCategory memoizes results', () => {
    const dotsMap = new Map([
      ['dot-1', buildDot({ id: 'dot-1', categoryId: 'react', name: 'Alice' })],
    ])

    const store = createMockDotBoardStore({ dots: dotsMap })

    const result1 = selectDotsByCategory(store)
    const result2 = selectDotsByCategory(store)

    // Same input Map → same output Map reference (memoization)
    expect(result1).toBe(result2)
  })

  it('selectCategoryDots filters dots by category', () => {
    const dot1 = buildDot({
      id: 'dot-1',
      categoryId: 'react',
      name: 'Alice',
    })
    const dot2 = buildDot({
      id: 'dot-2',
      categoryId: 'react',
      name: 'Bob',
    })

    const store = createMockDotBoardStore({
      dots: new Map([
        ['dot-1', dot1],
        ['dot-2', dot2],
      ]),
    })

    const reactDots = selectCategoryDots('react')(store)
    const vueDots = selectCategoryDots('vue')(store)

    expect(reactDots.map((dot) => dot.name)).toEqual(['Alice', 'Bob'])
    expect(vueDots).toEqual([])
  })

  it('selectCategoryDotCount counts dots by category', () => {
    const store = createMockDotBoardStore({
      dots: new Map([
        [
          'dot-1',
          buildDot({ id: 'dot-1', categoryId: 'react', name: 'Alice' }),
        ],
        ['dot-2', buildDot({ id: 'dot-2', categoryId: 'react', name: 'Bob' })],
      ]),
    })

    expect(selectCategoryDotCount('react')(store)).toBe(2)
    expect(selectCategoryDotCount('vue')(store)).toBe(0)
  })
})
