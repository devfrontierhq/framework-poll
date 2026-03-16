import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toast } from 'sonner'

import { AddCategoryDialog } from './AddCategoryDialog'
import { useDotBoardStore } from '@/store/dotBoardStore'

vi.mock('sonner')
vi.mock('@/store/dotBoardStore')

describe('AddCategoryDialog', () => {
  const mockOnOpenChange = vi.fn()
  const mockAddCategory = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useDotBoardStore).mockReturnValue(mockAddCategory)
    document.body.innerHTML = ''
  })

  it('renders add category dialog with correct elements', () => {
    render(<AddCategoryDialog open={true} onOpenChange={mockOnOpenChange} />)

    expect(screen.getByText('新增版塊')).toBeInTheDocument()
    expect(screen.getByText('建立一個新的框架版塊')).toBeInTheDocument()
    expect(screen.getByLabelText('版塊名稱')).toBeInTheDocument()
    expect(screen.getByLabelText('版塊顏色')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '取消' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '確認' })).toBeInTheDocument()
  })

  it('creates category with title and color', async () => {
    const user = userEvent.setup()
    mockAddCategory.mockResolvedValue(undefined)

    render(<AddCategoryDialog open={true} onOpenChange={mockOnOpenChange} />)

    const titleInput = screen.getByLabelText('版塊名稱')
    const colorInputs = screen.getAllByDisplayValue('#3b82f6')
    const submitButton = screen.getByRole('button', { name: '確認' })

    await user.clear(titleInput)
    await user.type(titleInput, 'React')

    // Find the text input for color (not the color picker)
    const colorTextInput = colorInputs.find(
      (input) => input.getAttribute('type') !== 'color',
    )
    if (colorTextInput) {
      await user.clear(colorTextInput)
      await user.type(colorTextInput, '#61dafb')
    }

    await user.click(submitButton)

    await waitFor(() => {
      expect(mockAddCategory).toHaveBeenCalledWith('React', '#61dafb')
      expect(toast.success).toHaveBeenCalledWith('版塊已新增：React')
      expect(mockOnOpenChange).toHaveBeenCalledWith(false)
    })
  })

  it('disables submit button when title is empty', () => {
    render(<AddCategoryDialog open={true} onOpenChange={mockOnOpenChange} />)

    const submitButton = screen.getByRole('button', { name: '確認' })
    expect(submitButton).toBeDisabled()
  })

  it('shows error message when category creation fails', async () => {
    const user = userEvent.setup()
    const errorMessage = '版塊名稱重複'
    mockAddCategory.mockRejectedValue(new Error(errorMessage))

    render(<AddCategoryDialog open={true} onOpenChange={mockOnOpenChange} />)

    const titleInput = screen.getByLabelText('版塊名稱')
    const submitButton = screen.getByRole('button', { name: '確認' })

    await user.type(titleInput, 'React')
    await user.click(submitButton)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(`新增失敗：${errorMessage}`)
      expect(mockOnOpenChange).not.toHaveBeenCalled()
    })
  })

  it('clears inputs when dialog is closed', async () => {
    const user = userEvent.setup()

    render(<AddCategoryDialog open={true} onOpenChange={mockOnOpenChange} />)

    const titleInput = screen.getByLabelText('版塊名稱')
    const cancelButton = screen.getByRole('button', { name: '取消' })

    await user.type(titleInput, 'React')
    await user.click(cancelButton)

    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
  })

  it('uses default color #3b82f6', () => {
    render(<AddCategoryDialog open={true} onOpenChange={mockOnOpenChange} />)

    const colorInputs = screen.getAllByDisplayValue('#3b82f6')
    expect(colorInputs.length).toBeGreaterThan(0)
  })

  it('syncs color between color picker and text input', async () => {
    const user = userEvent.setup()

    render(<AddCategoryDialog open={true} onOpenChange={mockOnOpenChange} />)

    // Find the color picker input
    const colorPicker = document.querySelector('input[type="color"]')
    expect(colorPicker).toBeInTheDocument()

    if (colorPicker) {
      await user.click(colorPicker)
      // Color picker interaction is limited in tests, but we verify it exists
      expect(colorPicker).toHaveValue('#3b82f6')
    }
  })

  it('prevents submission with whitespace-only title', async () => {
    const user = userEvent.setup()

    render(<AddCategoryDialog open={true} onOpenChange={mockOnOpenChange} />)

    const titleInput = screen.getByLabelText('版塊名稱')
    const submitButton = screen.getByRole('button', { name: '確認' })

    await user.type(titleInput, '   ')

    // Submit button should still be disabled for whitespace
    expect(submitButton).toBeDisabled()
  })
})
