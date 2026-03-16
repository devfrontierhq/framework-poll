import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { buildCategory, buildDot } from '@test/builders'
import type { Category, Dot } from '@/types/dotBoard'

import { CategoryGrid } from './CategoryGrid'

vi.mock('./CategoryCard', () => ({
  CategoryCard: vi.fn(
    ({
      category,
      categoryDots,
    }: {
      category: Category
      categoryDots: Dot[]
    }) => (
      <div data-testid="category-card">
        <span>{category.title}</span>
        <span data-testid={`dot-count-${category.id}`}>
          {categoryDots.length}
        </span>
        <span>{categoryDots.map((dot) => dot.name).join(',')}</span>
      </div>
    ),
  ),
}))

describe('CategoryGrid', () => {
  it('passes each card only its category dots', () => {
    const reactCategory = buildCategory({
      id: 'category-react',
      title: 'React',
    })
    const vueCategory = buildCategory({ id: 'category-vue', title: 'Vue' })

    const dotsByCategory = new Map([
      [
        reactCategory.id,
        [
          buildDot({
            id: 'dot-1',
            categoryId: reactCategory.id,
            name: 'Alice',
          }),
        ],
      ],
      [
        vueCategory.id,
        [
          buildDot({
            id: 'dot-2',
            categoryId: vueCategory.id,
            name: 'Bob',
          }),
        ],
      ],
    ])

    render(
      <CategoryGrid
        categories={[reactCategory, vueCategory]}
        dotsByCategory={dotsByCategory}
      />,
    )

    expect(
      screen.getByTestId(`dot-count-${reactCategory.id}`),
    ).toHaveTextContent('1')
    expect(screen.getByTestId(`dot-count-${vueCategory.id}`)).toHaveTextContent(
      '1',
    )
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })
})
