import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLongPress } from '../useLongPress'

function makeTouchEvent(x = 0, y = 0): React.TouchEvent {
  return {
    touches: [{ clientX: x, clientY: y }],
  } as unknown as React.TouchEvent
}

describe('useLongPress', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('初始狀態 isPressed 為 false，didLongPress.current 為 false', () => {
    const onLongPress = vi.fn()
    const { result } = renderHook(() => useLongPress({ onLongPress }))

    expect(result.current.isPressed).toBe(false)
    expect(result.current.didLongPress.current).toBe(false)
  })

  it('500ms 後觸發 onLongPress，isPressed 變為 true', () => {
    const onLongPress = vi.fn()
    const { result } = renderHook(() => useLongPress({ onLongPress }))

    act(() => {
      result.current.handlers.onTouchStart(makeTouchEvent(0, 0))
    })

    expect(onLongPress).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(onLongPress).toHaveBeenCalledOnce()
    expect(result.current.isPressed).toBe(true)
    expect(result.current.didLongPress.current).toBe(true)
  })

  it('計時器未到 500ms 不觸發 onLongPress', () => {
    const onLongPress = vi.fn()
    const { result } = renderHook(() => useLongPress({ onLongPress }))

    act(() => {
      result.current.handlers.onTouchStart(makeTouchEvent())
    })

    act(() => {
      vi.advanceTimersByTime(499)
    })

    expect(onLongPress).not.toHaveBeenCalled()
  })

  it('自訂 delay 參數', () => {
    const onLongPress = vi.fn()
    const { result } = renderHook(() => useLongPress({ onLongPress, delay: 300 }))

    act(() => {
      result.current.handlers.onTouchStart(makeTouchEvent())
    })

    act(() => {
      vi.advanceTimersByTime(299)
    })

    expect(onLongPress).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(1)
    })

    expect(onLongPress).toHaveBeenCalledOnce()
  })

  it('touchend 在長按前取消，不觸發 onLongPress', () => {
    const onLongPress = vi.fn()
    const { result } = renderHook(() => useLongPress({ onLongPress }))

    act(() => {
      result.current.handlers.onTouchStart(makeTouchEvent())
    })

    act(() => {
      vi.advanceTimersByTime(300)
      result.current.handlers.onTouchEnd()
    })

    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(onLongPress).not.toHaveBeenCalled()
    expect(result.current.isPressed).toBe(false)
  })

  it('touchmove 超過閾值取消計時，不觸發 onLongPress', () => {
    const onLongPress = vi.fn()
    const { result } = renderHook(() => useLongPress({ onLongPress }))

    act(() => {
      result.current.handlers.onTouchStart(makeTouchEvent(0, 0))
    })

    act(() => {
      result.current.handlers.onTouchMove(makeTouchEvent(20, 0)) // 超過 10px 閾值
    })

    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(onLongPress).not.toHaveBeenCalled()
  })

  it('touchmove 未超過閾值，長按仍可觸發', () => {
    const onLongPress = vi.fn()
    const { result } = renderHook(() => useLongPress({ onLongPress }))

    act(() => {
      result.current.handlers.onTouchStart(makeTouchEvent(0, 0))
    })

    act(() => {
      result.current.handlers.onTouchMove(makeTouchEvent(3, 3)) // 約 4.2px，未超過閾值
    })

    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(onLongPress).toHaveBeenCalledOnce()
  })

  it('自訂 moveThreshold 參數', () => {
    const onLongPress = vi.fn()
    const { result } = renderHook(() => useLongPress({ onLongPress, moveThreshold: 5 }))

    act(() => {
      result.current.handlers.onTouchStart(makeTouchEvent(0, 0))
    })

    act(() => {
      result.current.handlers.onTouchMove(makeTouchEvent(8, 0)) // 超過自訂 5px 閾值
    })

    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(onLongPress).not.toHaveBeenCalled()
  })

  it('cancel 時呼叫 onCancel callback', () => {
    const onLongPress = vi.fn()
    const onCancel = vi.fn()
    const { result } = renderHook(() => useLongPress({ onLongPress, onCancel }))

    act(() => {
      result.current.handlers.onTouchStart(makeTouchEvent())
      result.current.handlers.onTouchEnd()
    })

    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('touchmove 超過閾值時呼叫 onAbort，touchend 不呼叫 onAbort', () => {
    const onAbort = vi.fn()
    const onCancel = vi.fn()
    const { result } = renderHook(() => useLongPress({ onLongPress: vi.fn(), onCancel, onAbort }))

    // touchend 呼叫 onCancel 但不呼叫 onAbort
    act(() => {
      result.current.handlers.onTouchStart(makeTouchEvent(0, 0))
    })
    act(() => {
      result.current.handlers.onTouchEnd()
    })
    expect(onCancel).toHaveBeenCalledOnce()
    expect(onAbort).not.toHaveBeenCalled()

    // touchmove 超過閾值呼叫 onCancel 也呼叫 onAbort
    act(() => {
      result.current.handlers.onTouchStart(makeTouchEvent(0, 0))
    })
    act(() => {
      result.current.handlers.onTouchMove(makeTouchEvent(20, 0))
    })
    expect(onCancel).toHaveBeenCalledTimes(2)
    expect(onAbort).toHaveBeenCalledOnce()
  })

  it('touchmove 未超過閾值，不呼叫 onAbort', () => {
    const onAbort = vi.fn()
    const { result } = renderHook(() => useLongPress({ onLongPress: vi.fn(), onAbort }))

    act(() => {
      result.current.handlers.onTouchStart(makeTouchEvent(0, 0))
    })
    act(() => {
      result.current.handlers.onTouchMove(makeTouchEvent(3, 0))
    }) // 未超過閾值

    expect(onAbort).not.toHaveBeenCalled()
  })

  it('touchcancel 取消計時，呼叫 onCancel 和 onAbort', () => {
    const onCancel = vi.fn()
    const onAbort = vi.fn()
    const onLongPress = vi.fn()
    const { result } = renderHook(() => useLongPress({ onLongPress, onCancel, onAbort }))

    act(() => {
      result.current.handlers.onTouchStart(makeTouchEvent())
    })
    act(() => {
      result.current.handlers.onTouchCancel()
    })
    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(onLongPress).not.toHaveBeenCalled()
    expect(onCancel).toHaveBeenCalledOnce()
    expect(onAbort).toHaveBeenCalledOnce()
    expect(result.current.isPressed).toBe(false)
  })

  it('onContextMenu 阻止預設行為（防止瀏覽器長按選單）', () => {
    const onLongPress = vi.fn()
    const { result } = renderHook(() => useLongPress({ onLongPress }))

    const mockEvent = { preventDefault: vi.fn() } as unknown as React.MouseEvent
    result.current.handlers.onContextMenu(mockEvent)

    expect(mockEvent.preventDefault).toHaveBeenCalledOnce()
  })

  it('touchend 後 didLongPress.current 仍為 true，呼叫 clearLongPress 後才重置', () => {
    const onLongPress = vi.fn()
    const { result } = renderHook(() => useLongPress({ onLongPress }))

    act(() => {
      result.current.handlers.onTouchStart(makeTouchEvent())
      vi.advanceTimersByTime(500)
    })
    expect(result.current.didLongPress.current).toBe(true)

    act(() => {
      result.current.handlers.onTouchEnd()
    })
    expect(result.current.didLongPress.current).toBe(true) // 仍保留，供合成 click 消費

    act(() => {
      result.current.clearLongPress()
    })
    expect(result.current.didLongPress.current).toBe(false)
  })

  it('touchend 在長按成功後呼叫 onRelease，而非 onCancel', () => {
    const onLongPress = vi.fn()
    const onCancel = vi.fn()
    const onRelease = vi.fn()
    const { result } = renderHook(() => useLongPress({ onLongPress, onCancel, onRelease }))

    // 完成長按
    act(() => {
      result.current.handlers.onTouchStart(makeTouchEvent())
      vi.advanceTimersByTime(500)
    })
    expect(onLongPress).toHaveBeenCalledOnce()

    // 放開手指
    act(() => {
      result.current.handlers.onTouchEnd()
    })

    expect(onRelease).toHaveBeenCalledOnce()
    expect(onCancel).not.toHaveBeenCalled()
  })

  it('touchend 在長按前放開，呼叫 onCancel 而非 onRelease', () => {
    const onCancel = vi.fn()
    const onRelease = vi.fn()
    const { result } = renderHook(() => useLongPress({ onLongPress: vi.fn(), onCancel, onRelease }))

    act(() => {
      result.current.handlers.onTouchStart(makeTouchEvent())
      vi.advanceTimersByTime(300) // 不到 500ms
      result.current.handlers.onTouchEnd()
    })

    expect(onCancel).toHaveBeenCalledOnce()
    expect(onRelease).not.toHaveBeenCalled()
  })

  it('touchstart 重置 didLongPress.current 為 false', () => {
    const onLongPress = vi.fn()
    const { result } = renderHook(() => useLongPress({ onLongPress }))

    // 完成一次長按
    act(() => {
      result.current.handlers.onTouchStart(makeTouchEvent())
      vi.advanceTimersByTime(500)
    })

    expect(result.current.didLongPress.current).toBe(true)

    // 開始新的觸摸，應重置
    act(() => {
      result.current.handlers.onTouchStart(makeTouchEvent())
    })

    expect(result.current.didLongPress.current).toBe(false)
  })
})
