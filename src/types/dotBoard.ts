export type Category = {
  id: string
  title: string
  color: string
  sortOrder: number
  createdAt: string
  deletedAt: string | null
  isDeleted: 0 | 1
}

export type Dot = {
  id: string
  categoryId: string
  name: string
  xRatio: number
  yRatio: number
  createdAt: string
  deletedAt: string | null
  isDeleted: 0 | 1
}

export type CsvRow = {
  categoryTitle: string
  dotName: string
  createdAt: string
  deletedAt: string
}

/** 檢查記錄是否為正常狀態 (deletedAt === null) */
export function isActive<T extends { deletedAt: string | null }>(
  record: T,
): boolean {
  return record.deletedAt === null
}

/** 檢查記錄是否已刪除 (deletedAt !== null) */
export function isDeleted<T extends { deletedAt: string | null }>(
  record: T,
): boolean {
  return record.deletedAt !== null
}

/** 驗證座標是否在有效範圍內 [0, 1] */
export function isValidCoordinates(xRatio: number, yRatio: number): boolean {
  return xRatio >= 0 && xRatio <= 1 && yRatio >= 0 && yRatio <= 1
}

/** 驗證顏色是否為有效的十六進位格 */
export function isValidHexColor(color: string): boolean {
  return /^#[0-9A-F]{6}$/i.test(color)
}
