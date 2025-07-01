<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { getEpisodes } from '../api/tvdb'
import { useListsStore } from '../stores/lists'
import { useEpisodesStore } from '../stores/episodes'

const props = defineProps({
  series: { type: Object, required: true },
  embedded: { type: Boolean, default: false }
})
const emit = defineEmits(['close'])

const episodesStore = useEpisodesStore()
const listsStore = useListsStore()
const seasons = ref({})
const loading = ref(true)
const selectedSeason = ref(null) // almacena el número de temporada como string

async function loadSeasons() {
  loading.value = true
  selectedSeason.value = null
  try {
    seasons.value = await getEpisodes(props.series.id)
    episodesStore.setTotal(props.series.id, Object.values(seasons.value).reduce((s, l) => s + l.length, 0))
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await episodesStore.loadFromApi(props.series.id)
  await loadSeasons()
})

watch(() => props.series.id, loadSeasons)

function syncWatched () {
  const inWatched = listsStore.isIn('watched', props.series.id, props.series.type)
  const seen = episodesStore.countSeen(props.series.id) > 0
  if (seen && !inWatched) {
    // añadir al final (push)
    listsStore.toggle('watched', props.series)
  } else if (seen && inWatched) {
    // ya está, pero queremos refrescar su posición (mover al final)
    const arr = listsStore.watched
    const idx = arr.findIndex(s => s.id === props.series.id && (s.type||'serie') === props.series.type)
    if (idx !== -1) {
      const [item] = arr.splice(idx, 1)
      arr.push(item)
    }
  } else if (!seen && inWatched) {
    // quitar porque ya no tiene vistos
    listsStore.toggle('watched', props.series)
  }
}

function toggle(epId) {
  episodesStore.toggleEpisode(props.series.id, epId, selectedSeason.value)
  syncWatched()
}

const totalEpisodes = computed(() => {
  return Object.values(seasons.value).reduce((sum, list) => sum + list.length, 0)
})

const seenCount = computed(() => episodesStore.countSeen(props.series.id))
const progress = computed(() => (totalEpisodes.value ? Math.round(seenCount.value / totalEpisodes.value * 100) : 0))

const currentSeasonEpisodes = computed(() => {
  if (selectedSeason.value === null) return []
  return seasons.value[selectedSeason.value] || []
})

// resumen por temporada
const seasonsSummary = computed(() => {
  const summary = {}
  Object.entries(seasons.value).forEach(([num, list]) => {
    const total = list.length
    const seen = list.filter(ep => episodesStore.isSeen(props.series.id, ep.id)).length
    summary[num] = {
      total,
      seen,
      percent: total ? Math.round(seen / total * 100) : 0,
      allSeen: seen === total,
      someSeen: seen > 0 && seen < total
    }
  })
  return summary
})

function toggleSeasonAll(num) {
  const list = seasons.value[num]
  if (!list) return
  const summary = seasonsSummary.value[num]
  list.forEach(ep => {
    const already = episodesStore.isSeen(props.series.id, ep.id)
    if (summary.allSeen || (!summary.allSeen && !already)) {
      episodesStore.toggleEpisode(props.series.id, ep.id, num)
    }
  })
  syncWatched()
}
</script>

