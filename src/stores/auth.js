// Pinia store de autenticación
import { defineStore } from 'pinia'
import axios from 'axios'

export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000' })

export const useAuthStore = defineStore('auth', {
  state: () => ({
    // Si hay token en localStorage, configura encabezado de inmediato
    token: (() => {
      const t = localStorage.getItem('token') || null
      if (t) api.defaults.headers.common.Authorization = `Bearer ${t}`
      return t
    })(),
    user: null,
    loading: false,
    error: ''
  }),
  actions: {
    async register (email, password) {
      this.loading = true
      this.error = ''
      try {
        const { data } = await api.post('/register', { email, password })
        this.setToken(data.token)
        const { useListsStore } = await import('./lists')
        useListsStore().loadFromApi()
      } catch (err) {
        this.error = err.response?.data?.error || 'Error de registro'
      } finally {
        this.loading = false
      }
    },
    async login (email, password) {
      this.loading = true
      this.error = ''
      try {
        const { data } = await api.post('/login', { email, password })
        this.setToken(data.token)
        const { useListsStore } = await import('./lists')
        useListsStore().loadFromApi()
      } catch (err) {
        this.error = err.response?.data?.error || 'Credenciales inválidas'
      } finally {
        this.loading = false
      }
    },
    logout () {
      import('./lists').then(m => m.useListsStore().clearAll())
      delete api.defaults.headers.common.Authorization
      this.token = null
      localStorage.removeItem('token')
    },
    setToken (t) {
      api.defaults.headers.common.Authorization = `Bearer ${t}`
      this.token = t
      localStorage.setItem('token', t)
    },
    // Verifica si el token almacenado sigue siendo válido
    async validate () {
      if (!this.token) return false
      try {
        await api.get('/lists') // endpoint protegido
        return true
      } catch (err) {
        // Cualquier fallo invalida la sesión para evitar estado inconsistente
        this.logout()
        return false
      }
    }
  }
})
