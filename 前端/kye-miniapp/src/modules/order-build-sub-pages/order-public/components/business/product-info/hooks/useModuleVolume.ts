import { ref, reactive } from 'vue'

export const showPopover = ref(false)
export const billableWeight = reactive({
  estimateWeight: '',
  grossWeightTips: '',
})
