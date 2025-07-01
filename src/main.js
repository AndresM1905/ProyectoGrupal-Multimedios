import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
// import './style.css'  // eliminado para prevenir estilos base que interferían en mobile
import './assets/styles.css'
import App from './App.vue'
import { useAuthStore } from './stores/auth'
import { useEpisodesStore } from './stores/episodes'
import { getEpisodes } from './api/tvdb'
import { useListsStore } from './stores/lists'

async function bootstrap () {
  const app = createApp(App)
  const pinia = createPinia()
  app.use(pinia)
  app.use(router)

  const auth = useAuthStore()
  const lists = useListsStore()
  const episodesStore = useEpisodesStore()

  const { useSearchStore } = await import('./stores/search')
  const search = useSearchStore()
  search.close()

  if (await auth.validate()) {
    // cargar listas y progreso
    await lists.loadFromApi()
    await episodesStore.loadFromApi()

    // Pre-cargar totales de episodios para series en listas para que las barras aparezcan sin abrir el modal
    const seriesIds = new Set()
    ;['watchlist', 'watched', 'favorites'].forEach(name => {
      lists[name].forEach(item => {
        if ((item.type || 'serie') === 'serie' && !episodesStore.getTotal(item.id)) {
          seriesIds.add(item.id)
        }
      })
    })
    for (const id of seriesIds) {
      try {
        const seasons = await getEpisodes(id)
        const totalEp = Object.values(seasons).reduce((s, list) => s + list.length, 0)
        episodesStore.setTotal(id, totalEp)
      } catch (e) {
        console.error('preload total episodes', id, e)
      }
    }
  } else if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
    await router.replace('/login')
  }

  await router.isReady()
  app.mount('#app')
}

bootstrap()
