import type { Dot } from '@/types/dotBoard'
import { isActive } from '@/types/dotBoard'

/**
 * 取得特定 category 的未刪除 dots
 * Get active dots for a specific category
 *
 * @param categoryId - The category ID to filter dots for
 * @param dots - Array of all dots
 * @returns Array of active (non-deleted) dots in the category
 */
export function getCategoryDots(categoryId: string, dots: Dot[]): Dot[] {
  return dots.filter((dot) => dot.categoryId === categoryId && isActive(dot))
}

/**
 * 計算特定 category 的未刪除 dots 數量
 * Count non-deleted dots for a specific category
 *
 * @param categoryId - The category ID to count dots for
 * @param dots - Array of all dots
 * @returns Number of active (non-deleted) dots in the category
 */
export function getCategoryDotCount(categoryId: string, dots: Dot[]): number {
  return getCategoryDots(categoryId, dots).length
}
