import { useRef, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { Unlock, Plus, Grid2X2 } from 'lucide-react'

import { useMountEffect } from '@/hooks/useMountEffect'
import { useDotBoardStore } from '@/store/dotBoardStore'
import { selectCategoryList, selectDotsByCategory, selectCategoryCount } from '@/store/selectors'

import { Button } from '@/components/ui/button'

import { EmptyState } from '@/components/EmptyState'
import { CategoryGrid, type CategoryGridHandle } from '@/components/CategoryGrid'
import { AdminUnlockDialog } from '@/components/AdminUnlockDialog'
import { CategoryDialog } from '@/components/CategoryDialog'
import { ExportCsvButton } from '@/components/ExportCsvButton'
import { computeGridLayout } from '@/utils/arrangeDotsLayout'

function App() {
  const [activeDialog, setActiveDialog] = useState<'unlock' | 'addCategory' | null>(null)
  const [isArranging, setIsArranging] = useState(false)
  const categoryGridRef = useRef<CategoryGridHandle>(null)

  const loadData = useDotBoardStore((state) => state.loadData)
  const lockAdmin = useDotBoardStore((state) => state.lockAdmin)
  const arrangeDots = useDotBoardStore((state) => state.arrangeDots)

  const categoryCount = useDotBoardStore(selectCategoryCount)
  const categoryList = useDotBoardStore(selectCategoryList)
  const dotsByCategory = useDotBoardStore(selectDotsByCategory)

  const { isInitialized, isLoading, loadError, isAdminUnlocked } = useDotBoardStore(
    useShallow((state) => ({
      isInitialized: state.isInitialized,
      isLoading: state.isLoading,
      loadError: state.loadError,
      isAdminUnlocked: state.isAdminUnlocked,
    })),
  )

  const closeDialog = () => setActiveDialog(null)

  const handleAddCategoryClick = () => setActiveDialog('addCategory')
  const handleUnlockClick = () => setActiveDialog('unlock')

  const handleLockClick = () => {
    lockAdmin()
    closeDialog()
  }

  const handleArrangeDots = async () => {
    if (!categoryGridRef.current) return
    setIsArranging(true)
    try {
      const rects = categoryGridRef.current.getCardRects()
      const updates = categoryList.flatMap((category) => {
        const rect = rects.get(category.id)
        if (!rect) return []
        const dots = dotsByCategory.get(category.id) ?? []
        return computeGridLayout(dots, rect.width, rect.height)
      })
      await arrangeDots(updates)
    } finally {
      setIsArranging(false)
    }
  }

  useMountEffect(() => {
    loadData()
  })

  function renderContent() {
    if (isLoading || (!isInitialized && !loadError)) {
      return (
        <div
          className="flex min-h-[400px] items-center justify-center rounded-2xl border border-slate-200 bg-white/50 p-12
            text-center text-slate-600 shadow-sm backdrop-blur-sm"
        >
          載入中...
        </div>
      )
    }

    if (loadError) {
      return (
        <div
          className="flex min-h-[400px] items-center justify-center rounded-2xl border border-rose-200 bg-rose-50/80
            p-12 text-center text-rose-700 shadow-sm"
          role="alert"
        >
          載入資料失敗：{loadError}
        </div>
      )
    }

    if (categoryCount === 0) {
      return <EmptyState />
    }

    return <CategoryGrid ref={categoryGridRef} categories={categoryList} dotsByCategory={dotsByCategory} />
  }

  return (
    <main className="h-screen bg-slate-50">
      {isAdminUnlocked && (
        <div
          className="relative flex h-12 items-center justify-center bg-amber-50 px-6 text-sm font-medium text-amber-900"
        >
          <span>管理模式已啟用</span>
          <Button onClick={handleLockClick} variant="outline" size="sm" className="absolute right-6">
            退出
          </Button>
        </div>
      )}

      <div
        className={`mx-auto flex max-w-6xl flex-col gap-10 px-6 py-16 ${
          isAdminUnlocked ? 'h-[calc(100vh-3rem)]' : 'h-full'
        }`}
      >
        <header className="text-center">
          <div className="flex flex-col items-center gap-6 sm:grid sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-4">
            <div className="hidden sm:block" />
            <div className="w-full sm:max-w-none">
              <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">Framework Poll</h1>
              <p className="mt-4 text-lg text-slate-700">快來登記你使用的框架</p>
            </div>
            <div className="flex w-full justify-center gap-2 sm:justify-end">
              {isAdminUnlocked ? (
                <>
                  <ExportCsvButton />
                  <Button onClick={handleArrangeDots} disabled={isArranging} variant="outline" size="sm">
                    <Grid2X2 className="h-4 w-4" />
                    排列整齊
                  </Button>
                  <Button onClick={handleAddCategoryClick} variant="default" size="sm">
                    <Plus className="h-4 w-4" />
                    新增版塊
                  </Button>
                </>
              ) : (
                <Button onClick={handleUnlockClick} variant="outline" size="sm">
                  <Unlock className="h-4 w-4" />
                  管理模式
                </Button>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1">{renderContent()}</div>
      </div>

      <AdminUnlockDialog open={activeDialog === 'unlock'} onOpenChange={(open) => !open && closeDialog()} />
      <CategoryDialog
        key={activeDialog === 'addCategory' ? 'open' : 'closed'}
        mode="add"
        open={activeDialog === 'addCategory'}
        onOpenChange={(open) => !open && closeDialog()}
      />
    </main>
  )
}

export default App
