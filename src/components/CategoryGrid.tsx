import { forwardRef, useImperativeHandle, useRef } from 'react'

import type { Category, Dot } from '@/types/dotBoard'
import { cn } from '@/lib/utils'
import { CategoryCard } from './CategoryCard'

type CategoryGridProps = {
  categories: Category[]
  dotsByCategory: Map<string, Dot[]>
}

export type CategoryGridHandle = {
  getCardRects: () => Map<string, DOMRect>
}

export const CategoryGrid = forwardRef<CategoryGridHandle, CategoryGridProps>(function CategoryGrid(
  { categories, dotsByCategory },
  ref,
) {
  const hasOverflowRows = categories.length > 3
  const cardRefsMap = useRef<Map<string, HTMLDivElement>>(new Map())

  useImperativeHandle(ref, () => ({
    getCardRects() {
      const rects = new Map<string, DOMRect>()
      cardRefsMap.current.forEach((el, categoryId) => {
        rects.set(categoryId, el.getBoundingClientRect())
      })
      return rects
    },
  }))

  return (
    <div data-testid="category-grid-viewport" className={cn('h-full', hasOverflowRows && 'md:overflow-y-auto')}>
      <div
        data-testid="category-grid-track"
        className={cn('flex h-full min-w-full flex-col gap-6', 'md:grid md:grid-cols-3', hasOverflowRows && 'md:pb-10')}
      >
        {categories.map((category) => (
          <div key={category.id} className={cn('md:min-w-0', hasOverflowRows ? 'md:aspect-square' : 'h-full')}>
            <CategoryCard
              ref={(el) => {
                if (el) {
                  cardRefsMap.current.set(category.id, el)
                } else {
                  cardRefsMap.current.delete(category.id)
                }
              }}
              category={category}
              categoryDots={dotsByCategory.get(category.id) ?? []}
            />
          </div>
        ))}
      </div>
    </div>
  )
})
