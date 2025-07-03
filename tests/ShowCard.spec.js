import { describe, it, expect, beforeEach } from 'vitest'
import { render } from '@testing-library/vue'
import { createTestingPinia } from '@pinia/testing'
import { vi } from 'vitest'
import ShowCard from '../src/components/ShowCard.vue'

// Mock Pinia store; counters será mutable entre tests
import { reactive } from 'vue'
const counters = reactive({})
vi.mock('../src/stores/episodes', () => ({
  useEpisodesStore: () => ({
    ready: true,
    counters,
    getTotal: () => 188,
    setTotal: vi.fn()
  })
}))

describe('ShowCard.vue', () => { 
  beforeEach(() => { Object.keys(counters).forEach(k => delete counters[k]) })
  it('muestra el porcentaje de progreso cuando hay episodios vistos', async () => {
    counters['72005'] = 4
    const percentVal = Math.round(4 / 188 * 100)
    const show = { id: 72005, type: 'serie', title: 'Hey Arnold!', img: 'poster.jpg' }

    const { findByText } = render(ShowCard, {
      global: { plugins: [createTestingPinia({ createSpy: () => () => {} })] },
      props: { show }
    })

    await findByText(`${percentVal}%`)
  })
})
