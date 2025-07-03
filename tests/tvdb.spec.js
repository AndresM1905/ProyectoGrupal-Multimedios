import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import * as tvdb from '../src/api/tvdb'

const token = 'FAKE_TOKEN'

function mockSessionStorage () {
  const store = {}
  return {
    getItem: vi.fn(key => store[key]),
    setItem: vi.fn((key, val) => { store[key] = val })
  }
}

function createFetchMock (expectedUrl, dataArray) {
  return vi.fn((url, opts = {}) => {
    // login request will never happen because we preload token in sessionStorage
    if (url.includes('/search')) {
      expect(url).toBe(expectedUrl)
      expect(opts.headers?.Authorization).toBe(`Bearer ${token}`)
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: dataArray })
      })
    }
    // fallback (should not be called)
    return Promise.resolve({ ok: false, json: () => ({}) })
  })
}

// Helper to prepare environment for each test
function setupEnv (fetchMock) {
  global.sessionStorage = mockSessionStorage()
  global.sessionStorage.getItem.mockReturnValue(token)
  global.fetch = fetchMock
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('tvdb search functions', () => {
  it('searchSeries construye URL correcta y mapea respuesta', async () => {
    const query = 'Breaking Bad'
    const apiBase = 'https://api4.thetvdb.com/v4'
    const expUrl = `${apiBase}/search?query=${encodeURIComponent(query)}&type=series`
    const sample = {
      tvdb_id: 123,
      name: 'Breaking Bad',
      image_url: 'img.jpg',
      year: 2008
    }
    setupEnv(createFetchMock(expUrl, [sample]))

    const result = await tvdb.searchSeries(query)
    expect(result).toEqual([
      {
        id: 123,
        title: 'Breaking Bad',
        img: 'img.jpg',
        year: '2008',
        type: 'serie'
      }
    ])
  })

  it('searchMovies construye URL correcta y mapea respuesta', async () => {
    const query = 'Inception'
    const apiBase = 'https://api4.thetvdb.com/v4'
    const expUrl = `${apiBase}/search?query=${encodeURIComponent(query)}&type=movie`
    const sample = {
      id: 456,
      slug: 'inception',
      imageUrl: 'movie.jpg',
      released: '2010-07-16'
    }
    setupEnv(createFetchMock(expUrl, [sample]))

    const result = await tvdb.searchMovies(query)
    expect(result).toEqual([
      {
        id: 456,
        title: 'inception',
        img: 'movie.jpg',
        year: '2010',
        type: 'pelicula'
      }
    ])
  })
})
