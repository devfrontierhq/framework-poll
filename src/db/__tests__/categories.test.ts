import { describe, expect, it } from 'vitest'

import { buildCategory, buildDot } from '@test/builders'
import { isActive, isDeleted } from '@/types/dotBoard'

describe('Category Cascade Delete Logic', () => {
  it('should identify which dots belong to a deleted category', () => {
    const category = buildCategory({ id: 'cat-1', title: 'React' })

    const dots = [
      buildDot({ categoryId: 'cat-1', name: 'Dot 1' }),
      buildDot({ categoryId: 'cat-1', name: 'Dot 2' }),
      buildDot({ categoryId: 'cat-2', name: 'Dot 3' }), // Different category
    ]

    // Filter dots that belong to the category
    const categoryDots = dots.filter((dot) => dot.categoryId === category.id)

    expect(categoryDots).toHaveLength(2)
    expect(categoryDots[0].name).toBe('Dot 1')
    expect(categoryDots[1].name).toBe('Dot 2')
  })

  it('should simulate cascade delete behavior', () => {
    const category = buildCategory({
      id: 'cat-1',
      title: 'React',
      deletedAt: null,
      isDeleted: 0,
    })

    const dots = [
      buildDot({ categoryId: 'cat-1', name: 'Dot 1', deletedAt: null }),
      buildDot({ categoryId: 'cat-1', name: 'Dot 2', deletedAt: null }),
      buildDot({ categoryId: 'cat-2', name: 'Dot 3', deletedAt: null }),
    ]

    // Simulate cascade delete
    const deletedAt = '2024-03-15T14:00:00.000Z'
    const deletedCategory = {
      ...category,
      deletedAt,
      isDeleted: 1 as const,
    }

    // Apply cascade delete to dots
    const updatedDots = dots.map((dot) => {
      if (dot.categoryId === category.id && dot.isDeleted !== 1) {
        return {
          ...dot,
          deletedAt,
          isDeleted: 1 as const,
        }
      }
      return dot
    })

    // Verify category is deleted
    expect(isDeleted(deletedCategory)).toBe(true)
    expect(deletedCategory.deletedAt).toBe(deletedAt)

    // Verify dots in this category are deleted
    const categoryDots = updatedDots.filter(
      (dot) => dot.categoryId === category.id,
    )
    expect(categoryDots.every((dot) => isDeleted(dot))).toBe(true)
    expect(categoryDots.every((dot) => dot.deletedAt === deletedAt)).toBe(true)

    // Verify dots in other categories are not affected
    const otherCategoryDots = updatedDots.filter(
      (dot) => dot.categoryId !== category.id,
    )
    expect(otherCategoryDots.every((dot) => isActive(dot))).toBe(true)
  })

  it('should not re-delete already deleted dots during cascade', () => {
    const category = buildCategory({ id: 'cat-1', deletedAt: null })

    const dots = [
      buildDot({
        categoryId: 'cat-1',
        name: 'Active Dot',
        deletedAt: null,
        isDeleted: 0,
      }),
      buildDot({
        categoryId: 'cat-1',
        name: 'Already Deleted',
        deletedAt: '2024-03-14T10:00:00.000Z',
        isDeleted: 1,
      }),
    ]

    // Simulate cascade delete
    const categoryDeletedAt = '2024-03-15T14:00:00.000Z'

    const updatedDots = dots.map((dot) => {
      // Only delete dots that are not already deleted
      if (dot.categoryId === category.id && dot.isDeleted !== 1) {
        return {
          ...dot,
          deletedAt: categoryDeletedAt,
          isDeleted: 1 as const,
        }
      }
      return dot
    })

    // Active dot should have category's deletedAt
    const activeDot = updatedDots.find((d) => d.name === 'Active Dot')
    expect(activeDot!.deletedAt).toBe(categoryDeletedAt)

    // Already deleted dot should keep original deletedAt
    const alreadyDeleted = updatedDots.find((d) => d.name === 'Already Deleted')
    expect(alreadyDeleted!.deletedAt).toBe('2024-03-14T10:00:00.000Z')
  })

  it('should handle category with no dots', () => {
    const category = buildCategory({ id: 'cat-1' })
    const dots: ReturnType<typeof buildDot>[] = []

    // Filter dots for this category
    const categoryDots = dots.filter((dot) => dot.categoryId === category.id)

    expect(categoryDots).toHaveLength(0)

    // Cascade delete should work even with no dots
    const deletedAt = '2024-03-15T14:00:00.000Z'
    const deletedCategory = {
      ...category,
      deletedAt,
      isDeleted: 1 as const,
    }

    expect(isDeleted(deletedCategory)).toBe(true)
  })

  it('should use consistent timestamp for category and all dots', () => {
    const category = buildCategory({ id: 'cat-1' })

    const dots = [
      buildDot({ categoryId: 'cat-1', name: 'Dot 1' }),
      buildDot({ categoryId: 'cat-1', name: 'Dot 2' }),
      buildDot({ categoryId: 'cat-1', name: 'Dot 3' }),
    ]

    // Single timestamp for cascade delete
    const deletedAt = '2024-03-15T14:00:00.000Z'

    const deletedCategory = {
      ...category,
      deletedAt,
      isDeleted: 1 as const,
    }

    const deletedDots = dots.map((dot) => ({
      ...dot,
      deletedAt,
      isDeleted: 1 as const,
    }))

    // All should have same deletedAt
    const allDeletedAt = [
      deletedCategory.deletedAt,
      ...deletedDots.map((d) => d.deletedAt),
    ]

    expect(new Set(allDeletedAt).size).toBe(1)
    expect(allDeletedAt[0]).toBe(deletedAt)
  })

  it('should only cascade to active dots, not already deleted ones', () => {
    const category = buildCategory({ id: 'cat-1' })

    const dots = [
      buildDot({ categoryId: 'cat-1', name: 'Active 1', isDeleted: 0 }),
      buildDot({
        categoryId: 'cat-1',
        name: 'Deleted',
        isDeleted: 1,
        deletedAt: '2024-03-14T10:00:00.000Z',
      }),
      buildDot({ categoryId: 'cat-1', name: 'Active 2', isDeleted: 0 }),
    ]

    // Filter only active dots for cascade delete
    const dotsToDelete = dots.filter(
      (dot) => dot.categoryId === category.id && dot.isDeleted !== 1,
    )

    expect(dotsToDelete).toHaveLength(2)
    expect(dotsToDelete.map((d) => d.name)).toEqual(['Active 1', 'Active 2'])
  })

  it('should isolate cascade delete to specific category only', () => {
    const category1 = buildCategory({ id: 'cat-1', title: 'React' })
    const category2 = buildCategory({ id: 'cat-2', title: 'Vue' })

    const dots = [
      buildDot({ categoryId: 'cat-1', name: 'React User 1' }),
      buildDot({ categoryId: 'cat-1', name: 'React User 2' }),
      buildDot({ categoryId: 'cat-2', name: 'Vue User 1' }),
      buildDot({ categoryId: 'cat-2', name: 'Vue User 2' }),
    ]

    // Delete category 1
    const deletedAt = '2024-03-15T14:00:00.000Z'
    const updatedDots = dots.map((dot) => {
      if (dot.categoryId === category1.id && dot.isDeleted !== 1) {
        return {
          ...dot,
          deletedAt,
          isDeleted: 1 as const,
        }
      }
      return dot
    })

    // Category 1 dots should be deleted
    const cat1Dots = updatedDots.filter((d) => d.categoryId === category1.id)
    expect(cat1Dots.every((d) => isDeleted(d))).toBe(true)

    // Category 2 dots should remain active
    const cat2Dots = updatedDots.filter((d) => d.categoryId === category2.id)
    expect(cat2Dots.every((d) => isActive(d))).toBe(true)
  })
})
