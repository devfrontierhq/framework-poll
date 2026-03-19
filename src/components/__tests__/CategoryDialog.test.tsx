import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toast } from 'sonner'

import { CategoryDialog } from '../CategoryDialog'
import { useDotBoardStore } from '@/store/dotBoardStore'
import { buildCategory } from '@test/builders'

vi.mock('sonner')
vi.mock('@/store/dotBoardStore')

describe('CategoryDialog', () => {
  const mockOnOpenChange = vi.fn()
  const mockAddCategory = vi.fn()
  const mockEditCategory = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    document.body.innerHTML = ''
  })

  describe('Add Mode', () => {
    beforeEach(() => {
      vi.mocked(useDotBoardStore).mockReturnValue(mockAddCategory)
    })

    it('renders add category dialog with correct elements', () => {
      render(<CategoryDialog mode="add" open={true} onOpenChange={mockOnOpenChange} />)

      expect(screen.getByText('新增版塊')).toBeInTheDocument()
      expect(screen.getByText('建立一個新的框架版塊')).toBeInTheDocument()
      // Multi-row mode: title input is a placeholder-based input
      expect(screen.getByPlaceholderText('版塊名稱')).toBeInTheDocument()
      expect(document.querySelector('input[type="color"]')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '取消' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '確認' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '新增一筆' })).toBeInTheDocument()
    })

    it('creates category with title and color (single row)', async () => {
      const user = userEvent.setup()
      mockAddCategory.mockResolvedValue(undefined)

      render(<CategoryDialog mode="add" open={true} onOpenChange={mockOnOpenChange} />)

      const titleInput = screen.getByPlaceholderText('版塊名稱')
      await user.type(titleInput, 'React')

      const submitButton = screen.getByRole('button', { name: '確認' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockAddCategory).toHaveBeenCalledWith('React', '#3b82f6')
        expect(toast.success).toHaveBeenCalledWith('版塊已新增：React')
        expect(mockOnOpenChange).toHaveBeenCalledWith(false)
      })
    })

    it('creates multiple categories in batch', async () => {
      const user = userEvent.setup()
      mockAddCategory.mockResolvedValue(undefined)

      render(<CategoryDialog mode="add" open={true} onOpenChange={mockOnOpenChange} />)

      // Fill first row
      const firstTitleInput = screen.getByPlaceholderText('版塊名稱')
      await user.type(firstTitleInput, 'React')

      // Add second row
      await user.click(screen.getByRole('button', { name: '新增一筆' }))

      const titleInputs = screen.getAllByPlaceholderText('版塊名稱')
      expect(titleInputs).toHaveLength(2)
      await user.type(titleInputs[1], 'Vue')

      await user.click(screen.getByRole('button', { name: '確認' }))

      await waitFor(() => {
        expect(mockAddCategory).toHaveBeenCalledTimes(2)
        expect(mockAddCategory).toHaveBeenNthCalledWith(1, 'React', '#3b82f6')
        expect(mockAddCategory).toHaveBeenNthCalledWith(2, 'Vue', '#3b82f6')
        expect(toast.success).toHaveBeenCalledWith('版塊已新增：React、Vue')
        expect(mockOnOpenChange).toHaveBeenCalledWith(false)
      })
    })

    it('filters out rows with empty titles on submit', async () => {
      const user = userEvent.setup()
      mockAddCategory.mockResolvedValue(undefined)

      render(<CategoryDialog mode="add" open={true} onOpenChange={mockOnOpenChange} />)

      // Fill first row
      await user.type(screen.getByPlaceholderText('版塊名稱'), 'React')

      // Add second row (leave empty)
      await user.click(screen.getByRole('button', { name: '新增一筆' }))

      // Add third row and fill
      await user.click(screen.getByRole('button', { name: '新增一筆' }))
      const titleInputs = screen.getAllByPlaceholderText('版塊名稱')
      await user.type(titleInputs[2], 'Angular')

      await user.click(screen.getByRole('button', { name: '確認' }))

      await waitFor(() => {
        expect(mockAddCategory).toHaveBeenCalledTimes(2)
        expect(mockAddCategory).toHaveBeenCalledWith('React', '#3b82f6')
        expect(mockAddCategory).toHaveBeenCalledWith('Angular', '#3b82f6')
        expect(mockOnOpenChange).toHaveBeenCalledWith(false)
      })
    })

    it('disables submit button when all titles are empty', () => {
      render(<CategoryDialog mode="add" open={true} onOpenChange={mockOnOpenChange} />)

      const submitButton = screen.getByRole('button', { name: '確認' })
      expect(submitButton).toBeDisabled()
    })

    it('enables submit button when at least one row has a title', async () => {
      const user = userEvent.setup()

      render(<CategoryDialog mode="add" open={true} onOpenChange={mockOnOpenChange} />)

      const titleInput = screen.getByPlaceholderText('版塊名稱')
      await user.type(titleInput, 'React')

      const submitButton = screen.getByRole('button', { name: '確認' })
      expect(submitButton).not.toBeDisabled()
    })

    it('shows error message when category creation fails', async () => {
      const user = userEvent.setup()
      const errorMessage = '版塊名稱重複'
      mockAddCategory.mockRejectedValue(new Error(errorMessage))

      render(<CategoryDialog mode="add" open={true} onOpenChange={mockOnOpenChange} />)

      const titleInput = screen.getByPlaceholderText('版塊名稱')
      await user.type(titleInput, 'React')

      const submitButton = screen.getByRole('button', { name: '確認' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(`新增失敗：${errorMessage}`)
        expect(mockOnOpenChange).not.toHaveBeenCalled()
      })
    })

    it('clears inputs when dialog is closed and reopened', async () => {
      const user = userEvent.setup()

      const { rerender } = render(<CategoryDialog mode="add" open={true} onOpenChange={mockOnOpenChange} />)

      const titleInput = screen.getByPlaceholderText('版塊名稱')
      await user.type(titleInput, 'React')

      const cancelButton = screen.getByRole('button', { name: '取消' })
      await user.click(cancelButton)

      expect(mockOnOpenChange).toHaveBeenCalledWith(false)

      // Reopen
      rerender(<CategoryDialog mode="add" open={false} onOpenChange={mockOnOpenChange} />)
      rerender(<CategoryDialog mode="add" open={true} onOpenChange={mockOnOpenChange} />)

      expect(screen.getByPlaceholderText('版塊名稱')).toHaveValue('')
    })

    it('uses default color #3b82f6', () => {
      render(<CategoryDialog mode="add" open={true} onOpenChange={mockOnOpenChange} />)

      const colorPicker = document.querySelector('input[type="color"]')
      expect(colorPicker).toHaveValue('#3b82f6')
    })

    it('prevents submission with whitespace-only title', async () => {
      const user = userEvent.setup()

      render(<CategoryDialog mode="add" open={true} onOpenChange={mockOnOpenChange} />)

      const titleInput = screen.getByPlaceholderText('版塊名稱')
      await user.type(titleInput, '   ')

      const submitButton = screen.getByRole('button', { name: '確認' })
      expect(submitButton).toBeDisabled()
    })
  })

  describe('Add Mode - Row Management', () => {
    beforeEach(() => {
      vi.mocked(useDotBoardStore).mockReturnValue(mockAddCategory)
    })

    it('starts with one row', () => {
      render(<CategoryDialog mode="add" open={true} onOpenChange={mockOnOpenChange} />)

      expect(screen.getAllByPlaceholderText('版塊名稱')).toHaveLength(1)
    })

    it('adds a row when clicking the add row button', async () => {
      const user = userEvent.setup()

      render(<CategoryDialog mode="add" open={true} onOpenChange={mockOnOpenChange} />)

      await user.click(screen.getByRole('button', { name: '新增一筆' }))

      expect(screen.getAllByPlaceholderText('版塊名稱')).toHaveLength(2)
    })

    it('does not show remove button when only one row', () => {
      render(<CategoryDialog mode="add" open={true} onOpenChange={mockOnOpenChange} />)

      expect(screen.queryByRole('button', { name: /刪除第/ })).not.toBeInTheDocument()
    })

    it('shows remove button when there are 2 or more rows', async () => {
      const user = userEvent.setup()

      render(<CategoryDialog mode="add" open={true} onOpenChange={mockOnOpenChange} />)

      await user.click(screen.getByRole('button', { name: '新增一筆' }))

      const removeButtons = screen.getAllByRole('button', { name: /刪除第/ })
      expect(removeButtons).toHaveLength(2)
    })

    it('removes a row when clicking delete button', async () => {
      const user = userEvent.setup()

      render(<CategoryDialog mode="add" open={true} onOpenChange={mockOnOpenChange} />)

      // Add a second row
      await user.click(screen.getByRole('button', { name: '新增一筆' }))
      expect(screen.getAllByPlaceholderText('版塊名稱')).toHaveLength(2)

      // Remove first row
      const removeButtons = screen.getAllByRole('button', { name: /刪除第/ })
      await user.click(removeButtons[0])

      expect(screen.getAllByPlaceholderText('版塊名稱')).toHaveLength(1)
      // No more remove buttons since only 1 row remains
      expect(screen.queryByRole('button', { name: /刪除第/ })).not.toBeInTheDocument()
    })
  })

  describe('Edit Mode', () => {
    const mockCategory = buildCategory({ title: 'React', color: '#61dafb' })

    beforeEach(() => {
      vi.mocked(useDotBoardStore).mockReturnValue(mockEditCategory)
    })

    it('renders edit category dialog with correct elements', () => {
      render(<CategoryDialog mode="edit" open={true} onOpenChange={mockOnOpenChange} category={mockCategory} />)

      expect(screen.getByText('編輯版塊')).toBeInTheDocument()
      expect(screen.getByText('修改版塊的標題與顏色')).toBeInTheDocument()
      expect(screen.getByLabelText('版塊名稱')).toBeInTheDocument()
      expect(screen.getByLabelText('版塊顏色')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '取消' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '確認' })).toBeInTheDocument()
    })

    it('populates form with category data', () => {
      render(<CategoryDialog mode="edit" open={true} onOpenChange={mockOnOpenChange} category={mockCategory} />)

      const titleInput = screen.getByLabelText('版塊名稱')
      expect(titleInput).toHaveValue('React')

      const colorInputs = screen.getAllByDisplayValue('#61dafb')
      expect(colorInputs.length).toBeGreaterThan(0)
    })

    it('updates category with new title and color', async () => {
      const user = userEvent.setup()
      mockEditCategory.mockResolvedValue(
        buildCategory({
          id: mockCategory.id,
          title: 'React v18',
          color: '#58c4dc',
        }),
      )

      render(<CategoryDialog mode="edit" open={true} onOpenChange={mockOnOpenChange} category={mockCategory} />)

      const titleInput = screen.getByLabelText('版塊名稱')
      const colorInputs = screen.getAllByDisplayValue('#61dafb')
      const submitButton = screen.getByRole('button', { name: '確認' })

      await user.clear(titleInput)
      await user.type(titleInput, 'React v18')

      // Find the text input for color (not the color picker)
      const colorTextInput = colorInputs.find((input) => input.getAttribute('type') !== 'color')
      if (colorTextInput) {
        await user.clear(colorTextInput)
        await user.type(colorTextInput, '#58c4dc')
      }

      await user.click(submitButton)

      await waitFor(() => {
        expect(mockEditCategory).toHaveBeenCalledWith(mockCategory.id, {
          title: 'React v18',
          color: '#58c4dc',
        })
        expect(toast.success).toHaveBeenCalledWith('版塊已更新：React v18')
        expect(mockOnOpenChange).toHaveBeenCalledWith(false)
      })
    })

    it('disables submit button when title is empty', async () => {
      const user = userEvent.setup()

      render(<CategoryDialog mode="edit" open={true} onOpenChange={mockOnOpenChange} category={mockCategory} />)

      const titleInput = screen.getByLabelText('版塊名稱')
      const submitButton = screen.getByRole('button', { name: '確認' })

      await user.clear(titleInput)

      expect(submitButton).toBeDisabled()
    })

    it('shows error message when category update fails', async () => {
      const user = userEvent.setup()
      const errorMessage = '版塊名稱重複'
      mockEditCategory.mockRejectedValue(new Error(errorMessage))

      render(<CategoryDialog mode="edit" open={true} onOpenChange={mockOnOpenChange} category={mockCategory} />)

      const titleInput = screen.getByLabelText('版塊名稱')
      const submitButton = screen.getByRole('button', { name: '確認' })

      await user.clear(titleInput)
      await user.type(titleInput, 'Vue')
      await user.click(submitButton)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(`更新失敗：${errorMessage}`)
        expect(mockOnOpenChange).not.toHaveBeenCalled()
      })
    })

    it('shows error when category no longer exists', async () => {
      const user = userEvent.setup()
      mockEditCategory.mockResolvedValue(undefined)

      render(<CategoryDialog mode="edit" open={true} onOpenChange={mockOnOpenChange} category={mockCategory} />)

      const titleInput = screen.getByLabelText('版塊名稱')
      const submitButton = screen.getByRole('button', { name: '確認' })

      await user.clear(titleInput)
      await user.type(titleInput, 'Vue')
      await user.click(submitButton)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('更新失敗：版塊不存在或已被移除')
        expect(toast.success).not.toHaveBeenCalled()
        expect(mockOnOpenChange).not.toHaveBeenCalled()
      })
    })

    it('shows error when category was deleted before saving', async () => {
      const user = userEvent.setup()
      mockEditCategory.mockResolvedValue(
        buildCategory({
          id: mockCategory.id,
          title: 'React',
          color: '#61dafb',
          isDeleted: 1,
          deletedAt: new Date().toISOString(),
        }),
      )

      render(<CategoryDialog mode="edit" open={true} onOpenChange={mockOnOpenChange} category={mockCategory} />)

      const titleInput = screen.getByLabelText('版塊名稱')
      const submitButton = screen.getByRole('button', { name: '確認' })

      await user.clear(titleInput)
      await user.type(titleInput, 'Vue')
      await user.click(submitButton)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('更新失敗：版塊不存在或已被移除')
        expect(toast.success).not.toHaveBeenCalled()
        expect(mockOnOpenChange).not.toHaveBeenCalled()
      })
    })

    it('closes dialog on cancel', async () => {
      const user = userEvent.setup()

      render(<CategoryDialog mode="edit" open={true} onOpenChange={mockOnOpenChange} category={mockCategory} />)

      const cancelButton = screen.getByRole('button', { name: '取消' })
      await user.click(cancelButton)

      expect(mockOnOpenChange).toHaveBeenCalledWith(false)
    })

    it('prevents submission with whitespace-only title', async () => {
      const user = userEvent.setup()

      render(<CategoryDialog mode="edit" open={true} onOpenChange={mockOnOpenChange} category={mockCategory} />)

      const titleInput = screen.getByLabelText('版塊名稱')
      const submitButton = screen.getByRole('button', { name: '確認' })

      await user.clear(titleInput)
      await user.type(titleInput, '   ')

      expect(submitButton).toBeDisabled()
    })

    it('reinitializes form data when reopened for the same category', async () => {
      const user = userEvent.setup()
      const { rerender } = render(
        <CategoryDialog mode="edit" open={true} onOpenChange={mockOnOpenChange} category={mockCategory} />,
      )

      const titleInput = screen.getByLabelText('版塊名稱')
      await user.clear(titleInput)
      await user.type(titleInput, 'Unsaved title')

      rerender(<CategoryDialog mode="edit" open={false} onOpenChange={mockOnOpenChange} category={mockCategory} />)

      rerender(<CategoryDialog mode="edit" open={true} onOpenChange={mockOnOpenChange} category={mockCategory} />)

      expect(screen.getByLabelText('版塊名稱')).toHaveValue('React')
      expect(screen.getAllByDisplayValue('#61dafb').length).toBeGreaterThan(0)
    })
  })
})
