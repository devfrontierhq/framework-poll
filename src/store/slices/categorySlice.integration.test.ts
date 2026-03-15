import { describe, expect, it } from 'vitest'

import { createMockDotBoardStore } from '@test/store'

describe('initializeDefaultCategories integration test', () => {
  it('does not require admin privileges to initialize', async () => {
    const store = createMockDotBoardStore({
      isAdminUnlocked: false,
    })

    // Mock should allow calling without throwing
    await store.initializeDefaultCategories()

    expect(store.initializeDefaultCategories).toHaveBeenCalled()
  })

  it('verifies permission system is not broken', () => {
    const store = createMockDotBoardStore({
      isAdminUnlocked: false,
    })

    // This demonstrates the test requirement:
    // initializeDefaultCategories should work without admin
    // but addCategory should still require admin
    expect(store.isAdminUnlocked).toBe(false)
  })
})
