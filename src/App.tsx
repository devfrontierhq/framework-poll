import { useEffect, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { Lock, Unlock, Plus } from 'lucide-react'

import { useDotBoardStore } from '@/store/dotBoardStore'
import {
  selectCategoryList,
  selectDotsByCategory,
  selectCategoryCount,
} from '@/store/selectors'

import { Button } from '@/components/ui/button'

import { EmptyState } from '@/components/EmptyState'
import { CategoryGrid } from '@/components/CategoryGrid'
import { AdminUnlockDialog } from '@/components/AdminUnlockDialog'
import { CategoryDialog } from '@/components/CategoryDialog'

function App() {
  const [showAdminUnlockDialog, setShowAdminUnlockDialog] = useState(false)
  const [showAddCategoryDialog, setShowAddCategoryDialog] = useState(false)

  const loadData = useDotBoardStore((state) => state.loadData)
  const lockAdmin = useDotBoardStore((state) => state.lockAdmin)
  const categoryCount = useDotBoardStore(selectCategoryCount)

  const categoryList = useDotBoardStore(selectCategoryList)
  const dotsByCategory = useDotBoardStore(selectDotsByCategory)

  const { isInitialized, isLoading, loadError, isAdminUnlocked } =
    useDotBoardStore(
      useShallow((state) => ({
        isInitialized: state.isInitialized,
        isLoading: state.isLoading,
        loadError: state.loadError,
        isAdminUnlocked: state.isAdminUnlocked,
      })),
    )

  const handleUnlockClick = () => {
    setShowAdminUnlockDialog(true)
  }

  const handleLockClick = () => {
    lockAdmin()
  }

  const handleAddCategoryClick = () => {
    setShowAddCategoryDialog(true)
  }

  useEffect(() => {
    loadData()
  }, [loadData])

  function renderContent() {
    if (isLoading || (!isInitialized && !loadError)) {
      return (
        <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-slate-200 bg-white/50 p-12 text-center text-slate-600 shadow-sm backdrop-blur-sm">
          載入中...
        </div>
      )
    }

    if (loadError) {
      return (
        <div
          className="flex min-h-[400px] items-center justify-center rounded-2xl border border-rose-200 bg-rose-50/80 p-12 text-center text-rose-700 shadow-sm"
          role="alert"
        >
          載入資料失敗：{loadError}
        </div>
      )
    }

    if (categoryCount === 0) {
      return <EmptyState />
    }

    return (
      <CategoryGrid categories={categoryList} dotsByCategory={dotsByCategory} />
    )
  }

  return (
    <main className="h-screen bg-slate-50 px-6 py-16">
      <div className="mx-auto flex h-full max-w-6xl flex-col gap-10">
        <header className="text-center">
          <div className="flex items-center justify-between">
            <div className="flex-1" />
            <div className="flex-1">
              <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
                Framework Poll
              </h1>
              <p className="mt-4 text-lg text-slate-700">
                快來登記你使用的框架
              </p>
            </div>
            <div className="flex flex-1 justify-end gap-2">
              {isAdminUnlocked ? (
                <>
                  <Button
                    onClick={handleAddCategoryClick}
                    variant="default"
                    size="sm"
                  >
                    <Plus className="h-4 w-4" />
                    新增版塊
                  </Button>
                  <Button onClick={handleLockClick} variant="outline" size="sm">
                    <Lock className="h-4 w-4" />
                    鎖定
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

      <AdminUnlockDialog
        open={showAdminUnlockDialog}
        onOpenChange={setShowAdminUnlockDialog}
      />
      <CategoryDialog
        mode="add"
        open={showAddCategoryDialog}
        onOpenChange={setShowAddCategoryDialog}
      />
    </main>
  )
}

export default App
