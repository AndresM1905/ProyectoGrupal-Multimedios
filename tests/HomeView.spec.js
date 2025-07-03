import { describe, it, expect } from 'vitest'
import { mount, shallowMount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { setActivePinia } from 'pinia'
import HomeView from '../src/views/HomeView.vue'

function factory (listsState) {
  const pinia = createTestingPinia({
    initialState: {
      lists: listsState
    },
    stubActions: true
  })
  setActivePinia(pinia)
  return shallowMount(HomeView, {
    global: {
      plugins: [pinia],
      stubs: {
        Carousel: true // evita renderizar carrusel completo
      }
    }
  })
}

describe('HomeView snapshot', () => {
  it('renderiza secciones vacías como esperado', () => {
    const wrapper = factory({ watchlist: [], watched: [], favorites: [] })
    expect(wrapper.html()).toMatchSnapshot()
  })

  it('renderiza con ítems en las listas', () => {
    const dummy = [{ id: 1, title: 'Fake', img: 'a.jpg', type: 'serie' }]
    const wrapper = factory({ watchlist: dummy, watched: [], favorites: dummy })
    expect(wrapper.html()).toMatchSnapshot()
  })
})
