import { format } from 'date-fns'

import type { Category, CsvRow, Dot } from '@/types/dotBoard'

const FORMULA_PREFIX_PATTERN = /^[=+\-@\t\r]/

/**
 * 格式化日期時間為 CSV 格式 (yyyy-MM-dd HH:mm)
 * @param date ISO 8601 日期字串或 null
 * @returns 格式化的日期字串
 */
export function formatCsvDateTime(date: string | null): string {
  if (date === null) {
    return ''
  }

  return format(new Date(date), 'yyyy-MM-dd HH:mm')
}

/**
 * 建立 CSV 資料
 * @param dots 所有圓點資料（包含已刪除）
 * @param categories 所有版塊資料（包含已刪除）
 * @returns CSV 資料陣列
 */
export function buildCsvRows(dots: Dot[], categories: Category[]): CsvRow[] {
  const categoryMap = new Map(categories.map((c) => [c.id, c]))

  return dots.map((dot) => {
    const category = categoryMap.get(dot.categoryId)

    if (!category) {
      console.warn(
        `Category not found for dot ${dot.id} (categoryId: ${dot.categoryId})`,
      )
    }

    return {
      categoryTitle: category?.title ?? `[MISSING: ${dot.categoryId}]`,
      dotName: dot.name,
      createdAt: formatCsvDateTime(dot.createdAt),
      deletedAt: formatCsvDateTime(dot.deletedAt),
    }
  })
}

/**
 * 跳脫 CSV 欄位（處理逗號、引號、換行、公式注入）
 *
 * Formula-like values are prefixed with an apostrophe before CSV escaping so
 * spreadsheet apps render them as literal text instead of evaluating them.
 */
function escapeCsvField(field: string): string {
  const safeField = FORMULA_PREFIX_PATTERN.test(field) ? `'${field}` : field
  const needsQuoting =
    safeField.includes(',') || // CSV delimiter
    safeField.includes('"') || // Quote character
    safeField.includes('\n') || // Line feed
    safeField.includes('\r') // Carriage return

  if (needsQuoting) {
    // Escape internal quotes by doubling them, then wrap entire field.
    return `"${safeField.replace(/"/g, '""')}"`
  }

  return safeField
}

/**
 * 下載 CSV 檔案（UTF-8 with BOM）
 * @param rows CSV 資料列陣列
 */
export function downloadCsv(rows: CsvRow[]): void {
  const headers = ['版塊名稱', '項目名稱', '建立日期', '刪除日期']
  const headerRow = headers.join(',')

  const dataRows = rows.map((row) => {
    return [
      escapeCsvField(row.categoryTitle),
      escapeCsvField(row.dotName),
      escapeCsvField(row.createdAt),
      escapeCsvField(row.deletedAt),
    ].join(',')
  })

  // 組合完整 CSV（加入 UTF-8 BOM）
  const BOM = '\uFEFF'
  const csvContent = BOM + [headerRow, ...dataRows].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  // 產生檔名（含時間戳記）
  const timestamp = format(new Date(), 'yyyy-MM-dd_HHmmss')
  const filename = `framework-poll-${timestamp}.csv`

  // 觸發下載
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()

  // 清理（延遲到下一個渲染週期，確保下載已開始）
  requestAnimationFrame(() => {
    URL.revokeObjectURL(url)
  })
}
