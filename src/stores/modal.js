import { defineStore } from 'pinia'
import { ref } from 'vue'

// Store sencillo para controlar el modal de detalles de un título
export const useModalStore = defineStore('modal', () => {
  const isOpen = ref(false)
  const currentShow = ref(null)

  function open (show) {
    currentShow.value = show
    isOpen.value = true
  }
  function close () {
    isOpen.value = false
    currentShow.value = null
  }

  return { isOpen, currentShow, open, close }
})
