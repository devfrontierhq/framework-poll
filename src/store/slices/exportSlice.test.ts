import { beforeEach, describe, expect, it, vi } from 'vitest'

import { buildCategory, buildDot } from '@test/builders'

import type { DotBoardStore } from '../types'
import { createExportSlice } from './exportSlice'

// Mock the database module
vi.mock('@/db', () => ({
  getAllCategories: vi.fn(),
  getAllDots: vi.fn(),
}))

// Mock the CSV utility module
vi.mock('@/utils/csv', () => ({
  buildCsvRows: vi.fn(),
  downloadCsv: vi.fn(),
}))

import { getAllCategories, getAllDots } from '@/db'
import { buildCsvRows, downloadCsv } from '@/utils/csv'

describe('exportSlice', () => {
  let store: DotBoardStore
  const mockGetAllCategories = vi.mocked(getAllCategories)
  const mockGetAllDots = vi.mocked(getAllDots)
  const mockBuildCsvRows = vi.mocked(buildCsvRows)
  const mockDownloadCsv = vi.mocked(downloadCsv)

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks()

    // Create a minimal store with export slice
    const setState = vi.fn()
    const getState = () => store

    // Initialize store with export slice
    store = createExportSlice(setState, getState, {
      setState,
      getState,
      subscribe: vi.fn(),
      getInitialState: vi.fn(),
    }) as unknown as DotBoardStore
  })

  describe('exportCsv', () => {
    it('should export all categories and dots including deleted records', async () => {
      const mockCategories = [
        buildCategory({
          id: 'cat-1',
          title: 'React',
          color: '#61dafb',
          createdAt: '2024-01-01T00:00:00.000Z',
        }),
        buildCategory({
          id: 'cat-2',
          title: 'Vue',
          color: '#42b883',
          createdAt: '2024-01-02T00:00:00.000Z',
          deletedAt: '2024-01-10T00:00:00.000Z', // Deleted category
          isDeleted: 1,
        }),
      ]

      const mockDots = [
        buildDot({
          id: 'dot-1',
          categoryId: 'cat-1',
          name: 'Alice',
          createdAt: '2024-01-03T00:00:00.000Z',
        }),
        buildDot({
          id: 'dot-2',
          categoryId: 'cat-2',
          name: 'Bob',
          xRatio: 0.3,
          yRatio: 0.7,
          createdAt: '2024-01-04T00:00:00.000Z',
          deletedAt: '2024-01-11T00:00:00.000Z', // Deleted dot
          isDeleted: 1,
        }),
      ]

      const mockCsvRows = [
        {
          categoryTitle: 'React',
          dotName: 'Alice',
          createdAt: '2024-01-03 00:00',
          deletedAt: '',
        },
        {
          categoryTitle: 'Vue',
          dotName: 'Bob',
          createdAt: '2024-01-04 00:00',
          deletedAt: '2024-01-11 00:00',
        },
      ]

      mockGetAllCategories.mockResolvedValue(mockCategories)
      mockGetAllDots.mockResolvedValue(mockDots)
      mockBuildCsvRows.mockReturnValue(mockCsvRows)

      await store.exportCsv()

      // Verify getAllCategories and getAllDots were called
      expect(mockGetAllCategories).toHaveBeenCalledOnce()
      expect(mockGetAllDots).toHaveBeenCalledOnce()

      // Verify buildCsvRows was called with correct arguments
      expect(mockBuildCsvRows).toHaveBeenCalledWith(mockDots, mockCategories)

      // Verify downloadCsv was called with CSV rows
      expect(mockDownloadCsv).toHaveBeenCalledWith(mockCsvRows)
    })

    it('should handle empty database gracefully', async () => {
      mockGetAllCategories.mockResolvedValue([])
      mockGetAllDots.mockResolvedValue([])
      mockBuildCsvRows.mockReturnValue([])

      await store.exportCsv()

      expect(mockBuildCsvRows).toHaveBeenCalledWith([], [])
      expect(mockDownloadCsv).toHaveBeenCalledWith([])
    })

    it('should fetch categories and dots in parallel', async () => {
      const started: string[] = []
      let resolveCategories!: (value: []) => void
      let resolveDots!: (value: []) => void

      mockGetAllCategories.mockImplementation(() => {
        started.push('categories')
        return new Promise((resolve) => {
          resolveCategories = resolve
        })
      })
      mockGetAllDots.mockImplementation(() => {
        started.push('dots')
        return new Promise((resolve) => {
          resolveDots = resolve
        })
      })
      mockBuildCsvRows.mockReturnValue([])

      const exportPromise = store.exportCsv()

      expect(started).toEqual(['categories', 'dots'])

      resolveCategories([])
      await Promise.resolve()

      expect(mockBuildCsvRows).not.toHaveBeenCalled()
      expect(mockDownloadCsv).not.toHaveBeenCalled()

      resolveDots([])
      await exportPromise

      expect(mockBuildCsvRows).toHaveBeenCalledWith([], [])
      expect(mockDownloadCsv).toHaveBeenCalledWith([])
    })

    it('should propagate database errors', async () => {
      mockGetAllCategories.mockRejectedValue(new Error('Database error'))
      mockGetAllDots.mockResolvedValue([])

      await expect(store.exportCsv()).rejects.toThrow('Database error')
    })

    it('should propagate CSV building errors', async () => {
      mockGetAllCategories.mockResolvedValue([])
      mockGetAllDots.mockResolvedValue([])
      mockBuildCsvRows.mockImplementation(() => {
        throw new Error('CSV building error')
      })

      await expect(store.exportCsv()).rejects.toThrow('CSV building error')
    })

    it('should propagate download errors', async () => {
      mockGetAllCategories.mockResolvedValue([])
      mockGetAllDots.mockResolvedValue([])
      mockBuildCsvRows.mockReturnValue([])
      mockDownloadCsv.mockImplementation(() => {
        throw new Error('Download error')
      })

      await expect(store.exportCsv()).rejects.toThrow('Download error')
    })

    it('should include all records regardless of deletion status', async () => {
      const categories = [
        buildCategory({
          id: 'cat-1',
          title: 'Active Category',
          color: '#000000',
          createdAt: '2024-01-01T00:00:00.000Z',
        }),
        buildCategory({
          id: 'cat-2',
          title: 'Deleted Category',
          color: '#111111',
          createdAt: '2024-01-02T00:00:00.000Z',
          deletedAt: '2024-01-10T00:00:00.000Z',
          isDeleted: 1,
        }),
      ]

      const dots = [
        buildDot({
          id: 'dot-1',
          categoryId: 'cat-1',
          name: 'Active Dot',
          createdAt: '2024-01-03T00:00:00.000Z',
        }),
        buildDot({
          id: 'dot-2',
          categoryId: 'cat-2',
          name: 'Deleted Dot',
          xRatio: 0.3,
          yRatio: 0.7,
          createdAt: '2024-01-04T00:00:00.000Z',
          deletedAt: '2024-01-11T00:00:00.000Z',
          isDeleted: 1,
        }),
      ]

      mockGetAllCategories.mockResolvedValue(categories)
      mockGetAllDots.mockResolvedValue(dots)
      mockBuildCsvRows.mockReturnValue([])
      mockDownloadCsv.mockImplementation(() => {}) // Reset to normal behavior

      await store.exportCsv()

      // Verify both active and deleted records are passed to buildCsvRows
      expect(mockBuildCsvRows).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ name: 'Active Dot', deletedAt: null }),
          expect.objectContaining({
            name: 'Deleted Dot',
            deletedAt: '2024-01-11T00:00:00.000Z',
          }),
        ]),
        expect.arrayContaining([
          expect.objectContaining({
            title: 'Active Category',
            deletedAt: null,
          }),
          expect.objectContaining({
            title: 'Deleted Category',
            deletedAt: '2024-01-10T00:00:00.000Z',
          }),
        ]),
      )
    })
  })
})
