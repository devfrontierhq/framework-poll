import type { Category, Dot } from '@/types/dotBoard'
import { CategoryCard } from './CategoryCard'

type CategoryGridProps = {
  categories: Category[]
  dots: Map<string, Dot>
}

export function CategoryGrid({ categories, dots }: CategoryGridProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4">
      {categories.map((category) => (
        <CategoryCard key={category.id} category={category} dots={dots} />
      ))}
    </div>
  )
}
