import { useState } from 'react'
import { toast } from 'sonner'

type UseDialogSubmitOptions = {
  onClose: () => void
  successMessage: string | (() => string)
  errorMessagePrefix?: string
}

export function useDialogSubmit({ onClose, successMessage, errorMessagePrefix = '操作失敗' }: UseDialogSubmitOptions) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (action: () => Promise<void>) => {
    if (isSubmitting) return

    try {
      setIsSubmitting(true)
      await action()
      const message = typeof successMessage === 'function' ? successMessage() : successMessage
      toast.success(message)
      onClose()
    } catch (error) {
      const message = error instanceof Error ? error.message : '發生未知錯誤'
      toast.error(errorMessagePrefix ? `${errorMessagePrefix}：${message}` : message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (!isSubmitting) onClose()
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && isSubmitting) return
    if (!nextOpen) onClose()
  }

  const blockIfSubmitting = (event: { preventDefault: () => void }) => {
    if (isSubmitting) event.preventDefault()
  }

  return { isSubmitting, handleSubmit, handleCancel, handleOpenChange, blockIfSubmitting }
}
