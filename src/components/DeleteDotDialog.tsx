import type { Dot } from '@/types/dotBoard'

import { useDotBoardStore } from '@/store/dotBoardStore'
import { PasswordConfirmDialog } from '@/components/PasswordConfirmDialog'

type DeleteDotDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  dot: Dot
}

export function DeleteDotDialog({
  open,
  onOpenChange,
  dot,
}: DeleteDotDialogProps) {
  const removeDot = useDotBoardStore((state) => state.removeDot)

  const handleConfirm = async (password: string) => {
    const deletedDot = await removeDot(dot.id, password)

    if (!deletedDot) {
      throw new Error('圓點不存在或已被移除')
    }
  }

  return (
    <PasswordConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="刪除圓點"
      description={`確定要刪除「${dot.name}」嗎？此操作無法復原。`}
      itemName={dot.name}
      onConfirm={handleConfirm}
      successMessage={`圓點已刪除：${dot.name}`}
    />
  )
}
