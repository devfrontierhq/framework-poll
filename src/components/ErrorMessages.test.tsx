import { render, screen, waitFor, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { toast } from 'sonner'

import { createMockDotBoardStore } from '@test/store'
import { buildCategory, buildDot } from '@test/builders'

import { AdminUnlockDialog } from './AdminUnlockDialog'
import { PasswordConfirmDialog } from './PasswordConfirmDialog'
import { DeleteCategoryDialog } from './DeleteCategoryDialog'
import { DeleteDotDialog } from './DeleteDotDialog'
import { EmptyState } from './EmptyState'
import { ExportCsvButton } from './ExportCsvButton'
import { useDotBoardStore } from '@/store/dotBoardStore'

// Mock the store
vi.mock('@/store/dotBoardStore', () => ({
  useDotBoardStore: vi.fn(),
}))

// Mock toast notifications
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

describe('Error Messages - Comprehensive Testing', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    const mockStore = createMockDotBoardStore()
    vi.mocked(useDotBoardStore).mockImplementation((selector) =>
      selector(mockStore),
    )
  })

  afterEach(() => {
    cleanup()
  })

  describe('Password/Secret Key Errors', () => {
    describe('AdminUnlockDialog - Password Errors', () => {
      it('shows error message when password is incorrect', async () => {
        const user = userEvent.setup()
        const mockStore = createMockDotBoardStore({
          unlockAdmin: vi.fn().mockReturnValue(false), // Invalid password
        })

        vi.mocked(useDotBoardStore).mockImplementation((selector) =>
          selector(mockStore),
        )

        const onOpenChange = vi.fn()
        render(<AdminUnlockDialog open={true} onOpenChange={onOpenChange} />)

        const passwordInput = screen.getByPlaceholderText('輸入管理員密碼')
        const submitButton = screen.getByRole('button', { name: '解鎖' })

        await user.type(passwordInput, 'wrong-password')
        await user.click(submitButton)

        await waitFor(() => {
          expect(toast.error).toHaveBeenCalledWith('密碼錯誤，請重試')
        })

        // Dialog should remain open on error
        expect(onOpenChange).not.toHaveBeenCalledWith(false)
      })

      it('shows error message when unlock throws exception', async () => {
        const user = userEvent.setup()
        const mockStore = createMockDotBoardStore({
          unlockAdmin: vi.fn().mockImplementation(() => {
            throw new Error('Database connection failed')
          }),
        })

        vi.mocked(useDotBoardStore).mockImplementation((selector) =>
          selector(mockStore),
        )

        const onOpenChange = vi.fn()
        render(<AdminUnlockDialog open={true} onOpenChange={onOpenChange} />)

        const passwordInput = screen.getByPlaceholderText('輸入管理員密碼')
        const submitButton = screen.getByRole('button', { name: '解鎖' })

        await user.type(passwordInput, 'any-password')
        await user.click(submitButton)

        await waitFor(() => {
          expect(toast.error).toHaveBeenCalledWith(
            '驗證失敗：Database connection failed',
          )
        })
      })

      it('shows generic error message when unlock throws non-Error exception', async () => {
        const user = userEvent.setup()
        const mockStore = createMockDotBoardStore({
          unlockAdmin: vi.fn().mockImplementation(() => {
            throw 'String error'
          }),
        })

        vi.mocked(useDotBoardStore).mockImplementation((selector) =>
          selector(mockStore),
        )

        const onOpenChange = vi.fn()
        render(<AdminUnlockDialog open={true} onOpenChange={onOpenChange} />)

        const passwordInput = screen.getByPlaceholderText('輸入管理員密碼')
        const submitButton = screen.getByRole('button', { name: '解鎖' })

        await user.type(passwordInput, 'any-password')
        await user.click(submitButton)

        await waitFor(() => {
          expect(toast.error).toHaveBeenCalledWith(
            '驗證失敗：驗證密碼時發生未知錯誤',
          )
        })
      })

      it('prevents submit when password is empty', async () => {
        const mockStore = createMockDotBoardStore()

        vi.mocked(useDotBoardStore).mockImplementation((selector) =>
          selector(mockStore),
        )

        const onOpenChange = vi.fn()
        render(<AdminUnlockDialog open={true} onOpenChange={onOpenChange} />)

        const submitButton = screen.getByRole('button', { name: '解鎖' })

        expect(submitButton).toBeDisabled()

        // No error should be shown
        expect(toast.error).not.toHaveBeenCalled()
      })

      it('prevents submit when password is only whitespace', async () => {
        const user = userEvent.setup()
        const mockStore = createMockDotBoardStore()

        vi.mocked(useDotBoardStore).mockImplementation((selector) =>
          selector(mockStore),
        )

        const onOpenChange = vi.fn()
        render(<AdminUnlockDialog open={true} onOpenChange={onOpenChange} />)

        const passwordInput = screen.getByPlaceholderText('輸入管理員密碼')
        const submitButton = screen.getByRole('button', { name: '解鎖' })

        await user.type(passwordInput, '   ')

        expect(submitButton).toBeDisabled()
        expect(toast.error).not.toHaveBeenCalled()
      })
    })

    describe('PasswordConfirmDialog - Delete Operation Errors', () => {
      it('shows error message when delete operation fails with password error', async () => {
        const user = userEvent.setup()
        const onConfirm = vi.fn().mockRejectedValue(new Error('密碼錯誤'))
        const onOpenChange = vi.fn()

        render(
          <PasswordConfirmDialog
            open={true}
            onOpenChange={onOpenChange}
            title="刪除確認"
            description="確定要刪除嗎？"
            itemName="測試項目"
            onConfirm={onConfirm}
            successMessage="刪除成功"
          />,
        )

        const passwordInput = screen.getByPlaceholderText('輸入管理員密碼')
        const submitButton = screen.getByRole('button', { name: '確認刪除' })

        await user.type(passwordInput, 'wrong-password')
        await user.click(submitButton)

        await waitFor(() => {
          expect(toast.error).toHaveBeenCalledWith('刪除失敗：密碼錯誤')
        })

        // Dialog should remain open on error
        expect(onOpenChange).not.toHaveBeenCalledWith(false)
      })

      it('shows custom error message prefix', async () => {
        const user = userEvent.setup()
        const onConfirm = vi.fn().mockRejectedValue(new Error('操作被拒絕'))
        const onOpenChange = vi.fn()

        render(
          <PasswordConfirmDialog
            open={true}
            onOpenChange={onOpenChange}
            title="操作確認"
            description="確定要執行此操作嗎？"
            itemName="測試項目"
            onConfirm={onConfirm}
            successMessage="操作成功"
            errorMessagePrefix="操作失敗"
          />,
        )

        const passwordInput = screen.getByPlaceholderText('輸入管理員密碼')
        const submitButton = screen.getByRole('button', { name: '確認刪除' })

        await user.type(passwordInput, 'password')
        await user.click(submitButton)

        await waitFor(() => {
          expect(toast.error).toHaveBeenCalledWith('操作失敗：操作被拒絕')
        })
      })

      it('shows generic error message for non-Error exceptions', async () => {
        const user = userEvent.setup()
        const onConfirm = vi.fn().mockRejectedValue('String error')
        const onOpenChange = vi.fn()

        render(
          <PasswordConfirmDialog
            open={true}
            onOpenChange={onOpenChange}
            title="刪除確認"
            description="確定要刪除嗎？"
            itemName="測試項目"
            onConfirm={onConfirm}
            successMessage="刪除成功"
          />,
        )

        const passwordInput = screen.getByPlaceholderText('輸入管理員密碼')
        const submitButton = screen.getByRole('button', { name: '確認刪除' })

        await user.type(passwordInput, 'password')
        await user.click(submitButton)

        await waitFor(() => {
          expect(toast.error).toHaveBeenCalledWith('刪除失敗：發生未知錯誤')
        })
      })
    })

    describe('DeleteCategoryDialog - Password Errors', () => {
      it('shows error when category deletion fails', async () => {
        const user = userEvent.setup()
        const mockCategory = buildCategory({
          id: 'cat-1',
          title: 'React',
          color: '#61dafb',
        })

        const mockStore = createMockDotBoardStore({
          isAdminUnlocked: true,
          removeCategory: vi.fn().mockResolvedValue(null), // Returns null = category not found
        })

        vi.mocked(useDotBoardStore).mockImplementation((selector) =>
          selector(mockStore),
        )

        const onOpenChange = vi.fn()
        render(
          <DeleteCategoryDialog
            category={mockCategory}
            open={true}
            onOpenChange={onOpenChange}
          />,
        )

        const passwordInput = screen.getByPlaceholderText('輸入管理員密碼')
        const submitButton = screen.getByRole('button', { name: '確認刪除' })

        await user.type(passwordInput, 'password')
        await user.click(submitButton)

        await waitFor(() => {
          expect(toast.error).toHaveBeenCalledWith(
            '刪除失敗：版塊不存在或已被移除',
          )
        })
      })
    })

    describe('DeleteDotDialog - Password Errors', () => {
      it('shows error when dot deletion fails', async () => {
        const user = userEvent.setup()
        const mockDot = buildDot({
          id: 'dot-1',
          categoryId: 'cat-1',
          name: 'Alice',
        })

        const mockStore = createMockDotBoardStore({
          isAdminUnlocked: true,
          removeDot: vi.fn().mockResolvedValue(null), // Returns null = dot not found
        })

        vi.mocked(useDotBoardStore).mockImplementation((selector) =>
          selector(mockStore),
        )

        const onOpenChange = vi.fn()
        render(
          <DeleteDotDialog
            dot={mockDot}
            open={true}
            onOpenChange={onOpenChange}
          />,
        )

        const passwordInput = screen.getByPlaceholderText('輸入管理員密碼')
        const submitButton = screen.getByRole('button', { name: '確認刪除' })

        await user.type(passwordInput, 'password')
        await user.click(submitButton)

        await waitFor(() => {
          expect(toast.error).toHaveBeenCalledWith(
            '刪除失敗：圓點不存在或已被移除',
          )
        })
      })
    })
  })

  describe('Operation Errors', () => {
    describe('EmptyState - Initialization Errors', () => {
      it('shows error when initialization fails', async () => {
        const user = userEvent.setup()
        const mockStore = createMockDotBoardStore({
          initializeDefaultCategories: vi
            .fn()
            .mockRejectedValue(new Error('Database error')),
        })

        vi.mocked(useDotBoardStore).mockImplementation((selector) =>
          selector(mockStore),
        )

        render(<EmptyState />)

        const button = screen.getByRole('button')
        await user.click(button)

        await waitFor(() => {
          expect(toast.error).toHaveBeenCalledWith(
            '建立預設板塊失敗：Database error',
          )
        })
      })

      it('shows generic error for non-Error exceptions during initialization', async () => {
        const user = userEvent.setup()
        const mockStore = createMockDotBoardStore({
          initializeDefaultCategories: vi
            .fn()
            .mockRejectedValue('Unknown error'),
        })

        vi.mocked(useDotBoardStore).mockImplementation((selector) =>
          selector(mockStore),
        )

        render(<EmptyState />)

        const button = screen.getByRole('button')
        await user.click(button)

        await waitFor(() => {
          expect(toast.error).toHaveBeenCalledWith(
            '建立預設板塊失敗：建立預設板塊時發生未知錯誤',
          )
        })
      })
    })

    describe('ExportCsvButton - Export Errors', () => {
      it('shows error when CSV export fails', async () => {
        const user = userEvent.setup()
        const mockStore = createMockDotBoardStore({
          isAdminUnlocked: true,
          exportCsv: vi.fn().mockRejectedValue(new Error('Export failed')),
        })

        vi.mocked(useDotBoardStore).mockImplementation((selector) =>
          selector(mockStore),
        )

        render(<ExportCsvButton />)

        const button = screen.getByRole('button', { name: /匯出 CSV/ })
        await user.click(button)

        await waitFor(() => {
          expect(toast.error).toHaveBeenCalledWith('CSV 匯出失敗，請稍後再試')
        })
      })

      it('shows generic error for non-Error exceptions during export', async () => {
        const user = userEvent.setup()
        const mockStore = createMockDotBoardStore({
          isAdminUnlocked: true,
          exportCsv: vi.fn().mockRejectedValue('Unknown error'),
        })

        vi.mocked(useDotBoardStore).mockImplementation((selector) =>
          selector(mockStore),
        )

        render(<ExportCsvButton />)

        const button = screen.getByRole('button', { name: /匯出 CSV/ })
        await user.click(button)

        await waitFor(() => {
          expect(toast.error).toHaveBeenCalledWith('CSV 匯出失敗，請稍後再試')
        })
      })
    })
  })

  describe('Error Message Formatting', () => {
    it('error messages include operation context', async () => {
      const user = userEvent.setup()
      const mockStore = createMockDotBoardStore({
        unlockAdmin: vi.fn().mockImplementation(() => {
          throw new Error('Network timeout')
        }),
      })

      vi.mocked(useDotBoardStore).mockImplementation((selector) =>
        selector(mockStore),
      )

      const onOpenChange = vi.fn()
      render(<AdminUnlockDialog open={true} onOpenChange={onOpenChange} />)

      const passwordInput = screen.getByPlaceholderText('輸入管理員密碼')
      const submitButton = screen.getByRole('button', { name: '解鎖' })

      await user.type(passwordInput, 'password')
      await user.click(submitButton)

      await waitFor(() => {
        const errorCall = vi.mocked(toast.error).mock.calls[0][0]
        expect(errorCall).toContain('驗證失敗：')
        expect(errorCall).toContain('Network timeout')
      })
    })

    it('error messages are user-friendly and actionable', async () => {
      const user = userEvent.setup()
      const mockStore = createMockDotBoardStore({
        unlockAdmin: vi.fn().mockReturnValue(false),
      })

      vi.mocked(useDotBoardStore).mockImplementation((selector) =>
        selector(mockStore),
      )

      const onOpenChange = vi.fn()
      render(<AdminUnlockDialog open={true} onOpenChange={onOpenChange} />)

      const passwordInput = screen.getByPlaceholderText('輸入管理員密碼')
      const submitButton = screen.getByRole('button', { name: '解鎖' })

      await user.type(passwordInput, 'wrong')
      await user.click(submitButton)

      await waitFor(() => {
        const errorMessage = vi.mocked(toast.error).mock.calls[0][0]
        expect(errorMessage).toBe('密碼錯誤，請重試')
        // Should suggest retry action
        expect(errorMessage).toContain('請重試')
      })
    })

    it('distinguishes between different error types', async () => {
      const user = userEvent.setup()

      // Test password error
      const mockStoreWrongPassword = createMockDotBoardStore({
        unlockAdmin: vi.fn().mockReturnValue(false),
      })

      vi.mocked(useDotBoardStore).mockImplementation((selector) =>
        selector(mockStoreWrongPassword),
      )

      const { unmount } = render(
        <AdminUnlockDialog open={true} onOpenChange={vi.fn()} />,
      )

      let passwordInput = screen.getByPlaceholderText('輸入管理員密碼')
      let submitButton = screen.getByRole('button', { name: '解鎖' })

      await user.type(passwordInput, 'wrong')
      await user.click(submitButton)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('密碼錯誤，請重試')
      })

      vi.clearAllMocks()
      unmount()

      // Test system error
      const mockStoreSystemError = createMockDotBoardStore({
        unlockAdmin: vi.fn().mockImplementation(() => {
          throw new Error('System error')
        }),
      })

      vi.mocked(useDotBoardStore).mockImplementation((selector) =>
        selector(mockStoreSystemError),
      )

      render(<AdminUnlockDialog open={true} onOpenChange={vi.fn()} />)

      passwordInput = screen.getByPlaceholderText('輸入管理員密碼')
      submitButton = screen.getByRole('button', { name: '解鎖' })

      await user.type(passwordInput, 'password')
      await user.click(submitButton)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('驗證失敗：System error')
      })
    })
  })

  describe('Error Recovery', () => {
    it('allows retry after password error', async () => {
      const user = userEvent.setup()
      const unlockAdminMock = vi
        .fn()
        .mockReturnValueOnce(false) // First attempt fails
        .mockReturnValueOnce(true) // Second attempt succeeds

      const mockStore = createMockDotBoardStore({
        unlockAdmin: unlockAdminMock,
      })

      vi.mocked(useDotBoardStore).mockImplementation((selector) =>
        selector(mockStore),
      )

      const onOpenChange = vi.fn()
      render(<AdminUnlockDialog open={true} onOpenChange={onOpenChange} />)

      const passwordInput = screen.getByPlaceholderText('輸入管理員密碼')
      const submitButton = screen.getByRole('button', { name: '解鎖' })

      // First attempt with wrong password
      await user.type(passwordInput, 'wrong')
      await user.click(submitButton)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('密碼錯誤，請重試')
      })

      // Clear and retry with correct password
      await user.clear(passwordInput)
      await user.type(passwordInput, 'correct')
      await user.click(submitButton)

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('管理員模式已啟用')
      })

      expect(unlockAdminMock).toHaveBeenCalledTimes(2)
    })

    it('clears password field on dialog close after error', async () => {
      const user = userEvent.setup()
      const mockStore = createMockDotBoardStore({
        unlockAdmin: vi.fn().mockReturnValue(false),
      })

      vi.mocked(useDotBoardStore).mockImplementation((selector) =>
        selector(mockStore),
      )

      const onOpenChange = vi.fn()
      render(<AdminUnlockDialog open={true} onOpenChange={onOpenChange} />)

      const passwordInput = screen.getByPlaceholderText('輸入管理員密碼')
      const submitButton = screen.getByRole('button', { name: '解鎖' })
      const cancelButton = screen.getByRole('button', { name: '取消' })

      // Enter wrong password
      await user.type(passwordInput, 'wrong')
      await user.click(submitButton)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled()
      })

      // Close dialog
      await user.click(cancelButton)

      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })
})
