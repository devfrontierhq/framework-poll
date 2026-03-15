import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { EmptyState } from './EmptyState'
import { useDotBoardStore } from '@/store/dotBoardStore'

vi.mock('@/store/dotBoardStore')

function mockStore({
  initializeDefaultCategories = vi.fn(),
  isSeedingDefaultCategories = false,
} = {}) {
  vi.mocked(useDotBoardStore).mockImplementation((selector) =>
    selector({
      initializeDefaultCategories,
      isSeedingDefaultCategories,
    } as never),
  )

  return {
    initializeDefaultCategories,
  }
}

describe('EmptyState', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders empty state message and initialization button', () => {
    mockStore()

    const { container } = render(<EmptyState />)

    expect(screen.getByText('尚無版塊')).toBeInTheDocument()
    expect(screen.getByText('管理員目前還沒有建立任何版塊')).toBeInTheDocument()
    expect(container.querySelector('button')).toHaveTextContent(
      '建立預設框架板塊（React、Vue、Angular）',
    )
  })

  it('calls initializeDefaultCategories when button is clicked', async () => {
    const user = userEvent.setup()
    const { initializeDefaultCategories } = mockStore({
      initializeDefaultCategories: vi.fn().mockResolvedValue(undefined),
    })

    const { container } = render(<EmptyState />)

    const button = container.querySelector('button')!

    await user.click(button)

    await waitFor(() => {
      expect(initializeDefaultCategories).toHaveBeenCalledTimes(1)
    })
  })

  it('handles initialization errors gracefully', async () => {
    const user = userEvent.setup()
    const { initializeDefaultCategories } = mockStore({
      initializeDefaultCategories: vi
        .fn()
        .mockRejectedValue(new Error('Test error')),
    })

    const { container } = render(<EmptyState />)

    const button = container.querySelector('button')!

    // Should not throw error
    await user.click(button)

    await waitFor(() => {
      expect(initializeDefaultCategories).toHaveBeenCalledTimes(1)
    })
  })

  it('disables the button while initialization is in progress', () => {
    mockStore({
      isSeedingDefaultCategories: true,
    })

    render(<EmptyState />)

    expect(screen.getByRole('button', { name: '建立中...' })).toBeDisabled()
  })
})
