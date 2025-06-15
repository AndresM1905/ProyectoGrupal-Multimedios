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
    <button class="close-btn" @click="$router.back()"><i class="fa-solid fa-xmark"></i></button>
    <section class="section">
    <h3 class="section-title"><i class="fa-solid fa-search"></i> Buscar</h3>
    <TypeFilter v-model="type" />
    <form @submit="handleSubmit" class="search" style="margin-bottom:1rem;">
      <input v-model="query" type="search" placeholder="Buscar serie…" />
      <button type="submit"><i class="fa-solid fa-search"></i></button>
    </form>
    <div v-if="loading" class="loading">Buscando…</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <ThumbGrid v-else :shows="results" />
  </section>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: var(--clr-bg);
  overflow-y: auto;
  z-index: 1200;
  padding-top: 4rem; /* leave space for header */
}
.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: var(--clr-muted);
  font-size: 1.5rem;
}
</style>
