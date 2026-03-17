import { toast } from 'sonner'
import { Button } from './ui/button'

import { useDotBoardStore } from '@/store/dotBoardStore'

export function EmptyState() {
  const initializeDefaultCategories = useDotBoardStore((state) => state.initializeDefaultCategories)
  const isSeedingDefaultCategories = useDotBoardStore((state) => state.isSeedingDefaultCategories)

  async function handleInitializeDefaultCategories() {
    try {
      await initializeDefaultCategories()
      toast.success('預設板塊建立成功')
    } catch (error) {
      const message = error instanceof Error ? error.message : '建立預設板塊時發生未知錯誤'
      toast.error(`建立預設板塊失敗：${message}`)
    }
  }

  return (
    <div
      className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white/50
        p-12 text-center shadow-sm backdrop-blur-sm"
    >
      <h2 className="mb-2 text-2xl font-bold text-slate-900">尚無版塊</h2>
      <p className="mb-6 max-w-md text-slate-600">
        {import.meta.env.DEV ? '管理員目前還沒有建立任何版塊' : '等待管理員建立版塊'}
      </p>
      {import.meta.env.DEV && (
        <Button
          onClick={handleInitializeDefaultCategories}
          variant="default"
          size="lg"
          disabled={isSeedingDefaultCategories}
        >
          {isSeedingDefaultCategories ? '建立中...' : '建立預設框架板塊（React、Vue、Angular）'}
        </Button>
      )}
    </div>
  )
}
