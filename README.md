# TrackMySeries

Aplicación **full-stack** para llevar el control de tus series y películas, construida con **Vue 3** (Vite) en el front-end y **Express + Turso** en el back-end.

Permite:
- Búsqueda de series y películas en TheTVDB.
- Gestión de listas *Watchlist*, *Vistos* y *Favoritos* por usuario.
- Autenticación email/contraseña con JWT.
- Sincronización de listas en la nube vía Turso (con fallback offline a `localStorage`).

---

## Requisitos

- Node >= 18
- npm >= 9
- Clave de API v4 de [TheTVDB](https://thetvdb.com/).

## Instalación paso a paso (desde cero)

### 1. Clonar el repositorio
```bash
git clone https://github.com/AndresM1905/ProyectoGrupal-Multimedios.git

```

### 2. Instalar dependencias del front-end
```bash
npm install           # instala Vite, Vue, Pinia, etc.
```

### 3. Instalar dependencias del back-end
```bash
cd backend
npm install           # Express, Turso client, bcrypt, dotenv…
cd ..                 # vuelve a raíz del proyecto
```

### 4. Obtener claves y variables de entorno
1. Crea un archivo `.env` en la raíz *y* otro en `backend/` a partir de los ejemplos:
   ```bash
   cp .env.example .env
   cp backend/.env.example backend/.env   # si existe
   ```
2. Rellena:
   * `VITE_TVDB_API_KEY` – clave v4 personal de TheTVDB.
   La que me dieron a mí fue: ba615dd2-a5f6-4b44-97f7-245bc3e46667
   * `JWT_SECRET` – cualquier string aleatorio.

### 5. Instalar Turso CLI y crear la base de datos
```bash
# Para la mac con Homebrew
brew install turso      # (primera vez)   instala también sqld

# En Linux / Windows (otros métodos)
curl -sSf https://get.tur.so/install.sh | sh   # o revisar en internet

turso auth login --headless   # abre link, copia token ➜ turso config set token "..."

turso db create trackmyseries           # crea la base

turso db show trackmyseries      # copia la URL libsql://...

turso db tokens create trackmyseries    # genera token de autenticación
```
Coloca `TURSO_URL` y `TURSO_AUTH_TOKEN` en `backend/.env`.

### 6. Aplicar el esquema SQL (tablas `users` y `lists`)
```bash
cat backend/schema.sql | turso db shell trackmyseries
```

### 7. Arrancar la API
```bash
cd backend
npm run dev      # nodemon; puerto 4000 (o el indicado en .env) si no sirve el comando se puede usar npm start.
```

### 8. Arrancar el front-end
```bash
cd ..            # raíz del proyecto
npm run dev      # Vite; URL mostrada en consola, p.e. http://localhost:5173
```

 Abrir el navegador, registrarse y empieza a añadir series y películas.


Abrir `http://localhost:5173` y empiezar a probar.

## Scripts útiles

| Comando            | Descripción                                  |
|--------------------|----------------------------------------------|
| `npm run dev`      | Servidor con HMR                             |
| `npm run build`    | Compila producción a `dist/`                 |
| `npm run preview`  | Sirve la build para probarla localmente      |

## Estructura del proyecto

```
series-tracker-vue/
│  .env.example        # variables de entorno de ejemplo
│  index.html          # HTML raíz inyectado por Vite
│  vite.config.js      # configuración Vite
├─public/              # assets estáticos
├─src/
│  ├─assets/           # CSS global y logos
│  ├─components/       # componentes reutilizables (Hero, Carousel…)
│  ├─views/            # vistas de Router (Home, Search, Lists)
│  ├─stores/           # Pinia stores
│  ├─api/              # helpers de API externas
│  ├─router/           # configuración de rutas
│  └─main.js           # entrada de la app
└─README.md
```

## Variables de entorno

| Variable            | Propósito                                    |
|---------------------|----------------------------------------------|
| `VITE_TVDB_API_KEY` | Clave v4 personal de TheTVDB (frontend) |
| `TURSO_URL`        | URL de conexión a tu base Turso            |
| `TURSO_AUTH_TOKEN` | Token de autenticación Turso                |
| `JWT_SECRET`       | Clave para firmar JWT en el backend         |
| `PORT`             | Puerto en el que corre la API (opcional)    |

## el Roadmap

- [x] Backend Express + JWT + Turso
- [x] Autenticación y sincronización multi-usuario
- [x] Filtro Series / Películas
- [ ] Sección “Populares” usando filtros de TVDB o métricas propias.
- [ ] Tests unitarios (Vitest) y e2e (Cypress).

## Backend (API)

### Instalación y ejecución local
```bash
cd series-tracker-vue/backend
npm install
# copia y rellena .env con TURSO_URL, TURSO_AUTH_TOKEN, JWT_SECRET, PORT
npm run dev
```

### Endpoints principales
| Método | Ruta      | Descripción |
|--------|-----------|-------------|
| POST   | /register | Registro de usuario → JWT |
| POST   | /login    | Login → JWT |
| GET    | /lists    | Obtener listas del usuario |
| POST   | /lists    | Añadir a lista |
| DELETE | /lists    | Quitar de lista |

---

## Licencia

MIT © 2025   

This template should help get you started developing with Vue 3 in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about IDE Support for Vue in the [Vue Docs Scaling up Guide](https://vuejs.org/guide/scaling-up/tooling.html#ide-support).
