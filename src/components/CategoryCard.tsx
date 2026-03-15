import type { Category, Dot } from '@/types/dotBoard'
import { useDotBoardStore } from '@/store/dotBoardStore'
import { getCategoryDotCount } from '@/utils/count'

type CategoryCardProps = {
  category: Category
  dots: Map<string, Dot>
}

export function CategoryCard({ category, dots }: CategoryCardProps) {
  const isAdminUnlocked = useDotBoardStore((state) => state.isAdminUnlocked)

  const dotArray = Array.from(dots.values())
  const dotCount = getCategoryDotCount(category.id, dotArray)

  return (
    <div className="flex min-h-[300px] flex-col rounded-lg border border-slate-200 bg-white shadow-sm">
      {/* Header with title and optional count (admin mode only) */}
      <div className="border-b border-slate-200 p-4">
        <h3 className="text-lg font-bold" style={{ color: category.color }}>
          {category.title}
          {isAdminUnlocked ? ` - ${dotCount}` : ''}
        </h3>
      </div>

      {/* Dot display area - will be implemented in 6.5 */}
      <div className="relative flex-1 p-4">{/* TODO: Display dots here */}</div>
    </div>
  )
}
