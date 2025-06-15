<script setup>
import ThumbGrid from '../components/ThumbGrid.vue'
import { useListsStore } from '../stores/lists'

const lists = useListsStore()
</script>

<template>
  <section class="section">
    <h3 class="section-title"><i class="fa-solid fa-layer-group"></i> Mi Watchlist</h3>
    <ThumbGrid v-if="lists.watchlist.length" :shows="lists.watchlist" />
    <p v-else>No tienes series en tu Watchlist.</p>
  </section>
</template>
