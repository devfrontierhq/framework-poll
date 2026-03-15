import { describe, expect, it } from 'vitest'

import { buildCategory, buildDot } from '@test/builders'
import { isActive } from '@/types/dotBoard'
import type { Dot } from '@/types/dotBoard'

import { getCategoryDotCount } from './count'

describe('Category Dot Count Logic', () => {
  it('should count only non-deleted dots for a category', () => {
    const category = buildCategory({ id: 'cat-1', title: 'React' })

    const dots = [
      buildDot({ categoryId: 'cat-1', name: 'Active 1', deletedAt: null }),
      buildDot({ categoryId: 'cat-1', name: 'Active 2', deletedAt: null }),
      buildDot({
        categoryId: 'cat-1',
        name: 'Deleted 1',
        deletedAt: '2024-03-15T10:00:00.000Z',
      }),
      buildDot({
        categoryId: 'cat-2',
        name: 'Other Category',
        deletedAt: null,
      }),
    ]

    const count = getCategoryDotCount(category.id, dots)

    expect(count).toBe(2)
  })

  it('should return 0 when category has no dots', () => {
    const category = buildCategory({ id: 'cat-1', title: 'React' })
    const dots: Dot[] = []

    const count = getCategoryDotCount(category.id, dots)

    expect(count).toBe(0)
  })

  it('should return 0 when category has only deleted dots', () => {
    const category = buildCategory({ id: 'cat-1', title: 'React' })

    const dots = [
      buildDot({
        categoryId: 'cat-1',
        name: 'Deleted 1',
        deletedAt: '2024-03-15T10:00:00.000Z',
      }),
      buildDot({
        categoryId: 'cat-1',
        name: 'Deleted 2',
        deletedAt: '2024-03-15T11:00:00.000Z',
      }),
    ]

    const count = getCategoryDotCount(category.id, dots)

    expect(count).toBe(0)
  })

  it('should count all dots when none are deleted', () => {
    const category = buildCategory({ id: 'cat-1', title: 'React' })

    const dots = [
      buildDot({ categoryId: 'cat-1', name: 'Active 1', deletedAt: null }),
      buildDot({ categoryId: 'cat-1', name: 'Active 2', deletedAt: null }),
      buildDot({ categoryId: 'cat-1', name: 'Active 3', deletedAt: null }),
    ]

    const count = getCategoryDotCount(category.id, dots)

    expect(count).toBe(3)
  })

  it('should only count dots belonging to the specified category', () => {
    const category1 = buildCategory({ id: 'cat-1', title: 'React' })

    const dots = [
      buildDot({ categoryId: 'cat-1', name: 'React User 1', deletedAt: null }),
      buildDot({ categoryId: 'cat-1', name: 'React User 2', deletedAt: null }),
      buildDot({ categoryId: 'cat-2', name: 'Vue User 1', deletedAt: null }),
      buildDot({ categoryId: 'cat-2', name: 'Vue User 2', deletedAt: null }),
    ]

    const count = getCategoryDotCount(category1.id, dots)

    expect(count).toBe(2)
  })

  it('should handle mixed active and deleted dots correctly', () => {
    const category = buildCategory({ id: 'cat-1', title: 'React' })

    const dots = [
      buildDot({ categoryId: 'cat-1', name: 'Active 1', deletedAt: null }),
      buildDot({
        categoryId: 'cat-1',
        name: 'Deleted 1',
        deletedAt: '2024-03-15T10:00:00.000Z',
      }),
      buildDot({ categoryId: 'cat-1', name: 'Active 2', deletedAt: null }),
      buildDot({
        categoryId: 'cat-1',
        name: 'Deleted 2',
        deletedAt: '2024-03-15T11:00:00.000Z',
      }),
      buildDot({ categoryId: 'cat-1', name: 'Active 3', deletedAt: null }),
    ]

    const count = getCategoryDotCount(category.id, dots)

    expect(count).toBe(3)
  })

  it('should verify deletedAt === null is the counting criteria', () => {
    const category = buildCategory({ id: 'cat-1', title: 'React' })

    const dots = [
      buildDot({ categoryId: 'cat-1', name: 'Active', deletedAt: null }),
      buildDot({
        categoryId: 'cat-1',
        name: 'Deleted',
        deletedAt: '2024-03-15T10:00:00.000Z',
        isDeleted: 1,
      }),
    ]

    // Count using isActive helper (which checks deletedAt === null)
    const activeDotsUsingHelper = dots.filter(
      (dot) => dot.categoryId === category.id && isActive(dot),
    )

    // Count by checking deletedAt directly
    const activeDotsDirectCheck = dots.filter(
      (dot) => dot.categoryId === category.id && dot.deletedAt === null,
    )

    expect(activeDotsUsingHelper.length).toBe(1)
    expect(activeDotsDirectCheck.length).toBe(1)
    expect(activeDotsUsingHelper.length).toBe(activeDotsDirectCheck.length)
  })
})
