import { useEffect, useId, useState } from 'react'
import { Plus, X } from 'lucide-react'
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

type CategoryRow = {
  id: string
  title: string
  color: string
}

let rowCounter = 0
const createRowId = () => `row-${++rowCounter}`

const createDefaultRow = (): CategoryRow => ({
  id: createRowId(),
  title: '',
  color: DEFAULT_CATEGORY_COLOR,
})

export function CategoryDialog(props: CategoryDialogProps) {
  const { mode, open, onOpenChange } = props

  const editCategoryTitle = mode === 'edit' ? props.category.title : undefined
  const editCategoryColor = mode === 'edit' ? props.category.color : undefined

  // Store actions
  const addCategory = useDotBoardStore((state) => state.addCategory)
  const editCategory = useDotBoardStore((state) => state.editCategory)

  // Add mode: multi-row state
  const [rows, setRows] = useState<CategoryRow[]>([createDefaultRow()])

  // Edit mode: single form state
  const [formData, setFormData] = useState({
    title: '',
    color: DEFAULT_CATEGORY_COLOR,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const hasValidRow = rows.some((row) => row.title.trim() !== '')

  // Dynamic text based on mode
  const text = {
    title: mode === 'add' ? '新增版塊' : '編輯版塊',
    description: mode === 'add' ? '建立一個新的框架版塊' : '修改版塊的標題與顏色',
    submitting: mode === 'add' ? '新增中...' : '更新中...',
    confirm: '確認',
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && isSubmitting) {
      return
    }
    onOpenChange(nextOpen)
  }

  const handleSubmitAdd = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()

    const validRows = rows.filter((row) => row.title.trim() !== '')

    if (validRows.length === 0 || isSubmitting) {
      return
    }

    try {
      setIsSubmitting(true)

      for (const row of validRows) {
        await addCategory(row.title.trim(), row.color)
      }

      const names = validRows.map((r) => r.title.trim()).join('、')
      toast.success(`版塊已新增：${names}`)
      onOpenChange(false)
    } catch (error) {
      const message = error instanceof Error ? error.message : '新增版塊時發生未知錯誤'
      toast.error(`新增失敗：${message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitEdit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    const trimmedTitle = formData.title.trim()

    if (!trimmedTitle || isSubmitting) {
      return
    }

    try {
      setIsSubmitting(true)

      const { category } = props as { category: Category }
      const updatedCategory = await editCategory(category.id, {
        title: trimmedTitle,
        color: formData.color,
      })

      if (!updatedCategory || updatedCategory.isDeleted === 1) {
        throw new Error('版塊不存在或已被移除')
      }

      toast.success(`版塊已更新：${trimmedTitle}`)
      onOpenChange(false)
    } catch (error) {
      const message = error instanceof Error ? error.message : '更新版塊時發生未知錯誤'
      toast.error(`更新失敗：${message}`)
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

  // Add row handlers
  const handleAddRow = () => {
    setRows((prev) => [...prev, createDefaultRow()])
  }

  const handleRemoveRow = (id: string) => {
    setRows((prev) => prev.filter((row) => row.id !== id))
  }

  const handleRowChange = (id: string, field: 'title' | 'color', value: string) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)))
  }

  useEffect(() => {
    if (!open) return

    if (mode === 'add') {
      setRows([createDefaultRow()])
      return
    }

    if (editCategoryTitle !== undefined && editCategoryColor !== undefined) {
      setFormData({
        title: editCategoryTitle,
        color: editCategoryColor,
      })
    }
  }, [open, mode, editCategoryTitle, editCategoryColor])

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn('sm:max-w-[500px]', isSubmitting && '[&>button]:hidden')}
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
        <form onSubmit={mode === 'add' ? handleSubmitAdd : handleSubmitEdit}>
          <DialogHeader>
            <DialogTitle>{text.title}</DialogTitle>
            <DialogDescription>{text.description}</DialogDescription>
          </DialogHeader>

          {mode === 'add' ? (
            <div className="flex flex-col gap-2 py-4">
              {rows.map((row, index) => (
                <CategoryRowInput
                  key={row.id}
                  row={row}
                  index={index}
                  showRemove={rows.length >= 2}
                  isSubmitting={isSubmitting}
                  onChange={handleRowChange}
                  onRemove={handleRemoveRow}
                />
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddRow}
                disabled={isSubmitting}
                className="mt-1 w-full"
              >
                <Plus className="h-4 w-4" />
                新增一筆
              </Button>
            </div>
          ) : (
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
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
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
                      setFormData((prev) => ({
                        ...prev,
                        color: e.target.value,
                      }))
                    }
                    disabled={isSubmitting}
                    className="h-10 w-20 cursor-pointer rounded border border-slate-300 disabled:cursor-not-allowed
                      disabled:opacity-50"
                  />
                  <Input
                    value={formData.color}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        color: e.target.value,
                      }))
                    }
                    placeholder={DEFAULT_CATEGORY_COLOR}
                    disabled={isSubmitting}
                    pattern="^#[0-9A-Fa-f]{6}$"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>
              取消
            </Button>
            <Button
              type="submit"
              disabled={mode === 'add' ? !hasValidRow || isSubmitting : !formData.title.trim() || isSubmitting}
            >
              {isSubmitting ? text.submitting : text.confirm}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

type CategoryRowInputProps = {
  row: CategoryRow
  index: number
  showRemove: boolean
  isSubmitting: boolean
  onChange: (id: string, field: 'title' | 'color', value: string) => void
  onRemove: (id: string) => void
}

function CategoryRowInput({ row, index, showRemove, isSubmitting, onChange, onRemove }: CategoryRowInputProps) {
  const titleId = useId()
  const colorId = useId()

  return (
    <div className="flex items-center gap-2">
      <label htmlFor={titleId} className="sr-only">
        版塊名稱 {index + 1}
      </label>
      <Input
        id={titleId}
        value={row.title}
        onChange={(e) => onChange(row.id, 'title', e.target.value)}
        placeholder="版塊名稱"
        disabled={isSubmitting}
        autoFocus={index === 0}
        className="flex-1"
      />
      <label htmlFor={colorId} className="sr-only">
        版塊顏色 {index + 1}
      </label>
      <input
        id={colorId}
        type="color"
        value={row.color}
        onChange={(e) => onChange(row.id, 'color', e.target.value)}
        disabled={isSubmitting}
        className="h-9 w-12 cursor-pointer rounded border border-slate-300 disabled:cursor-not-allowed
          disabled:opacity-50"
      />
      {showRemove && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onRemove(row.id)}
          disabled={isSubmitting}
          aria-label={`刪除第 ${index + 1} 列`}
          className="shrink-0 px-2 text-slate-400 hover:text-red-500"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
