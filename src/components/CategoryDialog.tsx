import { useEffect, useState } from 'react'
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

import type { Category } from '@/types/dotBoard'

import { useDotBoardStore } from '@/store/dotBoardStore'

const DEFAULT_CATEGORY_COLOR = '#3b82f6'

type CategoryDialogProps =
  | {
      mode: 'add'
      open: boolean
      onOpenChange: (open: boolean) => void
    }
  | {
      mode: 'edit'
      open: boolean
      onOpenChange: (open: boolean) => void
      category: Category
    }

export function CategoryDialog(props: CategoryDialogProps) {
  const { mode, open, onOpenChange } = props
  const editCategoryTitle = mode === 'edit' ? props.category.title : undefined
  const editCategoryColor = mode === 'edit' ? props.category.color : undefined

  // Store actions
  const addCategory = useDotBoardStore((state) => state.addCategory)
  const editCategory = useDotBoardStore((state) => state.editCategory)

  const [formData, setFormData] = useState({
    title: '',
    color: DEFAULT_CATEGORY_COLOR,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Dynamic text based on mode
  const text = {
    title: mode === 'add' ? '新增版塊' : '編輯版塊',
    description:
      mode === 'add' ? '建立一個新的框架版塊' : '修改版塊的標題與顏色',
    submitting: mode === 'add' ? '新增中...' : '更新中...',
    confirm: '確認',
  }

  const handleOpenChange = (nextOpen: boolean) => {
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

      if (mode === 'add') {
        await addCategory(trimmedTitle, formData.color)
        toast.success(`版塊已新增：${trimmedTitle}`)
      } else {
        const { category } = props

        const updatedCategory = await editCategory(category.id, {
          title: trimmedTitle,
          color: formData.color,
        })

        if (!updatedCategory || updatedCategory.isDeleted === 1) {
          throw new Error('版塊不存在或已被移除')
        }

        toast.success(`版塊已更新：${trimmedTitle}`)
      }

      onOpenChange(false)
    } catch (error) {
      const action = mode === 'add' ? '新增' : '更新'
      const message =
        error instanceof Error ? error.message : `${action}版塊時發生未知錯誤`
      toast.error(`${action}失敗：${message}`)
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

  useEffect(() => {
    if (!open) return

    if (
      mode === 'edit' &&
      editCategoryTitle !== undefined &&
      editCategoryColor !== undefined
    ) {
      setFormData({
        title: editCategoryTitle,
        color: editCategoryColor,
      })
      return
    }

    setFormData({ title: '', color: DEFAULT_CATEGORY_COLOR })
  }, [open, mode, editCategoryTitle, editCategoryColor])

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{text.title}</DialogTitle>
            <DialogDescription>{text.description}</DialogDescription>
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
              {isSubmitting ? text.submitting : text.confirm}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
