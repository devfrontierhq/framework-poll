const DOT_SIZE_PX = 12
const DOT_RADIUS_PX = DOT_SIZE_PX / 2

export function getBoundedPosition(ratio: number): string {
  return `clamp(${DOT_RADIUS_PX}px, ${ratio * 100}%, calc(100% - ${DOT_RADIUS_PX}px))`
}
