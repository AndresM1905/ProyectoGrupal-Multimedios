<script setup>
import { ref, watch, computed } from 'vue'
import EpisodeTracker from './EpisodeTracker.vue'
import { useModalStore } from '../stores/modal'
import { useListsStore } from '../stores/lists'
import { useEpisodesStore } from '../stores/episodes'
import { getDetails, getEpisodes } from '../api/tvdb'

const modal = useModalStore()
const lists = useListsStore()

const details = ref(null)
const totalEpisodes = ref(0)
const loading = ref(false)

const episodesStore = useEpisodesStore()
const seenCount = computed(() => episodesStore.countSeen(modal.currentShow?.id))
const progress = computed(() => totalEpisodes.value ? Math.round(seenCount.value / totalEpisodes.value * 100) : 0)

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

  // si es serie, calculo episodios totales
  if (show && show.type === 'serie') {
    try {
      const seasons = await getEpisodes(show.id)
      totalEpisodes.value = Object.values(seasons).reduce((sum, list) => sum + list.length, 0)
      episodesStore.setTotal(show.id, totalEpisodes.value)
    } catch (e) {
      console.error('episodes count', e)
      totalEpisodes.value = 0
    }
  } else {
    totalEpisodes.value = 0
  }
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

      <!-- cuerpo scrollable -->
      <div class="scroll">
        <div v-if="loading" class="loading">Cargando…</div>
        <p v-else-if="details && details.overview" class="overview">{{ details.overview }}</p>
        <ul v-if="details && (details.genres?.length || details.runtime || details.status)" class="meta">
          <li v-if="details.genres?.length"><strong>Géneros:</strong> {{ details.genres.join(', ') }}</li>
          <li v-if="details.runtime"><strong>Duración:</strong> {{ details.runtime }} min</li>
          <li v-if="details.status"><strong>Estado:</strong> {{ details.status }}</li>
        </ul>
        <div v-if="modal.currentShow.type === 'serie' && totalEpisodes" class="series-progress">
          <p class="progress-text">{{ seenCount }} / {{ totalEpisodes }} · {{ progress }}%</p>
          <div class="progress-bar"><div class="fill" :style="{ width: progress + '%' }"></div></div>
        </div>
        <EpisodeTracker v-if="modal.currentShow.type === 'serie'" :series="modal.currentShow" embedded />
      </div>
      <!-- botones fijos -->
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
  max-width: 100vw;
  height: 100vh;
  border-radius: 0;
  padding-bottom: calc(env(safe-area-inset-bottom) + 1rem);
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
.series-progress { width:100%; margin-top:1rem; }
.series-progress .progress-bar { width:100%; height:8px; background: var(--clr-muted-20, #444); border-radius:4px; overflow:hidden; margin-top:4px; }
.series-progress .fill { height:100%; background: var(--clr-accent, #e91e63); transition: width .25s ease; }
.series-progress .progress-text { margin:0; font-size:.8rem; text-align:center; color:var(--clr-muted); }
.loading { margin: 1rem 0; font-size: .9rem; color: var(--clr-muted); text-align: center; }
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.sheet { display:flex; flex-direction:column; max-height:90vh; overflow:hidden; }
.scroll { flex:1; overflow-y:auto; width:100%; }
@media (max-width: 600px) {
  .backdrop { justify-content:center; align-items:flex-end; overflow:hidden; }
  .sheet {
    max-height: 80vh;
    width: 100%; max-width:100%;
    max-height: 90vh;
    max-width:none;
    border-radius: 16px 16px 0 0;
    animation: slideUp .25s ease-out;
  }
  .cover { width: 40vw; }
  @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
}
@media (min-width: 900px) {
  .sheet {
    max-width: 700px;
  }
  .cover { width: 160px; }
}
</style>
