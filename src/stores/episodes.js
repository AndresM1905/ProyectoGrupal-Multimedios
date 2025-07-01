import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

// Guarda los episodios vistos por serie
// estructura: { [seriesId]: Set(episodeId) } // seen
// totals: { [seriesId]: number }
export const useEpisodesStore = defineStore('episodes', () => {
  const seen = ref({})
  const totals = ref({})

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

  function setTotal (seriesId, total) {
    totals.value[seriesId] = total
  }

  function getTotal (seriesId) {
    return totals.value[seriesId] || 0
  }

  function percentSeen (seriesId) {
    const total = getTotal(seriesId)
    return total ? Math.round(countSeen(seriesId) / total * 100) : 0
  }

  // Persiste en localStorage
  const LS_KEY = 'trackmyseries_episodes'
  const raw = localStorage.getItem(LS_KEY)
  if (raw) {
    try {
      const parsed = JSON.parse(raw)
      const savedSeen = parsed.seen || parsed // backward compat
      Object.keys(savedSeen).forEach(k => {
        seen.value[k] = new Set(savedSeen[k])
      })
      if (parsed.totals) totals.value = parsed.totals
    } catch (e) {
      console.error('Error loading episodes from LS', e)
    }
  }

  watch([seen, totals], () => {
    const serializable = {}
    Object.keys(seen.value).forEach(k => {
      serializable[k] = Array.from(seen.value[k])
    })
    const totalsObj = { ...totals.value }
    localStorage.setItem(LS_KEY, JSON.stringify({ seen: serializable, totals: totalsObj }))
  }, { deep: true })

  return { seen, totals, isSeen, toggleEpisode, countSeen, setTotal, getTotal, percentSeen }
})
