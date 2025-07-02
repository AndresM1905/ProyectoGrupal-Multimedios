
import { defineStore } from 'pinia'
import { getEpisodes } from '../api/tvdb'
import { ref, watch, reactive } from 'vue'

// Guarda los episodios vistos por serie
// estructura: { [seriesId]: Set(episodeId) } // seen
// totals: { [seriesId]: number }
import { api } from './auth'

export const useEpisodesStore = defineStore('episodes', () => {
  const seen = ref({})
  const totals = reactive({})
  const ready = ref(false)
  const counters = reactive({})  // número de episodios vistos por serie (reactivo)

  function key (id) { return String(id) }

  function isSeen (seriesId, episodeId) {
    const id = key(seriesId)
    return !!seen.value[id]?.has(episodeId)
  }

  function updateCounter (seriesId) {
    counters[key(seriesId)] = countSeen(seriesId)
  }

  async function toggleEpisode (seriesId, episodeId, season) {
    const idKey = key(seriesId)
    if (!seen.value[idKey]) seen.value[idKey] = new Set()
    const isCurrentlySeen = seen.value[idKey].has(episodeId)
    if (isCurrentlySeen) {
      seen.value[idKey].delete(episodeId)
    } else {
      seen.value[idKey].add(episodeId)
    }
    // Actualizar contador para reactividad inmediata en la UI
    updateCounter(seriesId)
    // Si aún no tenemos total, obténlo SINCRÓNICAMENTE antes de persistir para que el backend reciba el total de inmediato
    let totalForPost = getTotal(seriesId)
    if (!totalForPost) {
      try {
        const seasons = await getEpisodes(Number(seriesId))
        totalForPost = Object.values(seasons).reduce((s, list) => s + list.length, 0)
        if (totalForPost) setTotal(seriesId, totalForPost)
      } catch (e) { console.error('fetch total sync', e) }
    }
    // Persistir
    try {
      await api.post('/episodes', {
        total_episodes: totalForPost || undefined,
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
    ready.value = false
    try {
      const idParam = seriesId ? key(seriesId) : undefined
      const { data } = await api.get('/episodes', { params: idParam ? { show_id: idParam } : {} })
            // Reemplazar sets para reflejar exactamente lo que viene del backend
      if (seriesId) {
        seen.value[key(seriesId)] = new Set()
      }
      const temp = {}
      data.forEach(row => {
        // Nuevo formato agregado (sin episode/seen)
        if ('seen_count' in row) {
          totals[key(row.show_id)] = row.total_episodes || 0
          counters[key(row.show_id)] = row.seen_count || 0
          // sin sets individuales; crea uno vacío para evitar undefined
          if (!seen.value[key(row.show_id)]) seen.value[key(row.show_id)] = new Set()
          // contador ya establecido, no recalculamos para no perder valor
          return
        }
        // Formato antiguo (una fila por episodio)
        if (row.total_episodes != null) {
          totals[key(row.show_id)] = row.total_episodes
        }
        const rowId = key(row.show_id)
        if (!temp[rowId]) temp[rowId] = []
        if (row.seen) temp[rowId].push(row.episode)
      })
      Object.keys(temp).forEach(id => {
        seen.value[key(id)] = new Set(temp[id])
        updateCounter(id)
      })

      // Back-fill: series con episodios vistos pero sin total guardado
      const pending = Object.keys(seen.value).filter(id => countSeen(id) > 0 && !getTotal(id))
      await Promise.all(pending.map(async id => {
        try {
          const seasons = await getEpisodes(Number(id))
          const total = Object.values(seasons).reduce((s, list) => s + list.length, 0)
          if (total) {
            setTotal(id, total)
            await api.post('/episodes', {
              show_id: id,
              season: 0,
              episode: 0,
              seen: true,
              total_episodes: total
            })
          }
        } catch (err) {
          console.error('backfill total', id, err)
        }
      }))
    } catch (e) {
      console.error('load episodes', e)
    }
    // Recalcula contadores sólo donde aún no tengamos contador (evita sobreescribir valores agregados)
    Object.keys(seen.value).forEach(id => {
      const idKey = key(id)
      if (counters[idKey] === undefined || counters[idKey] === 0) {
        updateCounter(id)
      }
    })
    ready.value = true
  }

  function countSeen (seriesId) {
    return seen.value[key(seriesId)] ? seen.value[key(seriesId)].size : 0
  }

  function setTotal (seriesId, total) {
    totals[key(seriesId)] = total
  }

  function getTotal (seriesId) {
    return totals[key(seriesId)] || 0
  }

  function getPercent (seriesId) {
    const total = getTotal(seriesId)
    const seenCnt = counters[key(seriesId)] || 0
    return total ? Math.round(seenCnt / total * 100) : 0
  }

  // mantener compat antigua
  function percentSeen (seriesId) {
    return getPercent(seriesId)
  }

  // Persiste en localStorage
  const LS_KEY = 'trackmyseries_episodes'
  const raw = localStorage.getItem(LS_KEY)
  if (raw) {
    try {
      const parsed = JSON.parse(raw)
      const savedSeen = parsed.seen || parsed // backward compat
      Object.keys(savedSeen).forEach(k => {
        seen.value[key(k)] = new Set(savedSeen[k])
      })
      if (parsed.totals) Object.assign(totals, parsed.totals)
    } catch (e) {
      console.error('Error loading episodes from LS', e)
    }
  }

  watch([seen, totals], () => {
    const serializable = {}
    Object.keys(seen.value).forEach(k => {
      serializable[k] = Array.from(seen.value[k])
    })
    const totalsObj = { ...totals }
    localStorage.setItem(LS_KEY, JSON.stringify({ seen: serializable, totals: totalsObj }))
  }, { deep: true })

  return { seen, totals, counters, ready, isSeen, toggleEpisode, loadFromApi, countSeen, setTotal, getTotal, percentSeen, getPercent }
})
