import { useState } from 'react'
import { Download } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'

import { useDotBoardStore } from '@/store/dotBoardStore'

export function ExportCsvButton() {
  const exportCsv = useDotBoardStore((state) => state.exportCsv)

  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    try {
      setIsExporting(true)
      await exportCsv()
      toast.success('CSV 匯出成功')
    } catch (error) {
      console.error('CSV export failed:', error)
      toast.error('CSV 匯出失敗，請稍後再試')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Button
      onClick={handleExport}
      variant="outline"
      size="sm"
      disabled={isExporting}
    >
      <Download className="h-4 w-4" />
      {isExporting ? '匯出中...' : '匯出 CSV'}
    </Button>
  )
}
