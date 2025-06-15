<script setup>
import ThumbGrid from '../components/ThumbGrid.vue'
import { useListsStore } from '../stores/lists'

const lists = useListsStore()
</script>

<template>
  <section class="section">
    <h3 class="section-title"><i class="fa-solid fa-heart"></i> Favoritos</h3>
    <ThumbGrid v-if="lists.favorites.length" :shows="lists.favorites" />
    <p v-else>No tienes favoritos aún.</p>
  </section>
</template>
