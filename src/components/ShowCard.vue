<script setup>
import { useModalStore } from '../stores/modal'
import { useEpisodesStore } from '../stores/episodes'
import { computed, onMounted } from 'vue'
import { getEpisodes } from '../api/tvdb'

const props = defineProps({
  show: { type: Object, required: true }
})

const modal = useModalStore()
const episodes = useEpisodesStore()
const total = computed(() => props.show.type === 'serie' ? episodes.getTotal(props.show.id) : 0)
const counter = computed(() => episodes.counters[String(props.show.id)] || 0)
const percent = computed(() => {
  if (!episodes.ready) return 0
  return total.value ? Math.round(counter.value / total.value * 100) : 0
})
// La barra se muestra siempre para series; percent será 0% hasta que tengamos totales

onMounted(async () => {
  if (props.show.type === 'serie' && !total.value) {
    try {
      const seasons = await getEpisodes(props.show.id)
      const totalEp = Object.values(seasons).reduce((s, list) => s + list.length, 0)
      if (totalEp) episodes.setTotal(props.show.id, totalEp)
    } catch (e) { console.error('card preload', e) }
  }
})

function open () {
  modal.open(props.show)
}
</script>

<template>
  <article class="card" @click="open">
    <img :src="props.show.img" :alt="props.show.title" />
    <div v-if="props.show.type === 'serie'" class="progress-wrap">
      <div class="progress-bar"><div class="fill" :style="{ width: percent + '%' }"></div></div>
      <small class="percent">{{ percent }}%</small>
    </div>
    <div class="card-info">
      <h4>{{ props.show.title }}</h4>
      <p v-if="props.show.year" class="year">{{ props.show.year }}</p>
    </div>
  </article>
</template>

<style scoped>
.card { position: relative; cursor:pointer; height:auto; }
img { width:100%; display:block; border-radius:6px; }
.progress-wrap {
  margin-top: .25rem;
  display:flex;
  flex-direction:column;
  align-items:center;
}
.progress-bar {
  width:100%;
  
  height:6px;
  background: var(--clr-muted-20, #444);
  border-radius:4px;
  overflow:hidden;
}
.progress-bar .fill { height:100%; background: var(--clr-accent,#e91e63); }
.percent { margin-top:6px; font-size:0.65rem; color:var(--clr-accent,#e91e63); }
.card-info { padding-top:0.2rem; text-align:center; }
.year { color:var(--clr-muted); font-size:0.8rem; margin:0; }
</style>
