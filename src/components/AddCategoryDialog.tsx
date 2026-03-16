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

type AddCategoryDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const DEFAULT_CATEGORY_COLOR = '#3b82f6'

export function AddCategoryDialog({
  open,
  onOpenChange,
}: AddCategoryDialogProps) {
  const addCategory = useDotBoardStore((state) => state.addCategory)

  const [formData, setFormData] = useState({
    title: '',
    color: DEFAULT_CATEGORY_COLOR,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setFormData({ title: '', color: DEFAULT_CATEGORY_COLOR })
    }

    onOpenChange(nextOpen)
  }

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    const trimmedTitle = formData.title.trim()

    if (!trimmedTitle || isSubmitting) {
      return
    }

    try {
      setIsSubmitting(true)
      await addCategory(trimmedTitle, formData.color)
      toast.success(`版塊已新增：${trimmedTitle}`)
      setFormData({ title: '', color: DEFAULT_CATEGORY_COLOR })
      onOpenChange(false)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '新增版塊時發生未知錯誤'
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
            <DialogTitle>新增版塊</DialogTitle>
            <DialogDescription>建立一個新的框架版塊</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label
                htmlFor="title"
                className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                版塊名稱
              </label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="例如：React、Vue、Angular"
                autoFocus
                disabled={isSubmitting}
                required
              />
            </div>
            <div className="grid gap-2">
              <label
                htmlFor="color"
                className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                版塊顏色
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="color"
                  type="color"
                  value={formData.color}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, color: e.target.value }))
                  }
                  disabled={isSubmitting}
                  className="h-10 w-20 cursor-pointer rounded border border-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <Input
                  value={formData.color}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, color: e.target.value }))
                  }
                  placeholder={DEFAULT_CATEGORY_COLOR}
                  disabled={isSubmitting}
                  pattern="^#[0-9A-Fa-f]{6}$"
                  className="flex-1"
                />
              </div>
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
              disabled={!formData.title.trim() || isSubmitting}
            >
              {isSubmitting ? '新增中...' : '確認'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
