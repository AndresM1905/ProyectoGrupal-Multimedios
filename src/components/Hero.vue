<script setup>
defineProps({
  background: String,
  title: String,
  meta: String,
  progressCurrent: Number,
  progressMax: Number
})
</script>

<template>
  <section class="hero">
    <img :src="background" :alt="title" class="hero-bg" />
    <div class="hero-overlay"></div>

    <div class="hero-content">
      <h2 class="hero-title">{{ title }}</h2>
      <p class="hero-meta">{{ meta }}</p>

      <div class="hero-progress">
        <progress :value="progressCurrent" :max="progressMax"></progress>
        <span>{{ progressCurrent }}/{{ progressMax }}</span>
      </div>
      <button class="btn-primary"><i class="fa-solid fa-play"></i> Reanudar</button>
    </div>
  </section>
</template>
