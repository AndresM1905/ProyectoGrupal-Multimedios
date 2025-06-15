-- Esquema mínimo para Series Tracker

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lists (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  tvdb_id INTEGER NOT NULL,
  type TEXT CHECK(type IN ('serie','pelicula')) NOT NULL,
  list_name TEXT CHECK(list_name IN ('watchlist','watched','favorites')) NOT NULL,
  title TEXT,
  img TEXT,
  year TEXT,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
