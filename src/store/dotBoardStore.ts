import { create } from 'zustand'

import type { Category, Dot } from '@/types/dotBoard'
import {
  getActiveCategories,
  getActiveDots,
  createCategory,
  updateCategory,
  softDeleteCategory,
} from '@/db'
import { getAdminSecret } from '@/utils/env'

export type DotBoardState = {
  categories: Map<string, Category>
  dots: Map<string, Dot>
  isAdminUnlocked: boolean
}

export type DotBoardActions = {
  loadData: () => Promise<void>
  unlockAdmin: (password: string) => boolean
  lockAdmin: () => void
  addCategory: (title: string, color: string) => Promise<Category>
  editCategory: (
    categoryId: string,
    updates: { title?: string; color?: string },
  ) => Promise<Category | undefined>
  removeCategory: (categoryId: string) => Promise<Category | undefined>
}

export type DotBoardStore = DotBoardState & DotBoardActions

const initialState: DotBoardState = {
  categories: new Map(),
  dots: new Map(),
  isAdminUnlocked: false,
}

export const useDotBoardStore = create<DotBoardStore>((set) => ({
  ...initialState,
  loadData: async () => {
    const [categories, dots] = await Promise.all([
      getActiveCategories(),
      getActiveDots(),
    ])

    set({
      categories: new Map(categories.map((cat) => [cat.id, cat])),
      dots: new Map(dots.map((dot) => [dot.id, dot])),
    })
  },
  unlockAdmin: (password: string) => {
    const adminSecret = getAdminSecret()

    // Edge cases: no admin secret configured or empty password
    if (!adminSecret || !password) {
      return false
    }

    const isValid = password === adminSecret

    if (isValid) {
      set({ isAdminUnlocked: true })
    }

    return isValid
  },
  lockAdmin: () => {
    set({ isAdminUnlocked: false })
  },
  addCategory: async (title: string, color: string) => {
    const category = await createCategory({ title, color })

    set((state) => {
      const categories = new Map(state.categories)
      categories.set(category.id, category)
      return { categories }
    })

    return category
  },
  editCategory: async (
    categoryId: string,
    updates: { title?: string; color?: string },
  ) => {
    const updatedCategory = await updateCategory(categoryId, updates)

    if (updatedCategory) {
      set((state) => {
        const categories = new Map(state.categories)
        categories.set(updatedCategory.id, updatedCategory)
        return { categories }
      })
    }

    return updatedCategory
  },
  removeCategory: async (categoryId: string) => {
    const deletedCategory = await softDeleteCategory(categoryId)

    if (deletedCategory) {
      set((state) => {
        const categories = new Map(state.categories)
        const dots = new Map(state.dots)

        // Remove the category
        categories.delete(categoryId)

        // Remove all dots belonging to this category
        for (const [dotId, dot] of dots) {
          if (dot.categoryId === categoryId) {
            dots.delete(dotId)
          }
        }

        return { categories, dots }
      })
    }

    return deletedCategory
  },
}))
