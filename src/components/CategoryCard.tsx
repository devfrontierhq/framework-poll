import type { Category, Dot } from '@/types/dotBoard'
import { useDotBoardStore } from '@/store/dotBoardStore'
import { getCategoryDots } from '@/utils/count'

type CategoryCardProps = {
  category: Category
  dots: Map<string, Dot>
}

const DOT_OPACITY = 0.8
const DOT_BORDER = '2px solid rgba(255, 255, 255, 0.95)'
const DOT_OVERLAP_RING = '0 0 0 1px rgba(15, 23, 42, 0.16)'

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
            data-testid="category-dot"
            className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              left: `${dot.xRatio * 100}%`,
              top: `${dot.yRatio * 100}%`,
              backgroundColor: category.color,
              border: DOT_BORDER,
              boxShadow: DOT_OVERLAP_RING,
              opacity: DOT_OPACITY,
            }}
            title={dot.name}
          />
        ))}
      </div>
    </div>
  )
}
