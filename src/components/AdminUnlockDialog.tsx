import { useState } from 'react'

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
import { useDialogSubmit } from '@/hooks/useDialogSubmit'

type AdminUnlockDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AdminUnlockDialog({ open, onOpenChange }: AdminUnlockDialogProps) {
  const unlockAdmin = useDotBoardStore((state) => state.unlockAdmin)

  const [password, setPassword] = useState('')

  const closeDialog = () => {
    setPassword('')
    onOpenChange(false)
  }

  const {
    isSubmitting,
    handleSubmit: submitDialog,
    handleCancel,
    handleOpenChange,
  } = useDialogSubmit({
    onClose: closeDialog,
    successMessage: '管理員模式已啟用',
    errorMessagePrefix: '',
  })

  const handleFormSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!password.trim()) return
    await submitDialog(async () => {
      let isValid: boolean
      try {
        isValid = unlockAdmin(password)
      } catch (error) {
        const msg = error instanceof Error ? error.message : '驗證密碼時發生未知錯誤'
        throw new Error(`驗證失敗：${msg}`)
      }
      if (!isValid) throw new Error('密碼錯誤，請重試')
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleFormSubmit}>
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
            <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>
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
