import { createApp, nextTick } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import './assets/styles.css'
import App from './App.vue'
import { useAuthStore } from './stores/auth'
import { useEpisodesStore } from './stores/episodes'

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

  // Montamos de inmediato para mostrar UI mientras se cargan datos; los componentes se actualizarán reactivamente
  app.mount('#app')

  // precarga totales de episodios sin bloquear la UI
  async function preloadTotals (listsStore, episodesStore) {
    const seriesIds = new Set()
    // solo series que ya tienen al menos un episodio visto
    Object.keys(episodesStore.seen).forEach(id => {
      if (episodesStore.countSeen(id) > 0 && !episodesStore.getTotal(id)) {
        seriesIds.add(id)
      }
    })
    ;['watchlist', 'watched', 'favorites'].forEach(name => {
      listsStore[name].forEach(item => {
        if ((item.type || 'serie') === 'serie' && !episodesStore.getTotal(item.id)) {
          seriesIds.add(item.id)
        }
      })
    })
    for (const id of seriesIds) {
      try {
        const numericId = Number(id)
        const seasons = await getEpisodes(numericId)
        const totalEp = Object.values(seasons).reduce((s, list) => s + list.length, 0)
        if (totalEp) episodesStore.setTotal(numericId, totalEp)
      } catch (e) {
        console.error('preload total episodes', id, e)
      }
    }
  }

  try {
    const isAuth = await auth.validate()
    if (isAuth) {
      // cargar listas y progreso
      await lists.loadFromApi()
      // Pre-crea propiedades reactivas de contador para todas las series antes de montar, evitando el problema de tracking en Safari
      ;['watchlist','watched','favorites'].forEach(name => {
        lists[name].forEach(item => {
           const idKey = String(item.id)
           if (!episodesStore.counters[idKey]) episodesStore.counters[idKey] = 0
           if (!episodesStore.totals[idKey]) episodesStore.totals[idKey] = 0
        })
      })
      await episodesStore.loadFromApi()
      await preloadTotals(lists, episodesStore)
      // Espera a que la reactividad calcule contadores antes del primer render
      await nextTick()
      await nextTick()
      if (!app._container) app.mount('#app')

    } else {
      // token inválido o no hay sesión, redirige a login si no estás ya allí

      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        await router.replace('/login')
      }
    }
  } catch (e) {
    console.error('Error bootstrap', e)
    // ante fallo, fuerza a login
    if (!app._container) app.mount('#app')
    if (window.location.pathname !== '/login') {
      await router.replace('/login')
    }
  }

  // router se resolverá después, ya montado
}

bootstrap()
