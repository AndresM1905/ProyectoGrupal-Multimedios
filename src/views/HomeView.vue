<script setup>
import Carousel from '../components/Carousel.vue'
import { useListsStore } from '../stores/lists'

const lists = useListsStore()
</script>

<template>
  <section class="section">
    <h3 class="section-title"><i class="fa-solid fa-bookmark"></i> Mi Watchlist</h3>
    <Carousel v-if="lists.watchlist.length" :shows="lists.watchlist" />
    <p v-else>No tienes series en tu Watchlist.</p>
  </section>

  <section class="section">
    <h3 class="section-title"><i class="fa-solid fa-eye"></i> Vistos</h3>
    <Carousel v-if="lists.watched.length" :shows="lists.watched" />
    <p v-else>Aún no marcaste series como vistas.</p>
  </section>

  <section class="section">
    <h3 class="section-title"><i class="fa-solid fa-heart"></i> Favoritos</h3>
    <Carousel v-if="lists.favorites.length" :shows="lists.favorites" />
    <p v-else>No tienes favoritos aún.</p>
  </section>
</template>
