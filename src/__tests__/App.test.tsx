import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'

import { buildCategory, buildDot } from '@test/builders'
import { createMockDotBoardStore } from '@test/store'

import App from '../App'
import { useDotBoardStore } from '../store/dotBoardStore'

// Mock the store
vi.mock('../store/dotBoardStore', () => ({
  useDotBoardStore: vi.fn(),
}))

describe('App', () => {
  beforeEach(() => {
    // Setup default mock implementation
    const mockStore = createMockDotBoardStore()
    vi.mocked(useDotBoardStore).mockImplementation((selector) => selector(mockStore))
  })

  afterEach(() => {
    cleanup()
  })

  it('renders the app title', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', {
        name: 'Framework Poll',
      }),
    ).toBeInTheDocument()
  })

  it('calls loadData on mount', () => {
    const loadDataMock = vi.fn()
    const mockStore = createMockDotBoardStore({
      loadData: loadDataMock,
    })

    vi.mocked(useDotBoardStore).mockImplementation((selector) => selector(mockStore))

    render(<App />)

    expect(loadDataMock).toHaveBeenCalledOnce()
  })

  it('displays EmptyState when there are no categories', () => {
    const mockStore = createMockDotBoardStore({
      isInitialized: true,
    })

    vi.mocked(useDotBoardStore).mockImplementation((selector) => selector(mockStore))

    render(<App />)

    expect(screen.getByText('尚無版塊')).toBeInTheDocument()
    expect(screen.getByText(/管理員目前還沒有建立任何版塊/)).toBeInTheDocument()
  })

  it('does not display EmptyState before load completes', () => {
    const mockStore = createMockDotBoardStore({
      isLoading: true,
    })

    vi.mocked(useDotBoardStore).mockImplementation((selector) => selector(mockStore))

    render(<App />)

    expect(screen.getByText('載入中...')).toBeInTheDocument()
    expect(screen.queryByText('尚無版塊')).not.toBeInTheDocument()
  })

  it('displays load error when initialization fails', () => {
    const mockStore = createMockDotBoardStore({
      loadError: 'boom',
    })

    vi.mocked(useDotBoardStore).mockImplementation((selector) => selector(mockStore))

    render(<App />)

    expect(screen.getByRole('alert')).toHaveTextContent('載入資料失敗：boom')
  })

  it('shows unlock admin button when admin mode is locked', () => {
    const mockStore = createMockDotBoardStore({
      isAdminUnlocked: false,
      isInitialized: true,
    })

    vi.mocked(useDotBoardStore).mockImplementation((selector) => selector(mockStore))

    render(<App />)

    expect(screen.getByRole('button', { name: /管理模式/ })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /新增版塊/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /退出/ })).not.toBeInTheDocument()
  })

  it('shows admin controls when admin mode is unlocked', () => {
    const mockStore = createMockDotBoardStore({
      isAdminUnlocked: true,
      isInitialized: true,
    })

    vi.mocked(useDotBoardStore).mockImplementation((selector) => selector(mockStore))

    render(<App />)

    expect(screen.getByRole('button', { name: /新增版塊/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /退出/ })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /管理模式/ })).not.toBeInTheDocument()
  })

  it('opens admin unlock dialog when unlock button is clicked', async () => {
    const user = userEvent.setup()
    const mockStore = createMockDotBoardStore({
      isAdminUnlocked: false,
      isInitialized: true,
    })

    vi.mocked(useDotBoardStore).mockImplementation((selector) => selector(mockStore))

    render(<App />)

    const unlockButton = screen.getByRole('button', { name: /管理模式/ })
    await user.click(unlockButton)

    expect(screen.getByText('管理員驗證')).toBeInTheDocument()
  })

  it('calls lockAdmin when lock button is clicked', async () => {
    const user = userEvent.setup()
    const lockAdminMock = vi.fn()
    const mockStore = createMockDotBoardStore({
      isAdminUnlocked: true,
      isInitialized: true,
      lockAdmin: lockAdminMock,
    })

    vi.mocked(useDotBoardStore).mockImplementation((selector) => selector(mockStore))

    render(<App />)

    const lockButton = screen.getByRole('button', { name: /退出/ })
    await user.click(lockButton)

    expect(lockAdminMock).toHaveBeenCalledOnce()
  })

  describe('排列整齊按鈕', () => {
    it('calls arrangeDots with valid position updates when button is clicked', async () => {
      const user = userEvent.setup()
      const arrangeDotsM = vi.fn().mockResolvedValue(undefined)

      const categories = [
        buildCategory({ id: 'cat-1' }),
        buildCategory({ id: 'cat-2' }),
        buildCategory({ id: 'cat-3' }),
      ]

      const dotsByCategory = new Map<string, ReturnType<typeof buildDot>[]>()
      const allDots = new Map<string, ReturnType<typeof buildDot>>()
      for (const cat of categories) {
        const dots = Array.from({ length: 500 }, (_, i) =>
          buildDot({
            categoryId: cat.id,
            createdAt: new Date(2024, 0, 1, 0, 0, i).toISOString(),
            xRatio: Math.random(),
            yRatio: Math.random(),
          }),
        )
        dotsByCategory.set(cat.id, dots)
        for (const dot of dots) allDots.set(dot.id, dot)
      }

      const categoriesMap = new Map(categories.map((c) => [c.id, c]))

      const mockStore = createMockDotBoardStore({
        isAdminUnlocked: true,
        isInitialized: true,
        categories: categoriesMap,
        dots: allDots,
        arrangeDots: arrangeDotsM,
      })

      vi.mocked(useDotBoardStore).mockImplementation((selector) => selector(mockStore))

      // happy-dom returns zeros for getBoundingClientRect — mock to realistic card size
      vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
        width: 400,
        height: 300,
        top: 0,
        left: 0,
        right: 400,
        bottom: 300,
        x: 0,
        y: 0,
        toJSON: () => {},
      })

      render(<App />)

      const arrangeButton = screen.getByRole('button', { name: /排列整齊/ })
      await user.click(arrangeButton)

      expect(arrangeDotsM).toHaveBeenCalledOnce()

      const [updates] = arrangeDotsM.mock.calls[0] as [Array<{ xRatio: number; yRatio: number }>]
      expect(updates.length).toBeGreaterThan(0)
      for (const { xRatio, yRatio } of updates) {
        expect(xRatio).toBeGreaterThanOrEqual(0)
        expect(xRatio).toBeLessThanOrEqual(1)
        expect(yRatio).toBeGreaterThanOrEqual(0)
        expect(yRatio).toBeLessThanOrEqual(1)
      }
    })
  })
})
