<script setup>
import { useListsStore } from '../stores/lists'
import { useModalStore } from '../stores/modal'
import { useEpisodesStore } from '../stores/episodes'
import { onMounted } from 'vue'
import { getEpisodes } from '../api/tvdb'

const props = defineProps({
  shows: {
    type: Array,
    default: () => []
  }
})

const lists = useListsStore()
const modal = useModalStore()
const episodes = useEpisodesStore()

function total (show) {
  return show.type === 'serie' ? episodes.getTotal(show.id) : 0
}
function percent (show) {
  return total(show) ? episodes.percentSeen(show.id) : 0
}

function open (show) {
  modal.open(show)
}

function toggle (list, show) {
  lists.toggle(list, show)
}
onMounted(async () => {
  const pending = props.shows.filter(s => s.type === 'serie' && !episodes.getTotal(s.id))
  for (const show of pending) {
    try {
      const seasons = await getEpisodes(show.id)
      const totalEp = Object.values(seasons).reduce((sum, l) => sum + l.length, 0)
      episodes.setTotal(show.id, totalEp)
    } catch (e) {
      console.error('Error precaching episodes', e)
    }
  }
})
</script>

<template>
  <div class="grid">
    <article v-for="show in props.shows" :key="show.id" class="thumb" @click="open(show)">
      <img :src="show.img" :alt="show.title" />
      <div v-if="percent(show) > 0" class="progress-wrap">
        <div class="progress-bar"><div class="fill" :style="{ width: percent(show) + '%' }"></div></div>
        <small class="percent">{{ percent(show) }}%</small>
      </div>
      <div class="actions">
        <button class="action-btn" :class="{ active: lists.isIn('watchlist', show.id) }" @click.stop="toggle('watchlist', show)">
          <i :class="lists.isIn('watchlist', show.id) ? 'fa-solid fa-bookmark' : 'fa-regular fa-bookmark'" />
        </button>
        <button class="action-btn" :class="{ active: lists.isIn('watched', show.id) }" @click.stop="toggle('watched', show)">
          <i class="fa-solid fa-check" />
        </button>
        <button class="action-btn" :class="{ active: lists.isIn('favorites', show.id) }" @click.stop="toggle('favorites', show)">
          <i :class="lists.isIn('favorites', show.id) ? 'fa-solid fa-heart' : 'fa-regular fa-heart'" />
        </button>
      </div>
      <h4>{{ show.title }}</h4>
    </article>
  </div>
</template>

<style scoped>
.progress-wrap {
  margin-top: 0.25rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.progress-bar {
  width: 100%;
  height: 6px;
  background: var(--clr-muted-20, #444);
  border-radius: 4px;
  overflow: hidden;
}
.progress-bar .fill {
  height: 100%;
  background: var(--clr-accent, #e91e63);
}
.percent {
  margin-top: 4px;
  font-size: 0.65rem;
  color: var(--clr-accent, #e91e63);
}
</style>
