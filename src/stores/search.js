import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { searchSeries, searchMovies } from '../api/tvdb'

export const useSearchStore = defineStore('search', () => {
  const isOpen = ref(false)
  const query = ref('')
  const type = ref('all') // all | serie | pelicula
  const results = ref([])
  const loading = ref(false)
  const error = ref('')

  async function runSearch () {
    if (!query.value.trim()) return
    loading.value = true
    error.value = ''
    try {
      if (type.value === 'serie') {
        results.value = await searchSeries(query.value.trim())
      } else if (type.value === 'pelicula') {
        results.value = await searchMovies(query.value.trim())
      } else {
        const [series, movies] = await Promise.all([
          searchSeries(query.value.trim()),
          searchMovies(query.value.trim())
        ])
        results.value = [...series, ...movies]
      }
    } catch (err) {
      console.error(err)
      error.value = 'Error al buscar. Intenta nuevamente.'
    } finally {
      loading.value = false
    }
  }

  function open () {
    isOpen.value = true
  }
  function close () {
    isOpen.value = false
    results.value = []
    error.value = ''
    loading.value = false
  }

  // Auto-search when query or type changes (debounced)
  let debounceId
  watch([query, type], () => {
    // limpiar resultados si no hay texto
    if (!query.value.trim()) {
      results.value = []
      loading.value = false
      error.value = ''
      if (debounceId) clearTimeout(debounceId)
      return
    }
    if (debounceId) clearTimeout(debounceId)
    debounceId = setTimeout(() => {
      runSearch()
    }, 400)
  })

  return { isOpen, query, type, results, loading, error, open, close, runSearch }
})
