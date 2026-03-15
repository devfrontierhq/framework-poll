import { render, screen, cleanup } from '@testing-library/react'
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
    render(<App />)

    expect(screen.getByText('尚無版塊')).toBeInTheDocument()
    expect(screen.getByText(/管理員目前還沒有建立任何版塊/)).toBeInTheDocument()
  })
})
