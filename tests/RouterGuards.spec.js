import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { createTestingPinia } from '@pinia/testing'
import { nextTick } from 'vue'

// Stub scrollTo (jsdom lacks implementation and vue-router's scrollBehavior calls it)
if (!global.window.scrollTo) {
  global.window.scrollTo = vi.fn()
}

/**
 * Helper to get a fresh router instance AFTER activating Pinia,
 * so that the beforeEach guard picks up the mocked auth store.
 */
async function getRouter () {
  // dynamic import to defer evaluation until Pinia is ready
  const { default: router } = await import('../src/router')
  return router
}

describe('router guards', () => {
  beforeEach(() => {
    // Fresh Pinia per test – createTestingPinia will set active instance
  })

  it('redirige a /login si no hay sesión y la ruta requiere auth', async () => {
    // Pinia sin token
    {
      const pinia = createTestingPinia({ initialState: { auth: { token: null } }, stubActions: true })
      setActivePinia(pinia)
    }
    const router = await getRouter()

    await router.push('/watchlist').catch(() => {})
    await router.isReady()
    expect(router.currentRoute.value.fullPath).toBe('/login')
  })

  it('redirige a / si el usuario ya está logueado e intenta /login', async () => {
    // Pinia con token ficticio
    {
      const pinia = createTestingPinia({ initialState: { auth: { token: 'abc' } }, stubActions: true })
      setActivePinia(pinia)
    }
    const router = await getRouter()

    // navega primero a home para montar correctamente
    await router.push('/')
    await router.isReady()

    await router.push('/login').catch(() => {})
        await router.isReady()
    await nextTick()
    expect(router.currentRoute.value.fullPath).toBe('/')
  })
})
