import type { Category } from '@/types/dotBoard'

import { useDotBoardStore } from '@/store/dotBoardStore'
import { PasswordConfirmDialog } from '@/components/PasswordConfirmDialog'

type DeleteCategoryDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: Category
}

export function DeleteCategoryDialog({
  open,
  onOpenChange,
  category,
}: DeleteCategoryDialogProps) {
  const removeCategory = useDotBoardStore((state) => state.removeCategory)

  const handleConfirm = async (password: string) => {
    const deletedCategory = await removeCategory(category.id, password)

    if (!deletedCategory) {
      throw new Error('版塊不存在或已被移除')
    }
  }

  return (
    <PasswordConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="刪除版塊"
      description={`確定要刪除「${category.title}」嗎？此操作會連帶刪除所有圓點。`}
      itemName={category.title}
      onConfirm={handleConfirm}
      successMessage={`版塊已刪除：${category.title}`}
    />
  )
}
