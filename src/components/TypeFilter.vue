<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: 'all' // 'all' | 'serie' | 'pelicula'
  }
})

const emit = defineEmits(['update:modelValue'])

function setType (val) {
  if (val !== props.modelValue) emit('update:modelValue', val)
}
</script>

<template>
  <div class="type-filter">
    <button :class="{ active: modelValue === 'all' }" @click="setType('all')">Todas</button>
    <button :class="{ active: modelValue === 'serie' }" @click="setType('serie')">Series</button>
    <button :class="{ active: modelValue === 'pelicula' }" @click="setType('pelicula')">Películas</button>
  </div>
</template>

<style scoped>
.type-filter {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}
button {
  background: none;
  border: 1px solid var(--clr-muted);
  padding: 0.25rem 0.6rem;
  border-radius: 4px;
  color: var(--clr-text);
  cursor: pointer;
}
button.active {
  background: var(--clr-primary);
  color: #fff;
  border-color: var(--clr-primary);
}
</style>
