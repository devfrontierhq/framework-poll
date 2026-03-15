import { describe, expect, it } from 'vitest'

import { isValidCoordinates } from '@/types/dotBoard'

import {
  calculateRelativeCoordinates,
  calculatePixelPosition,
} from './coordinates'

describe('Relative Coordinate System', () => {
  describe('calculateRelativeCoordinates', () => {
    it('should calculate xRatio = x / width and yRatio = y / height', () => {
      const x = 100
      const y = 50
      const width = 200
      const height = 100

      const result = calculateRelativeCoordinates(x, y, width, height)

      expect(result.xRatio).toBe(0.5) // 100 / 200
      expect(result.yRatio).toBe(0.5) // 50 / 100
    })

    it('should return 0 for top-left corner (0, 0)', () => {
      const result = calculateRelativeCoordinates(0, 0, 400, 300)

      expect(result.xRatio).toBe(0)
      expect(result.yRatio).toBe(0)
    })

    it('should return 1 for bottom-right corner', () => {
      const width = 400
      const height = 300

      const result = calculateRelativeCoordinates(width, height, width, height)

      expect(result.xRatio).toBe(1)
      expect(result.yRatio).toBe(1)
    })

    it('should handle clicks at container center', () => {
      const width = 800
      const height = 600
      const centerX = width / 2
      const centerY = height / 2

      const result = calculateRelativeCoordinates(
        centerX,
        centerY,
        width,
        height,
      )

      expect(result.xRatio).toBe(0.5)
      expect(result.yRatio).toBe(0.5)
    })

    it('should handle different container sizes correctly', () => {
      // Small container
      const small = calculateRelativeCoordinates(50, 50, 100, 100)
      expect(small.xRatio).toBe(0.5)
      expect(small.yRatio).toBe(0.5)

      // Large container
      const large = calculateRelativeCoordinates(500, 500, 1000, 1000)
      expect(large.xRatio).toBe(0.5)
      expect(large.yRatio).toBe(0.5)

      // Wide container
      const wide = calculateRelativeCoordinates(400, 100, 800, 200)
      expect(wide.xRatio).toBe(0.5)
      expect(wide.yRatio).toBe(0.5)

      // Tall container
      const tall = calculateRelativeCoordinates(100, 400, 200, 800)
      expect(tall.xRatio).toBe(0.5)
      expect(tall.yRatio).toBe(0.5)
    })

    it('should produce values between 0 and 1 for clicks inside container', () => {
      const width = 400
      const height = 300

      // Click near top-left
      const topLeft = calculateRelativeCoordinates(50, 30, width, height)
      expect(topLeft.xRatio).toBeGreaterThan(0)
      expect(topLeft.xRatio).toBeLessThan(1)
      expect(topLeft.yRatio).toBeGreaterThan(0)
      expect(topLeft.yRatio).toBeLessThan(1)

      // Click near bottom-right
      const bottomRight = calculateRelativeCoordinates(350, 270, width, height)
      expect(bottomRight.xRatio).toBeGreaterThan(0)
      expect(bottomRight.xRatio).toBeLessThan(1)
      expect(bottomRight.yRatio).toBeGreaterThan(0)
      expect(bottomRight.yRatio).toBeLessThan(1)
    })

    it('should maintain precision with decimal values', () => {
      const result = calculateRelativeCoordinates(123.456, 234.567, 400, 500)

      expect(result.xRatio).toBeCloseTo(0.30864)
      expect(result.yRatio).toBeCloseTo(0.469134)
    })
  })

  describe('calculatePixelPosition', () => {
    it('should convert xRatio and yRatio back to pixel coordinates', () => {
      const xRatio = 0.5
      const yRatio = 0.5
      const width = 400
      const height = 300

      const result = calculatePixelPosition(xRatio, yRatio, width, height)

      expect(result.x).toBe(200) // 0.5 * 400
      expect(result.y).toBe(150) // 0.5 * 300
    })

    it('should handle top-left corner (0, 0)', () => {
      const result = calculatePixelPosition(0, 0, 400, 300)

      expect(result.x).toBe(0)
      expect(result.y).toBe(0)
    })

    it('should handle bottom-right corner (1, 1)', () => {
      const width = 400
      const height = 300

      const result = calculatePixelPosition(1, 1, width, height)

      expect(result.x).toBe(width)
      expect(result.y).toBe(height)
    })

    it('should scale correctly with different container sizes', () => {
      const xRatio = 0.25
      const yRatio = 0.75

      // Small container
      const small = calculatePixelPosition(xRatio, yRatio, 200, 100)
      expect(small.x).toBe(50)
      expect(small.y).toBe(75)

      // Large container
      const large = calculatePixelPosition(xRatio, yRatio, 800, 600)
      expect(large.x).toBe(200)
      expect(large.y).toBe(450)
    })
  })

  describe('Coordinate System Round-Trip', () => {
    it('should preserve position when converting to relative and back', () => {
      const originalX = 250
      const originalY = 180
      const width = 500
      const height = 400

      // Convert to relative
      const { xRatio, yRatio } = calculateRelativeCoordinates(
        originalX,
        originalY,
        width,
        height,
      )

      // Convert back to pixels
      const { x, y } = calculatePixelPosition(xRatio, yRatio, width, height)

      expect(x).toBe(originalX)
      expect(y).toBe(originalY)
    })

    it('should maintain relative position across different container sizes', () => {
      const originalWidth = 400
      const originalHeight = 300
      const clickX = 200
      const clickY = 150

      // Calculate relative coordinates in original size
      const { xRatio, yRatio } = calculateRelativeCoordinates(
        clickX,
        clickY,
        originalWidth,
        originalHeight,
      )

      expect(xRatio).toBe(0.5)
      expect(yRatio).toBe(0.5)

      // Render in different size (responsive design)
      const newWidth = 800
      const newHeight = 600
      const { x, y } = calculatePixelPosition(
        xRatio,
        yRatio,
        newWidth,
        newHeight,
      )

      // Should still be at center (relative position preserved)
      expect(x).toBe(400) // 50% of 800
      expect(y).toBe(300) // 50% of 600
    })

    it('should handle responsive design scenarios', () => {
      // Desktop size
      const desktopWidth = 1200
      const desktopHeight = 800
      const desktopClickX = 600
      const desktopClickY = 400

      const { xRatio, yRatio } = calculateRelativeCoordinates(
        desktopClickX,
        desktopClickY,
        desktopWidth,
        desktopHeight,
      )

      // Mobile size
      const mobileWidth = 375
      const mobileHeight = 667
      const { x: mobileX, y: mobileY } = calculatePixelPosition(
        xRatio,
        yRatio,
        mobileWidth,
        mobileHeight,
      )

      // Position should be at center on mobile too
      expect(mobileX).toBeCloseTo(187.5) // 50% of 375
      expect(mobileY).toBeCloseTo(333.5) // 50% of 667
    })
  })

  describe('Coordinate Validation', () => {
    it('should validate coordinates are within [0, 1] range', () => {
      // Valid coordinates
      expect(isValidCoordinates(0, 0)).toBe(true)
      expect(isValidCoordinates(0.5, 0.5)).toBe(true)
      expect(isValidCoordinates(1, 1)).toBe(true)
      expect(isValidCoordinates(0.25, 0.75)).toBe(true)

      // Invalid coordinates (outside range)
      expect(isValidCoordinates(-0.1, 0.5)).toBe(false)
      expect(isValidCoordinates(0.5, -0.1)).toBe(false)
      expect(isValidCoordinates(1.1, 0.5)).toBe(false)
      expect(isValidCoordinates(0.5, 1.1)).toBe(false)
      expect(isValidCoordinates(-1, -1)).toBe(false)
      expect(isValidCoordinates(2, 2)).toBe(false)
    })

    it('should validate coordinates calculated from clicks are in range', () => {
      const width = 400
      const height = 300

      // Click inside container
      const inside = calculateRelativeCoordinates(200, 150, width, height)
      expect(isValidCoordinates(inside.xRatio, inside.yRatio)).toBe(true)

      // Click at edges
      const topLeft = calculateRelativeCoordinates(0, 0, width, height)
      expect(isValidCoordinates(topLeft.xRatio, topLeft.yRatio)).toBe(true)

      const bottomRight = calculateRelativeCoordinates(
        width,
        height,
        width,
        height,
      )
      expect(isValidCoordinates(bottomRight.xRatio, bottomRight.yRatio)).toBe(
        true,
      )
    })
  })

  describe('Edge Cases', () => {
    it('should handle quarter positions correctly', () => {
      const width = 400
      const height = 400

      // Top-left quarter
      const topLeft = calculateRelativeCoordinates(100, 100, width, height)
      expect(topLeft.xRatio).toBe(0.25)
      expect(topLeft.yRatio).toBe(0.25)

      // Top-right quarter
      const topRight = calculateRelativeCoordinates(300, 100, width, height)
      expect(topRight.xRatio).toBe(0.75)
      expect(topRight.yRatio).toBe(0.25)

      // Bottom-left quarter
      const bottomLeft = calculateRelativeCoordinates(100, 300, width, height)
      expect(bottomLeft.xRatio).toBe(0.25)
      expect(bottomLeft.yRatio).toBe(0.75)

      // Bottom-right quarter
      const bottomRight = calculateRelativeCoordinates(300, 300, width, height)
      expect(bottomRight.xRatio).toBe(0.75)
      expect(bottomRight.yRatio).toBe(0.75)
    })

    it('should handle non-square containers', () => {
      // Wide container (16:9 aspect ratio)
      const wide = calculateRelativeCoordinates(800, 225, 1600, 900)
      expect(wide.xRatio).toBe(0.5)
      expect(wide.yRatio).toBe(0.25)

      // Tall container (9:16 aspect ratio)
      const tall = calculateRelativeCoordinates(225, 800, 900, 1600)
      expect(tall.xRatio).toBe(0.25)
      expect(tall.yRatio).toBe(0.5)
    })

    it('should handle very small decimal values', () => {
      const width = 1000
      const height = 1000

      // Click very close to origin
      const nearOrigin = calculateRelativeCoordinates(1, 1, width, height)
      expect(nearOrigin.xRatio).toBe(0.001)
      expect(nearOrigin.yRatio).toBe(0.001)
      expect(isValidCoordinates(nearOrigin.xRatio, nearOrigin.yRatio)).toBe(
        true,
      )

      // Click very close to max
      const nearMax = calculateRelativeCoordinates(999, 999, width, height)
      expect(nearMax.xRatio).toBe(0.999)
      expect(nearMax.yRatio).toBe(0.999)
      expect(isValidCoordinates(nearMax.xRatio, nearMax.yRatio)).toBe(true)
    })
  })
})
