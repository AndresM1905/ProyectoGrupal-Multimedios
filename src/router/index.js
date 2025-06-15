import { createRouter, createWebHistory } from 'vue-router'

// Importación perezosa de vistas
const HomeView = () => import('../views/HomeView.vue')
const SearchView = () => import('../views/SearchView.vue')
const WatchlistView = () => import('../views/WatchlistView.vue')
const WatchedView = () => import('../views/WatchedView.vue')
const FavoritesView = () => import('../views/FavoritesView.vue')

const routes = [
  {
    path: '/',
    name: 'Home',
    components: { default: HomeView }
  },
  {
    path: '/search',
    name: 'Search',
    components: {
      default: HomeView,
      overlay: SearchView
    }
  },
  { path: '/watchlist', name: 'Watchlist', component: WatchlistView },
  { path: '/watched', name: 'Watched', component: WatchedView },
  { path: '/favorites', name: 'Favorites', component: FavoritesView }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

export default router
