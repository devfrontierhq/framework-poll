import type { Dot } from '@/types/dotBoard'
import { isValidCoordinates } from '@/types/dotBoard'
import { createId } from '@/utils/id'

import { getDb } from '@/db/client'
import { DotBoardDataError } from '@/db/errors'
import {
  INDEX_NAMES,
  STORE_NAMES,
  type CreateDotInput,
  type UpdateDotInput,
} from '@/db/schema'
import { getTimestamp, omitUndefinedFields, withDbError } from '@/db/utils'

export async function createDot(input: CreateDotInput): Promise<Dot> {
  if (!isValidCoordinates(input.xRatio, input.yRatio)) {
    throw new DotBoardDataError(
      `Invalid dot coordinates: xRatio=${input.xRatio}, yRatio=${input.yRatio}. Both must be in [0, 1].`,
    )
  }

  return withDbError('create dot', async () => {
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
      throw new DotBoardDataError(
        `Cannot create dot: category with id "${input.categoryId}" does not exist.`,
      )
    }

    if (category.isDeleted === 1) {
      await transaction.done
      throw new DotBoardDataError(
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
  })
}

export async function getDot(dotId: Dot['id']) {
  const database = await getDb()
  return withDbError('read dot', () => database.get(STORE_NAMES.dots, dotId))
}

export async function getActiveDots() {
  const database = await getDb()
  return withDbError('read active dots', () =>
    database.getAllFromIndex(STORE_NAMES.dots, INDEX_NAMES.dots.isDeleted, 0),
  )
}

export async function getAllDots() {
  const database = await getDb()
  return withDbError('read all dots', () => database.getAll(STORE_NAMES.dots))
}

export async function getActiveDotsByCategory(categoryId: Dot['categoryId']) {
  const database = await getDb()

  return withDbError('read active dots by category', () =>
    database.getAllFromIndex(
      STORE_NAMES.dots,
      INDEX_NAMES.dots.categoryIdIsDeleted,
      [categoryId, 0],
    ),
  )
}

export async function updateDot(dotId: Dot['id'], updates: UpdateDotInput) {
  return withDbError('update dot', async () => {
    const database = await getDb()
    const transaction = database.transaction(STORE_NAMES.dots, 'readwrite')
    const dotsStore = transaction.objectStore(STORE_NAMES.dots)
    const sanitizedUpdates = omitUndefinedFields<Dot>(updates)
    const dot = await dotsStore.get(dotId)

    if (!dot) {
      await transaction.done
      return undefined
    }

    if (dot.isDeleted === 1) {
      await transaction.done
      return dot
    }

    const nextDot: Dot = {
      ...dot,
      ...sanitizedUpdates,
    }

    if (
      sanitizedUpdates.xRatio !== undefined ||
      sanitizedUpdates.yRatio !== undefined
    ) {
      if (!isValidCoordinates(nextDot.xRatio, nextDot.yRatio)) {
        throw new DotBoardDataError(
          `Invalid dot coordinates: xRatio=${nextDot.xRatio}, yRatio=${nextDot.yRatio}. Both must be in [0, 1].`,
        )
      }
    }

    await dotsStore.put(nextDot)
    await transaction.done

    return nextDot
  })
}

export async function softDeleteDot(dotId: Dot['id']) {
  return withDbError('delete dot', async () => {
    const database = await getDb()
    const dot = await database.get(STORE_NAMES.dots, dotId)

    if (!dot) {
      return undefined
    }

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
  })
}
