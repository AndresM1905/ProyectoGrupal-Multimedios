<script setup>
import Carousel from '../components/Carousel.vue'
import { useListsStore } from '../stores/lists'
import { computed } from 'vue'

const lists = useListsStore()

// Mostrar último añadido primero
const watchlistItems = computed(() => [...lists.watchlist].slice().reverse())
const watchedItems = computed(() => [...lists.watched].slice().reverse())
const favoritesItems = computed(() => [...lists.favorites].slice().reverse())
</script>

<template>
  <section class="section">
    <h3 class="section-title"><i class="fa-solid fa-bookmark"></i> Mi Watchlist</h3>
    <Carousel v-if="watchlistItems.length" :shows="watchlistItems" />
    <p v-else>No tienes contenido en tu Watchlist.</p>
  </section>

  <section class="section">
    <h3 class="section-title"><i class="fa-solid fa-eye"></i> Vistos</h3>
    <Carousel v-if="watchedItems.length" :shows="watchedItems" />
    <p v-else>Aún no marcaste contenido como visto.</p>
  </section>

  <section class="section">
    <h3 class="section-title"><i class="fa-solid fa-heart"></i> Favoritos</h3>
    <Carousel v-if="favoritesItems.length" :shows="favoritesItems" />
    <p v-else>No tienes contenido favorito aún.</p>
  </section>
</template>
