import type { Dot } from '@/types/dotBoard'
import { isActive } from '@/types/dotBoard'

/**
 * 計算特定 category 的未刪除 dots 數量
 * Count non-deleted dots for a specific category
 *
 * @param categoryId - The category ID to count dots for
 * @param dots - Array of all dots
 * @returns Number of active (non-deleted) dots in the category
 */
export function getCategoryDotCount(categoryId: string, dots: Dot[]): number {
  return dots.filter((dot) => dot.categoryId === categoryId && isActive(dot))
    .length
}
