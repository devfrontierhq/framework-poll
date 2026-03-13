import {
  openDB,
  type DBSchema,
  type IDBPDatabase,
  type IDBPTransaction,
} from 'idb'

import type { Category, Dot } from '@/types/dotBoard'

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

type UpgradeTransaction = IDBPTransaction<
  DotBoardDB,
  [typeof STORE_NAMES.categories, typeof STORE_NAMES.dots],
  'versionchange'
>

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