<template>
  <div :class="props.embedded ? 'embedded-wrapper' : 'tracker-backdrop'" @click.self="props.embedded ? null : () => emit('close')">
    <div class="tracker-sheet">
      <header>
        <button v-if="!props.embedded" class="close-btn" @click="emit('close')" aria-label="Cerrar"><i class="fa-solid fa-xmark" /></button>
        <h2>{{ series.title }}</h2>
        <p class="progress-text">{{ seenCount }} / {{ totalEpisodes }} · {{ progress }}%</p>
        <div class="progress-bar"><div class="fill" :style="{ width: progress + '%' }" /></div>
      </header>

      <div v-if="loading" class="loading">Cargando episodios…</div>

      <div v-else class="content">
        <!-- Vista RESUMEN de temporadas -->
        <template v-if="selectedSeason === null">
          <ul class="seasons-list">
            <li v-for="(info, num) in seasonsSummary" :key="num">
              <span class="checkbox" @click="toggleSeasonAll(num)">
                <i :class="info.allSeen ? 'fa-solid fa-check-square' : (info.someSeen ? 'fa-solid fa-minus-square' : 'fa-regular fa-square')" />
              </span>
              <span class="season-title">Season {{ num }}</span>
              <div class="season-bar"><div class="fill" :style="{ width: info.percent + '%' }"></div></div>
              <span class="season-count">{{ info.seen }}/{{ info.total }}</span>
              <button class="arrow" @click="selectedSeason = num"><i class="fa-solid fa-chevron-right" /></button>
            </li>
          </ul>
        </template>

        <!-- Vista EPISODIOS de una temporada -->
        <template v-else>
          <button class="back-btn" @click="selectedSeason = null"><i class="fa-solid fa-chevron-left" /> Seasons</button>
          <h3 class="season-heading">Season {{ selectedSeason }}</h3>
          <ul class="episodes-list">
            <li v-for="ep in currentSeasonEpisodes" :key="ep.id" @click="toggle(ep.id)" :class="{ seen: episodesStore.isSeen(series.id, ep.id) }">
              <span class="checkbox">
                <i :class="episodesStore.isSeen(series.id, ep.id) ? 'fa-solid fa-check-square' : 'fa-regular fa-square'" />
              </span>
              <span class="ep-num">E{{ ep.number }}</span>
              <span class="ep-title">{{ ep.name }}</span>
            </li>
          </ul>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tracker-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1400;
}

/* Modo embebido dentro del modal principal */
.embedded-wrapper {
  width: 100%;
}
.embedded-wrapper .tracker-sheet {
  max-height: none;
  overflow: visible;
  padding: 0;
  background: transparent;
}

.tracker-sheet {
  background: var(--clr-bg);
  width: 100%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: hidden; /* only relevant when embedded */
  border-radius: 12px;
  padding: 1rem 1.25rem 2rem;
  box-sizing: border-box;
}
.close-btn {
  position:absolute;
  top:0.75rem;
  right:0.75rem;
  background:none;
  border:none;
  color:var(--clr-muted);
  font-size:1.25rem;
}
header {
  text-align:center;
  margin-bottom:1rem;
  position:relative;
}
.progress-bar {
  width:100%;
  height:8px;
  background: var(--clr-muted-10);
  border-radius:4px;
  overflow:hidden;
}
.progress-bar .fill { height:100%; background: var(--clr-primary); }

.seasons-list { list-style:none; margin:0; padding:0; }
.seasons-list li { display:flex; align-items:center; gap:0.5rem; padding:0.5rem 0; }
.season-title { flex:0 0 90px; }
.season-bar { flex:1; height:6px; background: var(--clr-muted-20, #444); border-radius:4px; overflow:hidden; }
.season-bar .fill { height:100%; background: var(--clr-accent, #a9a5ff); }
.season-count { width:60px; text-align:right; font-size:.8rem; color:var(--clr-muted); }
.arrow { background:none; border:none; color:var(--clr-muted); font-size:1rem; }
.back-btn { background:none; border:none; color:var(--clr-primary); display:flex; align-items:center; gap:4px; margin-bottom:.5rem; cursor:pointer; }
.season-heading { margin:0 0 .5rem; }
.episodes-list { list-style:none; margin:0; padding:0; }
.episodes-list li { display:flex; align-items:center; gap:0.5rem; padding:0.35rem 0; cursor:pointer; }
.episodes-list li.seen { opacity:0.6; }
.checkbox { font-size:1rem; width:1.25rem; text-align:center; }
.ep-num { width:3rem; color:var(--clr-muted); }
.loading { text-align:center; margin:2rem 0; }
</style>
