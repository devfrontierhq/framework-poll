import {
  openDB,
  type IDBPDatabase,
  type IDBPTransaction,
  type IDBPObjectStore,
} from 'idb'

import {
  DB_NAME,
  DB_VERSION,
  INDEX_NAMES,
  STORE_NAMES,
  type DotBoardDB,
} from '@/db/schema'
import { normalizeDbError } from '@/db/utils'

let dbPromise: Promise<IDBPDatabase<DotBoardDB>> | null = null

type UpgradeTransaction = IDBPTransaction<
  DotBoardDB,
  [typeof STORE_NAMES.categories, typeof STORE_NAMES.dots],
  'versionchange'
>

type CategoriesStore = IDBPObjectStore<
  DotBoardDB,
  [typeof STORE_NAMES.categories, typeof STORE_NAMES.dots],
  typeof STORE_NAMES.categories,
  'versionchange'
>

type DotsStore = IDBPObjectStore<
  DotBoardDB,
  [typeof STORE_NAMES.categories, typeof STORE_NAMES.dots],
  typeof STORE_NAMES.dots,
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

function ensureCategoriesIndexes(categoriesStore: CategoriesStore) {
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

function ensureDotsIndexes(dotsStore: DotsStore) {
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

export function getDb() {
  dbPromise ??= initIndexedDb().catch((error) => {
    dbPromise = null
    throw normalizeDbError('initialize database', error)
  })

  return dbPromise
}
