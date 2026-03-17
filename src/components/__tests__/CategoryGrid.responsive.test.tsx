import { render, screen, cleanup } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'

import { createMockDotBoardStore } from '@test/store'
import { buildCategory, buildDot } from '@test/builders'

import { CategoryGrid } from '../CategoryGrid'
import { useDotBoardStore } from '@/store/dotBoardStore'

// Mock the store
vi.mock('@/store/dotBoardStore', () => ({
  useDotBoardStore: vi.fn(),
}))

// Mock toast notifications
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

describe('CategoryGrid - Responsive Layout', () => {
  beforeEach(() => {
    // Setup default mock implementation
    const mockStore = createMockDotBoardStore()
    vi.mocked(useDotBoardStore).mockImplementation((selector) => selector(mockStore))
  })

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  describe('Mobile Layout (Single Column)', () => {
    const mockCategories = [
      buildCategory({ id: 'cat-1', title: 'React', color: '#61dafb' }),
      buildCategory({ id: 'cat-2', title: 'Vue', color: '#42b883' }),
      buildCategory({ id: 'cat-3', title: 'Angular', color: '#dd0031' }),
    ]

    const mockDotsByCategory = new Map([
      ['cat-1', [buildDot({ id: 'dot-1', categoryId: 'cat-1', name: 'Alice' })]],
      ['cat-2', [buildDot({ id: 'dot-2', categoryId: 'cat-2', name: 'Bob' })]],
      ['cat-3', [buildDot({ id: 'dot-3', categoryId: 'cat-3', name: 'Charlie' })]],
    ])

    it('mobile: renders all categories in flex column layout', () => {
      render(<CategoryGrid categories={mockCategories} dotsByCategory={mockDotsByCategory} />)

      const track = screen.getByTestId('category-grid-track')

      // Should have flex-col class for mobile
      expect(track).toHaveClass('flex')
      expect(track).toHaveClass('flex-col')

      // Should have all 3 categories
      const categoryCards = screen.getAllByRole('heading')
      expect(categoryCards).toHaveLength(3)
      expect(categoryCards[0]).toHaveTextContent('React')
      expect(categoryCards[1]).toHaveTextContent('Vue')
      expect(categoryCards[2]).toHaveTextContent('Angular')
    })

    it('mobile: categories stack vertically with gap-6', () => {
      render(<CategoryGrid categories={mockCategories} dotsByCategory={mockDotsByCategory} />)

      const track = screen.getByTestId('category-grid-track')

      // Should have gap-6 class
      expect(track).toHaveClass('gap-6')
      expect(track).toHaveClass('flex-col')
    })
  })

  describe('Desktop Layout (3 Column Grid) - 3 or fewer categories', () => {
    const mockCategories = [
      buildCategory({ id: 'cat-1', title: 'React', color: '#61dafb' }),
      buildCategory({ id: 'cat-2', title: 'Vue', color: '#42b883' }),
      buildCategory({ id: 'cat-3', title: 'Angular', color: '#dd0031' }),
    ]

    const mockDotsByCategory = new Map([
      ['cat-1', [buildDot({ id: 'dot-1', categoryId: 'cat-1', name: 'Alice' })]],
      ['cat-2', [buildDot({ id: 'dot-2', categoryId: 'cat-2', name: 'Bob' })]],
      ['cat-3', [buildDot({ id: 'dot-3', categoryId: 'cat-3', name: 'Charlie' })]],
    ])

    it('desktop: renders 3-column grid layout when categories <= 3', () => {
      render(<CategoryGrid categories={mockCategories} dotsByCategory={mockDotsByCategory} />)

      const track = screen.getByTestId('category-grid-track')

      // Desktop should use grid layout (md:grid md:grid-cols-3)
      expect(track).toHaveClass('md:grid')
      expect(track).toHaveClass('md:grid-cols-3')
    })

    it('desktop: no scroll for 3 or fewer categories', () => {
      render(<CategoryGrid categories={mockCategories} dotsByCategory={mockDotsByCategory} />)

      const viewport = screen.getByTestId('category-grid-viewport')

      // Should NOT have overflow-y-auto (no scroll needed)
      expect(viewport).not.toHaveClass('md:overflow-y-auto')
      // Should NOT have horizontal scroll
      expect(viewport).not.toHaveClass('overflow-x-auto')
    })

    it('desktop: category wrappers use h-full for portrait aspect ratio', () => {
      render(<CategoryGrid categories={mockCategories} dotsByCategory={mockDotsByCategory} />)

      const track = screen.getByTestId('category-grid-track')
      const categoryWrappers = track.querySelectorAll(':scope > div')

      categoryWrappers.forEach((wrapper) => {
        expect(wrapper).toHaveClass('h-full')
        expect(wrapper).not.toHaveClass('md:aspect-square')
      })
    })
  })

  describe('Desktop Layout (Vertical Scroll + Square) - More than 3 categories', () => {
    const mockCategories = [
      buildCategory({ id: 'cat-1', title: 'React', color: '#61dafb' }),
      buildCategory({ id: 'cat-2', title: 'Vue', color: '#42b883' }),
      buildCategory({ id: 'cat-3', title: 'Angular', color: '#dd0031' }),
      buildCategory({ id: 'cat-4', title: 'Svelte', color: '#ff3e00' }),
      buildCategory({ id: 'cat-5', title: 'Solid', color: '#2c4f7c' }),
    ]

    const mockDotsByCategory = new Map([
      ['cat-1', [buildDot({ id: 'dot-1', categoryId: 'cat-1', name: 'Alice' })]],
      ['cat-2', [buildDot({ id: 'dot-2', categoryId: 'cat-2', name: 'Bob' })]],
      ['cat-3', [buildDot({ id: 'dot-3', categoryId: 'cat-3', name: 'Charlie' })]],
      ['cat-4', [buildDot({ id: 'dot-4', categoryId: 'cat-4', name: 'David' })]],
      ['cat-5', [buildDot({ id: 'dot-5', categoryId: 'cat-5', name: 'Eve' })]],
    ])

    it('desktop: still renders 3-column grid when categories > 3', () => {
      render(<CategoryGrid categories={mockCategories} dotsByCategory={mockDotsByCategory} />)

      const track = screen.getByTestId('category-grid-track')

      // Should still use grid layout
      expect(track).toHaveClass('md:grid')
      expect(track).toHaveClass('md:grid-cols-3')
    })

    it('desktop: enables vertical scroll when categories > 3', () => {
      render(<CategoryGrid categories={mockCategories} dotsByCategory={mockDotsByCategory} />)

      const viewport = screen.getByTestId('category-grid-viewport')

      // Should have vertical scroll
      expect(viewport).toHaveClass('md:overflow-y-auto')
      // Should NOT have horizontal scroll
      expect(viewport).not.toHaveClass('overflow-x-auto')
    })

    it('desktop: each category wrapper has square aspect ratio when > 3 categories', () => {
      render(<CategoryGrid categories={mockCategories} dotsByCategory={mockDotsByCategory} />)

      const track = screen.getByTestId('category-grid-track')
      const categoryWrappers = track.querySelectorAll(':scope > div')

      categoryWrappers.forEach((wrapper) => {
        expect(wrapper).toHaveClass('md:aspect-square')
        expect(wrapper).not.toHaveClass('h-full')
      })
    })

    it('desktop: renders all 5 categories in grid layout', () => {
      render(<CategoryGrid categories={mockCategories} dotsByCategory={mockDotsByCategory} />)

      const categoryCards = screen.getAllByRole('heading')
      expect(categoryCards).toHaveLength(5)
      expect(categoryCards[0]).toHaveTextContent('React')
      expect(categoryCards[1]).toHaveTextContent('Vue')
      expect(categoryCards[2]).toHaveTextContent('Angular')
      expect(categoryCards[3]).toHaveTextContent('Svelte')
      expect(categoryCards[4]).toHaveTextContent('Solid')
    })
  })

  describe('Edge Cases', () => {
    it('renders correctly with no categories', () => {
      render(<CategoryGrid categories={[]} dotsByCategory={new Map()} />)

      const track = screen.getByTestId('category-grid-track')

      // Should still have base classes
      expect(track).toHaveClass('flex')
      expect(track).toHaveClass('flex-col')

      // No categories should be rendered
      expect(screen.queryAllByRole('heading')).toHaveLength(0)
    })

    it('renders correctly with single category', () => {
      const mockCategories = [buildCategory({ id: 'cat-1', title: 'React', color: '#61dafb' })]

      const mockDotsByCategory = new Map([['cat-1', [buildDot({ id: 'dot-1', categoryId: 'cat-1', name: 'Alice' })]]])

      render(<CategoryGrid categories={mockCategories} dotsByCategory={mockDotsByCategory} />)

      const track = screen.getByTestId('category-grid-track')

      // Should use grid layout (1 <= 3)
      expect(track).toHaveClass('md:grid')
      expect(track).toHaveClass('md:grid-cols-3')

      const categoryCards = screen.getAllByRole('heading')
      expect(categoryCards).toHaveLength(1)
      expect(categoryCards[0]).toHaveTextContent('React')
    })

    it('renders correctly with exactly 4 categories (boundary case)', () => {
      const mockCategories = [
        buildCategory({ id: 'cat-1', title: 'React', color: '#61dafb' }),
        buildCategory({ id: 'cat-2', title: 'Vue', color: '#42b883' }),
        buildCategory({ id: 'cat-3', title: 'Angular', color: '#dd0031' }),
        buildCategory({ id: 'cat-4', title: 'Svelte', color: '#ff3e00' }),
      ]

      const mockDotsByCategory = new Map([
        ['cat-1', [buildDot({ id: 'dot-1', categoryId: 'cat-1', name: 'Alice' })]],
        ['cat-2', [buildDot({ id: 'dot-2', categoryId: 'cat-2', name: 'Bob' })]],
        ['cat-3', [buildDot({ id: 'dot-3', categoryId: 'cat-3', name: 'Charlie' })]],
        ['cat-4', [buildDot({ id: 'dot-4', categoryId: 'cat-4', name: 'David' })]],
      ])

      render(<CategoryGrid categories={mockCategories} dotsByCategory={mockDotsByCategory} />)

      const track = screen.getByTestId('category-grid-track')
      const viewport = screen.getByTestId('category-grid-viewport')

      // Should use grid + vertical scroll + square aspect
      expect(track).toHaveClass('md:grid')
      expect(track).toHaveClass('md:grid-cols-3')
      expect(viewport).toHaveClass('md:overflow-y-auto')

      const categoryCards = screen.getAllByRole('heading')
      expect(categoryCards).toHaveLength(4)
    })
  })

  describe('Layout Consistency', () => {
    it('always uses 3-column grid on desktop regardless of category count', () => {
      const threeCategories = [
        buildCategory({ id: 'cat-1', title: 'React', color: '#61dafb' }),
        buildCategory({ id: 'cat-2', title: 'Vue', color: '#42b883' }),
        buildCategory({ id: 'cat-3', title: 'Angular', color: '#dd0031' }),
      ]

      const fiveCategories = [
        ...threeCategories,
        buildCategory({ id: 'cat-4', title: 'Svelte', color: '#ff3e00' }),
        buildCategory({ id: 'cat-5', title: 'Solid', color: '#2c4f7c' }),
      ]

      const { rerender } = render(<CategoryGrid categories={threeCategories} dotsByCategory={new Map()} />)

      expect(screen.getByTestId('category-grid-track')).toHaveClass('md:grid-cols-3')

      rerender(<CategoryGrid categories={fiveCategories} dotsByCategory={new Map()} />)

      expect(screen.getByTestId('category-grid-track')).toHaveClass('md:grid-cols-3')
    })

    it('desktop layout transitions aspect ratio correctly at 3-category boundary', () => {
      const threeCategories = [
        buildCategory({ id: 'cat-1', title: 'React', color: '#61dafb' }),
        buildCategory({ id: 'cat-2', title: 'Vue', color: '#42b883' }),
        buildCategory({ id: 'cat-3', title: 'Angular', color: '#dd0031' }),
      ]

      const fourCategories = [...threeCategories, buildCategory({ id: 'cat-4', title: 'Svelte', color: '#ff3e00' })]

      // Test with 3 categories: portrait (h-full), no scroll
      const { rerender } = render(<CategoryGrid categories={threeCategories} dotsByCategory={new Map()} />)

      let track = screen.getByTestId('category-grid-track')
      let viewport = screen.getByTestId('category-grid-viewport')
      let wrappers = track.querySelectorAll(':scope > div')

      expect(viewport).not.toHaveClass('md:overflow-y-auto')
      wrappers.forEach((w) => {
        expect(w).toHaveClass('h-full')
        expect(w).not.toHaveClass('md:aspect-square')
      })

      // Test with 4 categories: square aspect, vertical scroll
      rerender(<CategoryGrid categories={fourCategories} dotsByCategory={new Map()} />)

      track = screen.getByTestId('category-grid-track')
      viewport = screen.getByTestId('category-grid-viewport')
      wrappers = track.querySelectorAll(':scope > div')

      expect(viewport).toHaveClass('md:overflow-y-auto')
      wrappers.forEach((w) => {
        expect(w).toHaveClass('md:aspect-square')
        expect(w).not.toHaveClass('h-full')
      })
    })
  })
})
