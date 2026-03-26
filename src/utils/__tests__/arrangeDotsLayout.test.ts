import { describe, expect, it } from 'vitest'

import { buildDot } from '@test/builders'

import { computeGridLayout } from '../arrangeDotsLayout'

// DOT_DIAMETER_PX = 12, DOT_GAP_PX = 12, DOT_PADDING_PX = 6
// First dot center = padding + radius = 6 + 6 = 12px from container edge
// Step between dots = diameter + gap = 24px

describe('computeGridLayout', () => {
  it('returns empty array for 0 dots', () => {
    expect(computeGridLayout([], 400, 300)).toEqual([])
  })

  it('single dot arrangement — places dot near top-left with padding', () => {
    const dot = buildDot({ id: 'dot-1' })
    const width = 200
    const height = 200

    const result = computeGridLayout([dot], width, height)

    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('dot-1')
    // Center is at padding + radius = 6 + 6 = 12px from edge
    expect(result[0].xRatio).toBeCloseTo(12 / 200)
    expect(result[0].yRatio).toBeCloseTo(12 / 200)
  })

  it('dots arrange from top-left — fills first row before wrapping', () => {
    // Wide container (700x500): all 9 dots in first row
    const dots = Array.from({ length: 9 }, (_, i) =>
      buildDot({ id: `dot-${i}`, createdAt: `2024-01-0${i + 1}T00:00:00.000Z` }),
    )

    const width = 700
    const height = 500
    const result = computeGridLayout(dots, width, height)

    expect(result).toHaveLength(9)

    // First dot at padding + radius = 12px from edge
    expect(result[0].xRatio).toBeCloseTo(12 / width)
    expect(result[0].yRatio).toBeCloseTo(12 / height)

    // Second dot is 24px (step) to the right of the first
    expect(result[1].xRatio).toBeCloseTo(36 / width)
    expect(result[1].yRatio).toBeCloseTo(12 / height)

    // All 9 dots are in the first row (same yRatio)
    for (const r of result) {
      expect(r.yRatio).toBeCloseTo(12 / height)
    }
  })

  it('wraps to next row when container is not wide enough', () => {
    // Narrow container (50x500): usable width = 50 - 2*6 = 38, cols = floor(38/24) = 1
    // Actually with padding: cols = max(1, floor((50 - 2*6) / 24)) = max(1, 1) = 1
    // 5 dots → 5 rows
    const dots = Array.from({ length: 4 }, (_, i) =>
      buildDot({ id: `dot-${i}`, createdAt: `2024-01-0${i + 1}T00:00:00.000Z` }),
    )

    const width = 100
    const height = 500
    const result = computeGridLayout(dots, width, height)

    expect(result).toHaveLength(4)

    // dot-0 and dot-1 in row 0 (usable width = 100-12=88, cols = floor(88/24) = 3)
    expect(result[0].yRatio).toBeCloseTo(12 / height)
    expect(result[1].yRatio).toBeCloseTo(12 / height)
    expect(result[2].yRatio).toBeCloseTo(12 / height)

    // dot-3 in row 1
    expect(result[3].yRatio).toBeCloseTo(36 / height)
  })

  it('overflow: only arranges dots that fit — no out-of-range ratios', () => {
    const dots = Array.from({ length: 100 }, (_, i) =>
      buildDot({ id: `dot-${i}`, createdAt: `2024-01-${String(i + 1).padStart(2, '0')}T00:00:00.000Z` }),
    )

    // 60x60: usableW/H = 48, maxCols = floor(48/12) = 4, maxRows = 4, capacity = 16 < 100
    // Only the first 16 dots should be returned, all within [0, 1]
    const result = computeGridLayout(dots, 60, 60)

    expect(result.length).toBeLessThan(dots.length)
    for (const { xRatio, yRatio } of result) {
      expect(xRatio).toBeGreaterThanOrEqual(0)
      expect(xRatio).toBeLessThanOrEqual(1)
      expect(yRatio).toBeGreaterThanOrEqual(0)
      expect(yRatio).toBeLessThanOrEqual(1)
    }
  })

  it('no premature compression — 40 dots in 300x100 use normalStep without entering fallback', () => {
    // usableW = 288, cols = floor(288/24) = 12, rows = ceil(40/12) = 4
    // Last row bottom edge: padding(6) + radius(6) + 3*24 + radius(6) = 90 <= height-padding(94) ✓
    // Old condition rows*step=96 > usableH=88 would wrongly trigger compression
    const dots = Array.from({ length: 40 }, (_, i) =>
      buildDot({ id: `dot-${i}`, createdAt: `2024-01-${String(i + 1).padStart(2, '0')}T00:00:00.000Z` }),
    )

    const width = 300
    const height = 100
    const result = computeGridLayout(dots, width, height)

    expect(result).toHaveLength(40)

    // With normalStep=24 and cols=12: second dot is 24px to the right of the first
    const firstX = result[0].xRatio * width
    const secondX = result[1].xRatio * width
    expect(secondX - firstX).toBeCloseTo(24)

    // All ratios within bounds
    for (const { xRatio, yRatio } of result) {
      expect(xRatio).toBeGreaterThanOrEqual(0)
      expect(xRatio).toBeLessThanOrEqual(1)
      expect(yRatio).toBeGreaterThanOrEqual(0)
      expect(yRatio).toBeLessThanOrEqual(1)
    }
  })

  it('maxCols/maxRows accounts for leading radius — 441 dots fit in 270x270 without truncation', () => {
    // usableW/H = 258, correct maxCols = floor((258-6)/12)+1 = 21, capacity = 441
    // Old maxCols = floor(258/12) = 21 (happens to be same here, use tighter container)
    // usableW/H = 246 (270-24): correct maxCols = floor(240/12)+1 = 21, old = floor(246/12) = 20
    const dots = Array.from({ length: 441 }, (_, i) =>
      buildDot({ id: `dot-${i}`, createdAt: new Date(2024, 0, 1, 0, 0, i).toISOString() }),
    )

    // 258x258 container: usable = 246x246
    // correct maxCols = floor((246-6)/12)+1 = 21, capacity = 441 >= 441 → no truncation
    // old maxCols = floor(246/12) = 20, capacity = 400 < 441 → truncates last 41 dots
    const result = computeGridLayout(dots, 258, 258)

    expect(result).toHaveLength(441)
    for (const { xRatio, yRatio } of result) {
      expect(xRatio).toBeGreaterThanOrEqual(0)
      expect(xRatio).toBeLessThanOrEqual(1)
      expect(yRatio).toBeGreaterThanOrEqual(0)
      expect(yRatio).toBeLessThanOrEqual(1)
    }
  })

  it('small container with many dots — xRatio and yRatio never exceed 1 when dots fit', () => {
    const dots = Array.from({ length: 20 }, (_, i) =>
      buildDot({ id: `dot-${i}`, createdAt: `2024-01-${String(i + 1).padStart(2, '0')}T00:00:00.000Z` }),
    )

    // 80x80: usable = 68x68, correct maxCols = floor((68-6)/12)+1 = 6, capacity = 36 >= 20
    const result = computeGridLayout(dots, 80, 80)

    expect(result).toHaveLength(20)
    for (const { xRatio, yRatio } of result) {
      expect(xRatio).toBeGreaterThanOrEqual(0)
      expect(xRatio).toBeLessThanOrEqual(1)
      expect(yRatio).toBeGreaterThanOrEqual(0)
      expect(yRatio).toBeLessThanOrEqual(1)
    }
  })

  it('sorts by createdAt ascending', () => {
    // Pass dots in reverse chronological order
    const dotC = buildDot({ id: 'dot-c', createdAt: '2024-01-03T00:00:00.000Z' })
    const dotA = buildDot({ id: 'dot-a', createdAt: '2024-01-01T00:00:00.000Z' })
    const dotB = buildDot({ id: 'dot-b', createdAt: '2024-01-02T00:00:00.000Z' })

    const result = computeGridLayout([dotC, dotA, dotB], 300, 300)

    expect(result.map((r) => r.id)).toEqual(['dot-a', 'dot-b', 'dot-c'])
  })

  it('500 dots in realistic card size — all ratios within [0, 1]', () => {
    const dots = Array.from({ length: 500 }, (_, i) =>
      buildDot({
        id: `dot-${i}`,
        createdAt: new Date(2024, 0, 1, 0, 0, i).toISOString(),
        xRatio: Math.random(),
        yRatio: Math.random(),
      }),
    )

    const width = 400
    const height = 300
    const result = computeGridLayout(dots, width, height)

    expect(result.length).toBeLessThanOrEqual(500)
    for (const { xRatio, yRatio } of result) {
      expect(xRatio).toBeGreaterThanOrEqual(0)
      expect(xRatio).toBeLessThanOrEqual(1)
      expect(yRatio).toBeGreaterThanOrEqual(0)
      expect(yRatio).toBeLessThanOrEqual(1)
    }
  })

  it('500 dots compressed layout — dot centers do not exceed container bounds in pixels', () => {
    const dots = Array.from({ length: 500 }, (_, i) =>
      buildDot({
        id: `dot-${i}`,
        createdAt: new Date(2024, 0, 1, 0, 0, i).toISOString(),
        xRatio: Math.random(),
        yRatio: Math.random(),
      }),
    )

    const width = 400
    const height = 300
    const result = computeGridLayout(dots, width, height)

    for (const { xRatio, yRatio } of result) {
      expect(xRatio * width).toBeGreaterThanOrEqual(0)
      expect(xRatio * width).toBeLessThanOrEqual(width)
      expect(yRatio * height).toBeGreaterThanOrEqual(0)
      expect(yRatio * height).toBeLessThanOrEqual(height)
    }
  })
})
