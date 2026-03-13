import { openDB, type DBSchema, type IDBPDatabase } from 'idb'

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
  }
}

function createStores(database: IDBPDatabase<DotBoardDB>) {
  if (!database.objectStoreNames.contains(STORE_NAMES.categories)) {
    database.createObjectStore(STORE_NAMES.categories, { keyPath: 'id' })
  }

  if (!database.objectStoreNames.contains(STORE_NAMES.dots)) {
    database.createObjectStore(STORE_NAMES.dots, { keyPath: 'id' })
  }
}

function ensureCategoriesIndexes(database: IDBPDatabase<DotBoardDB>) {
  const categoriesStore = database
    .transaction(STORE_NAMES.categories, 'versionchange')
    .objectStore(STORE_NAMES.categories)

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

export function initIndexedDb() {
  return openDB<DotBoardDB>(DB_NAME, DB_VERSION, {
    upgrade(database) {
      createStores(database)
      ensureCategoriesIndexes(database)
    },
  })
}
