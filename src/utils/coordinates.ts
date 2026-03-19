/**
 * 計算相對座標：xRatio = x / width, yRatio = y / height
 * Calculate relative coordinates from pixel position
 *
 * @param x - Pixel X coordinate (click position)
 * @param y - Pixel Y coordinate (click position)
 * @param width - Container width in pixels
 * @param height - Container height in pixels
 * @returns Relative coordinates between 0 and 1
 */
export function calculateRelativeCoordinates(
  x: number,
  y: number,
  width: number,
  height: number,
): { xRatio: number; yRatio: number } {
  return {
    xRatio: x / width,
    yRatio: y / height,
  }
}

/**
 * 將相對座標轉換回像素位置：x = xRatio * width, y = yRatio * height
 * Convert relative coordinates back to pixel position
 *
 * @param xRatio - Relative X coordinate (0-1)
 * @param yRatio - Relative Y coordinate (0-1)
 * @param width - Container width in pixels
 * @param height - Container height in pixels
 * @returns Pixel coordinates
 */
export function calculatePixelPosition(
  xRatio: number,
  yRatio: number,
  width: number,
  height: number,
): { x: number; y: number } {
  return {
    x: xRatio * width,
    y: yRatio * height,
  }
}
