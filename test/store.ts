import { vi } from 'vitest'

import type { DotBoardStore } from '@/store/types'

export function createMockDotBoardStore(
  overrides: Partial<DotBoardStore> = {},
): DotBoardStore {
  return {
    categories: new Map(),
    dots: new Map(),
    isAdminUnlocked: false,
    isInitialized: false,
    isLoading: false,
    loadError: null,
    verifyAdminPassword: vi.fn(),
    unlockAdmin: vi.fn(),
    lockAdmin: vi.fn(),
    addCategory: vi.fn(),
    editCategory: vi.fn(),
    removeCategory: vi.fn(),
    initializeDefaultCategories: vi.fn(),
    addDot: vi.fn(),
    removeDot: vi.fn(),
    loadData: vi.fn(),
    exportCsv: vi.fn(),
    ...overrides,
  }
}
