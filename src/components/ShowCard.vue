<script setup>
const props = defineProps({
  img: String,
  title: String,
  year: [String, Number]
})
</script>

<template>
  <article class="card">
    <img :src="props.img" :alt="props.title" />
    <div class="card-info">
      <h4>{{ props.title }}</h4>
      <p v-if="props.year" class="year">{{ props.year }}</p>
    </div>
  </article>
</template>
