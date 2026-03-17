import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { buildCategory, buildDot } from '@test/builders'
import type { Category, Dot } from '@/types/dotBoard'

import { CategoryGrid } from '../CategoryGrid'

vi.mock('../CategoryCard', () => ({
  CategoryCard: vi.fn(({ category, categoryDots }: { category: Category; categoryDots: Dot[] }) => (
    <div data-testid="category-card">
      <span>{category.title}</span>
      <span data-testid={`dot-count-${category.id}`}>{categoryDots.length}</span>
      <span>{categoryDots.map((dot) => dot.name).join(',')}</span>
    </div>
  )),
}))

afterEach(() => {
  cleanup()
})

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

    render(<CategoryGrid categories={[reactCategory, vueCategory]} dotsByCategory={dotsByCategory} />)

    expect(screen.getByTestId(`dot-count-${reactCategory.id}`)).toHaveTextContent('1')
    expect(screen.getByTestId(`dot-count-${vueCategory.id}`)).toHaveTextContent('1')
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })

  it('uses a three-column grid without horizontal scrolling for up to three categories', () => {
    const categories = [
      buildCategory({ id: 'category-react', title: 'React' }),
      buildCategory({ id: 'category-vue', title: 'Vue' }),
      buildCategory({ id: 'category-angular', title: 'Angular' }),
    ]

    const { getByTestId } = render(<CategoryGrid categories={categories} dotsByCategory={new Map()} />)

    expect(getByTestId('category-grid-viewport')).not.toHaveClass('overflow-x-auto')
    expect(getByTestId('category-grid-track')).toHaveClass('md:grid', 'md:grid-cols-3')
  })

  it('enables vertical scrolling with square aspect ratio when there are more than three categories', () => {
    const categories = [
      buildCategory({ id: 'category-react', title: 'React' }),
      buildCategory({ id: 'category-vue', title: 'Vue' }),
      buildCategory({ id: 'category-angular', title: 'Angular' }),
      buildCategory({ id: 'category-svelte', title: 'Svelte' }),
    ]

    const { getByTestId } = render(<CategoryGrid categories={categories} dotsByCategory={new Map()} />)

    expect(getByTestId('category-grid-viewport')).toHaveClass('md:overflow-y-auto')
    expect(getByTestId('category-grid-track')).toHaveClass('md:grid', 'md:grid-cols-3')
  })
})
