import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import './style.css'
import './assets/styles.css'
import App from './App.vue'
import { useAuthStore } from './stores/auth'
import { useListsStore } from './stores/lists'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)

// Cargar listas remotas si ya hay sesión almacenada
const auth = useAuthStore()
const lists = useListsStore()
if (auth.token) {
  lists.loadFromApi()
}

app.mount('#app')
