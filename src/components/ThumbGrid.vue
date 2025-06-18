<script setup>
import { useListsStore } from '../stores/lists'
import { useModalStore } from '../stores/modal'

const props = defineProps({
  shows: {
    type: Array,
    default: () => []
  }
})

const lists = useListsStore()
const modal = useModalStore()

function open (show) {
  modal.open(show)
}

function toggle (list, show) {
  lists.toggle(list, show)
}
</script>

<template>
  <div class="grid">
    <article v-for="show in props.shows" :key="show.id" class="thumb" @click="open(show)">
      <img :src="show.img" :alt="show.title" />
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
