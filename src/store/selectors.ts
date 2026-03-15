import type { Dot } from '@/types/dotBoard'
import { groupDotsByCategory } from '@/utils/count'

import type { DotBoardStore } from './types'

export function selectCategoryList(state: DotBoardStore) {
  return Array.from(state.categories.values())
}

export function selectDotsByCategory(state: DotBoardStore) {
  return groupDotsByCategory(state.dots.values())
}

export function selectCategoryDotCount(categoryId: string) {
  return (state: DotBoardStore) =>
    selectDotsByCategory(state).get(categoryId)?.length ?? 0
}

export function selectCategoryDots(categoryId: string) {
  return (state: DotBoardStore): Dot[] =>
    selectDotsByCategory(state).get(categoryId) ?? []
}
