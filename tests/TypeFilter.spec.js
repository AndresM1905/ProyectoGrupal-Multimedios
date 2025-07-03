import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TypeFilter from '../src/components/TypeFilter.vue'

function factory (model = 'all') {
  return mount(TypeFilter, {
    props: {
      modelValue: model,
      // v-model support
      'onUpdate:modelValue': () => {}
    }
  })
}

describe('TypeFilter.vue', () => {
  it('resalta la opción activa', () => {
    const wrapper = factory('pelicula')
    const active = wrapper.find('button.active')
    expect(active.exists()).toBe(true)
    expect(active.text()).toBe('Películas')
  })

  it('emite update:modelValue al hacer click', async () => {
    const wrapper = factory('all')
    const btnSeries = wrapper.findAll('button')[1] // "Series"
    await btnSeries.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')[0]).toEqual(['serie'])
  })

  it('no emite si se hace click en la ya seleccionada', async () => {
    const wrapper = factory('serie')
    const btnSeries = wrapper.findAll('button')[1]
    await btnSeries.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
  })
})
