import { describe, expect, it } from 'vitest'

import { buildCategory, buildDot } from '@test/builders'
import { isActive } from '@/types/dotBoard'
import type { Dot } from '@/types/dotBoard'

import { groupDotsByCategory } from './count'

describe('groupDotsByCategory', () => {
  it('groups only non-deleted dots for a category', () => {
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

    const count = groupDotsByCategory(dots).get(category.id)?.length ?? 0

    expect(count).toBe(2)
  })

  it('returns no group when category has no dots', () => {
    const category = buildCategory({ id: 'cat-1', title: 'React' })
    const dots: Dot[] = []

    const count = groupDotsByCategory(dots).get(category.id)?.length ?? 0

    expect(count).toBe(0)
  })

  it('returns no group when category has only deleted dots', () => {
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

    const count = groupDotsByCategory(dots).get(category.id)?.length ?? 0

    expect(count).toBe(0)
  })

  it('groups all dots when none are deleted', () => {
    const category = buildCategory({ id: 'cat-1', title: 'React' })

    const dots = [
      buildDot({ categoryId: 'cat-1', name: 'Active 1', deletedAt: null }),
      buildDot({ categoryId: 'cat-1', name: 'Active 2', deletedAt: null }),
      buildDot({ categoryId: 'cat-1', name: 'Active 3', deletedAt: null }),
    ]

    const count = groupDotsByCategory(dots).get(category.id)?.length ?? 0

    expect(count).toBe(3)
  })

  it('only groups dots belonging to the specified category', () => {
    const category1 = buildCategory({ id: 'cat-1', title: 'React' })

    const dots = [
      buildDot({ categoryId: 'cat-1', name: 'React User 1', deletedAt: null }),
      buildDot({ categoryId: 'cat-1', name: 'React User 2', deletedAt: null }),
      buildDot({ categoryId: 'cat-2', name: 'Vue User 1', deletedAt: null }),
      buildDot({ categoryId: 'cat-2', name: 'Vue User 2', deletedAt: null }),
    ]

    const count = groupDotsByCategory(dots).get(category1.id)?.length ?? 0

    expect(count).toBe(2)
  })

  it('handles mixed active and deleted dots correctly', () => {
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

    const count = groupDotsByCategory(dots).get(category.id)?.length ?? 0

    expect(count).toBe(3)
  })

  it('uses deletedAt === null as the inclusion criteria', () => {
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
    expect(groupDotsByCategory(dots).get(category.id)?.length ?? 0).toBe(1)
  })
})
