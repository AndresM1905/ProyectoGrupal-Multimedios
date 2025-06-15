// Store Pinia para mis listas (watchlist, vistos y favoritos). Persiste en localStorage.

import { defineStore } from 'pinia'

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
    toggle (listName, show) {
      const list = this[listName]
      const idx = list.findIndex(s => s.id === show.id)
      if (idx === -1) {
        list.push(show)
      } else {
        list.splice(idx, 1)
      }
      saveToStorage(this)
    },
    isIn (listName, id) {
      return this[listName].some(s => s.id === id)
    },
    clearAll () {
      this.watchlist = []
      this.watched = []
      this.favorites = []
      saveToStorage(this)
    }
  }
})
