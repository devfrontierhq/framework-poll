import { describe, expect, it } from 'vitest'

import { buildCategory, buildDot } from '@test/builders'

import { isActive, isDeleted } from './dotBoard'

describe('Soft Delete Implementation', () => {
  describe('isActive', () => {
    it('should return true when deletedAt is null', () => {
      const activeCategory = buildCategory({
        deletedAt: null,
      })

      expect(isActive(activeCategory)).toBe(true)
    })

    it('should return false when deletedAt has a timestamp', () => {
      const deletedCategory = buildCategory({
        deletedAt: '2024-03-15T14:00:00.000Z',
      })

      expect(isActive(deletedCategory)).toBe(false)
    })

    it('should work with Dot records', () => {
      const activeDot = buildDot({ deletedAt: null })
      const deletedDot = buildDot({ deletedAt: '2024-03-15T14:00:00.000Z' })

      expect(isActive(activeDot)).toBe(true)
      expect(isActive(deletedDot)).toBe(false)
    })
  })

  describe('isDeleted', () => {
    it('should return false when deletedAt is null', () => {
      const activeCategory = buildCategory({
        deletedAt: null,
      })

      expect(isDeleted(activeCategory)).toBe(false)
    })

    it('should return true when deletedAt has a timestamp', () => {
      const deletedCategory = buildCategory({
        deletedAt: '2024-03-15T14:00:00.000Z',
      })

      expect(isDeleted(deletedCategory)).toBe(true)
    })

    it('should work with Dot records', () => {
      const activeDot = buildDot({ deletedAt: null })
      const deletedDot = buildDot({ deletedAt: '2024-03-15T14:00:00.000Z' })

      expect(isDeleted(activeDot)).toBe(false)
      expect(isDeleted(deletedDot)).toBe(true)
    })
  })

  describe('Soft Delete Filtering Rules', () => {
    it('should filter active records (deletedAt === null)', () => {
      const categories = [
        buildCategory({ id: 'cat-1', title: 'Active 1', deletedAt: null }),
        buildCategory({
          id: 'cat-2',
          title: 'Deleted 1',
          deletedAt: '2024-03-15T10:00:00.000Z',
        }),
        buildCategory({ id: 'cat-3', title: 'Active 2', deletedAt: null }),
        buildCategory({
          id: 'cat-4',
          title: 'Deleted 2',
          deletedAt: '2024-03-15T11:00:00.000Z',
        }),
      ]

      const activeCategories = categories.filter(isActive)

      expect(activeCategories).toHaveLength(2)
      expect(activeCategories[0].title).toBe('Active 1')
      expect(activeCategories[1].title).toBe('Active 2')
    })

    it('should filter deleted records (deletedAt !== null)', () => {
      const dots = [
        buildDot({ name: 'Active Dot 1', deletedAt: null }),
        buildDot({
          name: 'Deleted Dot 1',
          deletedAt: '2024-03-15T10:00:00.000Z',
        }),
        buildDot({ name: 'Active Dot 2', deletedAt: null }),
        buildDot({
          name: 'Deleted Dot 2',
          deletedAt: '2024-03-15T11:00:00.000Z',
        }),
      ]

      const deletedDots = dots.filter(isDeleted)

      expect(deletedDots).toHaveLength(2)
      expect(deletedDots[0].name).toBe('Deleted Dot 1')
      expect(deletedDots[1].name).toBe('Deleted Dot 2')
    })

    it('should handle empty array filtering', () => {
      const emptyCategories: ReturnType<typeof buildCategory>[] = []

      expect(emptyCategories.filter(isActive)).toHaveLength(0)
      expect(emptyCategories.filter(isDeleted)).toHaveLength(0)
    })

    it('should handle all active records', () => {
      const allActive = [
        buildCategory({ deletedAt: null }),
        buildCategory({ deletedAt: null }),
        buildCategory({ deletedAt: null }),
      ]

      expect(allActive.filter(isActive)).toHaveLength(3)
      expect(allActive.filter(isDeleted)).toHaveLength(0)
    })

    it('should handle all deleted records', () => {
      const allDeleted = [
        buildDot({ deletedAt: '2024-03-15T10:00:00.000Z' }),
        buildDot({ deletedAt: '2024-03-15T11:00:00.000Z' }),
        buildDot({ deletedAt: '2024-03-15T12:00:00.000Z' }),
      ]

      expect(allDeleted.filter(isActive)).toHaveLength(0)
      expect(allDeleted.filter(isDeleted)).toHaveLength(3)
    })
  })

  describe('Soft Delete State Transitions', () => {
    it('should demonstrate record state change from active to deleted', () => {
      // Initial state: active record
      const category = buildCategory({
        id: 'cat-1',
        title: 'Test Category',
        deletedAt: null,
        isDeleted: 0,
      })

      expect(isActive(category)).toBe(true)
      expect(isDeleted(category)).toBe(false)

      // After soft delete: mark as deleted
      const deletedCategory = {
        ...category,
        deletedAt: '2024-03-15T14:00:00.000Z',
        isDeleted: 1 as const,
      }

      expect(isActive(deletedCategory)).toBe(false)
      expect(isDeleted(deletedCategory)).toBe(true)
    })

    it('should verify isDeleted flag consistency with deletedAt', () => {
      // Active record: deletedAt = null, isDeleted = 0
      const activeRecord = buildCategory({
        deletedAt: null,
        isDeleted: 0,
      })

      expect(activeRecord.deletedAt).toBeNull()
      expect(activeRecord.isDeleted).toBe(0)
      expect(isActive(activeRecord)).toBe(true)

      // Deleted record: deletedAt = timestamp, isDeleted = 1
      const deletedRecord = buildCategory({
        deletedAt: '2024-03-15T14:00:00.000Z',
        isDeleted: 1,
      })

      expect(deletedRecord.deletedAt).not.toBeNull()
      expect(deletedRecord.isDeleted).toBe(1)
      expect(isDeleted(deletedRecord)).toBe(true)
    })
  })
})
