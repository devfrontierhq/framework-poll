import type { Category } from '@/types/dotBoard'

type CategoryGridProps = {
  categories: Category[]
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4">
      {categories.map((category) => (
        <div key={category.id}>
          {/* TODO: Replace with CategoryCard component */}
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h3 className="font-bold" style={{ color: category.color }}>
              {category.title}
            </h3>
          </div>
        </div>
      ))}
    </div>
  )
}
