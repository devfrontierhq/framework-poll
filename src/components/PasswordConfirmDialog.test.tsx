import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toast } from 'sonner'

import { PasswordConfirmDialog } from './PasswordConfirmDialog'

vi.mock('sonner')

describe('PasswordConfirmDialog', () => {
  const mockOnOpenChange = vi.fn()
  const mockOnConfirm = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    document.body.innerHTML = ''
  })

  it('renders dialog with correct elements', () => {
    render(
      <PasswordConfirmDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        title="測試標題"
        description="測試描述"
        itemName="測試項目"
        onConfirm={mockOnConfirm}
        successMessage="成功訊息"
      />,
    )

    expect(screen.getByText('測試標題')).toBeInTheDocument()
    expect(screen.getByText('測試描述')).toBeInTheDocument()
    expect(
      screen.getByLabelText('請輸入管理員密碼以確認刪除'),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '取消' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '確認刪除' })).toBeInTheDocument()
  })

  it('confirms with correct password', async () => {
    const user = userEvent.setup()
    mockOnConfirm.mockResolvedValue(undefined)

    render(
      <PasswordConfirmDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        title="測試標題"
        description="測試描述"
        itemName="測試項目"
        onConfirm={mockOnConfirm}
        successMessage="成功訊息"
      />,
    )

    const passwordInput = screen.getByLabelText('請輸入管理員密碼以確認刪除')
    const submitButton = screen.getByRole('button', { name: '確認刪除' })

    await user.type(passwordInput, 'test-secret')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockOnConfirm).toHaveBeenCalledWith('test-secret')
      expect(toast.success).toHaveBeenCalledWith('成功訊息')
      expect(mockOnOpenChange).toHaveBeenCalledWith(false)
    })
  })

  it('rejects confirmation with incorrect password', async () => {
    const user = userEvent.setup()
    mockOnConfirm.mockRejectedValue(new Error('密碼錯誤'))

    render(
      <PasswordConfirmDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        title="測試標題"
        description="測試描述"
        itemName="測試項目"
        onConfirm={mockOnConfirm}
        successMessage="成功訊息"
      />,
    )

    const passwordInput = screen.getByLabelText('請輸入管理員密碼以確認刪除')
    const submitButton = screen.getByRole('button', { name: '確認刪除' })

    await user.type(passwordInput, 'wrong-password')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockOnConfirm).toHaveBeenCalledWith('wrong-password')
      expect(toast.error).toHaveBeenCalledWith('刪除失敗：密碼錯誤')
      expect(mockOnOpenChange).not.toHaveBeenCalled()
    })
  })

  it('passes raw password input to onConfirm and leaves trimming to the verifier', async () => {
    const user = userEvent.setup()
    mockOnConfirm.mockResolvedValue(undefined)

    render(
      <PasswordConfirmDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        title="測試標題"
        description="測試描述"
        itemName="測試項目"
        onConfirm={mockOnConfirm}
        successMessage="成功訊息"
      />,
    )

    const passwordInput = screen.getByLabelText('請輸入管理員密碼以確認刪除')
    const submitButton = screen.getByRole('button', { name: '確認刪除' })

    await user.type(passwordInput, ' secret ')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockOnConfirm).toHaveBeenCalledWith(' secret ')
    })
  })

  it('uses custom error message prefix', async () => {
    const user = userEvent.setup()
    mockOnConfirm.mockRejectedValue(new Error('操作失敗'))

    render(
      <PasswordConfirmDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        title="測試標題"
        description="測試描述"
        itemName="測試項目"
        onConfirm={mockOnConfirm}
        successMessage="成功訊息"
        errorMessagePrefix="自訂錯誤"
      />,
    )

    const passwordInput = screen.getByLabelText('請輸入管理員密碼以確認刪除')
    const submitButton = screen.getByRole('button', { name: '確認刪除' })

    await user.type(passwordInput, 'test-password')
    await user.click(submitButton)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('自訂錯誤：操作失敗')
    })
  })

  it('disables submit button when password is empty', () => {
    render(
      <PasswordConfirmDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        title="測試標題"
        description="測試描述"
        itemName="測試項目"
        onConfirm={mockOnConfirm}
        successMessage="成功訊息"
      />,
    )

    const submitButton = screen.getByRole('button', { name: '確認刪除' })
    expect(submitButton).toBeDisabled()
  })

  it('shows error message when confirmation fails', async () => {
    const user = userEvent.setup()
    const errorMessage = '資料庫錯誤'
    mockOnConfirm.mockRejectedValue(new Error(errorMessage))

    render(
      <PasswordConfirmDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        title="測試標題"
        description="測試描述"
        itemName="測試項目"
        onConfirm={mockOnConfirm}
        successMessage="成功訊息"
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

    const { rerender } = render(
      <PasswordConfirmDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        title="測試標題"
        description="測試描述"
        itemName="測試項目"
        onConfirm={mockOnConfirm}
        successMessage="成功訊息"
      />,
    )

    const passwordInput = screen.getByLabelText('請輸入管理員密碼以確認刪除')
    const cancelButton = screen.getByRole('button', { name: '取消' })

    await user.type(passwordInput, 'test-secret')
    await user.click(cancelButton)

    expect(mockOnOpenChange).toHaveBeenCalledWith(false)

    rerender(
      <PasswordConfirmDialog
        open={false}
        onOpenChange={mockOnOpenChange}
        title="測試標題"
        description="測試描述"
        itemName="測試項目"
        onConfirm={mockOnConfirm}
        successMessage="成功訊息"
      />,
    )

    rerender(
      <PasswordConfirmDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        title="測試標題"
        description="測試描述"
        itemName="測試項目"
        onConfirm={mockOnConfirm}
        successMessage="成功訊息"
      />,
    )

    expect(screen.getByLabelText('請輸入管理員密碼以確認刪除')).toHaveValue('')
  })

  it('uses destructive variant for delete button', () => {
    render(
      <PasswordConfirmDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        title="測試標題"
        description="測試描述"
        itemName="測試項目"
        onConfirm={mockOnConfirm}
        successMessage="成功訊息"
      />,
    )

    const submitButton = screen.getByRole('button', { name: '確認刪除' })
    expect(submitButton.className).toContain('destructive')
  })

  it('prevents submission with whitespace-only password', async () => {
    const user = userEvent.setup()

    render(
      <PasswordConfirmDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        title="測試標題"
        description="測試描述"
        itemName="測試項目"
        onConfirm={mockOnConfirm}
        successMessage="成功訊息"
      />,
    )

    const passwordInput = screen.getByLabelText('請輸入管理員密碼以確認刪除')
    const submitButton = screen.getByRole('button', { name: '確認刪除' })

    await user.type(passwordInput, '   ')

    expect(submitButton).toBeDisabled()
  })

  it('handles unknown error gracefully', async () => {
    const user = userEvent.setup()
    mockOnConfirm.mockRejectedValue('unknown error')

    render(
      <PasswordConfirmDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        title="測試標題"
        description="測試描述"
        itemName="測試項目"
        onConfirm={mockOnConfirm}
        successMessage="成功訊息"
      />,
    )

    const passwordInput = screen.getByLabelText('請輸入管理員密碼以確認刪除')
    const submitButton = screen.getByRole('button', { name: '確認刪除' })

    await user.type(passwordInput, 'test-password')
    await user.click(submitButton)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('刪除失敗：發生未知錯誤')
    })
  })

  it('keeps dialog open when close is requested during submission', async () => {
    const user = userEvent.setup()
    let resolveConfirm: (() => void) | undefined
    mockOnConfirm.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveConfirm = resolve
        }),
    )

    render(
      <PasswordConfirmDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        title="測試標題"
        description="測試描述"
        itemName="測試項目"
        onConfirm={mockOnConfirm}
        successMessage="成功訊息"
      />,
    )

    const passwordInput = screen.getByLabelText('請輸入管理員密碼以確認刪除')
    await user.type(passwordInput, 'test-secret')
    await user.click(screen.getByRole('button', { name: '確認刪除' }))

    await waitFor(() => {
      expect(mockOnConfirm).toHaveBeenCalledWith('test-secret')
      expect(screen.getByRole('button', { name: '刪除中...' })).toBeDisabled()
    })

    mockOnOpenChange.mockClear()
    await user.click(screen.getByRole('button', { name: 'Close' }))

    expect(mockOnOpenChange).not.toHaveBeenCalled()

    resolveConfirm?.()
  })
})
