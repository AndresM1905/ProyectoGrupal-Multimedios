import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import './style.css'
import './assets/styles.css'
import App from './App.vue'
import { useAuthStore } from './stores/auth'
import { useListsStore } from './stores/lists'

async function bootstrap () {
  const app = createApp(App)
  const pinia = createPinia()
  app.use(pinia)
  app.use(router)

  const auth = useAuthStore()
  const lists = useListsStore()

  const { useSearchStore } = await import('./stores/search')
  const search = useSearchStore()
  search.close()

  if (await auth.validate()) {
    lists.loadFromApi()
  } else if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
    await router.replace('/login')
  }

  await router.isReady()
  app.mount('#app')
}

bootstrap()
