import type { Dot } from '@/types/dotBoard'
import type { DotPositionUpdate } from '@/db/dots'

type GridParams = { cols: number; rows: number; step: number; capacity: number }

const DOT_DIAMETER_PX = 12
const DOT_GAP_PX = 12
const DOT_PADDING_PX = 6 // space between dots and container edge

function resolveGrid(n: number, usableW: number, usableH: number): GridParams {
  const normalStep = DOT_DIAMETER_PX + DOT_GAP_PX
  const radius = DOT_DIAMETER_PX / 2

  const cols = Math.max(1, Math.floor(usableW / normalStep))
  const rows = Math.ceil(n / cols)

  // Normal path: all dots fit at standard step
  if (DOT_DIAMETER_PX + (rows - 1) * normalStep <= usableH) {
    return { cols, rows, step: normalStep, capacity: cols * rows }
  }

  // Compression path: too many rows, must compress step
  // max dots per axis at minimum density (gap=0): floor((usable - radius) / diameter) + 1
  const maxCols = Math.max(1, Math.floor((usableW - radius) / DOT_DIAMETER_PX) + 1)
  const maxRows = Math.max(1, Math.floor((usableH - radius) / DOT_DIAMETER_PX) + 1)

  let compressedCols: number
  let compressedRows: number
  if (maxRows * maxCols >= n) {
    compressedCols = Math.max(1, Math.ceil(n / maxRows))
    compressedRows = Math.ceil(n / compressedCols)
  } else {
    // Overflow unavoidable: clamp to maximum density grid
    compressedCols = maxCols
    compressedRows = maxRows
  }

  const stepByWidth = compressedCols > 1 ? Math.floor((usableW - radius) / (compressedCols - 1)) : usableW
  const stepByHeight = compressedRows > 1 ? Math.floor((usableH - radius) / (compressedRows - 1)) : usableH
  const step = Math.max(DOT_DIAMETER_PX, Math.min(stepByWidth, stepByHeight))

  return { cols: compressedCols, rows: compressedRows, step, capacity: compressedCols * compressedRows }
}

export function computeGridLayout(dots: Dot[], width: number, height: number): DotPositionUpdate[] {
  if (dots.length === 0) return []

  const sorted = [...dots].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  const usableW = width - 2 * DOT_PADDING_PX
  const usableH = height - 2 * DOT_PADDING_PX

  const { cols, step, capacity } = resolveGrid(sorted.length, usableW, usableH)
  const origin = DOT_PADDING_PX + DOT_DIAMETER_PX / 2

  return sorted.map((dot, i) => {
    const idx = i % capacity
    return {
      id: dot.id,
      xRatio: (origin + (idx % cols) * step) / width,
      yRatio: (origin + Math.floor(idx / cols) * step) / height,
    }
  })
}
