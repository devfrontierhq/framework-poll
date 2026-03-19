import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { toast } from 'sonner'
import { useDialogSubmit } from '../useDialogSubmit'

vi.mock('sonner')

describe('useDialogSubmit', () => {
  const mockOnClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('初始狀態 isSubmitting 為 false', () => {
    const { result } = renderHook(() => useDialogSubmit({ onClose: mockOnClose, successMessage: '成功' }))
    expect(result.current.isSubmitting).toBe(false)
  })

  it('handleSubmit 成功後呼叫 toast.success 和 onClose', async () => {
    const { result } = renderHook(() => useDialogSubmit({ onClose: mockOnClose, successMessage: '新增成功' }))

    await act(async () => {
      await result.current.handleSubmit(async () => {})
    })

    expect(toast.success).toHaveBeenCalledWith('新增成功')
    expect(mockOnClose).toHaveBeenCalledOnce()
  })

  it('handleSubmit 失敗後呼叫 toast.error，不呼叫 onClose', async () => {
    const { result } = renderHook(() =>
      useDialogSubmit({ onClose: mockOnClose, successMessage: '成功', errorMessagePrefix: '刪除失敗' }),
    )

    await act(async () => {
      await result.current.handleSubmit(async () => {
        throw new Error('密碼錯誤')
      })
    })

    expect(toast.error).toHaveBeenCalledWith('刪除失敗：密碼錯誤')
    expect(mockOnClose).not.toHaveBeenCalled()
  })

  it('handleSubmit 失敗時使用預設 errorMessagePrefix', async () => {
    const { result } = renderHook(() => useDialogSubmit({ onClose: mockOnClose, successMessage: '成功' }))

    await act(async () => {
      await result.current.handleSubmit(async () => {
        throw new Error('未知錯誤')
      })
    })

    expect(toast.error).toHaveBeenCalledWith('操作失敗：未知錯誤')
  })

  it('非 Error 的 throw 使用預設訊息', async () => {
    const { result } = renderHook(() => useDialogSubmit({ onClose: mockOnClose, successMessage: '成功' }))

    await act(async () => {
      await result.current.handleSubmit(async () => {
        throw 'unknown'
      })
    })

    expect(toast.error).toHaveBeenCalledWith('操作失敗：發生未知錯誤')
  })

  it('handleSubmit 執行中防重複提交', async () => {
    let resolveAction: (() => void) | undefined
    const action = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveAction = resolve
        }),
    )

    const { result } = renderHook(() => useDialogSubmit({ onClose: mockOnClose, successMessage: '成功' }))

    act(() => {
      result.current.handleSubmit(action)
    })

    await act(async () => {
      await result.current.handleSubmit(action)
    })

    resolveAction?.()
    expect(action).toHaveBeenCalledTimes(1)
  })

  it('handleCancel 非 submitting 時呼叫 onClose', () => {
    const { result } = renderHook(() => useDialogSubmit({ onClose: mockOnClose, successMessage: '成功' }))

    act(() => {
      result.current.handleCancel()
    })

    expect(mockOnClose).toHaveBeenCalledOnce()
  })

  it('handleCancel submitting 時 no-op', async () => {
    let resolveAction: (() => void) | undefined
    const { result } = renderHook(() => useDialogSubmit({ onClose: mockOnClose, successMessage: '成功' }))

    act(() => {
      result.current.handleSubmit(
        () =>
          new Promise<void>((resolve) => {
            resolveAction = resolve
          }),
      )
    })

    act(() => {
      result.current.handleCancel()
    })

    expect(mockOnClose).not.toHaveBeenCalled()
    resolveAction?.()
  })

  it('handleOpenChange false + 非 submitting 呼叫 onClose', () => {
    const { result } = renderHook(() => useDialogSubmit({ onClose: mockOnClose, successMessage: '成功' }))

    act(() => {
      result.current.handleOpenChange(false)
    })

    expect(mockOnClose).toHaveBeenCalledOnce()
  })

  it('handleOpenChange false + submitting 時不呼叫 onClose', async () => {
    let resolveAction: (() => void) | undefined
    const { result } = renderHook(() => useDialogSubmit({ onClose: mockOnClose, successMessage: '成功' }))

    act(() => {
      result.current.handleSubmit(
        () =>
          new Promise<void>((resolve) => {
            resolveAction = resolve
          }),
      )
    })

    act(() => {
      result.current.handleOpenChange(false)
    })

    expect(mockOnClose).not.toHaveBeenCalled()
    resolveAction?.()
  })

  it('handleOpenChange true 時不呼叫 onClose', () => {
    const { result } = renderHook(() => useDialogSubmit({ onClose: mockOnClose, successMessage: '成功' }))

    act(() => {
      result.current.handleOpenChange(true)
    })

    expect(mockOnClose).not.toHaveBeenCalled()
  })

  it('blockIfSubmitting submitting 時呼叫 event.preventDefault', async () => {
    let resolveAction: (() => void) | undefined
    const { result } = renderHook(() => useDialogSubmit({ onClose: mockOnClose, successMessage: '成功' }))

    act(() => {
      result.current.handleSubmit(
        () =>
          new Promise<void>((resolve) => {
            resolveAction = resolve
          }),
      )
    })

    const mockEvent = { preventDefault: vi.fn() }
    act(() => {
      result.current.blockIfSubmitting(mockEvent)
    })

    expect(mockEvent.preventDefault).toHaveBeenCalledOnce()
    resolveAction?.()
  })

  it('blockIfSubmitting 非 submitting 時不呼叫 event.preventDefault', () => {
    const { result } = renderHook(() => useDialogSubmit({ onClose: mockOnClose, successMessage: '成功' }))

    const mockEvent = { preventDefault: vi.fn() }
    act(() => {
      result.current.blockIfSubmitting(mockEvent)
    })

    expect(mockEvent.preventDefault).not.toHaveBeenCalled()
  })

  it('errorMessagePrefix 為空字串時直接顯示 message', async () => {
    const { result } = renderHook(() =>
      useDialogSubmit({ onClose: mockOnClose, successMessage: '成功', errorMessagePrefix: '' }),
    )

    await act(async () => {
      await result.current.handleSubmit(async () => {
        throw new Error('密碼錯誤，請重試')
      })
    })

    expect(toast.error).toHaveBeenCalledWith('密碼錯誤，請重試')
  })

  it('successMessage 為 function 時呼叫並使用回傳值', async () => {
    const successMessageFn = vi.fn(() => '新增成功：測試項目')
    const { result } = renderHook(() => useDialogSubmit({ onClose: mockOnClose, successMessage: successMessageFn }))

    await act(async () => {
      await result.current.handleSubmit(async () => {})
    })

    expect(successMessageFn).toHaveBeenCalledOnce()
    expect(toast.success).toHaveBeenCalledWith('新增成功：測試項目')
  })
})
