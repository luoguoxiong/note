import { ref, computed } from 'vue'

export const showRealNameGuide = ref(false)

export const realNameGuide = ref()

export const isReplace = ref(false)

export const isShowRealNameGuide = computed(() => {
  return realNameGuide.value && !isReplace.value && showRealNameGuide.value
})
