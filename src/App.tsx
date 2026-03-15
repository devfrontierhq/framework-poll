import { useEffect } from 'react'

import { useDotBoardStore } from '@/store/dotBoardStore'

function App() {
  const loadData = useDotBoardStore((state) => state.loadData)

  useEffect(() => {
    loadData()
  }, [loadData])

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <header className="text-center">
          <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
            Framework Poll
          </h1>
          <p className="mt-4 text-lg text-slate-700">快速登記你使用的框架</p>
        </header>

        {/* TODO: Add CategoryGrid component */}
        {/* TODO: Add EmptyState component */}
        {/* TODO: Add admin controls */}
      </div>
    </main>
  )
}

export default App
