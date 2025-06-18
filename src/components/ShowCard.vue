<script setup>
import { useModalStore } from '../stores/modal'

const props = defineProps({
  show: { type: Object, required: true }
})

const modal = useModalStore()
function open () {
  modal.open(props.show)
}
</script>

<template>
  <article class="card" @click="open">
    <img :src="props.show.img" :alt="props.show.title" />
    <div class="card-info">
      <h4>{{ props.show.title }}</h4>
      <p v-if="props.show.year" class="year">{{ props.show.year }}</p>
    </div>
  </article>
</template>
