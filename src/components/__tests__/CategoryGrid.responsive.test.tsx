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
    vi.mocked(useDotBoardStore).mockImplementation((selector) =>
      selector(mockStore),
    )
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
      [
        'cat-1',
        [buildDot({ id: 'dot-1', categoryId: 'cat-1', name: 'Alice' })],
      ],
      ['cat-2', [buildDot({ id: 'dot-2', categoryId: 'cat-2', name: 'Bob' })]],
      [
        'cat-3',
        [buildDot({ id: 'dot-3', categoryId: 'cat-3', name: 'Charlie' })],
      ],
    ])

    it('mobile: renders all categories in flex column layout', () => {
      render(
        <CategoryGrid
          categories={mockCategories}
          dotsByCategory={mockDotsByCategory}
        />,
      )

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
      render(
        <CategoryGrid
          categories={mockCategories}
          dotsByCategory={mockDotsByCategory}
        />,
      )

      const track = screen.getByTestId('category-grid-track')

      // Should have gap-6 class
      expect(track).toHaveClass('gap-6')
      expect(track).toHaveClass('flex-col')
    })

    it('mobile: each category takes full height', () => {
      render(
        <CategoryGrid
          categories={mockCategories}
          dotsByCategory={mockDotsByCategory}
        />,
      )

      // Find category wrapper divs (direct children of track)
      const track = screen.getByTestId('category-grid-track')
      const categoryWrappers = track.querySelectorAll(':scope > div')

      categoryWrappers.forEach((wrapper) => {
        expect(wrapper).toHaveClass('h-full')
      })
    })
  })

  describe('Desktop Layout (3 Column Grid) - 3 or fewer categories', () => {
    const mockCategories = [
      buildCategory({ id: 'cat-1', title: 'React', color: '#61dafb' }),
      buildCategory({ id: 'cat-2', title: 'Vue', color: '#42b883' }),
      buildCategory({ id: 'cat-3', title: 'Angular', color: '#dd0031' }),
    ]

    const mockDotsByCategory = new Map([
      [
        'cat-1',
        [buildDot({ id: 'dot-1', categoryId: 'cat-1', name: 'Alice' })],
      ],
      ['cat-2', [buildDot({ id: 'dot-2', categoryId: 'cat-2', name: 'Bob' })]],
      [
        'cat-3',
        [buildDot({ id: 'dot-3', categoryId: 'cat-3', name: 'Charlie' })],
      ],
    ])

    it('desktop: renders 3-column grid layout when categories <= 3', () => {
      render(
        <CategoryGrid
          categories={mockCategories}
          dotsByCategory={mockDotsByCategory}
        />,
      )

      const track = screen.getByTestId('category-grid-track')

      // Desktop should use grid layout (md:grid md:grid-cols-3)
      expect(track).toHaveClass('md:grid')
      expect(track).toHaveClass('md:grid-cols-3')

      // Should NOT have horizontal scroll classes (md:inline-flex md:flex-row)
      expect(track).not.toHaveClass('md:inline-flex')
      expect(track).not.toHaveClass('md:flex-row')
    })

    it('desktop: no horizontal scroll for 3 or fewer categories', () => {
      render(
        <CategoryGrid
          categories={mockCategories}
          dotsByCategory={mockDotsByCategory}
        />,
      )

      const viewport = screen.getByTestId('category-grid-viewport')

      // Should NOT have overflow-x-auto
      expect(viewport).not.toHaveClass('overflow-x-auto')
      expect(viewport).not.toHaveClass('[-ms-overflow-style:none]')
      expect(viewport).not.toHaveClass('[scrollbar-width:none]')
    })

    it('desktop: category wrappers use md:min-w-0 for proper grid sizing', () => {
      render(
        <CategoryGrid
          categories={mockCategories}
          dotsByCategory={mockDotsByCategory}
        />,
      )

      const track = screen.getByTestId('category-grid-track')
      const categoryWrappers = track.querySelectorAll(':scope > div')

      categoryWrappers.forEach((wrapper) => {
        expect(wrapper).toHaveClass('md:min-w-0')
        expect(wrapper).not.toHaveClass('md:w-80')
        expect(wrapper).not.toHaveClass('md:flex-shrink-0')
      })
    })
  })

  describe('Desktop Layout (Horizontal Scroll) - More than 3 categories', () => {
    const mockCategories = [
      buildCategory({ id: 'cat-1', title: 'React', color: '#61dafb' }),
      buildCategory({ id: 'cat-2', title: 'Vue', color: '#42b883' }),
      buildCategory({ id: 'cat-3', title: 'Angular', color: '#dd0031' }),
      buildCategory({ id: 'cat-4', title: 'Svelte', color: '#ff3e00' }),
      buildCategory({ id: 'cat-5', title: 'Solid', color: '#2c4f7c' }),
    ]

    const mockDotsByCategory = new Map([
      [
        'cat-1',
        [buildDot({ id: 'dot-1', categoryId: 'cat-1', name: 'Alice' })],
      ],
      ['cat-2', [buildDot({ id: 'dot-2', categoryId: 'cat-2', name: 'Bob' })]],
      [
        'cat-3',
        [buildDot({ id: 'dot-3', categoryId: 'cat-3', name: 'Charlie' })],
      ],
      [
        'cat-4',
        [buildDot({ id: 'dot-4', categoryId: 'cat-4', name: 'David' })],
      ],
      ['cat-5', [buildDot({ id: 'dot-5', categoryId: 'cat-5', name: 'Eve' })]],
    ])

    it('desktop: renders horizontal scroll layout when categories > 3', () => {
      render(
        <CategoryGrid
          categories={mockCategories}
          dotsByCategory={mockDotsByCategory}
        />,
      )

      const track = screen.getByTestId('category-grid-track')

      // Desktop should use flex-row layout (md:inline-flex md:flex-row)
      expect(track).toHaveClass('md:inline-flex')
      expect(track).toHaveClass('md:flex-row')

      // Should NOT use grid layout
      expect(track).not.toHaveClass('md:grid')
      expect(track).not.toHaveClass('md:grid-cols-3')
    })

    it('desktop: enables horizontal scroll with hidden scrollbar when categories > 3', () => {
      render(
        <CategoryGrid
          categories={mockCategories}
          dotsByCategory={mockDotsByCategory}
        />,
      )

      const viewport = screen.getByTestId('category-grid-viewport')

      // Should have overflow-x-auto and scrollbar hiding classes
      expect(viewport).toHaveClass('overflow-x-auto')
      expect(viewport).toHaveClass('[-ms-overflow-style:none]')
      expect(viewport).toHaveClass('[scrollbar-width:none]')
      expect(viewport).toHaveClass('[&::-webkit-scrollbar]:hidden')
    })

    it('desktop: each category has fixed width (w-80) and no shrink', () => {
      render(
        <CategoryGrid
          categories={mockCategories}
          dotsByCategory={mockDotsByCategory}
        />,
      )

      const track = screen.getByTestId('category-grid-track')
      const categoryWrappers = track.querySelectorAll(':scope > div')

      categoryWrappers.forEach((wrapper) => {
        expect(wrapper).toHaveClass('md:w-80')
        expect(wrapper).toHaveClass('md:flex-shrink-0')
        expect(wrapper).not.toHaveClass('md:min-w-0')
      })
    })

    it('desktop: renders all 5 categories in horizontal layout', () => {
      render(
        <CategoryGrid
          categories={mockCategories}
          dotsByCategory={mockDotsByCategory}
        />,
      )

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
      const mockCategories = [
        buildCategory({ id: 'cat-1', title: 'React', color: '#61dafb' }),
      ]

      const mockDotsByCategory = new Map([
        [
          'cat-1',
          [buildDot({ id: 'dot-1', categoryId: 'cat-1', name: 'Alice' })],
        ],
      ])

      render(
        <CategoryGrid
          categories={mockCategories}
          dotsByCategory={mockDotsByCategory}
        />,
      )

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
        [
          'cat-1',
          [buildDot({ id: 'dot-1', categoryId: 'cat-1', name: 'Alice' })],
        ],
        [
          'cat-2',
          [buildDot({ id: 'dot-2', categoryId: 'cat-2', name: 'Bob' })],
        ],
        [
          'cat-3',
          [buildDot({ id: 'dot-3', categoryId: 'cat-3', name: 'Charlie' })],
        ],
        [
          'cat-4',
          [buildDot({ id: 'dot-4', categoryId: 'cat-4', name: 'David' })],
        ],
      ])

      render(
        <CategoryGrid
          categories={mockCategories}
          dotsByCategory={mockDotsByCategory}
        />,
      )

      const track = screen.getByTestId('category-grid-track')
      const viewport = screen.getByTestId('category-grid-viewport')

      // Should trigger horizontal scroll layout (4 > 3)
      expect(track).toHaveClass('md:inline-flex')
      expect(track).toHaveClass('md:flex-row')
      expect(viewport).toHaveClass('overflow-x-auto')

      const categoryCards = screen.getAllByRole('heading')
      expect(categoryCards).toHaveLength(4)
    })

    it('maintains full height for all layouts', () => {
      const mockCategories = [
        buildCategory({ id: 'cat-1', title: 'React', color: '#61dafb' }),
        buildCategory({ id: 'cat-2', title: 'Vue', color: '#42b883' }),
      ]

      const mockDotsByCategory = new Map([
        [
          'cat-1',
          [buildDot({ id: 'dot-1', categoryId: 'cat-1', name: 'Alice' })],
        ],
        [
          'cat-2',
          [buildDot({ id: 'dot-2', categoryId: 'cat-2', name: 'Bob' })],
        ],
      ])

      render(
        <CategoryGrid
          categories={mockCategories}
          dotsByCategory={mockDotsByCategory}
        />,
      )

      const viewport = screen.getByTestId('category-grid-viewport')
      const track = screen.getByTestId('category-grid-track')

      // Both viewport and track should have h-full
      expect(viewport).toHaveClass('h-full')
      expect(track).toHaveClass('h-full')

      // All category wrappers should have h-full
      const categoryWrappers = track.querySelectorAll(':scope > div')
      categoryWrappers.forEach((wrapper) => {
        expect(wrapper).toHaveClass('h-full')
      })
    })
  })

  describe('Layout Consistency', () => {
    it('mobile layout remains consistent regardless of category count', () => {
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

      const { rerender } = render(
        <CategoryGrid
          categories={threeCategories}
          dotsByCategory={new Map()}
        />,
      )

      const track1 = screen.getByTestId('category-grid-track')
      expect(track1).toHaveClass('flex')
      expect(track1).toHaveClass('flex-col')

      rerender(
        <CategoryGrid categories={fiveCategories} dotsByCategory={new Map()} />,
      )

      const track2 = screen.getByTestId('category-grid-track')
      expect(track2).toHaveClass('flex')
      expect(track2).toHaveClass('flex-col')
    })

    it('desktop layout transitions correctly at 3-category boundary', () => {
      const threeCategories = [
        buildCategory({ id: 'cat-1', title: 'React', color: '#61dafb' }),
        buildCategory({ id: 'cat-2', title: 'Vue', color: '#42b883' }),
        buildCategory({ id: 'cat-3', title: 'Angular', color: '#dd0031' }),
      ]

      const fourCategories = [
        ...threeCategories,
        buildCategory({ id: 'cat-4', title: 'Svelte', color: '#ff3e00' }),
      ]

      // Test with 3 categories (grid layout)
      const { rerender } = render(
        <CategoryGrid
          categories={threeCategories}
          dotsByCategory={new Map()}
        />,
      )

      const track1 = screen.getByTestId('category-grid-track')
      expect(track1).toHaveClass('md:grid')
      expect(track1).toHaveClass('md:grid-cols-3')
      expect(track1).not.toHaveClass('md:inline-flex')

      // Test with 4 categories (horizontal scroll layout)
      rerender(
        <CategoryGrid categories={fourCategories} dotsByCategory={new Map()} />,
      )

      const track2 = screen.getByTestId('category-grid-track')
      expect(track2).toHaveClass('md:inline-flex')
      expect(track2).toHaveClass('md:flex-row')
      expect(track2).not.toHaveClass('md:grid')
    })
  })
})
