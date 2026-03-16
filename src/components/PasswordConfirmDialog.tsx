import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

type PasswordConfirmDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  itemName: string
  onConfirm: (password: string) => Promise<void>
  successMessage: string
  errorMessagePrefix?: string
}

export function PasswordConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  itemName,
  onConfirm,
  successMessage,
  errorMessagePrefix = '刪除失敗',
}: PasswordConfirmDialogProps) {
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const closeDialog = () => {
    setPassword('')
    onOpenChange(false)
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      if (isSubmitting) {
        return
      }
      closeDialog()
      return
    }
    onOpenChange(nextOpen)
  }

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!password.trim() || isSubmitting) {
      return
    }

    try {
      setIsSubmitting(true)
      await onConfirm(password)
      toast.success(successMessage)
      closeDialog()
    } catch (error) {
      const message = error instanceof Error ? error.message : '發生未知錯誤'
      toast.error(`${errorMessagePrefix}：${message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (isSubmitting) {
      return
    }
    closeDialog()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn('sm:max-w-[425px]', isSubmitting && '[&>button]:hidden')}
        onEscapeKeyDown={(event) => {
          if (isSubmitting) {
            event.preventDefault()
          }
        }}
        onPointerDownOutside={(event) => {
          if (isSubmitting) {
            event.preventDefault()
          }
        }}
      >
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label
                htmlFor={`password-confirm-${itemName}`}
                className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                請輸入管理員密碼以確認刪除
              </label>
              <Input
                id={`password-confirm-${itemName}`}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="輸入管理員密碼"
                autoFocus
                disabled={isSubmitting}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              取消
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={!password.trim() || isSubmitting}
            >
              {isSubmitting ? '刪除中...' : '確認刪除'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
