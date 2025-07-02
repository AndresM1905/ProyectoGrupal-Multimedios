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

-- Progreso de episodios vistos por usuario
CREATE TABLE IF NOT EXISTS episodes_seen (
  user_id TEXT NOT NULL,
  show_id INTEGER NOT NULL,
  season INTEGER NOT NULL,
  episode INTEGER NOT NULL,
  seen BOOLEAN NOT NULL DEFAULT 1,
  total_episodes INTEGER,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, show_id, season, episode),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
