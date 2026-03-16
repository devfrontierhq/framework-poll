import { createSelector } from 'reselect'

import type { Dot } from '@/types/dotBoard'
import { groupDotsByCategory } from '@/utils/count'

import type { DotBoardStore } from './types'

// Base selectors
export const selectCategories = (state: DotBoardStore) => state.categories
export const selectDots = (state: DotBoardStore) => state.dots

// Memoized derived selectors
export const selectCategoryList = createSelector(
  [selectCategories],
  (categories) => Array.from(categories.values()),
)

export const selectDotsByCategory = createSelector([selectDots], (dots) =>
  groupDotsByCategory(dots.values()),
)

export const selectCategoryCount = createSelector(
  [selectCategories],
  (categories) => categories.size,
)

// Parameterized selectors
export function selectCategoryDotCount(categoryId: string) {
  return createSelector(
    [selectDotsByCategory],
    (dotsByCategory) => dotsByCategory.get(categoryId)?.length ?? 0,
  )
}

export function selectCategoryDots(categoryId: string) {
  return createSelector(
    [selectDotsByCategory],
    (dotsByCategory): Dot[] => dotsByCategory.get(categoryId) ?? [],
  )
}
