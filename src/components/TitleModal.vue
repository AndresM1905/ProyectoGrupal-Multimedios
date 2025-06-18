<script setup>
import { ref, watch } from 'vue'
import { useModalStore } from '../stores/modal'
import { useListsStore } from '../stores/lists'
import { getDetails } from '../api/tvdb'

const modal = useModalStore()
const lists = useListsStore()

const details = ref(null)
const loading = ref(false)

watch(() => modal.currentShow, async (show) => {
  if (!show) return
  loading.value = true
  details.value = null
  try {
    details.value = await getDetails(show)
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}, { immediate: true })

function close () {
  modal.close()
}

function toggle (list) {
  if (!modal.currentShow) return
  lists.toggle(list, modal.currentShow)
}
</script>

<template>
  <div class="backdrop" @click.self="close" @keyup.esc="close" tabindex="0">
    <div class="sheet">
      <button class="close-btn" @click="close" aria-label="Cerrar"><i class="fa-solid fa-xmark" /></button>
      <img :src="modal.currentShow.img" :alt="modal.currentShow.title" class="cover" />
      <h2 class="title">{{ modal.currentShow.title }}</h2>
      <p v-if="modal.currentShow.year" class="year">{{ modal.currentShow.year }}</p>

      <!-- sinopsis / detalles -->
      <div v-if="loading" class="loading">Cargando…</div>
      <p v-else-if="details && details.overview" class="overview">{{ details.overview }}</p>
      <ul v-if="details && (details.genres?.length || details.runtime || details.status)" class="meta">
        <li v-if="details.genres?.length"><strong>Géneros:</strong> {{ details.genres.join(', ') }}</li>
        <li v-if="details.runtime"><strong>Duración:</strong> {{ details.runtime }} min</li>
        <li v-if="details.status"><strong>Estado:</strong> {{ details.status }}</li>
      </ul>
      <!-- botones -->
      <div class="modal-actions">
        <button class="modal-btn" :class="{ active: lists.isIn('watchlist', modal.currentShow.id) }" @click="toggle('watchlist')">
          <i :class="lists.isIn('watchlist', modal.currentShow.id) ? 'fa-solid fa-bookmark' : 'fa-regular fa-bookmark'" />
        </button>
        <button class="modal-btn" :class="{ active: lists.isIn('watched', modal.currentShow.id) }" @click="toggle('watched')">
          <i class="fa-solid fa-check" />
        </button>
        <button class="modal-btn" :class="{ active: lists.isIn('favorites', modal.currentShow.id) }" @click="toggle('favorites')">
          <i :class="lists.isIn('favorites', modal.currentShow.id) ? 'fa-solid fa-heart' : 'fa-regular fa-heart'" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center; /* centrar verticalmente */
  justify-content: center;
  z-index: 1300;
  animation: fadeIn 0.15s ease-out;
}
.sheet {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: var(--clr-bg);
  width: 100%;
  max-width: 500px;
  border-radius: 12px;
  padding: 1rem 1.25rem 2rem;
  box-sizing: border-box;
}
.cover {
  width: 140px;
  border-radius: 6px;
  display: block;
  margin: 0 auto 1rem;
}
.title { margin: 0 0 0.25rem; text-align:center; }
.year { color: var(--clr-muted); margin:0; text-align:center; }
.modal-actions {
  margin-top: 1.25rem;
  display: flex;
  justify-content: center;
  gap: 1.5rem;
}
.modal-btn {
  display: flex;
  justify-content: center;
  background: none;
  border: none;
  color: var(--clr-muted);
  font-size: 1.5rem;
}
.modal-btn.active { color: var(--clr-accent); }
.close-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: none;
  border: none;
  color: var(--clr-muted);
  font-size: 1.4rem;
}
.overview { margin: 1rem 0; font-size: .9rem; line-height: 1.35; text-align: center; }
.meta { list-style: none; padding: 0; margin: 0 0 1rem; font-size: .8rem; text-align: center; color: var(--clr-muted); }
.meta li + li { margin-top: .25rem; }
.loading { margin: 1rem 0; font-size: .9rem; color: var(--clr-muted); text-align: center; }
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
