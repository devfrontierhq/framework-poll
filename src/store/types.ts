import type { Category, Dot } from '@/types/dotBoard'

export const ADMIN_REQUIRED_ERROR = 'Admin mode is required'
export const DELETE_PASSWORD_REQUIRED_ERROR =
  'Password confirmation is required for delete operations'
export const INVALID_DELETE_PASSWORD_ERROR =
  'Invalid password for delete operation'

// State types
export type AuthState = {
  isAdminUnlocked: boolean
}

export type CategoryState = {
  categories: Map<string, Category>
}

export type DotState = {
  dots: Map<string, Dot>
}

// Action types
export type AuthActions = {
  verifyAdminPassword: (password: string) => boolean
  unlockAdmin: (password: string) => boolean
  lockAdmin: () => void
}

export type CategoryActions = {
  addCategory: (title: string, color: string) => Promise<Category>
  editCategory: (
    categoryId: string,
    updates: { title?: string; color?: string },
  ) => Promise<Category | undefined>
  removeCategory: (
    categoryId: string,
    password: string,
  ) => Promise<Category | undefined>
}

export type DotActions = {
  addDot: (
    categoryId: string,
    name: string,
    xRatio: number,
    yRatio: number,
  ) => Promise<Dot>
  removeDot: (dotId: string, password: string) => Promise<Dot | undefined>
}

export type DataActions = {
  loadData: () => Promise<void>
}

export type ExportActions = {
  exportCsv: () => Promise<void>
}

// Combined store type
export type DotBoardStore = AuthState &
  CategoryState &
  DotState &
  AuthActions &
  CategoryActions &
  DotActions &
  DataActions &
  ExportActions
