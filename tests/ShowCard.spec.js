import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/vue'
import { createTestingPinia } from '@pinia/testing'
import { vi } from 'vitest'
import ShowCard from '../src/components/ShowCard.vue'

// Mock Pinia store so el componente calcule 2 % sin lógica extra.
import { reactive } from 'vue'
vi.mock('../src/stores/episodes', () => ({
  useEpisodesStore: () => ({
    ready: true,
    counters: reactive({ '72005': 4 }),
    getTotal: () => 188,
    setTotal: vi.fn()
  })
}))

describe('ShowCard.vue', () => {
  it('muestra el porcentaje de progreso correcto', async () => {
    const percentVal = Math.round(4 / 188 * 100)
    const show = { id: 72005, type: 'serie', title: 'Hey Arnold!', img: 'poster.jpg' }

    const { findByText } = render(ShowCard, {
      global: { plugins: [createTestingPinia({ createSpy: () => () => {} })] },
      props: { show }
    })

    await findByText(`${percentVal}%`)
  })
})
