/**
 * 產生唯一識別碼 (UUID v4)
 * 優先使用瀏覽器原生 crypto.randomUUID()，並降級至手動實作
 */
export function createId(): string {
  // 現代瀏覽器支援
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }

  // 降級方案：手動實作 UUID v4
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}
