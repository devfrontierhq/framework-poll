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
import { useDotBoardStore } from '@/store/dotBoardStore'

type AdminUnlockDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AdminUnlockDialog({
  open,
  onOpenChange,
}: AdminUnlockDialogProps) {
  const unlockAdmin = useDotBoardStore((state) => state.unlockAdmin)

  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setPassword('')
    }

    onOpenChange(nextOpen)
  }

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    const trimmedPassword = password.trim()

    if (!trimmedPassword || isSubmitting) {
      return
    }

    try {
      setIsSubmitting(true)
      const isValid = unlockAdmin(trimmedPassword)

      if (isValid) {
        toast.success('管理員模式已啟用')
        setPassword('')
        onOpenChange(false)
      } else {
        toast.error('密碼錯誤，請重試')
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '驗證密碼時發生未知錯誤'
      toast.error(`驗證失敗：${message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (isSubmitting) {
      return
    }

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>管理員驗證</DialogTitle>
            <DialogDescription>請輸入密碼以啟用管理功能</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label
                htmlFor="password"
                className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                密碼
              </label>
              <Input
                id="password"
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
            <Button type="submit" disabled={!password.trim() || isSubmitting}>
              {isSubmitting ? '驗證中...' : '解鎖'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
