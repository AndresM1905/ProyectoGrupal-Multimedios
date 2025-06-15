import { createRouter, createWebHistory } from 'vue-router'

// Importación perezosa de vistas
const HomeView = () => import('../views/HomeView.vue')
const SearchView = () => import('../views/SearchView.vue')
const WatchlistView = () => import('../views/WatchlistView.vue')
const WatchedView = () => import('../views/WatchedView.vue')
const FavoritesView = () => import('../views/FavoritesView.vue')
const LoginView = () => import('../views/LoginView.vue')
const RegisterView = () => import('../views/RegisterView.vue')

const routes = [
  {
    path: '/',
    name: 'Home',
    components: { default: HomeView },
    meta: { requiresAuth: true }
  },
  {
    path: '/search',
    name: 'Search',
    components: {
      default: HomeView,
      overlay: SearchView
    },
    meta: { requiresAuth: true }
  },
  { path: '/watchlist', name: 'Watchlist', component: WatchlistView, meta: { requiresAuth: true } },
  { path: '/watched', name: 'Watched', component: WatchedView, meta: { requiresAuth: true } },
  { path: '/favorites', name: 'Favorites', component: FavoritesView, meta: { requiresAuth: true } },
  { path: '/login', name: 'Login', component: LoginView },
  { path: '/register', name: 'Register', component: RegisterView }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

import { useAuthStore } from '../stores/auth'

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.token) {
    return next('/login')
  }
  if (auth.token && (to.path === '/login' || to.path === '/register')) {
    return next('/')
  }
  next()
})

export default router
