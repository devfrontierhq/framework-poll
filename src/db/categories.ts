import type { Category } from '@/types/dotBoard'
import { isValidHexColor } from '@/types/dotBoard'
import { createId } from '@/utils/id'

import { getDb } from '@/db/client'
import { DotBoardDataError } from '@/db/errors'
import { INDEX_NAMES, STORE_NAMES, type CreateCategoryInput, type UpdateCategoryInput } from '@/db/schema'
import { getTimestamp, omitUndefinedFields, withDbError } from '@/db/utils'

function normalizeCategoryTitle(title: string) {
  return title.trim().toLowerCase()
}

function getNextSortOrder(categories: Pick<Category, 'sortOrder'>[]): number {
  if (categories.length === 0) {
    return 1
  }

  const maxSortOrder = Math.max(...categories.map((cat) => cat.sortOrder))
  return maxSortOrder + 1
}

export async function createCategory(input: CreateCategoryInput): Promise<Category> {
  return withDbError('create category', async () => {
    const database = await getDb()
    const transaction = database.transaction(STORE_NAMES.categories, 'readwrite')
    const categoriesStore = transaction.objectStore(STORE_NAMES.categories)
    const activeCategories = await categoriesStore.index(INDEX_NAMES.categories.isDeleted).getAll(0)
    const sortOrder = input.sortOrder ?? getNextSortOrder(activeCategories)
    const category = buildCategory({ ...input, sortOrder })

    await categoriesStore.add(category)
    await transaction.done

    return category
  })
}

/**
 * Use this for workflows that create multiple categories as a single unit.
 * If any add fails, IndexedDB rolls back the whole transaction so callers
 * do not end up with partially persisted categories.
 */
export async function createCategoriesAtomic(
  inputs: (CreateCategoryInput & { sortOrder: number })[],
): Promise<Category[]> {
  return withDbError('create categories', async () => {
    const categories = inputs.map(buildCategory)

    const database = await getDb()
    const transaction = database.transaction(STORE_NAMES.categories, 'readwrite')
    const categoriesStore = transaction.objectStore(STORE_NAMES.categories)

    for (const category of categories) {
      await categoriesStore.add(category)
    }

    await transaction.done
    return categories
  })
}

/**
 * Bootstrap default categories only when there are currently zero active
 * categories. Read + optional create happens inside one transaction so stale
 * tabs cannot append defaults onto a board that is no longer empty.
 */
export async function initializeDefaultCategoriesAtomic(
  inputs: (CreateCategoryInput & { sortOrder: number })[],
): Promise<Category[]> {
  return withDbError('initialize default categories', async () => {
    const database = await getDb()
    const transaction = database.transaction(STORE_NAMES.categories, 'readwrite')
    const categoriesStore = transaction.objectStore(STORE_NAMES.categories)
    const activeCategories = await categoriesStore.index(INDEX_NAMES.categories.isDeleted).getAll(0)
    const activeTitles = new Set(activeCategories.map((category) => normalizeCategoryTitle(category.title)))

    if (activeCategories.length > 0) {
      await transaction.done
      return activeCategories
    }

    for (const input of inputs) {
      const normalizedTitle = normalizeCategoryTitle(input.title)

      if (activeTitles.has(normalizedTitle)) {
        continue
      }

      const category = buildCategory(input)
      await categoriesStore.add(category)
      activeCategories.push(category)
      activeTitles.add(normalizedTitle)
    }

    await transaction.done
    return activeCategories
  })
}

export async function getCategory(categoryId: Category['id']) {
  const database = await getDb()
  return withDbError('read category', () => database.get(STORE_NAMES.categories, categoryId))
}

export async function getActiveCategories() {
  const database = await getDb()
  return withDbError('read active categories', () =>
    database.getAllFromIndex(STORE_NAMES.categories, INDEX_NAMES.categories.isDeleted, 0),
  )
}

export async function getAllCategories() {
  const database = await getDb()
  return withDbError('read all categories', () => database.getAll(STORE_NAMES.categories))
}

function buildCategory(input: CreateCategoryInput & { sortOrder: number }): Category {
  if (!isValidHexColor(input.color)) {
    throw new DotBoardDataError(`Invalid color format: ${input.color}. Must be hex format (#RRGGBB).`)
  }

  return {
    id: createId(),
    title: input.title,
    color: input.color,
    sortOrder: input.sortOrder,
    createdAt: getTimestamp(),
    deletedAt: null,
    isDeleted: 0,
  }
}

export async function updateCategory(categoryId: Category['id'], updates: UpdateCategoryInput) {
  return withDbError('update category', async () => {
    const database = await getDb()
    const transaction = database.transaction(STORE_NAMES.categories, 'readwrite')
    const categoriesStore = transaction.objectStore(STORE_NAMES.categories)
    const sanitizedUpdates = omitUndefinedFields<Category>(updates)
    const category = await categoriesStore.get(categoryId)

    if (!category) {
      await transaction.done
      return undefined
    }

    if (category.isDeleted === 1) {
      await transaction.done
      return category
    }
    if (sanitizedUpdates.color !== undefined && !isValidHexColor(sanitizedUpdates.color)) {
      throw new DotBoardDataError(`Invalid color format: ${sanitizedUpdates.color}. Must be hex format (#RRGGBB).`)
    }

    const nextCategory: Category = {
      ...category,
      ...sanitizedUpdates,
    }

    await categoriesStore.put(nextCategory)
    await transaction.done

    return nextCategory
  })
}

export async function softDeleteCategory(categoryId: Category['id']) {
  return withDbError('delete category', async () => {
    const database = await getDb()
    const transaction = database.transaction([STORE_NAMES.categories, STORE_NAMES.dots], 'readwrite')
    const categoriesStore = transaction.objectStore(STORE_NAMES.categories)
    const dotsStore = transaction.objectStore(STORE_NAMES.dots)
    const category = await categoriesStore.get(categoryId)

    if (!category) {
      await transaction.done
      return undefined
    }

    if (category.isDeleted === 1) {
      await transaction.done
      return category
    }

    const deletedAt = getTimestamp()
    const nextCategory: Category = {
      ...category,
      deletedAt,
      isDeleted: 1,
    }

    await categoriesStore.put(nextCategory)

    const dotsByCategory = await dotsStore.index(INDEX_NAMES.dots.categoryId).getAll(categoryId)

    await Promise.all(
      dotsByCategory
        .filter((dot) => dot.isDeleted !== 1)
        .map((dot) =>
          dotsStore.put({
            ...dot,
            deletedAt,
            isDeleted: 1,
          }),
        ),
    )

    await transaction.done

    return nextCategory
  })
}
