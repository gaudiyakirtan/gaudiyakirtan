import { defineConfig } from 'vitest/config'

// Data-layer unit tests (docs/WORKFLOW.md slice: groupings + tests). Node environment - the
// covered modules (decode, songRepository, manifestRepository, songGroupRepository, search) are
// server/pure logic, not React components, so no DOM/jsdom is needed.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
