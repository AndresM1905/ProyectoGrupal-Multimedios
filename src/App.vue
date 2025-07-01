<script setup>
import { useAuthStore } from './stores/auth'
import { useRouter } from 'vue-router'
import { useSearchStore } from './stores/search'
import SearchOverlay from './components/SearchOverlay.vue'
import TitleModal from './components/TitleModal.vue'
import { useModalStore } from './stores/modal'

const auth = useAuthStore()
const router = useRouter()
const search = useSearchStore()
const modal = useModalStore()
function logout () {
  search.close()
  auth.logout()
  router.push('/login')
}
function onFocus () {
  search.open()
}
function submitSearch (e) {
  e.preventDefault()
  search.runSearch()
}
</script>

<template>
  <!-- Encabezado -->
    <header class="header">
    <!-- Brand -->
    <router-link to="/" class="logo">
      <i class="fa-solid fa-clapperboard"></i>
      <span class="logo-text">TrackMySeries</span>
    </router-link>

    <!-- Search form -->
    <form v-if="auth.token" class="search-bar" @submit="submitSearch">
      <i class="fa-solid fa-search"></i>
      <input v-model="search.query" type="search" placeholder="Buscar…" @focus="onFocus" />
    </form>

    <!-- Action icons (shown solo cuando hay sesión) -->
    <div class="header-actions" v-if="auth.token">
      <router-link to="/" class="hdr-icon desktop-only" title="Inicio"><i class="fa-solid fa-house"></i></router-link>
      <router-link to="/watchlist" class="hdr-icon desktop-only" title="Watchlist"><i class="fa-solid fa-bookmark"></i></router-link>
      <router-link to="/watched" class="hdr-icon desktop-only" title="Vistos"><i class="fa-solid fa-eye"></i></router-link>
      <router-link to="/favorites" class="hdr-icon desktop-only" title="Favoritos"><i class="fa-solid fa-heart"></i></router-link>
      <button class="hdr-icon" title="Cerrar sesión" @click="logout"><i class="fa-solid fa-right-from-bracket"></i></button>
    </div>
  </header>

  <!-- Spacing element to push content below fixed header -->
  <div style="height: calc(var(--header-height) + 16px);"></div>
  <!-- Contenido principal -->
  <router-view />
  <!-- Capa de búsqueda (overlay) -->
  <SearchOverlay v-if="auth.token && search.isOpen" />
  <!-- Modal de detalles -->
  <TitleModal v-if="modal.isOpen" />

  <!-- Navegación inferior (móvil) -->
  <nav class="bottom-nav">
    <router-link to="/" class="nav-link"><i class="fa-solid fa-house"></i><span>Inicio</span></router-link>
    <router-link to="/watchlist" class="nav-link"><i class="fa-solid fa-bookmark"></i><span>Watchlist</span></router-link>
    <router-link to="/watched" class="nav-link"><i class="fa-solid fa-eye"></i><span>Vistos</span></router-link>
    <router-link to="/favorites" class="nav-link"><i class="fa-solid fa-heart"></i><span>Favoritos</span></router-link>
      </nav>
</template>

<style scoped>
:root {
  --header-height: 56px;
}

.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  --header-height: 56px;
  height: var(--header-height);

  display: flex;
  align-items: center;
  gap: 1rem;
  background: var(--clr-surface);
  padding: 0.5rem 1rem; box-sizing: border-box;
  border-radius: 8px;
}
.logo {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-weight: 600;
  color: var(--clr-text);
  text-decoration: none;
  font-size: 1.1rem;
  white-space: nowrap;
}
.logo i {
  color: var(--clr-accent);
}
.search-bar {
  flex: 1 1 auto;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.45rem 0.75rem;
  background: var(--clr-elev-1, #1f1f1f);
  border-radius: 999px;
  color: var(--clr-muted);
  font-size: 0.9rem;
  min-width: 0; /* allow shrink */
}
.search-bar input {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--clr-text);
  outline: none;
}

.header-actions {
  gap: 0.5rem;
}
.header-actions {
  display: flex;
  gap: 0.8rem;
  margin-left: auto;
  align-items: center;
}
.hdr-icon { color:var(--clr-muted); font-size:1rem; }
.hdr-icon.router-link-active { color:var(--clr-accent); }
.bottom-nav .router-link-active { color: var(--clr-accent); }

/* RESPONSIVE */
@media (max-width: 600px) {
  .desktop-only { display: none; }
  .logo-text {
    display: none; /* sólo icono en móvil */
  }
  .search-bar {
    padding-left: 0.5rem;
  }
  .placeholder {
    display: none;
  }
  .header-actions {
    gap: 0.5rem;
  }
}
</style>
