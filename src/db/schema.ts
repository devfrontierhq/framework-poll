import type { DBSchema } from 'idb'

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

export type CreateCategoryInput = Pick<Category, 'title' | 'color'> & {
  sortOrder?: number
}
export type UpdateCategoryInput = Partial<Pick<Category, 'title' | 'color'>>
export type CreateDotInput = Pick<
  Dot,
  'categoryId' | 'name' | 'xRatio' | 'yRatio'
>
export type UpdateDotInput = Partial<Pick<Dot, 'name' | 'xRatio' | 'yRatio'>>
