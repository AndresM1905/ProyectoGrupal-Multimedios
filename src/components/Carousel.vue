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
      :show="show"
    />
  </div>
</template>
