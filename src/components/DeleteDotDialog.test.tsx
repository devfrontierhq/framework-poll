import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toast } from 'sonner'

import { DeleteDotDialog } from './DeleteDotDialog'
import { useDotBoardStore } from '@/store/dotBoardStore'
import { buildDot } from '@test/builders'
import { INVALID_DELETE_PASSWORD_ERROR } from '@/store/types'

vi.mock('sonner')
vi.mock('@/store/dotBoardStore')

describe('DeleteDotDialog', () => {
  const mockOnOpenChange = vi.fn()
  const mockRemoveDot = vi.fn()
  const mockDot = buildDot({ name: 'Alice', xRatio: 0.5, yRatio: 0.5 })

  beforeEach(() => {
    vi.clearAllMocks()
    document.body.innerHTML = ''
    vi.mocked(useDotBoardStore).mockReturnValue(mockRemoveDot)
  })

  it('renders delete dot dialog with correct elements', () => {
    render(
      <DeleteDotDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        dot={mockDot}
      />,
    )

    expect(screen.getByText('刪除圓點')).toBeInTheDocument()
    expect(screen.getByText(/確定要刪除「Alice」嗎？/)).toBeInTheDocument()
    expect(
      screen.getByLabelText('請輸入管理員密碼以確認刪除'),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '取消' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '確認刪除' })).toBeInTheDocument()
  })

  it('deletes dot with correct password', async () => {
    const user = userEvent.setup()
    mockRemoveDot.mockResolvedValue(mockDot)

    render(
      <DeleteDotDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        dot={mockDot}
      />,
    )

    const passwordInput = screen.getByLabelText('請輸入管理員密碼以確認刪除')
    const submitButton = screen.getByRole('button', { name: '確認刪除' })

    await user.type(passwordInput, 'test-secret')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockRemoveDot).toHaveBeenCalledWith(mockDot.id, 'test-secret')
      expect(toast.success).toHaveBeenCalledWith('圓點已刪除：Alice')
      expect(mockOnOpenChange).toHaveBeenCalledWith(false)
    })
  })

  it('shows error when dot is already missing', async () => {
    const user = userEvent.setup()
    mockRemoveDot.mockResolvedValue(undefined)

    render(
      <DeleteDotDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        dot={mockDot}
      />,
    )

    const passwordInput = screen.getByLabelText('請輸入管理員密碼以確認刪除')
    const submitButton = screen.getByRole('button', { name: '確認刪除' })

    await user.type(passwordInput, 'test-secret')
    await user.click(submitButton)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('刪除失敗：圓點不存在或已被移除')
      expect(toast.success).not.toHaveBeenCalled()
      expect(mockOnOpenChange).not.toHaveBeenCalled()
    })
  })

  it('rejects deletion with incorrect password', async () => {
    const user = userEvent.setup()
    mockRemoveDot.mockRejectedValue(new Error(INVALID_DELETE_PASSWORD_ERROR))

    render(
      <DeleteDotDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        dot={mockDot}
      />,
    )

    const passwordInput = screen.getByLabelText('請輸入管理員密碼以確認刪除')
    const submitButton = screen.getByRole('button', { name: '確認刪除' })

    await user.type(passwordInput, 'wrong-password')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockRemoveDot).toHaveBeenCalledWith(mockDot.id, 'wrong-password')
      expect(toast.error).toHaveBeenCalledWith(
        `刪除失敗：${INVALID_DELETE_PASSWORD_ERROR}`,
      )
      expect(mockOnOpenChange).not.toHaveBeenCalled()
    })
  })

  it('disables submit button when password is empty', () => {
    render(
      <DeleteDotDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        dot={mockDot}
      />,
    )

    const submitButton = screen.getByRole('button', { name: '確認刪除' })
    expect(submitButton).toBeDisabled()
  })

  it('shows error message when deletion fails', async () => {
    const user = userEvent.setup()
    const errorMessage = '資料庫錯誤'
    mockRemoveDot.mockRejectedValue(new Error(errorMessage))

    render(
      <DeleteDotDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        dot={mockDot}
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
      <DeleteDotDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        dot={mockDot}
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
      <DeleteDotDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        dot={mockDot}
      />,
    )

    const submitButton = screen.getByRole('button', { name: '確認刪除' })
    expect(submitButton.className).toContain('destructive')
  })

  it('prevents submission with whitespace-only password', async () => {
    const user = userEvent.setup()

    render(
      <DeleteDotDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        dot={mockDot}
      />,
    )

    const passwordInput = screen.getByLabelText('請輸入管理員密碼以確認刪除')
    const submitButton = screen.getByRole('button', { name: '確認刪除' })

    await user.type(passwordInput, '   ')

    expect(submitButton).toBeDisabled()
  })

  it('shows warning about operation being irreversible', () => {
    render(
      <DeleteDotDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        dot={mockDot}
      />,
    )

    expect(screen.getByText(/此操作無法復原/)).toBeInTheDocument()
  })
})
