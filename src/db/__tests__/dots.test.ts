import { beforeEach, describe, expect, it, vi } from 'vitest'

import { buildDot } from '@test/builders'

import type { Dot } from '@/types/dotBoard'

const { committedDots, getDb } = vi.hoisted(() => {
  const committedDots = new Map<string, Dot>()

  const getDb = vi.fn(async () => ({
    transaction: () => {
      return {
        objectStore: () => ({
          get: async (id: string) => committedDots.get(id) ?? undefined,
          put: async (dot: Dot) => {
            committedDots.set(dot.id, dot)
          },
        }),
        done: Promise.resolve(),
      }
    },
  }))

  return { committedDots, getDb }
})

vi.mock('@/db/client', () => ({ getDb }))

import { batchUpdateDots } from '@/db/dots'

describe('batchUpdateDots', () => {
  beforeEach(() => {
    committedDots.clear()
    getDb.mockClear()
  })

  it('empty batch is a no-op', async () => {
    await expect(batchUpdateDots([])).resolves.toEqual([])
    expect(getDb).not.toHaveBeenCalled()
  })

  it('batch update dot positions', async () => {
    const dot1 = buildDot({ id: 'dot-1', xRatio: 0.1, yRatio: 0.2 })
    const dot2 = buildDot({ id: 'dot-2', xRatio: 0.3, yRatio: 0.4 })
    committedDots.set(dot1.id, dot1)
    committedDots.set(dot2.id, dot2)

    const result = await batchUpdateDots([
      { id: 'dot-1', xRatio: 0.9, yRatio: 0.8 },
      { id: 'dot-2', xRatio: 0.7, yRatio: 0.6 },
    ])

    expect(result).toHaveLength(2)
    expect(result[0]).toMatchObject({ id: 'dot-1', xRatio: 0.9, yRatio: 0.8 })
    expect(result[1]).toMatchObject({ id: 'dot-2', xRatio: 0.7, yRatio: 0.6 })
    expect(committedDots.get('dot-1')!.xRatio).toBe(0.9)
    expect(committedDots.get('dot-2')!.xRatio).toBe(0.7)
  })

  it('batch update skips deleted dots', async () => {
    const deletedDot = buildDot({
      id: 'dot-deleted',
      xRatio: 0.1,
      yRatio: 0.1,
      isDeleted: 1,
      deletedAt: '2024-01-01T00:00:00.000Z',
    })
    committedDots.set(deletedDot.id, deletedDot)

    const result = await batchUpdateDots([{ id: 'dot-deleted', xRatio: 0.9, yRatio: 0.9 }])

    expect(result).toEqual([])
    expect(committedDots.get('dot-deleted')!.xRatio).toBe(0.1)
    expect(committedDots.get('dot-deleted')!.yRatio).toBe(0.1)
  })

  it('batch update rejects invalid coordinates', async () => {
    await expect(batchUpdateDots([{ id: 'dot-1', xRatio: 1.5, yRatio: 0.5 }])).rejects.toThrow(
      'Invalid dot coordinates',
    )

    await expect(batchUpdateDots([{ id: 'dot-1', xRatio: 0.5, yRatio: -0.1 }])).rejects.toThrow(
      'Invalid dot coordinates',
    )

    // getDb should not be called (validation before transaction)
    expect(getDb).not.toHaveBeenCalled()
  })
})
