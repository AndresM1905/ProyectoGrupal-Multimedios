<script setup>
import ThumbGrid from '../components/ThumbGrid.vue'
import { useListsStore } from '../stores/lists'

const lists = useListsStore()
</script>

<template>
  <section class="section">
    <h3 class="section-title"><i class="fa-solid fa-eye"></i> Vistos</h3>
    <ThumbGrid v-if="lists.watched.length" :shows="lists.watched" />
    <p v-else>Aún no marcaste series como vistas.</p>
  </section>
</template>
