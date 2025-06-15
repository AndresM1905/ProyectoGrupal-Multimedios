<script setup>
import ThumbGrid from '../components/ThumbGrid.vue'
import TypeFilter from '../components/TypeFilter.vue'
import { ref } from 'vue'
import { searchSeries, searchMovies } from '../api/tvdb'

// Lógica de búsqueda
const query = ref('')
const type = ref('all') // 'all' | 'serie' | 'pelicula'
const results = ref([])
const loading = ref(false)
const error = ref('')

async function handleSubmit (e) {
  e.preventDefault()
  if (!query.value.trim()) return
  loading.value = true
  error.value = ''
  try {
    if (type.value === 'serie') {
      results.value = await searchSeries(query.value.trim())
    } else if (type.value === 'pelicula') {
      results.value = await searchMovies(query.value.trim())
    } else {
      const [series, movies] = await Promise.all([
        searchSeries(query.value.trim()),
        searchMovies(query.value.trim())
      ])
      results.value = [...series, ...movies]
    }
  } catch (err) {
    console.error(err)
    error.value = 'Error al buscar. Intenta nuevamente.'
  } finally {
    loading.value = false
  }
}

</script>

<template>
  <div class="overlay">
    <div class="search-top">
      <form @submit="handleSubmit" class="search-bar">
        <i class="fa-solid fa-search"></i>
        <input v-model="query" type="search" placeholder="Buscar…" />
      </form>
      <button class="close-btn" @click="$router.back()"><i class="fa-solid fa-xmark"></i></button>
    </div>

    <TypeFilter v-model="type" class="type-filter" />

    <div v-if="loading" class="loading">Buscando…</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <ThumbGrid v-else :shows="results" />
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: var(--clr-bg);
  overflow-y: auto;
  z-index: 1200;
  padding: 4rem 1rem 2rem; /* leave space for main header */
}
.search-top {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
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
}
.search-bar input {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--clr-text);
  outline: none;
}
.close-btn {
  background: none;
  border: none;
  color: var(--clr-muted);
  font-size: 1.5rem;
}
.type-filter {
  margin-bottom: 1rem;
}
</style>
