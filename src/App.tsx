import { useEffect } from 'react'
import { useShallow } from 'zustand/react/shallow'

import { useDotBoardStore } from '@/store/dotBoardStore'
import { EmptyState } from '@/components/EmptyState'
import { CategoryGrid } from '@/components/CategoryGrid'

function App() {
  const loadData = useDotBoardStore((state) => state.loadData)
  const categories = useDotBoardStore((state) => state.categories)
  const dots = useDotBoardStore((state) => state.dots)

  const { isInitialized, isLoading, loadError } = useDotBoardStore(
    useShallow((state) => ({
      isInitialized: state.isInitialized,
      isLoading: state.isLoading,
      loadError: state.loadError,
    })),
  )

  const categoryList = Array.from(categories.values())

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

    if (categories.size === 0) {
      return <EmptyState />
    }

    return <CategoryGrid categories={categoryList} dots={dots} />
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <header className="text-center">
          <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
            Framework Poll
          </h1>
          <p className="mt-4 text-lg text-slate-700">快速登記你使用的框架</p>
        </header>

        {renderContent()}

        {/* TODO: Add admin controls */}
      </div>
    </main>
  )
}

export default App
