// Store Pinia para mis listas (watchlist, vistos y favoritos). Persiste en localStorage.

import { defineStore } from 'pinia'
import { api } from './auth'
import { useAuthStore } from './auth'

const STORAGE_KEY = 'trackmyseries_lists'

function loadFromStorage () {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
      watchlist: [],
      watched: [],
      favorites: []
    }
  } catch (e) {
    console.error('No pude leer listas guardadas', e)
    return { watchlist: [], watched: [], favorites: [] }
  }
}

function saveToStorage (state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    watchlist: state.watchlist,
    watched: state.watched,
    favorites: state.favorites
  }))
}

export const useListsStore = defineStore('lists', {
  state: () => ({
    ...loadFromStorage()
  }),
  actions: {
    // Añade o quita una serie en la lista indicada
    async toggle (listName, show) {
      const list = this[listName]
      const idx = list.findIndex(s => s.id === show.id && (s.type || 'serie') === (show.type || 'serie'))
      if (idx === -1) {
        list.push(show)
        // sync API si hay sesión
        const auth = useAuthStore()
        if (auth.token) {
          try {
            await api.post('/lists', {
              tvdb_id: show.id,
              title: show.title,
              img: show.img,
              year: show.year,
              type: show.type || 'serie',
              list_name: listName
            })
          } catch (e) { console.error('Error al guardar en servidor', e) }
        }
      } else {
        const removed = list.splice(idx, 1)[0]
        const auth = useAuthStore()
        if (auth.token) {
          try {
            await api.delete('/lists', { data: { tvdb_id: removed.id, type: removed.type || 'serie', list_name: listName } })
          } catch (e) { console.error('Error al borrar en servidor', e) }
        }
      }
      saveToStorage(this)
    },
    isIn (listName, id, type = null) {
      return this[listName].some(s => s.id === id && (type ? (s.type || 'serie') === type : true))
    },
    // Devuelve la lista filtrada por tipo ('serie', 'pelicula' o 'all')
    getFiltered (listName, type = 'all') {
      if (type === 'all') return this[listName]
      return this[listName].filter(s => (s.type || 'serie') === type)
    },
    async loadFromApi () {
      const auth = useAuthStore()
      if (!auth.token) return
      try {
        const { data } = await api.get('/lists')
        this.watchlist = []
        this.watched = []
        this.favorites = []
        data.forEach(item => {
          const obj = {
            id: item.tvdb_id,
            title: item.title,
            img: item.img,
            year: item.year,
            type: item.type
          }
          this[item.list_name].push(obj)
        })
        saveToStorage(this)
      } catch (e) {
        console.error('No pude cargar listas del servidor', e)
      }
    },
    clearAll () {
      this.watchlist = []
      this.watched = []
      this.favorites = []
      saveToStorage(this)
    }
  }
})
