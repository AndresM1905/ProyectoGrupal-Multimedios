import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import HomeView from '../src/views/HomeView.vue'
import { createTestingPinia } from '@pinia/testing'
import { reactive } from 'vue'
import ShowCard from '../src/components/ShowCard.vue'
import { vi } from 'vitest'

// --- Mock Episodes Store, la app arranca con datos precargados ---
const counters = reactive({ '42': 1 }) // 1 episodio visto
const totals = reactive({ '42': 10 })  // 10 episodios totales
vi.mock('../src/stores/episodes', () => ({
  useEpisodesStore: () => ({
    ready: true,
    counters,
    totals,
    getTotal: id => totals[id] || 0,
    setTotal: (id, val) => { totals[id] = val },
    countSeen: id => counters[id] || 0
  })
}))

// Stub getEpisodes para no hacer fetch real
vi.mock('../src/api/tvdb', () => ({
  getEpisodes: vi.fn(() => Promise.resolve({ 1: Array(10).fill({ id: 1 }) }))
}))

import { nextTick } from 'vue'

function factory () {
  const pinia = createTestingPinia({
    initialState: {
      lists: {
        watchlist: [
          { id: 42, type: 'serie', title: 'Serie Test', img: 'poster.jpg' }
        ],
        watched: [],
        favorites: []
      }
    },
    stubActions: true
  })
  return mount(HomeView, {
    global: {
      plugins: [pinia],
      stubs: {
        Carousel: {
          template: '<div><ShowCard v-for="s in shows" :key="s.id" :show="s" /></div>',
          props: ['shows'],
          components: { ShowCard }
        }
      }
    }
  })
}

describe('HomeView carga barras de progreso al iniciar', () => {
  it('muestra la barra de porcentaje sin abrir modal', async () => {
    const wrapper = factory()
    await nextTick(); await nextTick()
    const percentEl = wrapper.find('small.percent')
    expect(percentEl.exists()).toBe(true)
    expect(percentEl.text()).toBe('10%')
  })
})
