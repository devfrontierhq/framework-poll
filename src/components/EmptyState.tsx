export function EmptyState() {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white/50 p-12 text-center shadow-sm backdrop-blur-sm">
      <h2 className="mb-2 text-2xl font-bold text-slate-900">尚無版塊</h2>
      <p className="max-w-md text-slate-600">管理員目前還沒有建立任何版塊</p>
    </div>
  )
}
