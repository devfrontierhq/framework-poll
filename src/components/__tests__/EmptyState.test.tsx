import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toast } from 'sonner'

import { createMockDotBoardStore } from '@test/store'

import { EmptyState } from '../EmptyState'
import { useDotBoardStore } from '@/store/dotBoardStore'

vi.mock('@/store/dotBoardStore')
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

describe('EmptyState', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  describe('Display and Guidance Text', () => {
    it('renders empty state message and initialization button', () => {
      vi.mocked(useDotBoardStore).mockImplementation((selector) => selector(createMockDotBoardStore()))

      const { container } = render(<EmptyState />)

      expect(screen.getByText('尚無版塊')).toBeInTheDocument()
      expect(screen.getByText('管理員目前還沒有建立任何版塊')).toBeInTheDocument()
      expect(container.querySelector('button')).toHaveTextContent('建立預設框架板塊（React、Vue、Angular）')
    })

    it('displays correct heading text with proper styling', () => {
      vi.mocked(useDotBoardStore).mockImplementation((selector) => selector(createMockDotBoardStore()))

      render(<EmptyState />)

      const heading = screen.getByRole('heading', { level: 2 })
      expect(heading).toHaveTextContent('尚無版塊')
      expect(heading).toHaveClass('text-2xl', 'font-bold', 'text-slate-900')
    })

    it('displays guidance text explaining the empty state', () => {
      vi.mocked(useDotBoardStore).mockImplementation((selector) => selector(createMockDotBoardStore()))

      render(<EmptyState />)

      const guidanceText = screen.getByText('管理員目前還沒有建立任何版塊')
      expect(guidanceText).toBeInTheDocument()
      expect(guidanceText).toHaveClass('text-slate-600')
    })

    it('displays button with clear action description', () => {
      vi.mocked(useDotBoardStore).mockImplementation((selector) => selector(createMockDotBoardStore()))

      render(<EmptyState />)

      const button = screen.getByRole('button')
      expect(button).toHaveTextContent('建立預設框架板塊（React、Vue、Angular）')
      expect(button).toBeEnabled()
    })

    it('has proper visual hierarchy with centered layout', () => {
      vi.mocked(useDotBoardStore).mockImplementation((selector) => selector(createMockDotBoardStore()))

      const { container } = render(<EmptyState />)

      const emptyStateContainer = container.firstChild as HTMLElement
      expect(emptyStateContainer).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center', 'text-center')
    })

    it('applies proper spacing between elements', () => {
      vi.mocked(useDotBoardStore).mockImplementation((selector) => selector(createMockDotBoardStore()))

      render(<EmptyState />)

      const heading = screen.getByRole('heading', { level: 2 })
      expect(heading).toHaveClass('mb-2')

      const guidanceText = screen.getByText('管理員目前還沒有建立任何版塊')
      expect(guidanceText).toHaveClass('mb-6')
    })

    it('has minimum height to ensure visibility', () => {
      vi.mocked(useDotBoardStore).mockImplementation((selector) => selector(createMockDotBoardStore()))

      const { container } = render(<EmptyState />)

      const emptyStateContainer = container.firstChild as HTMLElement
      expect(emptyStateContainer).toHaveClass('min-h-[400px]')
    })

    it('applies rounded corners and shadow for visual appeal', () => {
      vi.mocked(useDotBoardStore).mockImplementation((selector) => selector(createMockDotBoardStore()))

      const { container } = render(<EmptyState />)

      const emptyStateContainer = container.firstChild as HTMLElement
      expect(emptyStateContainer).toHaveClass('rounded-2xl', 'border', 'shadow-sm')
    })
  })

  describe('Button States', () => {
    it('shows default button text when not seeding', () => {
      vi.mocked(useDotBoardStore).mockImplementation((selector) =>
        selector(
          createMockDotBoardStore({
            isSeedingDefaultCategories: false,
          }),
        ),
      )

      render(<EmptyState />)

      const button = screen.getByRole('button')
      expect(button).toHaveTextContent('建立預設框架板塊（React、Vue、Angular）')
      expect(button).toBeEnabled()
    })

    it('shows loading text when seeding is in progress', () => {
      vi.mocked(useDotBoardStore).mockImplementation((selector) =>
        selector(
          createMockDotBoardStore({
            isSeedingDefaultCategories: true,
          }),
        ),
      )

      render(<EmptyState />)

      const button = screen.getByRole('button', { name: '建立中...' })
      expect(button).toBeInTheDocument()
      expect(button).toBeDisabled()
    })

    it('disables the button while initialization is in progress', () => {
      vi.mocked(useDotBoardStore).mockImplementation((selector) =>
        selector(
          createMockDotBoardStore({
            isSeedingDefaultCategories: true,
          }),
        ),
      )

      render(<EmptyState />)

      expect(screen.getByRole('button', { name: '建立中...' })).toBeDisabled()
    })

    it('enables the button when not seeding', () => {
      vi.mocked(useDotBoardStore).mockImplementation((selector) =>
        selector(
          createMockDotBoardStore({
            isSeedingDefaultCategories: false,
          }),
        ),
      )

      render(<EmptyState />)

      const button = screen.getByRole('button')
      expect(button).toBeEnabled()
    })
  })

  describe('User Interactions', () => {
    it('calls initializeDefaultCategories when button is clicked', async () => {
      const user = userEvent.setup()
      const initializeDefaultCategories = vi.fn().mockResolvedValue(undefined)

      vi.mocked(useDotBoardStore).mockImplementation((selector) =>
        selector(
          createMockDotBoardStore({
            initializeDefaultCategories,
          }),
        ),
      )

      const { container } = render(<EmptyState />)

      const button = container.querySelector('button')!

      await user.click(button)

      await waitFor(() => {
        expect(initializeDefaultCategories).toHaveBeenCalledTimes(1)
      })

      expect(toast.success).toHaveBeenCalledWith('預設板塊建立成功')
    })

    it('shows success toast after successful initialization', async () => {
      const user = userEvent.setup()
      vi.mocked(useDotBoardStore).mockImplementation((selector) =>
        selector(
          createMockDotBoardStore({
            initializeDefaultCategories: vi.fn().mockResolvedValue(undefined),
          }),
        ),
      )

      render(<EmptyState />)

      const button = screen.getByRole('button')

      await user.click(button)

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('預設板塊建立成功')
      })
    })

    it('handles initialization errors gracefully', async () => {
      const user = userEvent.setup()
      const initializeDefaultCategories = vi.fn().mockRejectedValue(new Error('Test error'))

      vi.mocked(useDotBoardStore).mockImplementation((selector) =>
        selector(
          createMockDotBoardStore({
            initializeDefaultCategories,
          }),
        ),
      )

      const { container } = render(<EmptyState />)

      const button = container.querySelector('button')!

      // Should not throw error
      await user.click(button)

      await waitFor(() => {
        expect(initializeDefaultCategories).toHaveBeenCalledTimes(1)
      })

      expect(toast.error).toHaveBeenCalledWith('建立預設板塊失敗：Test error')
    })

    it('handles non-Error exceptions with generic message', async () => {
      const user = userEvent.setup()

      vi.mocked(useDotBoardStore).mockImplementation((selector) =>
        selector(
          createMockDotBoardStore({
            initializeDefaultCategories: vi.fn().mockRejectedValue('String error'),
          }),
        ),
      )

      render(<EmptyState />)

      const button = screen.getByRole('button')

      await user.click(button)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('建立預設板塊失敗：建立預設板塊時發生未知錯誤')
      })
    })

    it('prevents multiple clicks while seeding', async () => {
      const user = userEvent.setup()
      const initializeDefaultCategories = vi.fn().mockResolvedValue(undefined)

      vi.mocked(useDotBoardStore).mockImplementation((selector) =>
        selector(
          createMockDotBoardStore({
            initializeDefaultCategories,
            isSeedingDefaultCategories: true,
          }),
        ),
      )

      render(<EmptyState />)

      const button = screen.getByRole('button')

      // Button should be disabled, so click should not trigger action
      expect(button).toBeDisabled()

      // Even if we try to click, it should not call the function
      await user.click(button)

      expect(initializeDefaultCategories).not.toHaveBeenCalled()
    })
  })

  describe('DEV vs Production mode', () => {
    it('shows initialization button in dev mode', () => {
      vi.mocked(useDotBoardStore).mockImplementation((selector) => selector(createMockDotBoardStore()))

      render(<EmptyState />)

      expect(screen.getByRole('button', { name: /建立預設框架板塊/ })).toBeInTheDocument()
    })

    it('hides initialization button in production mode', () => {
      vi.stubEnv('DEV', false)

      vi.mocked(useDotBoardStore).mockImplementation((selector) => selector(createMockDotBoardStore()))

      render(<EmptyState />)

      expect(screen.queryByRole('button')).not.toBeInTheDocument()

      vi.unstubAllEnvs()
    })

    it('shows production-friendly text in production mode', () => {
      vi.stubEnv('DEV', false)

      vi.mocked(useDotBoardStore).mockImplementation((selector) => selector(createMockDotBoardStore()))

      render(<EmptyState />)

      expect(screen.getByText('等待管理員建立版塊')).toBeInTheDocument()
      expect(screen.queryByText('管理員目前還沒有建立任何版塊')).not.toBeInTheDocument()

      vi.unstubAllEnvs()
    })

    it('shows dev-friendly text in dev mode', () => {
      vi.mocked(useDotBoardStore).mockImplementation((selector) => selector(createMockDotBoardStore()))

      render(<EmptyState />)

      expect(screen.getByText('管理員目前還沒有建立任何版塊')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      vi.mocked(useDotBoardStore).mockImplementation((selector) => selector(createMockDotBoardStore()))

      render(<EmptyState />)

      const heading = screen.getByRole('heading', { level: 2 })
      expect(heading).toHaveTextContent('尚無版塊')
    })

    it('button has accessible role', () => {
      vi.mocked(useDotBoardStore).mockImplementation((selector) => selector(createMockDotBoardStore()))

      render(<EmptyState />)

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('button text clearly describes the action', () => {
      vi.mocked(useDotBoardStore).mockImplementation((selector) => selector(createMockDotBoardStore()))

      render(<EmptyState />)

      const button = screen.getByRole('button', {
        name: /建立預設框架板塊/,
      })
      expect(button).toBeInTheDocument()
    })

    it('button state is communicated through disabled attribute', () => {
      vi.mocked(useDotBoardStore).mockImplementation((selector) =>
        selector(
          createMockDotBoardStore({
            isSeedingDefaultCategories: true,
          }),
        ),
      )

      render(<EmptyState />)

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('disabled')
    })
  })
})
