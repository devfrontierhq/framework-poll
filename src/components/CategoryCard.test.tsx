import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { toast } from 'sonner'

import { buildCategory, buildDot } from '@test/builders'
import { getBoundedPosition } from '@/lib/dotPosition'
import { createMockDotBoardStore } from '@test/store'

import { CategoryCard } from './CategoryCard'

import { useDotBoardStore } from '@/store/dotBoardStore'

vi.mock('@/store/dotBoardStore', () => ({
  useDotBoardStore: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

describe('CategoryCard', () => {
  beforeEach(() => {
    const mockStore = createMockDotBoardStore()

    vi.mocked(useDotBoardStore).mockImplementation((selector) =>
      selector(mockStore),
    )
  })

  afterEach(() => {
    cleanup()
  })

  it('keeps the dialog open and preserves the entered name when dot creation fails', async () => {
    const user = userEvent.setup()
    const category = buildCategory({
      id: 'category-1',
      color: '#3b82f6',
      title: 'React',
    })
    const addDot = vi.fn().mockRejectedValue(new Error('DB offline'))

    vi.mocked(useDotBoardStore).mockImplementation((selector) =>
      selector(
        createMockDotBoardStore({
          addDot,
        }),
      ),
    )

    const { container } = render(
      <CategoryCard category={category} categoryDots={[]} />,
    )

    const plotArea = container.querySelector('.cursor-pointer')!

    await user.click(plotArea)
    await user.type(screen.getByLabelText('名字'), 'Alice')
    await user.click(screen.getByRole('button', { name: '確認' }))

    await waitFor(() => {
      expect(addDot).toHaveBeenCalledTimes(1)
    })

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByLabelText('名字')).toHaveValue('Alice')
    expect(toast.error).toHaveBeenCalledWith('新增失敗：DB offline')
  })

  it('closes the dialog after dot creation succeeds', async () => {
    const user = userEvent.setup()
    const category = buildCategory({
      id: 'category-1',
      color: '#3b82f6',
      title: 'React',
    })
    const addDot = vi.fn().mockResolvedValue(
      buildDot({
        id: 'dot-1',
        categoryId: category.id,
        name: 'Alice',
        xRatio: 0.5,
        yRatio: 0.5,
      }),
    )

    vi.mocked(useDotBoardStore).mockImplementation((selector) =>
      selector(
        createMockDotBoardStore({
          addDot,
        }),
      ),
    )

    const { container } = render(
      <CategoryCard category={category} categoryDots={[]} />,
    )

    const plotArea = container.querySelector('.cursor-pointer')!

    await user.click(plotArea)
    await user.type(screen.getByLabelText('名字'), 'Alice')
    await user.click(screen.getByRole('button', { name: '確認' }))

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    expect(toast.success).toHaveBeenCalledWith('新增成功：Alice')
  })

  it('renders dots with overlap-friendly opacity and visible border styling', () => {
    const category = buildCategory({
      id: 'category-1',
      color: '#3b82f6',
      title: 'React',
    })
    const categoryDots = [
      buildDot({
        id: 'dot-1',
        categoryId: category.id,
        name: 'Alice',
        xRatio: 0.5,
        yRatio: 0.5,
      }),
      buildDot({
        id: 'dot-2',
        categoryId: category.id,
        name: 'Bob',
        xRatio: 0.52,
        yRatio: 0.52,
      }),
    ]

    render(<CategoryCard category={category} categoryDots={categoryDots} />)

    const renderedDots = screen.getAllByTestId('category-dot')

    expect(renderedDots).toHaveLength(2)

    for (const dot of renderedDots) {
      expect(dot.style.opacity).toBe('0.8')
      expect(dot.style.backgroundColor).toBe(category.color)
      expect(dot.style.border).toContain('2px solid')
      expect(dot.style.border).toContain('rgba(255, 255, 255, 0.95)')
      expect(dot.style.boxShadow).toBe('0 0 0 1px rgba(15, 23, 42, 0.16)')
    }
  })

  it('keeps the title readable for light category colors while showing the category color in a swatch', () => {
    const category = buildCategory({
      id: 'category-1',
      color: '#FFFFFF',
      title: 'Vue',
    })

    render(<CategoryCard category={category} categoryDots={[]} />)

    const heading = screen.getByRole('heading', { name: 'Vue' })
    const swatch = screen.getByTestId('category-color-swatch')

    expect(heading).not.toHaveStyle({ color: category.color })
    expect(heading.className).toContain('text-slate-900')
    expect(swatch.style.backgroundColor).toBe(category.color)
  })

  it('renders a hover label for each dot using CSS tooltip classes', () => {
    const category = buildCategory({
      id: 'category-1',
      color: '#3b82f6',
      title: 'React',
    })
    const dot = buildDot({
      id: 'dot-1',
      categoryId: category.id,
      name: 'Alice',
      xRatio: 0.5,
      yRatio: 0.5,
    })

    render(<CategoryCard category={category} categoryDots={[dot]} />)

    const dotWrapper = screen.getByTestId('category-dot-wrapper')
    const hoverLabel = screen.getByTestId('dot-hover-label')

    expect(dotWrapper.className).toContain('group')
    expect(hoverLabel).toHaveTextContent('Alice')
    expect(hoverLabel.className).toContain('opacity-0')
    expect(hoverLabel.className).toContain('group-hover:opacity-100')
  })

  it('bounds edge ratios so dots stay fully inside the plotting area', () => {
    expect(getBoundedPosition(0)).toBe('clamp(6px, 0%, calc(100% - 6px))')
    expect(getBoundedPosition(1)).toBe('clamp(6px, 100%, calc(100% - 6px))')
    expect(getBoundedPosition(0.5)).toBe('clamp(6px, 50%, calc(100% - 6px))')
  })

  describe('Admin Mode UI', () => {
    it('shows edit and delete buttons when admin is unlocked', () => {
      const category = buildCategory({
        id: 'category-1',
        color: '#3b82f6',
        title: 'React',
      })

      vi.mocked(useDotBoardStore).mockImplementation((selector) =>
        selector(
          createMockDotBoardStore({
            isAdminUnlocked: true,
          }),
        ),
      )

      render(<CategoryCard category={category} categoryDots={[]} />)

      expect(
        screen.getByRole('button', { name: '編輯版塊' }),
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: '刪除版塊' }),
      ).toBeInTheDocument()
    })

    it('hides edit and delete buttons when admin is locked', () => {
      const category = buildCategory({
        id: 'category-1',
        color: '#3b82f6',
        title: 'React',
      })

      vi.mocked(useDotBoardStore).mockImplementation((selector) =>
        selector(
          createMockDotBoardStore({
            isAdminUnlocked: false,
          }),
        ),
      )

      render(<CategoryCard category={category} categoryDots={[]} />)

      expect(
        screen.queryByRole('button', { name: '編輯版塊' }),
      ).not.toBeInTheDocument()
      expect(
        screen.queryByRole('button', { name: '刪除版塊' }),
      ).not.toBeInTheDocument()
    })

    it('opens edit dialog when edit button is clicked', async () => {
      const user = userEvent.setup()
      const category = buildCategory({
        id: 'category-1',
        color: '#3b82f6',
        title: 'React',
      })

      vi.mocked(useDotBoardStore).mockImplementation((selector) =>
        selector(
          createMockDotBoardStore({
            isAdminUnlocked: true,
          }),
        ),
      )

      render(<CategoryCard category={category} categoryDots={[]} />)

      const editButton = screen.getByRole('button', { name: '編輯版塊' })
      await user.click(editButton)

      // Check that edit dialog is opened
      expect(screen.getByText('編輯版塊')).toBeInTheDocument()
      expect(screen.getByText('修改版塊的標題與顏色')).toBeInTheDocument()
    })

    it('shows dot count in title when admin is unlocked', () => {
      const category = buildCategory({
        id: 'category-1',
        color: '#3b82f6',
        title: 'React',
      })
      const dots = [
        buildDot({
          id: 'dot-1',
          categoryId: category.id,
          name: 'Alice',
          xRatio: 0.5,
          yRatio: 0.5,
        }),
        buildDot({
          id: 'dot-2',
          categoryId: category.id,
          name: 'Bob',
          xRatio: 0.6,
          yRatio: 0.6,
        }),
      ]

      vi.mocked(useDotBoardStore).mockImplementation((selector) =>
        selector(
          createMockDotBoardStore({
            isAdminUnlocked: true,
          }),
        ),
      )

      render(<CategoryCard category={category} categoryDots={dots} />)

      expect(screen.getByText('React - 2')).toBeInTheDocument()
    })

    it('hides dot count in title when admin is locked', () => {
      const category = buildCategory({
        id: 'category-1',
        color: '#3b82f6',
        title: 'React',
      })
      const dots = [
        buildDot({
          id: 'dot-1',
          categoryId: category.id,
          name: 'Alice',
          xRatio: 0.5,
          yRatio: 0.5,
        }),
      ]

      vi.mocked(useDotBoardStore).mockImplementation((selector) =>
        selector(
          createMockDotBoardStore({
            isAdminUnlocked: false,
          }),
        ),
      )

      render(<CategoryCard category={category} categoryDots={dots} />)

      expect(screen.getByText('React')).toBeInTheDocument()
      expect(screen.queryByText('React - 1')).not.toBeInTheDocument()
    })

    it('opens delete dialog when delete button is clicked', async () => {
      const user = userEvent.setup()
      const category = buildCategory({
        id: 'category-1',
        color: '#3b82f6',
        title: 'React',
      })

      vi.mocked(useDotBoardStore).mockImplementation((selector) =>
        selector(
          createMockDotBoardStore({
            isAdminUnlocked: true,
          }),
        ),
      )

      render(<CategoryCard category={category} categoryDots={[]} />)

      const deleteButton = screen.getByRole('button', { name: '刪除版塊' })
      await user.click(deleteButton)

      // Check that delete dialog is opened
      expect(screen.getByText('刪除版塊')).toBeInTheDocument()
      expect(screen.getByText(/確定要刪除「React」嗎？/)).toBeInTheDocument()
    })

    it('opens delete dot dialog when dot is clicked in admin mode', async () => {
      const user = userEvent.setup()
      const category = buildCategory({
        id: 'category-1',
        color: '#3b82f6',
        title: 'React',
      })
      const dot = buildDot({
        id: 'dot-1',
        categoryId: category.id,
        name: 'Alice',
        xRatio: 0.5,
        yRatio: 0.5,
      })

      vi.mocked(useDotBoardStore).mockImplementation((selector) =>
        selector(
          createMockDotBoardStore({
            isAdminUnlocked: true,
          }),
        ),
      )

      render(<CategoryCard category={category} categoryDots={[dot]} />)

      const dotElement = screen.getByTestId('category-dot')
      await user.click(dotElement)

      // Check that delete dot dialog is opened
      expect(screen.getByText('刪除圓點')).toBeInTheDocument()
      expect(screen.getByText(/確定要刪除「Alice」嗎？/)).toBeInTheDocument()
    })

    it('opens delete dot dialog when admin focuses a dot and presses Enter', async () => {
      const user = userEvent.setup()
      const category = buildCategory({
        id: 'category-1',
        color: '#3b82f6',
        title: 'React',
      })
      const dot = buildDot({
        id: 'dot-1',
        categoryId: category.id,
        name: 'Alice',
        xRatio: 0.5,
        yRatio: 0.5,
      })

      vi.mocked(useDotBoardStore).mockImplementation((selector) =>
        selector(
          createMockDotBoardStore({
            isAdminUnlocked: true,
          }),
        ),
      )

      render(<CategoryCard category={category} categoryDots={[dot]} />)

      const dotButton = screen.getByRole('button', { name: '刪除圓點 Alice' })

      await user.tab()
      await user.tab()
      await user.tab()

      expect(dotButton).toHaveFocus()

      await user.keyboard('{Enter}')

      expect(screen.getByText('刪除圓點')).toBeInTheDocument()
      expect(screen.getByText(/確定要刪除「Alice」嗎？/)).toBeInTheDocument()
    })

    it('does not open delete dot dialog when dot is clicked in non-admin mode', async () => {
      const user = userEvent.setup()
      const category = buildCategory({
        id: 'category-1',
        color: '#3b82f6',
        title: 'React',
      })
      const dot = buildDot({
        id: 'dot-1',
        categoryId: category.id,
        name: 'Alice',
        xRatio: 0.5,
        yRatio: 0.5,
      })

      vi.mocked(useDotBoardStore).mockImplementation((selector) =>
        selector(
          createMockDotBoardStore({
            isAdminUnlocked: false,
          }),
        ),
      )

      render(<CategoryCard category={category} categoryDots={[dot]} />)

      const dotElement = screen.getByTestId('category-dot')
      await user.click(dotElement)

      // Check that delete dot dialog is NOT opened
      expect(screen.queryByText('刪除圓點')).not.toBeInTheDocument()
    })
  })
})
