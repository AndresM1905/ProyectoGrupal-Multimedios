// Simple Express API backed by Turso (libsql)
// Endpoints: /register, /login, /lists (GET, POST, DELETE)
// This is a minimal MVP to authenticate users and store their lists.
// To run locally: 1) npm i express jsonwebtoken bcrypt libsql dotenv cors
//                 2) set env vars in .env (see .env.example)
//                 3) node backend/server.js

import express from 'express'
import cors from 'cors'
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import { createClient } from '@libsql/client'
import 'dotenv/config'

// ======== TVDB helper for total episodes back-fill =========
const { TVDB_API_KEY } = process.env
const TVDB_API_BASE = 'https://api4.thetvdb.com/v4'
let tvdbToken = null
let tvdbTokenExpiry = 0

async function getTvdbToken () {
  if (!TVDB_API_KEY) throw new Error('TVDB_API_KEY env var missing')
  const now = Date.now()
  if (tvdbToken && now < tvdbTokenExpiry) return tvdbToken
  const res = await fetch(`${TVDB_API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apikey: TVDB_API_KEY })
  })
  if (!res.ok) throw new Error('TVDB auth failed')
  const { data } = await res.json()
  tvdbToken = data.token
  tvdbTokenExpiry = now + 24 * 60 * 60 * 1000 // 24h
  return tvdbToken
}

// Devuelve número total de episodios de una serie (suma de todas las seasons)
async function fetchTotalEpisodes (seriesId) {
  let page = 0
  let hasMore = true
  let scheme = 'default'
  let total = 0
  const token = await getTvdbToken()
  while (hasMore) {
    const url = `${TVDB_API_BASE}/series/${seriesId}/episodes/${scheme}?page=${page}`
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    if (!res.ok) {
      if (scheme === 'default') { // prueba con esquema official una vez
        scheme = 'official'
        page = 0
        continue
      }
      throw new Error(`TVDB episodes error ${res.status}`)
    }
    const json = await res.json()
    const list = Array.isArray(json.data) ? json.data : (Array.isArray(json.data?.episodes) ? json.data.episodes : [])
    total += list.length
    page = json.links?.next ?? null
    if (page === null) hasMore = false
  }
  return total
}


const app = express()
app.use(cors())
app.use(express.json())

const {
  TURSO_URL,
  TURSO_AUTH_TOKEN,
  JWT_SECRET = 'changeme'
} = process.env

if (!TURSO_URL || !TURSO_AUTH_TOKEN) {
  console.error('TURSO_URL y TURSO_AUTH_TOKEN deben estar definidos en .env')
  process.exit(1)
}

const db = createClient({ url: TURSO_URL, authToken: TURSO_AUTH_TOKEN })

// Helper para crear JWT
function signToken (userId) {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: '7d' })
}

// Middleware para verificar token
function auth (req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'Token faltante' })
  try {
    req.user = jwt.verify(token, JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ error: 'Token inválido' })
  }
}

// Registro
app.post('/register', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Datos incompletos' })
  const hash = await bcrypt.hash(password, 10)
  try {
    const id = crypto.randomUUID()
    await db.execute({
      sql: 'INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)',
      args: [id, email, hash]
    })
    res.json({ token: signToken(id) })
  } catch (err) {
    if (err.message.includes('UNIQUE')) return res.status(409).json({ error: 'Email en uso' })
    console.error(err)
    res.status(500).json({ error: 'Error de servidor' })
  }
})

// Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body
  const { rows } = await db.execute({ sql: 'SELECT * FROM users WHERE email = ?', args: [email] })
  const user = rows[0]
  if (!user) return res.status(401).json({ error: 'Credenciales inválidas' })
  const ok = await bcrypt.compare(password, user.password_hash)
  if (!ok) return res.status(401).json({ error: 'Credenciales inválidas' })
  res.json({ token: signToken(user.id) })
})

// Obtener listas del usuario
app.get('/lists', auth, async (req, res) => {
  const { rows } = await db.execute({ sql: 'SELECT * FROM lists WHERE user_id = ?', args: [req.user.sub] })
  res.json(rows)
})

// Añadir a lista
app.post('/lists', auth, async (req, res) => {
  const { tvdb_id, type, list_name, title, img, year } = req.body
  if (!tvdb_id || !type || !list_name) return res.status(400).json({ error: 'Datos incompletos' })
  await db.execute({
    sql: 'INSERT INTO lists (user_id, tvdb_id, type, list_name, title, img, year) VALUES (?, ?, ?, ?, ?, ?, ?)',
    args: [req.user.sub, tvdb_id, type, list_name, title || '', img || '', year || '']
  })
  res.json({ ok: true })
})

// Eliminar de lista
// Eliminar de lista por tvdb_id + list_name (+type)
app.delete('/lists', auth, async (req, res) => {
  const { tvdb_id, list_name, type } = req.body
  if (!tvdb_id || !list_name) return res.status(400).json({ error: 'Datos incompletos' })
  await db.execute({
    sql: 'DELETE FROM lists WHERE user_id = ? AND tvdb_id = ? AND list_name = ?' + (type ? ' AND type = ?' : ''),
    args: type ? [req.user.sub, tvdb_id, list_name, type] : [req.user.sub, tvdb_id, list_name]
  })
  res.json({ ok: true })
})

// ================= Episodios vistos ==================
// Obtener episodios vistos (opcional show_id)
app.get('/episodes', auth, async (req, res) => {
  const t0 = Date.now()
  console.log('[EPISODES] inicio')

  const { show_id } = req.query
  let sql
  if (show_id) {
    sql = 'SELECT * FROM episodes_seen WHERE user_id = ? AND show_id = ? AND seen = 1'
  } else {
    sql = `SELECT show_id,
                 COALESCE(MAX(total_episodes), 0) AS total_episodes,
                 COUNT(*)                      AS seen_count
            FROM episodes_seen
            WHERE user_id = ? AND seen = 1
            GROUP BY show_id`
  }
  let rows
  try {
    const argsArr = show_id ? [req.user.sub, show_id] : [req.user.sub]
    const result = await db.execute({ sql, args: argsArr })
    rows = result.rows.map(obj => {
      const out = {}
      for (const [k, v] of Object.entries(obj)) {
        out[k] = typeof v === 'bigint' ? Number(v) : v
      }
      return out
    })
    console.log('[EPISODES] consulta OK', rows.length, 'filas')
    // Back-fill total_episodes si viene 0 y hay episodios vistos
    for (const row of rows) {
      if (!row.total_episodes && row.seen_count > 0) {
        try {
          const totalEp = await fetchTotalEpisodes(row.show_id)
          if (totalEp) {
            row.total_episodes = totalEp
            // Actualiza en base (pone una sola fila dummy season=0 episode=0)
            await db.execute({
              sql: `INSERT INTO episodes_seen (user_id, show_id, season, episode, seen, total_episodes)
                     VALUES (?, ?, 0, 0, 1, ?)
                     ON CONFLICT(user_id, show_id, season, episode) DO UPDATE SET total_episodes = EXCLUDED.total_episodes`,
              args: [req.user.sub, row.show_id, totalEp]
            })
          }
        } catch (err) {
          console.error('backfill total_episodes', row.show_id, err.message)
        }
      }
    }
  } catch (err) {
    console.error('[EPISODES] error SQL', err)
    return res.status(500).json({ error: 'db error' })
  }
  res.json(rows)
})

// Upsert episodio
app.post('/episodes', auth, async (req, res) => {
  const { show_id, season, episode, seen = true, total_episodes } = req.body
  if (show_id == null || season == null || episode == null) {
    return res.status(400).json({ error: 'Datos incompletos' })
  }
  await db.execute({
    sql: `INSERT INTO episodes_seen (user_id, show_id, season, episode, seen, total_episodes) VALUES (?, ?, ?, ?, ?, ?)
          ON CONFLICT(user_id, show_id, season, episode)
          DO UPDATE SET seen = excluded.seen,
                       updated_at = CURRENT_TIMESTAMP,
                       total_episodes = COALESCE(excluded.total_episodes, episodes_seen.total_episodes)`,
    args: [req.user.sub, show_id, season, episode, seen ? 1 : 0, total_episodes]
  })

  // Si aún no tenemos total_episodes guardado para esta serie, obténlo una vez y actualiza
  const { rows: totalRows } = await db.execute({
    sql: 'SELECT 1 FROM episodes_seen WHERE user_id = ? AND show_id = ? AND total_episodes IS NOT NULL LIMIT 1',
    args: [req.user.sub, show_id]
  })
  if (totalRows.length === 0) {
    const total = await fetchTotalEpisodes(show_id).catch(() => 0)
    if (total > 0) {
      await db.execute({
        sql: 'UPDATE episodes_seen SET total_episodes = ? WHERE user_id = ? AND show_id = ?',
        args: [total, req.user.sub, show_id]
      })
    }
  }
  res.json({ ok: true })
})

// Borrar progreso de una serie
app.delete('/episodes/:showId', auth, async (req, res) => {
  const { showId } = req.params
  await db.execute({
    sql: 'DELETE FROM episodes_seen WHERE user_id = ? AND show_id = ?',
    args: [req.user.sub, showId]
  })
  res.json({ ok: true })
})

// ===== Back-fill totals once at startup =====
async function backfillMissingTotals () {
  try {
    const { rows } = await db.execute({
      sql: 'SELECT DISTINCT user_id, show_id FROM episodes_seen WHERE total_episodes IS NULL AND seen = 1',
      args: []
    })
    console.log('Back-fill pendientes:', rows.length)
    for (const row of rows) {
      const total = await fetchTotalEpisodes(row.show_id).catch(() => 0)
      if (total > 0) {
        await db.execute({
          sql: 'UPDATE episodes_seen SET total_episodes = ? WHERE user_id = ? AND show_id = ? AND total_episodes IS NULL',
          args: [total, row.user_id, row.show_id]
        })
        console.log(`Total ${total} episodios para serie ${row.show_id} (usuario ${row.user_id})`)
      }
    }
    console.log('Back-fill completado')
  } catch (err) {
    console.error('Error back-fill startup', err)
  }
}
backfillMissingTotals()

// Iniciar servidor
const PORT = process.env.PORT || 4000
app.listen(PORT, () => console.log(`API escuchando en http://localhost:${PORT}`))
