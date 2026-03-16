import type { Category, Dot } from '@/types/dotBoard'
import { cn } from '@/lib/utils'
import { CategoryCard } from './CategoryCard'

type CategoryGridProps = {
  categories: Category[]
  dotsByCategory: Map<string, Dot[]>
}

export function CategoryGrid({
  categories,
  dotsByCategory,
}: CategoryGridProps) {
  const hasOverflowColumns = categories.length > 3

  return (
    <div
      data-testid="category-grid-viewport"
      className={cn(
        'h-full',
        hasOverflowColumns &&
          'overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
      )}
    >
      <div
        data-testid="category-grid-track"
        className={cn(
          'flex h-full min-w-full flex-col gap-6',
          hasOverflowColumns
            ? 'md:inline-flex md:flex-row'
            : 'md:grid md:grid-cols-3',
        )}
      >
        {categories.map((category) => (
          <div
            key={category.id}
            className={cn(
              'h-full',
              hasOverflowColumns ? 'md:w-80 md:flex-shrink-0' : 'md:min-w-0',
            )}
          >
            <CategoryCard
              category={category}
              categoryDots={dotsByCategory.get(category.id) ?? []}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
