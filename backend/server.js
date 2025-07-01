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
  const { show_id } = req.query
  const sql = show_id
    ? 'SELECT * FROM episodes_seen WHERE user_id = ? AND show_id = ?'
    : 'SELECT * FROM episodes_seen WHERE user_id = ?'
  const { rows } = await db.execute({ sql, args: show_id ? [req.user.sub, show_id] : [req.user.sub] })
  res.json(rows)
})

// Upsert episodio
app.post('/episodes', auth, async (req, res) => {
  const { show_id, season, episode, seen = true } = req.body
  if (show_id == null || season == null || episode == null) {
    return res.status(400).json({ error: 'Datos incompletos' })
  }
  await db.execute({
    sql: `INSERT INTO episodes_seen (user_id, show_id, season, episode, seen) VALUES (?, ?, ?, ?, ?)
          ON CONFLICT(user_id, show_id, season, episode)
          DO UPDATE SET seen = excluded.seen, updated_at = CURRENT_TIMESTAMP`,
    args: [req.user.sub, show_id, season, episode, seen ? 1 : 0]
  })
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

// Iniciar servidor
const PORT = process.env.PORT || 4000
app.listen(PORT, () => console.log(`API escuchando en http://localhost:${PORT}`))
