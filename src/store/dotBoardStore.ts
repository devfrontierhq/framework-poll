import { create } from 'zustand'

import type { Category, Dot } from '@/types/dotBoard'
import {
  getActiveCategories,
  getActiveDots,
  getAllCategories,
  getAllDots,
  createCategory,
  updateCategory,
  softDeleteCategory,
  createDot,
  softDeleteDot,
} from '@/db'
import { getAdminSecret } from '@/utils/env'
import { buildCsvRows, downloadCsv } from '@/utils/csv'

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
  addDot: (
    categoryId: string,
    name: string,
    xRatio: number,
    yRatio: number,
  ) => Promise<Dot>
  removeDot: (dotId: string) => Promise<Dot | undefined>
  exportCsv: () => Promise<void>
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
  addDot: async (
    categoryId: string,
    name: string,
    xRatio: number,
    yRatio: number,
  ) => {
    const dot = await createDot({ categoryId, name, xRatio, yRatio })

    set((state) => {
      const dots = new Map(state.dots)
      dots.set(dot.id, dot)
      return { dots }
    })

    return dot
  },
  removeDot: async (dotId: string) => {
    const deletedDot = await softDeleteDot(dotId)

    if (deletedDot) {
      set((state) => {
        const dots = new Map(state.dots)
        dots.delete(dotId)
        return { dots }
      })
    }

    return deletedDot
  },
  exportCsv: async () => {
    // Fetch all data from IndexedDB (including deleted records)
    const [allCategories, allDots] = await Promise.all([
      getAllCategories(),
      getAllDots(),
    ])

    // Build CSV rows with category name resolution
    const csvRows = buildCsvRows(allDots, allCategories)

    // Download CSV file with UTF-8 BOM encoding
    downloadCsv(csvRows)
  },
}))
