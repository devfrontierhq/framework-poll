import type { Category, Dot } from '@/types/dotBoard'
import { cn } from '@/lib/utils'
import { CategoryCard } from './CategoryCard'

type CategoryGridProps = {
  categories: Category[]
  dotsByCategory: Map<string, Dot[]>
}

export function CategoryGrid({ categories, dotsByCategory }: CategoryGridProps) {
  const hasOverflowRows = categories.length > 3

  return (
    <div data-testid="category-grid-viewport" className={cn('h-full', hasOverflowRows && 'md:overflow-y-auto')}>
      <div
        data-testid="category-grid-track"
        className={cn('flex h-full min-w-full flex-col gap-6', 'md:grid md:grid-cols-3', hasOverflowRows && 'md:pb-10')}
      >
        {categories.map((category) => (
          <div key={category.id} className={cn('md:min-w-0', hasOverflowRows ? 'md:aspect-square' : 'h-full')}>
            <CategoryCard category={category} categoryDots={dotsByCategory.get(category.id) ?? []} />
          </div>
        ))}
      </div>
    </div>
  )
}
