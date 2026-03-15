import { create } from 'zustand'

import type { DotBoardStore } from './types'
import { createAuthSlice } from './slices/authSlice'
import { createCategorySlice } from './slices/categorySlice'
import { createDotSlice } from './slices/dotSlice'
import { createDataSlice } from './slices/dataSlice'
import { createExportSlice } from './slices/exportSlice'

export const useDotBoardStore = create<DotBoardStore>()((...a) => ({
  ...createAuthSlice(...a),
  ...createCategorySlice(...a),
  ...createDotSlice(...a),
  ...createDataSlice(...a),
  ...createExportSlice(...a),
}))

// Re-export types for convenience
export type { DotBoardStore } from './types'
