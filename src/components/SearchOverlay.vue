<script setup>
import { useSearchStore } from '../stores/search'
import TypeFilter from './TypeFilter.vue'
import ThumbGrid from './ThumbGrid.vue'

const search = useSearchStore()
function close () {
  search.close()
}
</script>

<template>
  <div class="overlay" @keyup.esc="close" tabindex="0">
    <div class="top-row">
      <TypeFilter v-model="search.type" class="type-filter" />
      <button class="close-btn" @click="close" aria-label="Cerrar"><i class="fa-solid fa-xmark"></i></button>
    </div>

    <div class="results-area">
      <div v-if="search.loading" class="loading">Buscando…</div>
      <div v-else-if="search.error" class="error">{{ search.error }}</div>
      <ThumbGrid v-else :shows="search.results" />
    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  top: 56px;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--clr-bg);
  z-index: 1200;
  display: flex;
  flex-direction: column;
  padding: 0;
  animation: fadeIn 0.15s ease-out;
  outline: none; /* allow key events */
  overflow-y: auto;
}
.results-area {
  flex: 1 1 auto;
  overflow-y: auto;
  min-height: 0;
  -webkit-overflow-scrolling: touch;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.top-row {
  position: sticky;
  top: 0;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
  padding: 0.75rem 1rem;
  background: var(--clr-bg);
  border-bottom: 1px solid var(--clr-elev-1, #333);
  justify-content: space-between;
}
.type-filter { flex-shrink: 0; }

.close-btn {
  background: none;
  border: none;
  color: var(--clr-muted);
  font-size: 1.5rem;
}
</style>
