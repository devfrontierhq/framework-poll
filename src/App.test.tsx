import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'

import { createMockDotBoardStore } from '@test/store'

import App from './App'
import { useDotBoardStore } from './store/dotBoardStore'

// Mock the store
vi.mock('./store/dotBoardStore', () => ({
  useDotBoardStore: vi.fn(),
}))

describe('App', () => {
  beforeEach(() => {
    // Setup default mock implementation
    const mockStore = createMockDotBoardStore()
    vi.mocked(useDotBoardStore).mockImplementation((selector) =>
      selector(mockStore),
    )
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

    vi.mocked(useDotBoardStore).mockImplementation((selector) =>
      selector(mockStore),
    )

    render(<App />)

    expect(loadDataMock).toHaveBeenCalledOnce()
  })

  it('displays EmptyState when there are no categories', () => {
    const mockStore = createMockDotBoardStore({
      isInitialized: true,
    })

    vi.mocked(useDotBoardStore).mockImplementation((selector) =>
      selector(mockStore),
    )

    render(<App />)

    expect(screen.getByText('尚無版塊')).toBeInTheDocument()
    expect(screen.getByText(/管理員目前還沒有建立任何版塊/)).toBeInTheDocument()
  })

  it('does not display EmptyState before load completes', () => {
    const mockStore = createMockDotBoardStore({
      isLoading: true,
    })

    vi.mocked(useDotBoardStore).mockImplementation((selector) =>
      selector(mockStore),
    )

    render(<App />)

    expect(screen.getByText('載入中...')).toBeInTheDocument()
    expect(screen.queryByText('尚無版塊')).not.toBeInTheDocument()
  })

  it('displays load error when initialization fails', () => {
    const mockStore = createMockDotBoardStore({
      loadError: 'boom',
    })

    vi.mocked(useDotBoardStore).mockImplementation((selector) =>
      selector(mockStore),
    )

    render(<App />)

    expect(screen.getByRole('alert')).toHaveTextContent('載入資料失敗：boom')
  })

  it('shows unlock admin button when admin mode is locked', () => {
    const mockStore = createMockDotBoardStore({
      isAdminUnlocked: false,
      isInitialized: true,
    })

    vi.mocked(useDotBoardStore).mockImplementation((selector) =>
      selector(mockStore),
    )

    render(<App />)

    expect(screen.getByRole('button', { name: /管理模式/ })).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /新增版塊/ }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /退出/ }),
    ).not.toBeInTheDocument()
  })

  it('shows admin controls when admin mode is unlocked', () => {
    const mockStore = createMockDotBoardStore({
      isAdminUnlocked: true,
      isInitialized: true,
    })

    vi.mocked(useDotBoardStore).mockImplementation((selector) =>
      selector(mockStore),
    )

    render(<App />)

    expect(screen.getByRole('button', { name: /新增版塊/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /退出/ })).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /管理模式/ }),
    ).not.toBeInTheDocument()
  })

  it('opens admin unlock dialog when unlock button is clicked', async () => {
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

    vi.mocked(useDotBoardStore).mockImplementation((selector) =>
      selector(mockStore),
    )

    render(<App />)

    const lockButton = screen.getByRole('button', { name: /退出/ })
    await user.click(lockButton)

    expect(lockAdminMock).toHaveBeenCalledOnce()
  })
})
