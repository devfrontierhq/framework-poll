import { render, screen, cleanup, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'

import { createMockDotBoardStore } from '@test/store'

import App from '../App'
import { useDotBoardStore } from '../store/dotBoardStore'

// Mock the store
vi.mock('../store/dotBoardStore', () => ({
  useDotBoardStore: vi.fn(),
}))

// Mock toast notifications
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

describe('App - Admin Mode UI Interactions', () => {
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

  describe('Admin Mode Locked State', () => {
    it('shows "管理模式" unlock button when admin is locked', () => {
      const mockStore = createMockDotBoardStore({
        isAdminUnlocked: false,
        isInitialized: true,
      })

      vi.mocked(useDotBoardStore).mockImplementation((selector) =>
        selector(mockStore),
      )

      render(<App />)

      const unlockButton = screen.getByRole('button', { name: /管理模式/ })
      expect(unlockButton).toBeInTheDocument()
      expect(unlockButton).toBeVisible()
    })

    it('does not show admin banner when admin is locked', () => {
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

    it('does not show "新增版塊" button when admin is locked', () => {
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

    it('does not show "匯出 CSV" button when admin is locked', () => {
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

    it('does not show "退出" button when admin is locked', () => {
      const mockStore = createMockDotBoardStore({
        isAdminUnlocked: false,
        isInitialized: true,
      })

      vi.mocked(useDotBoardStore).mockImplementation((selector) =>
        selector(mockStore),
      )

      render(<App />)

      expect(
        screen.queryByRole('button', { name: '退出' }),
      ).not.toBeInTheDocument()
    })
  })

  describe('Admin Mode Unlocked State', () => {
    it('shows admin banner when admin is unlocked', () => {
      const mockStore = createMockDotBoardStore({
        isAdminUnlocked: true,
        isInitialized: true,
      })

      vi.mocked(useDotBoardStore).mockImplementation((selector) =>
        selector(mockStore),
      )

      render(<App />)

      expect(screen.getByText('管理模式已啟用')).toBeInTheDocument()
      expect(screen.getByText('管理模式已啟用')).toBeVisible()
    })

    it('shows "退出" button in admin banner when admin is unlocked', () => {
      const mockStore = createMockDotBoardStore({
        isAdminUnlocked: true,
        isInitialized: true,
      })

      vi.mocked(useDotBoardStore).mockImplementation((selector) =>
        selector(mockStore),
      )

      render(<App />)

      const lockButton = screen.getByRole('button', { name: '退出' })
      expect(lockButton).toBeInTheDocument()
      expect(lockButton).toBeVisible()
    })

    it('shows "新增版塊" button when admin is unlocked', () => {
      const mockStore = createMockDotBoardStore({
        isAdminUnlocked: true,
        isInitialized: true,
      })

      vi.mocked(useDotBoardStore).mockImplementation((selector) =>
        selector(mockStore),
      )

      render(<App />)

      const addButton = screen.getByRole('button', { name: /新增版塊/ })
      expect(addButton).toBeInTheDocument()
      expect(addButton).toBeVisible()
    })

    it('shows "匯出 CSV" button when admin is unlocked', () => {
      const mockStore = createMockDotBoardStore({
        isAdminUnlocked: true,
        isInitialized: true,
      })

      vi.mocked(useDotBoardStore).mockImplementation((selector) =>
        selector(mockStore),
      )

      render(<App />)

      const exportButton = screen.getByRole('button', { name: /匯出 CSV/ })
      expect(exportButton).toBeInTheDocument()
      expect(exportButton).toBeVisible()
    })

    it('does not show "管理模式" unlock button when admin is unlocked', () => {
      const mockStore = createMockDotBoardStore({
        isAdminUnlocked: true,
        isInitialized: true,
      })

      vi.mocked(useDotBoardStore).mockImplementation((selector) =>
        selector(mockStore),
      )

      render(<App />)

      expect(
        screen.queryByRole('button', { name: /管理模式/ }),
      ).not.toBeInTheDocument()
    })
  })

  describe('Admin Mode Toggle Interactions', () => {
    it('opens AdminUnlockDialog when clicking unlock button', async () => {
      const user = userEvent.setup()
      const mockStore = createMockDotBoardStore({
        isAdminUnlocked: false,
        isInitialized: true,
      })

      vi.mocked(useDotBoardStore).mockImplementation((selector) =>
        selector(mockStore),
      )

      render(<App />)

      const unlockButton = screen.getByRole('button', { name: /管理模式/ })
      await user.click(unlockButton)

      // Check that AdminUnlockDialog is displayed
      expect(screen.getByText('管理員驗證')).toBeInTheDocument()
      expect(screen.getByText('請輸入密碼以啟用管理功能')).toBeInTheDocument()
    })

    it('calls lockAdmin when clicking lock button', async () => {
      const user = userEvent.setup()
      const lockAdminMock = vi.fn()
      const mockStore = createMockDotBoardStore({
        isAdminUnlocked: true,
        isInitialized: true,
        lockAdmin: lockAdminMock,
      })

      vi.mocked(useDotBoardStore).mockImplementation((selector) =>
        selector(mockStore),
      )

      render(<App />)

      const lockButton = screen.getByRole('button', { name: '退出' })
      await user.click(lockButton)

      expect(lockAdminMock).toHaveBeenCalledOnce()
    })

    it('opens AddCategoryDialog when clicking add category button in admin mode', async () => {
      const user = userEvent.setup()
      const mockStore = createMockDotBoardStore({
        isAdminUnlocked: true,
        isInitialized: true,
      })

      vi.mocked(useDotBoardStore).mockImplementation((selector) =>
        selector(mockStore),
      )

      render(<App />)

      const addButton = screen.getByRole('button', { name: /新增版塊/ })

      // Before clicking, dialog should not be visible
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

      await user.click(addButton)

      // After clicking, dialog should appear
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })
    })
  })

  describe('Admin Mode Banner Visibility', () => {
    it('shows amber banner at the top when admin mode is enabled', () => {
      const mockStore = createMockDotBoardStore({
        isAdminUnlocked: true,
        isInitialized: true,
      })

      vi.mocked(useDotBoardStore).mockImplementation((selector) =>
        selector(mockStore),
      )

      const { container } = render(<App />)

      const banner = container.querySelector('.bg-amber-50')
      expect(banner).toBeInTheDocument()
      expect(banner).toHaveTextContent('管理模式已啟用')
    })

    it('adjusts main content height when admin banner is visible', () => {
      const mockStore = createMockDotBoardStore({
        isAdminUnlocked: true,
        isInitialized: true,
      })

      vi.mocked(useDotBoardStore).mockImplementation((selector) =>
        selector(mockStore),
      )

      const { container } = render(<App />)

      // Check that main container has adjusted height class
      const mainContainer = container.querySelector(
        '.h-\\[calc\\(100vh-3rem\\)\\]',
      )
      expect(mainContainer).toBeInTheDocument()
    })

    it('uses full height when admin banner is not visible', () => {
      const mockStore = createMockDotBoardStore({
        isAdminUnlocked: false,
        isInitialized: true,
      })

      vi.mocked(useDotBoardStore).mockImplementation((selector) =>
        selector(mockStore),
      )

      const { container } = render(<App />)

      // Check that main container has full height class
      const mainContainer = container.querySelector('.h-full')
      expect(mainContainer).toBeInTheDocument()
    })
  })

  describe('Admin Mode State Persistence', () => {
    it('maintains admin unlocked state across re-renders', () => {
      const mockStore = createMockDotBoardStore({
        isAdminUnlocked: true,
        isInitialized: true,
      })

      vi.mocked(useDotBoardStore).mockImplementation((selector) =>
        selector(mockStore),
      )

      const { rerender } = render(<App />)

      expect(screen.getByText('管理模式已啟用')).toBeInTheDocument()

      rerender(<App />)

      expect(screen.getByText('管理模式已啟用')).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /新增版塊/ }),
      ).toBeInTheDocument()
    })

    it('maintains admin locked state across re-renders', () => {
      const mockStore = createMockDotBoardStore({
        isAdminUnlocked: false,
        isInitialized: true,
      })

      vi.mocked(useDotBoardStore).mockImplementation((selector) =>
        selector(mockStore),
      )

      const { rerender } = render(<App />)

      expect(
        screen.getByRole('button', { name: /管理模式/ }),
      ).toBeInTheDocument()

      rerender(<App />)

      expect(
        screen.getByRole('button', { name: /管理模式/ }),
      ).toBeInTheDocument()
      expect(screen.queryByText('管理模式已啟用')).not.toBeInTheDocument()
    })
  })
})
