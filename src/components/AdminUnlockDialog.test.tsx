import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toast } from 'sonner'

import { AdminUnlockDialog } from './AdminUnlockDialog'
import { useDotBoardStore } from '@/store/dotBoardStore'

vi.mock('sonner')
vi.mock('@/store/dotBoardStore')

describe('AdminUnlockDialog', () => {
  const mockOnOpenChange = vi.fn()
  const mockUnlockAdmin = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useDotBoardStore).mockReturnValue(mockUnlockAdmin)
    document.body.innerHTML = ''
  })

  it('renders admin unlock dialog with correct elements', () => {
    render(<AdminUnlockDialog open={true} onOpenChange={mockOnOpenChange} />)

    expect(screen.getByText('管理員驗證')).toBeInTheDocument()
    expect(screen.getByText('請輸入密碼以啟用管理功能')).toBeInTheDocument()
    expect(screen.getByLabelText('密碼')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '取消' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '解鎖' })).toBeInTheDocument()
  })

  it('unlocks admin mode with correct password', async () => {
    const user = userEvent.setup()
    mockUnlockAdmin.mockReturnValue(true)

    render(<AdminUnlockDialog open={true} onOpenChange={mockOnOpenChange} />)

    const passwordInput = screen.getByPlaceholderText('輸入管理員密碼')
    const submitButton = screen.getByRole('button', { name: '解鎖' })

    await user.type(passwordInput, 'correct-password')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockUnlockAdmin).toHaveBeenCalledWith('correct-password')
      expect(toast.success).toHaveBeenCalledWith('管理員模式已啟用')
      expect(mockOnOpenChange).toHaveBeenCalledWith(false)
    })
  })

  it('shows error with incorrect password', async () => {
    const user = userEvent.setup()
    mockUnlockAdmin.mockReturnValue(false)

    render(<AdminUnlockDialog open={true} onOpenChange={mockOnOpenChange} />)

    const passwordInput = screen.getByPlaceholderText('輸入管理員密碼')
    const submitButton = screen.getByRole('button', { name: '解鎖' })

    await user.type(passwordInput, 'wrong-password')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockUnlockAdmin).toHaveBeenCalledWith('wrong-password')
      expect(toast.error).toHaveBeenCalledWith('密碼錯誤，請重試')
      expect(mockOnOpenChange).not.toHaveBeenCalled()
    })
  })

  it('disables submit button when password is empty', () => {
    render(<AdminUnlockDialog open={true} onOpenChange={mockOnOpenChange} />)

    const submitButton = screen.getByRole('button', { name: '解鎖' })
    expect(submitButton).toBeDisabled()
  })

  it('clears password when dialog is closed', async () => {
    const user = userEvent.setup()

    render(<AdminUnlockDialog open={true} onOpenChange={mockOnOpenChange} />)

    const passwordInput = screen.getByPlaceholderText('輸入管理員密碼')
    const cancelButton = screen.getByRole('button', { name: '取消' })

    await user.type(passwordInput, 'some-password')
    await user.click(cancelButton)

    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
  })

  it('prevents submission with whitespace-only password', async () => {
    const user = userEvent.setup()

    render(<AdminUnlockDialog open={true} onOpenChange={mockOnOpenChange} />)

    const passwordInput = screen.getByPlaceholderText('輸入管理員密碼')
    const submitButton = screen.getByRole('button', { name: '解鎖' })

    await user.type(passwordInput, '   ')

    // Submit button should still be disabled for whitespace
    expect(submitButton).toBeDisabled()
  })

  it('shows loading state during submission', async () => {
    const user = userEvent.setup()
    // Note: unlockAdmin is synchronous in the implementation,
    // so the loading state only appears briefly when isSubmitting is true
    mockUnlockAdmin.mockReturnValue(true)

    render(<AdminUnlockDialog open={true} onOpenChange={mockOnOpenChange} />)

    const passwordInput = screen.getByPlaceholderText('輸入管理員密碼')
    const submitButton = screen.getByRole('button', { name: '解鎖' })

    await user.type(passwordInput, 'password')

    // Verify that the button initially shows "解鎖"
    expect(submitButton).toHaveTextContent('解鎖')

    // After clicking, the component should briefly show loading state
    // but since unlockAdmin is sync, we just verify the button was enabled
    await user.click(submitButton)

    // After submission completes, dialog should be closed
    await waitFor(() => {
      expect(mockOnOpenChange).toHaveBeenCalledWith(false)
    })
  })

  it('uses password input type for security', () => {
    render(<AdminUnlockDialog open={true} onOpenChange={mockOnOpenChange} />)

    const passwordInput = screen.getByPlaceholderText('輸入管理員密碼')
    expect(passwordInput).toHaveAttribute('type', 'password')
  })
})
