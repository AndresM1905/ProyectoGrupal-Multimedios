

const API_KEY = import.meta.env.VITE_TVDB_API_KEY
const API_BASE = 'https://api4.thetvdb.com/v4'
const TOKEN_STORAGE_KEY = 'tvdb_jwt'

async function getToken () {
  if (!API_KEY) {
    throw new Error('TVDB API key missing. Define VITE_TVDB_API_KEY in your .env file.')
  }

  // Si ya tengo un token lo reutilizo
  const cached = sessionStorage.getItem(TOKEN_STORAGE_KEY)
  if (cached) {
    return cached
  }

  // Pido un token nuevo
  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ apikey: API_KEY })
  })

  if (!res.ok) {
    throw new Error('TVDB auth failed')
  }

  const { data } = await res.json()
  sessionStorage.setItem(TOKEN_STORAGE_KEY, data.token)
  return data.token
}

export async function searchSeries (query) {
  const token = await getToken()
  const url = `${API_BASE}/search?query=${encodeURIComponent(query)}&type=series`
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  if (!res.ok) {
    throw new Error('Search request failed')
  }
  const json = await res.json()
  const list = json.data || []
    // Devuelvo solo los datos que voy a usar
  return list.map(item => {
    let year = ''
    if (item.firstAired) {
      year = item.firstAired.slice(0, 4)
    } else if (item.year) {
      year = String(item.year)
    } else if (item.first_air_time) {
      year = item.first_air_time.slice(0, 4)
    }
    return {
      id: item.tvdb_id || item.id,
      title: item.name || item.slug || 'Serie',
      img: item.image_url || item.imageUrl || item.image || 'https://via.placeholder.com/342x513?text=No+Image',
      year,
      type: 'serie'
    }
  })
}

// Búsqueda de películas
export async function searchMovies (query) {
  const token = await getToken()
  const url = `${API_BASE}/search?query=${encodeURIComponent(query)}&type=movie`
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  })
  if (!res.ok) throw new Error('Search request failed')
  const { data = [] } = await res.json()
  return data.map(item => {
    const year = item.year ? String(item.year) : (item.released ? item.released.slice(0, 4) : '')
    return {
      id: item.tvdb_id || item.id,
      title: item.name || item.slug || 'Película',
      img: item.image_url || item.imageUrl || item.image || 'https://via.placeholder.com/342x513?text=No+Image',
      year,
      type: 'pelicula'
    }
  })
}

// Obtiene algunos títulos de ejemplo para poblar la pantalla de inicio durante el desarrollo
// Obtiene temporadas y episodios de una serie y los agrupa por número de temporada
export async function getEpisodes (seriesId) {
  if (!seriesId) return {}
  const token = await getToken()

  // usamos API_BASE ya definido arriba
  const seasons = {}
  let page = 0
  let hasMore = true

  let scheme = 'default'
  while (hasMore) {
    const url = `${API_BASE}/series/${seriesId}/episodes/${scheme}?page=${page}`
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    if (!res.ok) throw new Error('Error al obtener episodios')
    const json = await res.json()
    const list = Array.isArray(json.data) ? json.data : (Array.isArray(json.data?.episodes) ? json.data.episodes : [])
    if (list.length === 0) {
      // si usando "default" no hay datos, probamos con "official"
      if (scheme === 'default') {
        scheme = 'official'
        page = 1
        continue
      }

      hasMore = false
      break
    }

    list.forEach(ep => {
      const seasonNum = ep.airedSeason || ep.seasonNumber || 0
      if (!seasons[seasonNum]) seasons[seasonNum] = []
      seasons[seasonNum].push({
        id: ep.id,
        name: ep.name || ep.overview || `E${ep.number}`,
        number: ep.number || ep.airedEpisodeNumber,
        overview: ep.overview || '',
        image: ep.image || ''
      })
    })

    page = json.links?.next ?? null
    if (page === null) hasMore = false
  }

  // Ordena episodios y temporadas
  Object.values(seasons).forEach(list => list.sort((a, b) => a.number - b.number))
  return seasons
}

export async function getDetails (show) {
  if (!show || !show.id) throw new Error('show object with id required')
  const token = await getToken()
  const endpoint = show.type === 'pelicula' ? `movies/${show.id}` : `series/${show.id}`
  const res = await fetch(`${API_BASE}/${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  if (!res.ok) throw new Error('Details request failed')
  const { data } = await res.json()
  if (!data) return {}

  // Normaliza géneros a array de strings
  const genresArr = Array.isArray(data.genres) ? data.genres.map(g => g.name || g).filter(Boolean) : []
  // Normaliza overview (puede venir por idioma)
  let overviewTxt = ''
  if (typeof data.overview === 'string') {
    overviewTxt = data.overview
  } else if (data.overview && typeof data.overview === 'object') {
    overviewTxt = data.overview.es || data.overview.en || Object.values(data.overview)[0] || ''
  }
  // Normaliza status (puede ser objeto)
  let statusTxt = ''
  if (typeof data.status === 'string') {
    statusTxt = data.status
  } else if (data.status && typeof data.status === 'object') {
    statusTxt = data.status.name || ''
  }

  return {
    overview: overviewTxt,
    genres: genresArr,
    status: statusTxt,
    runtime: data.averageRuntime || data.runtime || '',
    rating: data.score || data.rating || null
  }
}

export async function getDemoData () {
  const titles = [
    'The Last of Us',
    'Breaking Bad',
    'Game of Thrones',
    'Friends',
    'The Office',
    'Stranger Things',
    'Arcane',
    'House of the Dragon',
    'Sex and the City',
    'Loki'
  ]

  // Lanzo todas las búsquedas en paralelo
  const responses = await Promise.allSettled(titles.map(t => searchSeries(t)))
  const map = {}
  titles.forEach((t, idx) => {
    const r = responses[idx]
    if (r.status === 'fulfilled' && r.value.length) {
      map[t] = r.value[0]
    }
  })

  const heroSrc = map['The Last of Us'] || Object.values(map)[0]
  const hero = heroSrc
    ? {
        background: heroSrc.img,
        title: heroSrc.title,
        meta: '',
        progressCurrent: 0,
        progressMax: 1
      }
    : null

  const continuar = [
    map['Breaking Bad'],
    map['Game of Thrones'],
    map['Friends'],
    map['The Office']
  ].filter(Boolean).map(s => ({
    ...s,
    season: 1,
    episode: 1,
    maxEpisodes: 1
  }))

  const biblioteca = [
    map['Stranger Things'],
    map['Arcane'],
    map['House of the Dragon'],
    map['Sex and the City'],
    map['Loki']
  ].filter(Boolean)

  return { hero, continuar, biblioteca }
}
