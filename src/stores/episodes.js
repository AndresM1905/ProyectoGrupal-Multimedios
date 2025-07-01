
import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

// Guarda los episodios vistos por serie
// estructura: { [seriesId]: Set(episodeId) } // seen
// totals: { [seriesId]: number }
import { api } from './auth'

export const useEpisodesStore = defineStore('episodes', () => {
  const seen = ref({})
  const totals = ref({})

  function isSeen (seriesId, episodeId) {
    return !!seen.value[seriesId]?.has(episodeId)
  }

  async function toggleEpisode (seriesId, episodeId, season) {
    if (!seen.value[seriesId]) seen.value[seriesId] = new Set()
    const isCurrentlySeen = seen.value[seriesId].has(episodeId)
    if (isCurrentlySeen) {
      seen.value[seriesId].delete(episodeId)
    } else {
      seen.value[seriesId].add(episodeId)
    }
    // Persistir
    try {
      await api.post('/episodes', {
        show_id: seriesId,
        season,
        episode: episodeId,
        seen: !isCurrentlySeen
      })
    } catch (e) {
      console.error('sync episode', e)
    }
  }

  async function loadFromApi (seriesId) {
    try {
      const { data } = await api.get('/episodes', { params: seriesId ? { show_id: seriesId } : {} })
            // Reemplazar sets para reflejar exactamente lo que viene del backend
      if (seriesId) {
        seen.value[seriesId] = new Set()
      }
      data.forEach(row => {
        if (!seen.value[row.show_id]) seen.value[row.show_id] = new Set()
        if (row.seen) seen.value[row.show_id].add(row.episode)
      })
    } catch (e) {
      console.error('load episodes', e)
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

  return { seen, totals, isSeen, toggleEpisode, loadFromApi, countSeen, setTotal, getTotal, percentSeen }
})
