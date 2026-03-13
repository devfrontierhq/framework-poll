import type { Category } from '@/types/dotBoard'
import { isValidHexColor } from '@/types/dotBoard'
import { createId } from '@/utils/id'

import { getDb } from '@/db/client'
import { DotBoardDataError } from '@/db/errors'
import {
  INDEX_NAMES,
  STORE_NAMES,
  type CreateCategoryInput,
  type UpdateCategoryInput,
} from '@/db/schema'
import { getTimestamp, omitUndefinedFields, withDbError } from '@/db/utils'

export async function createCategory(
  input: CreateCategoryInput,
): Promise<Category> {
  if (!isValidHexColor(input.color)) {
    throw new DotBoardDataError(
      `Invalid color format: ${input.color}. Must be hex format (#RRGGBB).`,
    )
  }

  const category: Category = {
    id: createId(),
    title: input.title,
    color: input.color,
    createdAt: getTimestamp(),
    deletedAt: null,
    isDeleted: 0,
  }

  const database = await getDb()
  await withDbError('create category', () =>
    database.add(STORE_NAMES.categories, category),
  )

  return category
}

export async function getCategory(categoryId: Category['id']) {
  const database = await getDb()
  return withDbError('read category', () =>
    database.get(STORE_NAMES.categories, categoryId),
  )
}

export async function getActiveCategories() {
  const database = await getDb()
  return withDbError('read active categories', () =>
    database.getAllFromIndex(
      STORE_NAMES.categories,
      INDEX_NAMES.categories.isDeleted,
      0,
    ),
  )
}

export async function getAllCategories() {
  const database = await getDb()
  return withDbError('read all categories', () =>
    database.getAll(STORE_NAMES.categories),
  )
}

export async function updateCategory(
  categoryId: Category['id'],
  updates: UpdateCategoryInput,
) {
  return withDbError('update category', async () => {
    const database = await getDb()
    const transaction = database.transaction(
      STORE_NAMES.categories,
      'readwrite',
    )
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

    if (
      sanitizedUpdates.color !== undefined &&
      !isValidHexColor(sanitizedUpdates.color)
    ) {
      throw new DotBoardDataError(
        `Invalid color format: ${sanitizedUpdates.color}. Must be hex format (#RRGGBB).`,
      )
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
    const transaction = database.transaction(
      [STORE_NAMES.categories, STORE_NAMES.dots],
      'readwrite',
    )
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

    const dotsByCategory = await dotsStore
      .index(INDEX_NAMES.dots.categoryId)
      .getAll(categoryId)

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
