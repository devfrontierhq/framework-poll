import {
  openDB,
  type DBSchema,
  type IDBPDatabase,
  type IDBPTransaction,
} from 'idb'

import type { Category, Dot } from '@/types/dotBoard'
import { isValidHexColor } from '@/types/dotBoard'
import { createId } from '@/utils/id'

export const DB_NAME = 'framework-poll-db'
export const DB_VERSION = 1

export const STORE_NAMES = {
  categories: 'categories',
  dots: 'dots',
} as const

export const INDEX_NAMES = {
  categories: {
    deletedAt: 'deletedAt',
    isDeleted: 'isDeleted',
  },
  dots: {
    categoryId: 'categoryId',
    deletedAt: 'deletedAt',
    isDeleted: 'isDeleted',
    categoryIdIsDeleted: 'categoryIdIsDeleted',
  },
} as const

export type DotBoardDB = DBSchema & {
  categories: {
    key: Category['id']
    value: Category
    indexes: {
      deletedAt: Category['deletedAt']
      isDeleted: Category['isDeleted']
    }
  }
  dots: {
    key: Dot['id']
    value: Dot
    indexes: {
      categoryId: Dot['categoryId']
      deletedAt: Dot['deletedAt']
      isDeleted: Dot['isDeleted']
      categoryIdIsDeleted: [Dot['categoryId'], Dot['isDeleted']]
    }
  }
}

export type CreateCategoryInput = Pick<Category, 'title' | 'color'>
export type UpdateCategoryInput = Partial<Pick<Category, 'title' | 'color'>>

let dbPromise: Promise<IDBPDatabase<DotBoardDB>> | null = null

type UpgradeTransaction = IDBPTransaction<
  DotBoardDB,
  [typeof STORE_NAMES.categories, typeof STORE_NAMES.dots],
  'versionchange'
>

function getTimestamp() {
  return new Date().toISOString()
}

function getDb() {
  dbPromise ??= initIndexedDb()
  return dbPromise
}

function createStores(
  database: IDBPDatabase<DotBoardDB>,
  transaction: UpgradeTransaction,
) {
  const categoriesStore = database.objectStoreNames.contains(
    STORE_NAMES.categories,
  )
    ? transaction.objectStore(STORE_NAMES.categories)
    : database.createObjectStore(STORE_NAMES.categories, { keyPath: 'id' })

  const dotsStore = database.objectStoreNames.contains(STORE_NAMES.dots)
    ? transaction.objectStore(STORE_NAMES.dots)
    : database.createObjectStore(STORE_NAMES.dots, { keyPath: 'id' })

  return {
    categoriesStore,
    dotsStore,
  }
}

function ensureCategoriesIndexes(
  categoriesStore: ReturnType<typeof createStores>['categoriesStore'],
) {
  if (!categoriesStore.indexNames.contains(INDEX_NAMES.categories.deletedAt)) {
    categoriesStore.createIndex(
      INDEX_NAMES.categories.deletedAt,
      INDEX_NAMES.categories.deletedAt,
    )
  }
  if (!categoriesStore.indexNames.contains(INDEX_NAMES.categories.isDeleted)) {
    categoriesStore.createIndex(
      INDEX_NAMES.categories.isDeleted,
      INDEX_NAMES.categories.isDeleted,
    )
  }
}

function ensureDotsIndexes(
  dotsStore: ReturnType<typeof createStores>['dotsStore'],
) {
  if (!dotsStore.indexNames.contains(INDEX_NAMES.dots.categoryId)) {
    dotsStore.createIndex(
      INDEX_NAMES.dots.categoryId,
      INDEX_NAMES.dots.categoryId,
    )
  }

  if (!dotsStore.indexNames.contains(INDEX_NAMES.dots.deletedAt)) {
    dotsStore.createIndex(
      INDEX_NAMES.dots.deletedAt,
      INDEX_NAMES.dots.deletedAt,
    )
  }

  if (!dotsStore.indexNames.contains(INDEX_NAMES.dots.isDeleted)) {
    dotsStore.createIndex(
      INDEX_NAMES.dots.isDeleted,
      INDEX_NAMES.dots.isDeleted,
    )
  }

  if (!dotsStore.indexNames.contains(INDEX_NAMES.dots.categoryIdIsDeleted)) {
    dotsStore.createIndex(INDEX_NAMES.dots.categoryIdIsDeleted, [
      'categoryId',
      'isDeleted',
    ])
  }
}

export function initIndexedDb() {
  return openDB<DotBoardDB>(DB_NAME, DB_VERSION, {
    upgrade(database, _oldVersion, _newVersion, transaction) {
      const stores = createStores(database, transaction)
      ensureCategoriesIndexes(stores.categoriesStore)
      ensureDotsIndexes(stores.dotsStore)
    },
  })
}

export async function createCategory(
  input: CreateCategoryInput,
): Promise<Category> {
  // Validate hex color format before persisting
  if (!isValidHexColor(input.color)) {
    throw new Error(
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
  await database.add(STORE_NAMES.categories, category)

  return category
}

export async function getCategory(categoryId: Category['id']) {
  const database = await getDb()
  return database.get(STORE_NAMES.categories, categoryId)
}

export async function getCategories() {
  const database = await getDb()
  return database.getAll(STORE_NAMES.categories)
}

export async function updateCategory(
  categoryId: Category['id'],
  updates: UpdateCategoryInput,
) {
  const database = await getDb()
  const transaction = database.transaction(STORE_NAMES.categories, 'readwrite')
  const categoriesStore = transaction.objectStore(STORE_NAMES.categories)
  const category = await categoriesStore.get(categoryId)

  if (!category) {
    await transaction.done
    return undefined
  }

  // Validate hex color format if color is being updated
  if (updates.color !== undefined && !isValidHexColor(updates.color)) {
    throw new Error(
      `Invalid color format: ${updates.color}. Must be hex format (#RRGGBB).`,
    )
  }

  const nextCategory: Category = {
    ...category,
    ...updates,
  }

  await categoriesStore.put(nextCategory)
  await transaction.done

  return nextCategory
}

export async function softDeleteCategory(categoryId: Category['id']) {
  const database = await getDb()
  const category = await database.get(STORE_NAMES.categories, categoryId)

  if (!category) {
    return undefined
  }

  const deletedAt = getTimestamp()
  const nextCategory: Category = {
    ...category,
    deletedAt,
    isDeleted: 1,
  }

  await database.put(STORE_NAMES.categories, nextCategory)

  return nextCategory
}
