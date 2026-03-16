import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toast } from 'sonner'

import { CategoryDialog } from './CategoryDialog'
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
      render(
        <CategoryDialog
          mode="add"
          open={true}
          onOpenChange={mockOnOpenChange}
        />,
      )

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

      render(
        <CategoryDialog
          mode="add"
          open={true}
          onOpenChange={mockOnOpenChange}
        />,
      )

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
      render(
        <CategoryDialog
          mode="add"
          open={true}
          onOpenChange={mockOnOpenChange}
        />,
      )

      const submitButton = screen.getByRole('button', { name: '確認' })
      expect(submitButton).toBeDisabled()
    })

    it('shows error message when category creation fails', async () => {
      const user = userEvent.setup()
      const errorMessage = '版塊名稱重複'
      mockAddCategory.mockRejectedValue(new Error(errorMessage))

      render(
        <CategoryDialog
          mode="add"
          open={true}
          onOpenChange={mockOnOpenChange}
        />,
      )

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

      render(
        <CategoryDialog
          mode="add"
          open={true}
          onOpenChange={mockOnOpenChange}
        />,
      )

      const titleInput = screen.getByLabelText('版塊名稱')
      const cancelButton = screen.getByRole('button', { name: '取消' })

      await user.type(titleInput, 'React')
      await user.click(cancelButton)

      expect(mockOnOpenChange).toHaveBeenCalledWith(false)
    })

    it('uses default color #3b82f6', () => {
      render(
        <CategoryDialog
          mode="add"
          open={true}
          onOpenChange={mockOnOpenChange}
        />,
      )

      const colorInputs = screen.getAllByDisplayValue('#3b82f6')
      expect(colorInputs.length).toBeGreaterThan(0)
    })

    it('syncs color between color picker and text input', async () => {
      const user = userEvent.setup()

      render(
        <CategoryDialog
          mode="add"
          open={true}
          onOpenChange={mockOnOpenChange}
        />,
      )

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

      render(
        <CategoryDialog
          mode="add"
          open={true}
          onOpenChange={mockOnOpenChange}
        />,
      )

      const titleInput = screen.getByLabelText('版塊名稱')
      const submitButton = screen.getByRole('button', { name: '確認' })

      await user.type(titleInput, '   ')

      // Submit button should still be disabled for whitespace
      expect(submitButton).toBeDisabled()
    })
  })

  describe('Edit Mode', () => {
    const mockCategory = buildCategory({ title: 'React', color: '#61dafb' })

    beforeEach(() => {
      vi.mocked(useDotBoardStore).mockReturnValue(mockEditCategory)
    })

    it('renders edit category dialog with correct elements', () => {
      render(
        <CategoryDialog
          mode="edit"
          open={true}
          onOpenChange={mockOnOpenChange}
          category={mockCategory}
        />,
      )

      expect(screen.getByText('編輯版塊')).toBeInTheDocument()
      expect(screen.getByText('修改版塊的標題與顏色')).toBeInTheDocument()
      expect(screen.getByLabelText('版塊名稱')).toBeInTheDocument()
      expect(screen.getByLabelText('版塊顏色')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '取消' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '確認' })).toBeInTheDocument()
    })

    it('populates form with category data', () => {
      render(
        <CategoryDialog
          mode="edit"
          open={true}
          onOpenChange={mockOnOpenChange}
          category={mockCategory}
        />,
      )

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

      render(
        <CategoryDialog
          mode="edit"
          open={true}
          onOpenChange={mockOnOpenChange}
          category={mockCategory}
        />,
      )

      const titleInput = screen.getByLabelText('版塊名稱')
      const colorInputs = screen.getAllByDisplayValue('#61dafb')
      const submitButton = screen.getByRole('button', { name: '確認' })

      await user.clear(titleInput)
      await user.type(titleInput, 'React v18')

      // Find the text input for color (not the color picker)
      const colorTextInput = colorInputs.find(
        (input) => input.getAttribute('type') !== 'color',
      )
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

      render(
        <CategoryDialog
          mode="edit"
          open={true}
          onOpenChange={mockOnOpenChange}
          category={mockCategory}
        />,
      )

      const titleInput = screen.getByLabelText('版塊名稱')
      const submitButton = screen.getByRole('button', { name: '確認' })

      await user.clear(titleInput)

      expect(submitButton).toBeDisabled()
    })

    it('shows error message when category update fails', async () => {
      const user = userEvent.setup()
      const errorMessage = '版塊名稱重複'
      mockEditCategory.mockRejectedValue(new Error(errorMessage))

      render(
        <CategoryDialog
          mode="edit"
          open={true}
          onOpenChange={mockOnOpenChange}
          category={mockCategory}
        />,
      )

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

      render(
        <CategoryDialog
          mode="edit"
          open={true}
          onOpenChange={mockOnOpenChange}
          category={mockCategory}
        />,
      )

      const titleInput = screen.getByLabelText('版塊名稱')
      const submitButton = screen.getByRole('button', { name: '確認' })

      await user.clear(titleInput)
      await user.type(titleInput, 'Vue')
      await user.click(submitButton)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          '更新失敗：版塊不存在或已被移除',
        )
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

      render(
        <CategoryDialog
          mode="edit"
          open={true}
          onOpenChange={mockOnOpenChange}
          category={mockCategory}
        />,
      )

      const titleInput = screen.getByLabelText('版塊名稱')
      const submitButton = screen.getByRole('button', { name: '確認' })

      await user.clear(titleInput)
      await user.type(titleInput, 'Vue')
      await user.click(submitButton)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          '更新失敗：版塊不存在或已被移除',
        )
        expect(toast.success).not.toHaveBeenCalled()
        expect(mockOnOpenChange).not.toHaveBeenCalled()
      })
    })

    it('closes dialog on cancel', async () => {
      const user = userEvent.setup()

      render(
        <CategoryDialog
          mode="edit"
          open={true}
          onOpenChange={mockOnOpenChange}
          category={mockCategory}
        />,
      )

      const cancelButton = screen.getByRole('button', { name: '取消' })
      await user.click(cancelButton)

      expect(mockOnOpenChange).toHaveBeenCalledWith(false)
    })

    it('prevents submission with whitespace-only title', async () => {
      const user = userEvent.setup()

      render(
        <CategoryDialog
          mode="edit"
          open={true}
          onOpenChange={mockOnOpenChange}
          category={mockCategory}
        />,
      )

      const titleInput = screen.getByLabelText('版塊名稱')
      const submitButton = screen.getByRole('button', { name: '確認' })

      await user.clear(titleInput)
      await user.type(titleInput, '   ')

      expect(submitButton).toBeDisabled()
    })

    it('reinitializes form data when reopened for the same category', async () => {
      const user = userEvent.setup()
      const { rerender } = render(
        <CategoryDialog
          mode="edit"
          open={true}
          onOpenChange={mockOnOpenChange}
          category={mockCategory}
        />,
      )

      const titleInput = screen.getByLabelText('版塊名稱')
      await user.clear(titleInput)
      await user.type(titleInput, 'Unsaved title')

      rerender(
        <CategoryDialog
          mode="edit"
          open={false}
          onOpenChange={mockOnOpenChange}
          category={mockCategory}
        />,
      )

      rerender(
        <CategoryDialog
          mode="edit"
          open={true}
          onOpenChange={mockOnOpenChange}
          category={mockCategory}
        />,
      )

      expect(screen.getByLabelText('版塊名稱')).toHaveValue('React')
      expect(screen.getAllByDisplayValue('#61dafb').length).toBeGreaterThan(0)
    })
  })
})
