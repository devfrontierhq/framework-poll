import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toast } from 'sonner'

import { DeleteCategoryDialog } from './DeleteCategoryDialog'
import { useDotBoardStore } from '@/store/dotBoardStore'
import { buildCategory } from '@test/builders'
import { INVALID_DELETE_PASSWORD_ERROR } from '@/store/types'

vi.mock('sonner')
vi.mock('@/store/dotBoardStore')

describe('DeleteCategoryDialog', () => {
  const mockOnOpenChange = vi.fn()
  const mockDeleteCategory = vi.fn()
  const mockCategory = buildCategory({ title: 'React', color: '#61dafb' })

  beforeEach(() => {
    vi.clearAllMocks()
    document.body.innerHTML = ''
    vi.mocked(useDotBoardStore).mockReturnValue(mockDeleteCategory)
  })

  it('renders delete category dialog with correct elements', () => {
    render(
      <DeleteCategoryDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        category={mockCategory}
      />,
    )

    expect(screen.getByText('刪除版塊')).toBeInTheDocument()
    expect(screen.getByText(/確定要刪除「React」嗎？/)).toBeInTheDocument()
    expect(
      screen.getByLabelText('請輸入管理員密碼以確認刪除'),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '取消' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '確認刪除' })).toBeInTheDocument()
  })

  it('deletes category with correct password', async () => {
    const user = userEvent.setup()
    mockDeleteCategory.mockResolvedValue(mockCategory)

    render(
      <DeleteCategoryDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        category={mockCategory}
      />,
    )

    const passwordInput = screen.getByLabelText('請輸入管理員密碼以確認刪除')
    const submitButton = screen.getByRole('button', { name: '確認刪除' })

    await user.type(passwordInput, 'test-secret')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockDeleteCategory).toHaveBeenCalledWith(
        mockCategory.id,
        'test-secret',
      )
      expect(toast.success).toHaveBeenCalledWith('版塊已刪除：React')
      expect(mockOnOpenChange).toHaveBeenCalledWith(false)
    })
  })

  it('shows error when category is already missing', async () => {
    const user = userEvent.setup()
    mockDeleteCategory.mockResolvedValue(undefined)

    render(
      <DeleteCategoryDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        category={mockCategory}
      />,
    )

    const passwordInput = screen.getByLabelText('請輸入管理員密碼以確認刪除')
    const submitButton = screen.getByRole('button', { name: '確認刪除' })

    await user.type(passwordInput, 'test-secret')
    await user.click(submitButton)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('刪除失敗：版塊不存在或已被移除')
      expect(toast.success).not.toHaveBeenCalled()
      expect(mockOnOpenChange).not.toHaveBeenCalled()
    })
  })

  it('rejects deletion with incorrect password', async () => {
    const user = userEvent.setup()
    mockDeleteCategory.mockRejectedValue(
      new Error(INVALID_DELETE_PASSWORD_ERROR),
    )

    render(
      <DeleteCategoryDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        category={mockCategory}
      />,
    )

    const passwordInput = screen.getByLabelText('請輸入管理員密碼以確認刪除')
    const submitButton = screen.getByRole('button', { name: '確認刪除' })

    await user.type(passwordInput, 'wrong-password')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockDeleteCategory).toHaveBeenCalledWith(
        mockCategory.id,
        'wrong-password',
      )
      expect(toast.error).toHaveBeenCalledWith(
        `刪除失敗：${INVALID_DELETE_PASSWORD_ERROR}`,
      )
      expect(mockOnOpenChange).not.toHaveBeenCalled()
    })
  })

  it('disables submit button when password is empty', () => {
    render(
      <DeleteCategoryDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        category={mockCategory}
      />,
    )

    const submitButton = screen.getByRole('button', { name: '確認刪除' })
    expect(submitButton).toBeDisabled()
  })

  it('shows error message when deletion fails', async () => {
    const user = userEvent.setup()
    const errorMessage = '資料庫錯誤'
    mockDeleteCategory.mockRejectedValue(new Error(errorMessage))

    render(
      <DeleteCategoryDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        category={mockCategory}
      />,
    )

    const passwordInput = screen.getByLabelText('請輸入管理員密碼以確認刪除')
    const submitButton = screen.getByRole('button', { name: '確認刪除' })

    await user.type(passwordInput, 'test-secret')
    await user.click(submitButton)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(`刪除失敗：${errorMessage}`)
      expect(mockOnOpenChange).not.toHaveBeenCalled()
    })
  })

  it('clears password when dialog is closed', async () => {
    const user = userEvent.setup()

    render(
      <DeleteCategoryDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        category={mockCategory}
      />,
    )

    const passwordInput = screen.getByLabelText('請輸入管理員密碼以確認刪除')
    const cancelButton = screen.getByRole('button', { name: '取消' })

    await user.type(passwordInput, 'test-secret')
    await user.click(cancelButton)

    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
  })

  it('uses destructive variant for delete button', () => {
    render(
      <DeleteCategoryDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        category={mockCategory}
      />,
    )

    const submitButton = screen.getByRole('button', { name: '確認刪除' })
    expect(submitButton.className).toContain('destructive')
  })

  it('prevents submission with whitespace-only password', async () => {
    const user = userEvent.setup()

    render(
      <DeleteCategoryDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        category={mockCategory}
      />,
    )

    const passwordInput = screen.getByLabelText('請輸入管理員密碼以確認刪除')
    const submitButton = screen.getByRole('button', { name: '確認刪除' })

    await user.type(passwordInput, '   ')

    expect(submitButton).toBeDisabled()
  })

  it('shows warning message about cascading delete', () => {
    render(
      <DeleteCategoryDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        category={mockCategory}
      />,
    )

    expect(screen.getByText(/此操作會連帶刪除所有圓點/)).toBeInTheDocument()
  })
})
