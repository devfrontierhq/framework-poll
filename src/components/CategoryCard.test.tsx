import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { buildCategory, buildDot } from '@test/builders'
import { getBoundedPosition } from '@/lib/dotPosition'
import { createMockDotBoardStore } from '@test/store'

import { CategoryCard } from './CategoryCard'

import { useDotBoardStore } from '@/store/dotBoardStore'

vi.mock('@/store/dotBoardStore', () => ({
  useDotBoardStore: vi.fn(),
}))

describe('CategoryCard', () => {
  beforeEach(() => {
    const mockStore = createMockDotBoardStore()

    vi.mocked(useDotBoardStore).mockImplementation((selector) =>
      selector(mockStore),
    )
  })

  afterEach(() => {
    cleanup()
  })

  it('renders dots with overlap-friendly opacity and visible border styling', () => {
    const category = buildCategory({
      id: 'category-1',
      color: '#3b82f6',
      title: 'React',
    })
    const categoryDots = [
      buildDot({
        id: 'dot-1',
        categoryId: category.id,
        name: 'Alice',
        xRatio: 0.5,
        yRatio: 0.5,
      }),
      buildDot({
        id: 'dot-2',
        categoryId: category.id,
        name: 'Bob',
        xRatio: 0.52,
        yRatio: 0.52,
      }),
    ]

    render(<CategoryCard category={category} categoryDots={categoryDots} />)

    const renderedDots = screen.getAllByTestId('category-dot')

    expect(renderedDots).toHaveLength(2)

    for (const dot of renderedDots) {
      expect(dot.style.opacity).toBe('0.8')
      expect(dot.style.backgroundColor).toBe(category.color)
      expect(dot.style.border).toContain('2px solid')
      expect(dot.style.border).toContain('rgba(255, 255, 255, 0.95)')
      expect(dot.style.boxShadow).toBe('0 0 0 1px rgba(15, 23, 42, 0.16)')
    }
  })

  it('keeps the title readable for light category colors while showing the category color in a swatch', () => {
    const category = buildCategory({
      id: 'category-1',
      color: '#FFFFFF',
      title: 'Vue',
    })

    render(<CategoryCard category={category} categoryDots={[]} />)

    const heading = screen.getByRole('heading', { name: 'Vue' })
    const swatch = screen.getByTestId('category-color-swatch')

    expect(heading).not.toHaveStyle({ color: category.color })
    expect(heading.className).toContain('text-slate-900')
    expect(swatch.style.backgroundColor).toBe(category.color)
  })

  it('renders a hover label for each dot using CSS tooltip classes', () => {
    const category = buildCategory({
      id: 'category-1',
      color: '#3b82f6',
      title: 'React',
    })
    const dot = buildDot({
      id: 'dot-1',
      categoryId: category.id,
      name: 'Alice',
      xRatio: 0.5,
      yRatio: 0.5,
    })

    render(<CategoryCard category={category} categoryDots={[dot]} />)

    const dotWrapper = screen.getByTestId('category-dot-wrapper')
    const hoverLabel = screen.getByTestId('dot-hover-label')

    expect(dotWrapper.className).toContain('group')
    expect(hoverLabel).toHaveTextContent('Alice')
    expect(hoverLabel.className).toContain('opacity-0')
    expect(hoverLabel.className).toContain('group-hover:opacity-100')
  })

  it('bounds edge ratios so dots stay fully inside the plotting area', () => {
    expect(getBoundedPosition(0)).toBe('clamp(6px, 0%, calc(100% - 6px))')
    expect(getBoundedPosition(1)).toBe('clamp(6px, 100%, calc(100% - 6px))')
    expect(getBoundedPosition(0.5)).toBe('clamp(6px, 50%, calc(100% - 6px))')
  })
})
