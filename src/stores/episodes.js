import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

// Guarda los episodios vistos por serie
// estructura: { [seriesId]: Set(episodeId) }
export const useEpisodesStore = defineStore('episodes', () => {
  const seen = ref({})

  function isSeen (seriesId, episodeId) {
    return !!seen.value[seriesId]?.has(episodeId)
  }

  function toggleEpisode (seriesId, episodeId) {
    if (!seen.value[seriesId]) seen.value[seriesId] = new Set()
    if (seen.value[seriesId].has(episodeId)) {
      seen.value[seriesId].delete(episodeId)
    } else {
      seen.value[seriesId].add(episodeId)
    }
  }

  function countSeen (seriesId) {
    return seen.value[seriesId] ? seen.value[seriesId].size : 0
  }

  // Persiste en localStorage
  const LS_KEY = 'trackmyseries_episodes'
  const raw = localStorage.getItem(LS_KEY)
  if (raw) {
    try {
      const parsed = JSON.parse(raw)
      // restore as sets
      Object.keys(parsed).forEach(k => {
        seen.value[k] = new Set(parsed[k])
      })
    } catch (e) {
      console.error('Error loading episodes from LS', e)
    }
  }

  watch(seen, (val) => {
    const serializable = {}
    Object.keys(val).forEach(k => {
      serializable[k] = Array.from(val[k])
    })
    localStorage.setItem(LS_KEY, JSON.stringify(serializable))
  }, { deep: true })

  return { seen, isSeen, toggleEpisode, countSeen }
})
