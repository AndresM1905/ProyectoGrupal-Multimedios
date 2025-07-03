import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/vue'
import { flushPromises } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import EpisodeTracker from '../src/components/EpisodeTracker.vue'

// Mock getEpisodes so the component has data sin llamadas reales
vi.mock('../src/api/tvdb', () => ({
  getEpisodes: vi.fn().mockResolvedValue({
    1: Array.from({ length: 3 }, (_, i) => ({ id: i + 1, name: `Ep${i + 1}` }))
  })
}))

const toggleSpy = vi.fn()

// Mock store
vi.mock('../src/stores/episodes', () => ({
  useEpisodesStore: () => ({
    ready: true,
    totals: { '42': 3 },
    counters: { '42': 1 },
    getTotal: () => 3,
    countSeen: () => 1,
    isSeen: (id, ep) => ep === 1, // solo ep 1 visto
    toggleEpisode: toggleSpy,
    loadFromApi: vi.fn().mockResolvedValue(),
    setTotal: vi.fn()
  })
}))

describe('EpisodeTracker.vue', () => {
  it('muestra porcentaje correcto y llama toggleEpisode al marcar', async () => {
    const { findByText, container } = render(EpisodeTracker, {
      global: { plugins: [createTestingPinia()] },
      props: { series: { id: 42, title: 'Fake' } }
    })

    // Esperar a que se resuelvan promesas asíncronas internas
    await flushPromises()
    // Porcentaje inicial (1 de 3) = 33 %
    await findByText(/33%/)

    const checkboxes = container.querySelectorAll('.checkbox')
    expect(checkboxes.length).toBeGreaterThan(0)
    await fireEvent.click(checkboxes[0])

    expect(toggleSpy).toHaveBeenCalled()
  })
})
