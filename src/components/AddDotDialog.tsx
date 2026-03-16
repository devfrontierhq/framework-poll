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

type AddDotDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  categoryTitle: string
  onSubmit: (name: string) => Promise<void> | void
}

export function AddDotDialog({
  open,
  onOpenChange,
  categoryTitle,
  onSubmit,
}: AddDotDialogProps) {
  const [name, setName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setName('')
    }

    onOpenChange(nextOpen)
  }

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    const trimmedName = name.trim()

    if (!trimmedName || isSubmitting) {
      return
    }

    try {
      setIsSubmitting(true)
      await onSubmit(trimmedName)
      toast.success(`新增成功：${trimmedName}`)
      setName('')
      onOpenChange(false)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '新增名稱時發生未知錯誤'
      toast.error(`新增失敗：${message}`)
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
            <DialogTitle>新增</DialogTitle>
            <DialogDescription>{categoryTitle}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label
                htmlFor="name"
                className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                名字
              </label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="輸入您的名字"
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
            <Button type="submit" disabled={!name.trim() || isSubmitting}>
              {isSubmitting ? '新增中...' : '確認'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
