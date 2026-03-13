import type { Category, CsvRow, Dot } from '@/types/dotBoard'
import { createId } from '@/utils/id'

/**
 * 建立測試用 Category 資料
 */
export function buildCategory(overrides: Partial<Category> = {}): Category {
  return {
    id: createId(),
    title: '測試版塊',
    color: '#3b82f6',
    createdAt: new Date().toISOString(),
    deletedAt: null,
    ...overrides,
  }
}

/**
 * 建立測試用 Dot 資料
 */
export function buildDot(overrides: Partial<Dot> = {}): Dot {
  return {
    id: createId(),
    categoryId: createId(),
    name: '測試圓點',
    xRatio: 0.5,
    yRatio: 0.5,
    createdAt: new Date().toISOString(),
    deletedAt: null,
    ...overrides,
  }
}

/**
 * 建立測試用 CsvRow 資料
 */
export function buildCsvRow(overrides: Partial<CsvRow> = {}): CsvRow {
  return {
    categoryTitle: '測試版塊',
    dotName: '測試圓點',
    createdAt: '2024-01-01 10:00',
    deletedAt: '',
    ...overrides,
  }
}
