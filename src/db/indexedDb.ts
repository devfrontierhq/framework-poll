import {
  openDB,
  type DBSchema,
  type IDBPDatabase,
  type IDBPTransaction,
} from 'idb'

import type { Category, Dot } from '@/types/dotBoard'
import { isValidCoordinates, isValidHexColor } from '@/types/dotBoard'
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
export type CreateDotInput = Pick<
  Dot,
  'categoryId' | 'name' | 'xRatio' | 'yRatio'
>
export type UpdateDotInput = Partial<Pick<Dot, 'name' | 'xRatio' | 'yRatio'>>

let dbPromise: Promise<IDBPDatabase<DotBoardDB>> | null = null

type UpgradeTransaction = IDBPTransaction<
  DotBoardDB,
  [typeof STORE_NAMES.categories, typeof STORE_NAMES.dots],
  'versionchange'
>

function getTimestamp() {
  return new Date().toISOString()
}

function omitUndefinedFields<T extends object>(
  updates: Partial<T>,
): Partial<T> {
  return Object.fromEntries(
    Object.entries(updates).filter(([, value]) => value !== undefined),
  ) as Partial<T>
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

export async function getActiveCategories() {
  const database = await getDb()
  return database.getAllFromIndex(
    STORE_NAMES.categories,
    INDEX_NAMES.categories.isDeleted,
    0,
  )
}

export async function getAllCategories() {
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
  const sanitizedUpdates = omitUndefinedFields<Category>(updates)
  const category = await categoriesStore.get(categoryId)

  if (!category) {
    await transaction.done
    return undefined
  }

  // Validate hex color format if color is being updated
  if (
    sanitizedUpdates.color !== undefined &&
    !isValidHexColor(sanitizedUpdates.color)
  ) {
    throw new Error(
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
}

export async function softDeleteCategory(categoryId: Category['id']) {
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

  // If already deleted, preserve original deletedAt timestamp
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
}

export async function createDot(input: CreateDotInput): Promise<Dot> {
  // Validate coordinates before persisting
  if (!isValidCoordinates(input.xRatio, input.yRatio)) {
    throw new Error(
      `Invalid dot coordinates: xRatio=${input.xRatio}, yRatio=${input.yRatio}. Both must be in [0, 1].`,
    )
  }

  const database = await getDb()
  const transaction = database.transaction(
    [STORE_NAMES.categories, STORE_NAMES.dots],
    'readwrite',
  )
  const categoriesStore = transaction.objectStore(STORE_NAMES.categories)
  const dotsStore = transaction.objectStore(STORE_NAMES.dots)
  const category = await categoriesStore.get(input.categoryId)

  if (!category) {
    await transaction.done
    throw new Error(
      `Cannot create dot: category with id "${input.categoryId}" does not exist.`,
    )
  }
  if (category.isDeleted === 1) {
    await transaction.done
    throw new Error(
      `Cannot create dot: category "${category.title}" has been deleted.`,
    )
  }

  const dot: Dot = {
    id: createId(),
    categoryId: input.categoryId,
    name: input.name,
    xRatio: input.xRatio,
    yRatio: input.yRatio,
    createdAt: getTimestamp(),
    deletedAt: null,
    isDeleted: 0,
  }

  await dotsStore.add(dot)
  await transaction.done

  return dot
}

export async function getDot(dotId: Dot['id']) {
  const database = await getDb()
  return database.get(STORE_NAMES.dots, dotId)
}

export async function getActiveDots() {
  const database = await getDb()
  return database.getAllFromIndex(
    STORE_NAMES.dots,
    INDEX_NAMES.dots.isDeleted,
    0,
  )
}

export async function getAllDots() {
  const database = await getDb()
  return database.getAll(STORE_NAMES.dots)
}

export async function getActiveDotsByCategory(categoryId: Dot['categoryId']) {
  const database = await getDb()

  return database.getAllFromIndex(
    STORE_NAMES.dots,
    INDEX_NAMES.dots.categoryIdIsDeleted,
    [categoryId, 0],
  )
}

export async function updateDot(dotId: Dot['id'], updates: UpdateDotInput) {
  const database = await getDb()
  const transaction = database.transaction(STORE_NAMES.dots, 'readwrite')
  const dotsStore = transaction.objectStore(STORE_NAMES.dots)
  const sanitizedUpdates = omitUndefinedFields<Dot>(updates)
  const dot = await dotsStore.get(dotId)

  if (!dot) {
    await transaction.done
    return undefined
  }

  // Avoid reviving a dot that was already soft-deleted.
  if (dot.isDeleted === 1) {
    await transaction.done
    return dot
  }

  const nextDot: Dot = {
    ...dot,
    ...sanitizedUpdates,
  }

  // Validate coordinates if either xRatio or yRatio is being updated
  if (
    sanitizedUpdates.xRatio !== undefined ||
    sanitizedUpdates.yRatio !== undefined
  ) {
    if (!isValidCoordinates(nextDot.xRatio, nextDot.yRatio)) {
      throw new Error(
        `Invalid dot coordinates: xRatio=${nextDot.xRatio}, yRatio=${nextDot.yRatio}. Both must be in [0, 1].`,
      )
    }
  }

  await dotsStore.put(nextDot)
  await transaction.done

  return nextDot
}

export async function softDeleteDot(dotId: Dot['id']) {
  const database = await getDb()
  const dot = await database.get(STORE_NAMES.dots, dotId)

  if (!dot) {
    return undefined
  }

  // If already deleted, preserve original deletedAt timestamp
  if (dot.isDeleted === 1) {
    return dot
  }

  const deletedAt = getTimestamp()
  const nextDot: Dot = {
    ...dot,
    deletedAt,
    isDeleted: 1,
  }

  await database.put(STORE_NAMES.dots, nextDot)

  return nextDot
}
