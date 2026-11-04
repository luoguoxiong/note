import { ref } from 'vue'

export const isDetailMode = ref(false)
export const currentIndex = ref(0)

export const goBack = () => {
  isDetailMode.value = false
}
