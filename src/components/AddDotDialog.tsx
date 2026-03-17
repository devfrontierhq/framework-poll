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

import { useDialogSubmit } from '@/hooks/useDialogSubmit'

type AddDotDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  categoryTitle: string
  onSubmit: (name: string) => Promise<void> | void
}

export function AddDotDialog({ open, onOpenChange, categoryTitle, onSubmit }: AddDotDialogProps) {
  const [name, setName] = useState('')

  const closeDialog = () => {
    setName('')
    onOpenChange(false)
  }

  const {
    isSubmitting,
    handleSubmit: submitDialog,
    handleCancel,
    handleOpenChange,
  } = useDialogSubmit({
    onClose: closeDialog,
    successMessage: () => `新增成功：${name.trim()}`,
    errorMessagePrefix: '新增失敗',
  })

  const handleFormSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) return
    await submitDialog(() => Promise.resolve(onSubmit(trimmedName)))
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleFormSubmit}>
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
            <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>
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
