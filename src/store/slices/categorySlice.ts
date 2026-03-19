import type { StateCreator } from 'zustand'

import type { Category, Dot } from '@/types/dotBoard'
import {
  ADMIN_REQUIRED_ERROR,
  DELETE_PASSWORD_REQUIRED_ERROR,
  INVALID_DELETE_PASSWORD_ERROR,
  type DotBoardStore,
  type CategoryState,
  type CategoryActions,
} from '../types'
import {
  createCategory,
  getActiveDots,
  initializeDefaultCategoriesAtomic,
  updateCategory,
  softDeleteCategory,
} from '@/db'

export type CategorySlice = CategoryState & CategoryActions

type CategoryUpdates = {
  title?: string
  color?: string
}

const DEFAULT_CATEGORIES = [
  { title: 'React', color: '#61dafb', sortOrder: 1 },
  { title: 'Vue', color: '#42b883', sortOrder: 2 },
  { title: 'Angular', color: '#dd0031', sortOrder: 3 },
] as const

function prepareNewCategoryInput(title: string, color: string) {
  const trimmedTitle = title?.trim()

  if (!trimmedTitle) {
    throw new Error('Category title is required')
  }

  return {
    title: trimmedTitle,
    color,
  }
}

function prepareCategoryUpdates(updates: CategoryUpdates): CategoryUpdates {
  if (updates.title === undefined) {
    return updates
  }

  const trimmedTitle = updates.title.trim()

  if (!trimmedTitle) {
    throw new Error('Category title cannot be empty')
  }

  return {
    ...updates,
    title: trimmedTitle,
  }
}

function removeCategoryFromState(
  categories: Map<string, Category>,
  dots: Map<string, Dot>,
  categoryId: string,
) {
  const nextCategories = new Map(categories)
  nextCategories.delete(categoryId)

  const nextDots = new Map(
    Array.from(dots.entries()).filter(
      ([, dot]) => dot.categoryId !== categoryId,
    ),
  )

  return {
    categories: nextCategories,
    dots: nextDots,
  }
}

export const createCategorySlice: StateCreator<
  DotBoardStore,
  [],
  [],
  CategorySlice
> = (set, get) => ({
  categories: new Map(),
  isSeedingDefaultCategories: false,

  addCategory: async (title: string, color: string) => {
    if (!get().isAdminUnlocked) {
      throw new Error(ADMIN_REQUIRED_ERROR)
    }

    const input = prepareNewCategoryInput(title, color)
    const category = await createCategory(input)

    set((state) => ({
      categories: new Map(state.categories).set(category.id, category),
    }))

    return category
  },

  editCategory: async (categoryId: string, updates: CategoryUpdates) => {
    if (!get().isAdminUnlocked) {
      throw new Error(ADMIN_REQUIRED_ERROR)
    }

    if (!categoryId) {
      throw new Error('Category ID is required')
    }

    const preparedUpdates = prepareCategoryUpdates(updates)
    const updatedCategory = await updateCategory(categoryId, preparedUpdates)

    if (!updatedCategory) {
      return undefined
    }

    if (updatedCategory.isDeleted === 1) {
      set((state) =>
        removeCategoryFromState(state.categories, state.dots, categoryId),
      )

      return updatedCategory
    }

    set((state) => ({
      categories: new Map(state.categories).set(
        updatedCategory.id,
        updatedCategory,
      ),
    }))

    return updatedCategory
  },

  removeCategory: async (categoryId: string, password: string) => {
    if (!get().isAdminUnlocked) {
      throw new Error(ADMIN_REQUIRED_ERROR)
    }

    if (!categoryId) {
      throw new Error('Category ID is required')
    }

    if (!password) {
      throw new Error(DELETE_PASSWORD_REQUIRED_ERROR)
    }

    if (!get().verifyAdminPassword(password)) {
      throw new Error(INVALID_DELETE_PASSWORD_ERROR)
    }

    const deletedCategory = await softDeleteCategory(categoryId)

    if (!deletedCategory) {
      return undefined
    }

    set((state) =>
      removeCategoryFromState(state.categories, state.dots, categoryId),
    )

    return deletedCategory
  },

  initializeDefaultCategories: async () => {
    if (get().isSeedingDefaultCategories) {
      return
    }

    try {
      set({ isSeedingDefaultCategories: true })

      // Finish the category bootstrap transaction before reading dots so a
      // stale tab cannot overwrite newer votes with an older dots snapshot.
      const categories = await initializeDefaultCategoriesAtomic(
        DEFAULT_CATEGORIES.map(({ title, color, sortOrder }) => ({
          ...prepareNewCategoryInput(title, color),
          sortOrder,
        })),
      )

      set({
        categories: new Map(
          categories.map((category) => [category.id, category]),
        ),
      })

      const dots = await getActiveDots()

      set({
        dots: new Map(dots.map((dot) => [dot.id, dot])),
      })
    } finally {
      set({ isSeedingDefaultCategories: false })
    }
  },
})
