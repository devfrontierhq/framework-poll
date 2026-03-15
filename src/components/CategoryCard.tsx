import type { Category, Dot } from '@/types/dotBoard'
import { useDotBoardStore } from '@/store/dotBoardStore'
import { getCategoryDots } from '@/utils/count'

type CategoryCardProps = {
  category: Category
  dots: Map<string, Dot>
}

export function CategoryCard({ category, dots }: CategoryCardProps) {
  const isAdminUnlocked = useDotBoardStore((state) => state.isAdminUnlocked)

  const dotArray = Array.from(dots.values())
  const categoryDots = getCategoryDots(category.id, dotArray)
  const dotCount = categoryDots.length

  return (
    <div className="flex min-h-[300px] flex-col rounded-lg border border-slate-200 bg-white shadow-sm">
      {/* Header with title and optional count (admin mode only) */}
      <div className="border-b border-slate-200 p-4">
        <h3 className="text-lg font-bold" style={{ color: category.color }}>
          {category.title}
          {isAdminUnlocked ? ` - ${dotCount}` : ''}
        </h3>
      </div>

      {/* Dot display area */}
      <div className="relative flex-1 p-4">
        {categoryDots.map((dot) => (
          <div
            key={dot.id}
            className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white"
            style={{
              left: `${dot.xRatio * 100}%`,
              top: `${dot.yRatio * 100}%`,
              backgroundColor: category.color,
              opacity: 0.8,
            }}
            title={dot.name}
          />
        ))}
      </div>
    </div>
  )
}
