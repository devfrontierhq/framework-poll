export type Category = {
  id: string
  title: string
  color: string
  createdAt: string
  deletedAt: string | null
}

export type Dot = {
  id: string
  categoryId: string
  name: string
  xRatio: number
  yRatio: number
  createdAt: string
  deletedAt: string | null
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
