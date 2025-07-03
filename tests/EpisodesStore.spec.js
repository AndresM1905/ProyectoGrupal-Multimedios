import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

// Mock API used in episodes store
vi.mock('../src/stores/auth', () => ({
  api: {
    post: vi.fn().mockResolvedValue({ data: {} }),
    get: vi.fn().mockResolvedValue({ data: [] })
  }
}))

// Stub getEpisodes helper so we don't hit TVDB in unit tests
vi.mock('../src/api/tvdb', () => ({
  getEpisodes: vi.fn().mockResolvedValue({
    // 1 temporada con 10 episodios
    1: Array.from({ length: 10 }, (_, i) => ({ id: i + 1 }))
  })
}))

import { useEpisodesStore } from '../src/stores/episodes'

describe('episodes store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('toggleEpisode añade y quita episodios vistos y actualiza counters', async () => {
    const store = useEpisodesStore()

    // Estado inicial vacío
    expect(store.countSeen(123)).toBe(0)
    expect(store.counters['123']).toBeUndefined()

    // Marca episodio 5 como visto
    await store.toggleEpisode(123, 5, 1)
    expect(store.isSeen(123, 5)).toBe(true)
    expect(store.counters['123']).toBe(1)

    // Desmarca el mismo episodio
    await store.toggleEpisode(123, 5, 1)
    expect(store.isSeen(123, 5)).toBe(false)
    expect(store.counters['123']).toBe(0)
  })
})
