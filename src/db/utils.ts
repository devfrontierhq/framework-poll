import { DotBoardDataError, DotBoardDbError } from '@/db/errors'

export function getTimestamp() {
  return new Date().toISOString()
}

export function omitUndefinedFields<T extends object>(
  updates: Partial<T>,
): Partial<T> {
  return Object.fromEntries(
    Object.entries(updates).filter(([, value]) => value !== undefined),
  ) as Partial<T>
}

export function normalizeDbError(operation: string, error: unknown) {
  if (error instanceof DotBoardDbError || error instanceof DotBoardDataError) {
    return error
  }

  const message =
    error instanceof Error ? error.message : 'Unknown IndexedDB error'

  return new DotBoardDbError(
    operation,
    `Failed to ${operation}: ${message}`,
    error instanceof Error ? error : undefined,
  )
}

export async function withDbError<T>(
  operation: string,
  action: () => Promise<T>,
) {
  try {
    return await action()
  } catch (error) {
    throw normalizeDbError(operation, error)
  }
}
