import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/vue'

// Limpia el DOM después de cada prueba
afterEach(() => {
  // vue-testing-library cleanup (si usamos render)
  cleanup()
})
