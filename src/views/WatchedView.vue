<script setup>
import ThumbGrid from '../components/ThumbGrid.vue'
import TypeFilter from '../components/TypeFilter.vue'
import { useListsStore } from '../stores/lists'
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

const lists = useListsStore()
const route = useRoute()
const type = ref(route.query.type || 'all')
const items = computed(() => [...lists.getFiltered('watched', type.value)].slice().reverse())
</script>

<template>
  <section class="section">
        <h3 class="section-title"><i class="fa-solid fa-eye"></i> Vistos</h3>
    <TypeFilter v-model="type" />
    <ThumbGrid v-if="items.length" :shows="items" />
    <p v-else>No tienes contenido marcado como visto.</p>
  </section>
</template>
