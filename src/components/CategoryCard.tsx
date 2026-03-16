import { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'

import type { Category, Dot } from '@/types/dotBoard'

import { AddDotDialog } from '@/components/AddDotDialog'
import { CategoryDialog } from '@/components/CategoryDialog'
import { DeleteCategoryDialog } from '@/components/DeleteCategoryDialog'
import { DeleteDotDialog } from '@/components/DeleteDotDialog'

import { useDotBoardStore } from '@/store/dotBoardStore'
import { getBoundedPosition } from '@/lib/dotPosition'
import { calculateRelativeCoordinates } from '@/utils/coordinates'

type CategoryCardProps = {
  category: Category
  categoryDots: Dot[]
}

type OpenDialog = 'none' | 'add-dot' | 'edit' | 'delete-category' | 'delete-dot'

const DOT_OPACITY = 0.8
const DOT_BORDER = '2px solid rgba(255, 255, 255, 0.95)'
const DOT_OVERLAP_RING = '0 0 0 1px rgba(15, 23, 42, 0.16)'

export function CategoryCard({ category, categoryDots }: CategoryCardProps) {
  const isAdminUnlocked = useDotBoardStore((state) => state.isAdminUnlocked)
  const addDot = useDotBoardStore((state) => state.addDot)

  const [openDialog, setOpenDialog] = useState<OpenDialog>('none')
  const [selectedDot, setSelectedDot] = useState<Dot | null>(null)
  const [pendingCoordinates, setPendingCoordinates] = useState<{
    xRatio: number
    yRatio: number
  } | null>(null)

  const dotCount = categoryDots.length

  const handleDialogChange = (open: boolean) => {
    if (!open) setOpenDialog('none')
  }

  const handleDotClick = (
    e: React.MouseEvent<HTMLButtonElement>,
    dot: Dot,
  ) => {
    if (isAdminUnlocked) {
      e.stopPropagation()
      setSelectedDot(dot)
      setOpenDialog('delete-dot')
    }
  }

  const handleAreaClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const clickX = event.clientX - rect.left
    const clickY = event.clientY - rect.top

    const { xRatio, yRatio } = calculateRelativeCoordinates(
      clickX,
      clickY,
      rect.width,
      rect.height,
    )

    setPendingCoordinates({ xRatio, yRatio })
    setOpenDialog('add-dot')
  }

  const handleSubmitDot = async (name: string) => {
    if (pendingCoordinates) {
      await addDot(
        category.id,
        name,
        pendingCoordinates.xRatio,
        pendingCoordinates.yRatio,
      )
      setPendingCoordinates(null)
    }
  }

  return (
    <div className="flex min-h-[300px] flex-col rounded-lg border border-slate-200 bg-white shadow-sm md:h-full md:min-h-0">
      {/* Header with title and optional count (admin mode only) */}
      <div className="border-b border-slate-200 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              data-testid="category-color-swatch"
              aria-hidden="true"
              className="h-3 w-3 rounded-full border border-slate-200 shadow-sm"
              style={{ backgroundColor: category.color }}
            />
            <h3 className="text-lg font-bold text-slate-900">
              {category.title}
              {isAdminUnlocked ? ` - ${dotCount}` : ''}
            </h3>
          </div>
          {isAdminUnlocked && (
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation()
                  setOpenDialog('edit')
                }}
                aria-label="編輯版塊"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation()
                  setOpenDialog('delete-category')
                }}
                aria-label="刪除版塊"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Dot display area */}
      <div
        className="relative flex-1 cursor-pointer p-4"
        onClick={handleAreaClick}
      >
        {categoryDots.map((dot) => (
          <div
            key={dot.id}
            data-testid="category-dot-wrapper"
            className="group absolute -translate-x-1/2 -translate-y-1/2"
            style={{
              left: getBoundedPosition(dot.xRatio),
              top: getBoundedPosition(dot.yRatio),
            }}
          >
            {isAdminUnlocked ? (
              <button
                type="button"
                data-testid="category-dot"
                className="h-3 w-3 cursor-pointer rounded-full transition-transform hover:scale-125"
                style={{
                  backgroundColor: category.color,
                  border: DOT_BORDER,
                  boxShadow: DOT_OVERLAP_RING,
                  opacity: DOT_OPACITY,
                }}
                aria-label={`刪除圓點 ${dot.name}`}
                onClick={(e) => handleDotClick(e, dot)}
              />
            ) : (
              <div
                data-testid="category-dot"
                className="h-3 w-3 rounded-full"
                style={{
                  backgroundColor: category.color,
                  border: DOT_BORDER,
                  boxShadow: DOT_OVERLAP_RING,
                  opacity: DOT_OPACITY,
                }}
                aria-label={dot.name}
              />
            )}
            <div
              data-testid="dot-hover-label"
              className="pointer-events-none absolute top-0 left-1/2 z-10 -translate-x-1/2 -translate-y-full rounded-md bg-slate-950 px-2 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
            >
              {dot.name}
            </div>
          </div>
        ))}
      </div>

      <AddDotDialog
        open={openDialog === 'add-dot'}
        onOpenChange={handleDialogChange}
        categoryTitle={category.title}
        onSubmit={handleSubmitDot}
      />
      {selectedDot && (
        <DeleteDotDialog
          open={openDialog === 'delete-dot'}
          onOpenChange={handleDialogChange}
          dot={selectedDot}
        />
      )}

      <CategoryDialog
        mode="edit"
        open={openDialog === 'edit'}
        onOpenChange={handleDialogChange}
        category={category}
      />
      <DeleteCategoryDialog
        open={openDialog === 'delete-category'}
        onOpenChange={handleDialogChange}
        category={category}
      />
    </div>
  )
}
