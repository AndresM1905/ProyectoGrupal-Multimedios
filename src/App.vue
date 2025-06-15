<script setup>
// Sin lógica específica aquí
</script>

<template>
  <!-- Encabezado -->
  <header class="header">
    <router-link to="/" class="logo"><i class="fa-solid fa-clapperboard"></i> TrackMySeries</router-link>
    <router-link to="/search" class="search-link"><i class="fa-solid fa-search"></i></router-link>
    <div class="header-actions">
      <router-link to="/watchlist" class="hdr-icon" title="Watchlist"><i class="fa-solid fa-bookmark"></i></router-link>
      <router-link to="/watched" class="hdr-icon" title="Vistos"><i class="fa-solid fa-eye"></i></router-link>
      <router-link to="/favorites" class="hdr-icon" title="Favoritos"><i class="fa-solid fa-heart"></i></router-link>
          </div>
  </header>

  <!-- Contenido principal -->
  <router-view />
  <!-- Capa de búsqueda (overlay) -->
  <router-view name="overlay" />

  <!-- Navegación inferior (móvil) -->
  <nav class="bottom-nav">
    <router-link to="/" class="nav-link"><i class="fa-solid fa-house"></i><span>Inicio</span></router-link>
    <router-link to="/watchlist" class="nav-link"><i class="fa-solid fa-bookmark"></i><span>Watchlist</span></router-link>
    <router-link to="/watched" class="nav-link"><i class="fa-solid fa-eye"></i><span>Vistos</span></router-link>
    <router-link to="/favorites" class="nav-link"><i class="fa-solid fa-heart"></i><span>Favoritos</span></router-link>
      </nav>
</template>

<style scoped>
/* No styles defined */
.header-actions {
  display:flex;
  gap:1rem;
  margin-left:auto;
}
.hdr-icon { color:var(--clr-muted); font-size:1rem; }
.hdr-icon.router-link-active { color:var(--clr-accent); }
</style>
