import { useEffect, useRef, useState } from 'react'

type UseLongPressOptions = {
  onLongPress: () => void
  onCancel?: () => void
  onRelease?: () => void
  onAbort?: () => void
  delay?: number
  moveThreshold?: number
}

export function useLongPress({
  onLongPress,
  onCancel,
  onRelease,
  onAbort,
  delay = 500,
  moveThreshold = 10,
}: UseLongPressOptions) {
  const [isPressed, setIsPressed] = useState(false)

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const didLongPress = useRef(false)
  const startPos = useRef<{ x: number; y: number } | null>(null)

  const start = (e: React.TouchEvent) => {
    didLongPress.current = false
    const touch = e.touches[0]
    startPos.current = { x: touch.clientX, y: touch.clientY }

    timerRef.current = setTimeout(() => {
      didLongPress.current = true
      setIsPressed(true)
      onLongPress()
    }, delay)
  }

  const cancel = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }
    setIsPressed(false)
    startPos.current = null

    if (didLongPress.current) {
      onRelease?.()
    } else {
      onCancel?.()
    }
  }

  const clearLongPress = () => {
    didLongPress.current = false
  }

  const abort = () => {
    onAbort?.()
    cancel()
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!startPos.current) return
    const touch = e.touches[0]
    const dx = touch.clientX - startPos.current.x
    const dy = touch.clientY - startPos.current.y
    if (Math.sqrt(dx * dx + dy * dy) > moveThreshold) {
      abort()
    }
  }

  const handlers = {
    onTouchStart: start,
    onTouchEnd: cancel,
    onTouchMove: handleTouchMove,
    onTouchCancel: abort,
    onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  return { handlers, isPressed, didLongPress, clearLongPress }
}
