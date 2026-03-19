import type { StateCreator } from 'zustand'

import type { DotBoardStore, ExportActions } from '../types'
import { getAllCategories, getAllDots } from '@/db'
import { buildCsvRows, downloadCsv } from '@/utils/csv'

export type ExportSlice = ExportActions

export const createExportSlice: StateCreator<
  DotBoardStore,
  [],
  [],
  ExportSlice
> = () => ({
  exportCsv: async () => {
    // Fetch all data from IndexedDB (including deleted records)
    const [allCategories, allDots] = await Promise.all([
      getAllCategories(),
      getAllDots(),
    ])

    // Build CSV rows with category name resolution
    const csvRows = buildCsvRows(allDots, allCategories)

    // Download CSV file with UTF-8 BOM encoding
    downloadCsv(csvRows)
  },
})
