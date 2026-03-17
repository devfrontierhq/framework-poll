import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'

import { createMockDotBoardStore } from '@test/store'
import { buildCategory, buildDot } from '@test/builders'

import App from './App'
import { useDotBoardStore } from './store/dotBoardStore'
import { CategoryCard } from './components/CategoryCard'

// Mock the store
vi.mock('./store/dotBoardStore', () => ({
  useDotBoardStore: vi.fn(),
}))

// Mock toast notifications
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

describe('App - Permission Control for Non-Admin Users', () => {
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

  describe('Non-Admin User Restrictions in App', () => {
    it('non-admin user cannot see "新增版塊" button', () => {
      const mockStore = createMockDotBoardStore({
        isAdminUnlocked: false,
        isInitialized: true,
      })

      vi.mocked(useDotBoardStore).mockImplementation((selector) =>
        selector(mockStore),
      )

      render(<App />)

      expect(
        screen.queryByRole('button', { name: /新增版塊/ }),
      ).not.toBeInTheDocument()
    })

    it('non-admin user cannot see "匯出 CSV" button', () => {
      const mockStore = createMockDotBoardStore({
        isAdminUnlocked: false,
        isInitialized: true,
      })

      vi.mocked(useDotBoardStore).mockImplementation((selector) =>
        selector(mockStore),
      )

      render(<App />)

      expect(
        screen.queryByRole('button', { name: /匯出 CSV/ }),
      ).not.toBeInTheDocument()
    })

    it('non-admin user cannot see admin banner', () => {
      const mockStore = createMockDotBoardStore({
        isAdminUnlocked: false,
        isInitialized: true,
      })

      vi.mocked(useDotBoardStore).mockImplementation((selector) =>
        selector(mockStore),
      )

      render(<App />)

      expect(screen.queryByText('管理模式已啟用')).not.toBeInTheDocument()
    })

    it('non-admin user can only see "管理模式" unlock button', () => {
      const mockStore = createMockDotBoardStore({
        isAdminUnlocked: false,
        isInitialized: true,
      })

      vi.mocked(useDotBoardStore).mockImplementation((selector) =>
        selector(mockStore),
      )

      render(<App />)

      // Should see unlock button
      expect(
        screen.getByRole('button', { name: /管理模式/ }),
      ).toBeInTheDocument()

      // Should NOT see admin controls
      expect(
        screen.queryByRole('button', { name: /新增版塊/ }),
      ).not.toBeInTheDocument()
      expect(
        screen.queryByRole('button', { name: /匯出 CSV/ }),
      ).not.toBeInTheDocument()
      expect(
        screen.queryByRole('button', { name: '退出' }),
      ).not.toBeInTheDocument()
    })
  })

  describe('Non-Admin User Restrictions in CategoryCard', () => {
    const mockCategory = buildCategory({
      id: 'cat-1',
      title: 'React',
      color: '#61dafb',
    })

    const mockDots = [
      buildDot({ id: 'dot-1', categoryId: 'cat-1', name: 'Alice' }),
      buildDot({ id: 'dot-2', categoryId: 'cat-1', name: 'Bob' }),
    ]

    beforeEach(() => {
      const mockStore = createMockDotBoardStore({
        isAdminUnlocked: false,
      })

      vi.mocked(useDotBoardStore).mockImplementation((selector) =>
        selector(mockStore),
      )
    })

    it('non-admin user cannot see edit button on category card', () => {
      render(<CategoryCard category={mockCategory} categoryDots={mockDots} />)

      expect(
        screen.queryByRole('button', { name: '編輯版塊' }),
      ).not.toBeInTheDocument()
    })

    it('non-admin user cannot see delete button on category card', () => {
      render(<CategoryCard category={mockCategory} categoryDots={mockDots} />)

      expect(
        screen.queryByRole('button', { name: '刪除版塊' }),
      ).not.toBeInTheDocument()
    })

    it('non-admin user cannot see dot count in category title', () => {
      render(<CategoryCard category={mockCategory} categoryDots={mockDots} />)

      const heading = screen.getByRole('heading', { name: /React/ })
      expect(heading).toHaveTextContent('React')
      expect(heading).not.toHaveTextContent('- 2') // No count for non-admin
    })

    it('non-admin user sees dots but cannot click to delete them', () => {
      render(<CategoryCard category={mockCategory} categoryDots={mockDots} />)

      const dots = screen.getAllByTestId('category-dot')
      expect(dots).toHaveLength(2)

      // Dots should be divs, not buttons
      dots.forEach((dot) => {
        expect(dot.tagName).toBe('DIV')
        expect(dot).not.toHaveAttribute('aria-label', /刪除圓點/)
      })
    })

    it('non-admin user can still add dots by clicking the area', async () => {
      const user = userEvent.setup()
      render(<CategoryCard category={mockCategory} categoryDots={mockDots} />)

      // Find the clickable area (the area with cursor-pointer class)
      const dotArea = document.querySelector('.cursor-pointer') as HTMLElement
      expect(dotArea).toBeInTheDocument()

      await user.click(dotArea)

      // AddDotDialog should appear - check for dialog role instead
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('non-admin user cannot open edit dialog', () => {
      render(<CategoryCard category={mockCategory} categoryDots={mockDots} />)

      // Edit button should not exist
      expect(
        screen.queryByRole('button', { name: '編輯版塊' }),
      ).not.toBeInTheDocument()

      // Dialog should not be in the document
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('non-admin user cannot open delete category dialog', () => {
      render(<CategoryCard category={mockCategory} categoryDots={mockDots} />)

      // Delete button should not exist
      expect(
        screen.queryByRole('button', { name: '刪除版塊' }),
      ).not.toBeInTheDocument()

      // Dialog should not be in the document
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  describe('Admin vs Non-Admin Comparison', () => {
    const mockCategory = buildCategory({
      id: 'cat-1',
      title: 'Vue',
      color: '#42b883',
    })

    const mockDots = [
      buildDot({ id: 'dot-1', categoryId: 'cat-1', name: 'Test' }),
    ]

    it('admin mode shows controls that non-admin cannot see', () => {
      // First render as non-admin
      const nonAdminStore = createMockDotBoardStore({
        isAdminUnlocked: false,
      })

      vi.mocked(useDotBoardStore).mockImplementation((selector) =>
        selector(nonAdminStore),
      )

      const { unmount } = render(
        <CategoryCard category={mockCategory} categoryDots={mockDots} />,
      )

      expect(
        screen.queryByRole('button', { name: '編輯版塊' }),
      ).not.toBeInTheDocument()
      expect(
        screen.queryByRole('button', { name: '刪除版塊' }),
      ).not.toBeInTheDocument()

      unmount()

      // Re-render as admin
      const adminStore = createMockDotBoardStore({
        isAdminUnlocked: true,
      })

      vi.mocked(useDotBoardStore).mockImplementation((selector) =>
        selector(adminStore),
      )

      render(<CategoryCard category={mockCategory} categoryDots={mockDots} />)

      expect(
        screen.getByRole('button', { name: '編輯版塊' }),
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: '刪除版塊' }),
      ).toBeInTheDocument()
    })

    it('admin mode shows dot count that non-admin cannot see', () => {
      // First render as non-admin
      const nonAdminStore = createMockDotBoardStore({
        isAdminUnlocked: false,
      })

      vi.mocked(useDotBoardStore).mockImplementation((selector) =>
        selector(nonAdminStore),
      )

      const { unmount } = render(
        <CategoryCard category={mockCategory} categoryDots={mockDots} />,
      )

      const headingNonAdmin = screen.getByRole('heading', { name: /Vue/ })
      expect(headingNonAdmin).toHaveTextContent('Vue')
      expect(headingNonAdmin).not.toHaveTextContent('- 1')

      unmount()

      // Re-render as admin
      const adminStore = createMockDotBoardStore({
        isAdminUnlocked: true,
      })

      vi.mocked(useDotBoardStore).mockImplementation((selector) =>
        selector(adminStore),
      )

      render(<CategoryCard category={mockCategory} categoryDots={mockDots} />)

      const headingAdmin = screen.getByRole('heading', { name: /Vue/ })
      expect(headingAdmin).toHaveTextContent('Vue - 1')
    })

    it('admin mode makes dots clickable for deletion, non-admin dots are not clickable', () => {
      // First render as non-admin
      const nonAdminStore = createMockDotBoardStore({
        isAdminUnlocked: false,
      })

      vi.mocked(useDotBoardStore).mockImplementation((selector) =>
        selector(nonAdminStore),
      )

      const { unmount } = render(
        <CategoryCard category={mockCategory} categoryDots={mockDots} />,
      )

      const dotNonAdmin = screen.getByTestId('category-dot')
      expect(dotNonAdmin.tagName).toBe('DIV')

      unmount()

      // Re-render as admin
      const adminStore = createMockDotBoardStore({
        isAdminUnlocked: true,
      })

      vi.mocked(useDotBoardStore).mockImplementation((selector) =>
        selector(adminStore),
      )

      render(<CategoryCard category={mockCategory} categoryDots={mockDots} />)

      const dotAdmin = screen.getByTestId('category-dot')
      expect(dotAdmin.tagName).toBe('BUTTON')
      expect(dotAdmin).toHaveAttribute('aria-label', '刪除圓點 Test')
    })
  })
})
