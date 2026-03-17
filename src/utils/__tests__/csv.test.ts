import { describe, expect, it } from 'vitest'

import { buildCategory, buildDot } from '@test/builders'

import { buildCsvRows, formatCsvDateTime } from '../csv'

describe('formatCsvDateTime', () => {
  it('should format valid ISO date string to yyyy-MM-dd HH:mm format', () => {
    const isoDate = '2024-03-15T14:30:00.000Z'
    const result = formatCsvDateTime(isoDate)

    // Note: The result depends on the local timezone
    // We're testing that it matches the expected format pattern
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/)
  })

  it('should return empty string when input is null', () => {
    const result = formatCsvDateTime(null)

    expect(result).toBe('')
  })

  it('should format different date values correctly', () => {
    // Test various dates to ensure consistency
    const dates = [
      '2024-01-01T00:00:00.000Z', // Year start
      '2024-12-31T23:59:00.000Z', // Year end
      '2024-06-15T12:30:00.000Z', // Mid-year
    ]

    dates.forEach((date) => {
      const result = formatCsvDateTime(date)
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/)
    })
  })

  it('should format a specific known date correctly', () => {
    // Using a date with a known timezone-independent format
    const isoDate = '2024-03-15T00:00:00.000Z'
    const result = formatCsvDateTime(isoDate)

    // Verify the date part is correct (time may vary by timezone)
    expect(result).toContain('2024-03-')
  })

  it('should handle dates with different time components', () => {
    const morning = '2024-03-15T08:00:00.000Z'
    const afternoon = '2024-03-15T14:30:00.000Z'
    const evening = '2024-03-15T20:45:00.000Z'

    const morningResult = formatCsvDateTime(morning)
    const afternoonResult = formatCsvDateTime(afternoon)
    const eveningResult = formatCsvDateTime(evening)

    // All should match the format pattern
    expect(morningResult).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/)
    expect(afternoonResult).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/)
    expect(eveningResult).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/)
  })
})

describe('buildCsvRows', () => {
  it('should build CSV rows with correct category and dot information', () => {
    const category = buildCategory({
      id: 'cat-1',
      title: 'React',
      color: '#61dafb',
    })

    const dot = buildDot({
      id: 'dot-1',
      categoryId: 'cat-1',
      name: 'Alice',
      createdAt: '2024-03-15T10:00:00.000Z',
      deletedAt: null,
    })

    const result = buildCsvRows([dot], [category])

    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      categoryTitle: 'React',
      dotName: 'Alice',
    })
    expect(result[0].createdAt).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/)
    expect(result[0].deletedAt).toBe('')
  })

  it('should handle multiple dots and categories correctly', () => {
    const categories = [
      buildCategory({ id: 'cat-1', title: 'React' }),
      buildCategory({ id: 'cat-2', title: 'Vue' }),
    ]

    const dots = [
      buildDot({ categoryId: 'cat-1', name: 'Alice' }),
      buildDot({ categoryId: 'cat-2', name: 'Bob' }),
      buildDot({ categoryId: 'cat-1', name: 'Charlie' }),
    ]

    const result = buildCsvRows(dots, categories)

    expect(result).toHaveLength(3)
    expect(result[0].categoryTitle).toBe('React')
    expect(result[0].dotName).toBe('Alice')
    expect(result[1].categoryTitle).toBe('Vue')
    expect(result[1].dotName).toBe('Bob')
    expect(result[2].categoryTitle).toBe('React')
    expect(result[2].dotName).toBe('Charlie')
  })

  it('should handle missing category with fallback message', () => {
    const dot = buildDot({
      categoryId: 'missing-category-id',
      name: 'Orphan Dot',
    })

    const result = buildCsvRows([dot], [])

    expect(result).toHaveLength(1)
    expect(result[0].categoryTitle).toBe('[MISSING: missing-category-id]')
    expect(result[0].dotName).toBe('Orphan Dot')
  })

  it('should include both active and deleted dots in export', () => {
    const category = buildCategory({ id: 'cat-1', title: 'React' })

    const activeDot = buildDot({
      categoryId: 'cat-1',
      name: 'Active User',
      createdAt: '2024-03-15T10:00:00.000Z',
      deletedAt: null,
    })

    const deletedDot = buildDot({
      categoryId: 'cat-1',
      name: 'Deleted User',
      createdAt: '2024-03-15T10:00:00.000Z',
      deletedAt: '2024-03-15T14:00:00.000Z',
    })

    const result = buildCsvRows([activeDot, deletedDot], [category])

    expect(result).toHaveLength(2)

    // Active dot should have empty deletedAt
    expect(result[0].dotName).toBe('Active User')
    expect(result[0].deletedAt).toBe('')

    // Deleted dot should have formatted deletedAt
    expect(result[1].dotName).toBe('Deleted User')
    expect(result[1].deletedAt).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/)
  })

  it('should handle empty dots array', () => {
    const categories = [buildCategory({ title: 'React' })]
    const result = buildCsvRows([], categories)

    expect(result).toHaveLength(0)
    expect(result).toEqual([])
  })

  it('should handle empty categories array', () => {
    const dots = [buildDot({ name: 'Test Dot', categoryId: 'cat-1' })]
    const result = buildCsvRows(dots, [])

    expect(result).toHaveLength(1)
    expect(result[0].categoryTitle).toBe('[MISSING: cat-1]')
  })

  it('should format dates using formatCsvDateTime', () => {
    const category = buildCategory({ id: 'cat-1', title: 'React' })
    const dot = buildDot({
      categoryId: 'cat-1',
      name: 'Test User',
      createdAt: '2024-03-15T10:30:00.000Z',
      deletedAt: '2024-03-15T14:45:00.000Z',
    })

    const result = buildCsvRows([dot], [category])

    // Both dates should be formatted
    expect(result[0].createdAt).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/)
    expect(result[0].deletedAt).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/)
  })
})
