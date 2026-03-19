/**
 * 讀取管理員密鑰
 * @returns 管理員密鑰
 */
export function getAdminSecret(): string | undefined {
  return import.meta.env.VITE_ADMIN_SECRET
}
