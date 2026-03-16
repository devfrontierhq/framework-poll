import type { Dot } from '@/types/dotBoard'
import { isActive } from '@/types/dotBoard'

/**
 * 依 category 預先分組未刪除的 dots，避免重複掃描整份資料
 */
export function groupDotsByCategory(dots: Iterable<Dot>): Map<string, Dot[]> {
  const groupedDots = new Map<string, Dot[]>()

  for (const dot of dots) {
    if (!isActive(dot)) {
      continue
    }

    const categoryDots = groupedDots.get(dot.categoryId)

    if (categoryDots) {
      categoryDots.push(dot)
      continue
    }

    groupedDots.set(dot.categoryId, [dot])
  }

  return groupedDots
}
