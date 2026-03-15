import { render, screen, cleanup } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'

import App from './App'
import { useDotBoardStore } from './store/dotBoardStore'

// Mock the store
vi.mock('./store/dotBoardStore', () => ({
  useDotBoardStore: vi.fn(),
}))

describe('App', () => {
  const createMockStore = () => ({
    // State
    categories: new Map(),
    dots: new Map(),
    isAdminUnlocked: false,
    isInitialized: false,
    isLoading: false,
    loadError: null,
    // Actions
    loadData: vi.fn(),
    unlockAdmin: vi.fn(),
    lockAdmin: vi.fn(),
    verifyAdminPassword: vi.fn(),
    addCategory: vi.fn(),
    editCategory: vi.fn(),
    removeCategory: vi.fn(),
    addDot: vi.fn(),
    removeDot: vi.fn(),
    exportCsv: vi.fn(),
  })

  beforeEach(() => {
    // Setup default mock implementation
    const mockStore = createMockStore()
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
    const mockStore = createMockStore()
    const loadDataMock = vi.fn()
    mockStore.loadData = loadDataMock

    vi.mocked(useDotBoardStore).mockImplementation((selector) =>
      selector(mockStore),
    )

    render(<App />)

    expect(loadDataMock).toHaveBeenCalledOnce()
  })

  it('displays EmptyState when there are no categories', () => {
    render(<App />)

    expect(screen.getByText('尚無版塊')).toBeInTheDocument()
    expect(screen.getByText(/管理員目前還沒有建立任何版塊/)).toBeInTheDocument()
  })
})
