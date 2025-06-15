<script setup>
import ShowCard from './ShowCard.vue'

const props = defineProps({
  shows: {
    type: Array,
    default: () => []
  }
})
</script>

<template>
  <div class="carousel">
    <ShowCard
      v-for="show in props.shows"
      :key="show.id"
      :img="show.img"
      :title="show.title"
      :year="show.year"
    />
  </div>
</template>
