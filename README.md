# TrackMySeries

Aplicación SPA para llevar el control de tus series favoritas, construida con **Vue 3**, **Vite**, **Pinia** y **Vue Router**.

Permite:
- Buscar series en TheTVDB.
- Añadirlas a *Watchlist*, *Vistos* o *Favoritos*.
- Persistencia local vía `localStorage` (próximamente Turso).

---

## Requisitos

- Node >= 18
- npm >= 9
- Clave de API v4 de [TheTVDB](https://thetvdb.com/).

## Puesta en marcha

```bash
# 1. Clona el repo
$ git clone https://github.com/tu-usuario/trackmyseries.git
$ cd trackmyseries/series-tracker-vue

# 2. Instala dependencias
$ npm install

# 3. Variables de entorno
#   Copia el ejemplo y pega tu TVDB API Key
$ cp .env.example .env
$ echo "VITE_TVDB_API_KEY=TU_API_KEY" >> .env

# 4. Inicia el servidor de desarrollo
$ npm run dev
```

Abre `http://localhost:5173` y empieza a probar.

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
| `VITE_TVDB_API_KEY` | Clave v4 personal de TheTVDB (obligatoria)   |

## Roadmap breve

- [ ] Autenticación de usuario (Turso + Clerk)
- [ ] Sincronizar listas en la nube.
- [ ] Sección “Populares” usando filtros de TVDB o métricas propias.
- [ ] Tests unitarios (Vitest) y e2e (Cypress).

## Licencia

MIT © 2025   

This template should help get you started developing with Vue 3 in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about IDE Support for Vue in the [Vue Docs Scaling up Guide](https://vuejs.org/guide/scaling-up/tooling.html#ide-support).
