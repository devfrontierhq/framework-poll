import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'

import App from './App'
import { useDotBoardStore } from './store/dotBoardStore'

// Mock the store
vi.mock('./store/dotBoardStore', () => ({
  useDotBoardStore: vi.fn(),
}))

describe('App', () => {
  beforeEach(() => {
    // Setup default mock implementation
    vi.mocked(useDotBoardStore).mockImplementation((selector) =>
      selector({
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
      }),
    )
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

    vi.mocked(useDotBoardStore).mockImplementation((selector) =>
      selector({
        categories: new Map(),
        dots: new Map(),
        isAdminUnlocked: false,
        isInitialized: false,
        isLoading: false,
        loadError: null,
        loadData: loadDataMock,
        unlockAdmin: vi.fn(),
        lockAdmin: vi.fn(),
        verifyAdminPassword: vi.fn(),
        addCategory: vi.fn(),
        editCategory: vi.fn(),
        removeCategory: vi.fn(),
        addDot: vi.fn(),
        removeDot: vi.fn(),
        exportCsv: vi.fn(),
      }),
    )

    render(<App />)

    expect(loadDataMock).toHaveBeenCalledOnce()
  })
})
