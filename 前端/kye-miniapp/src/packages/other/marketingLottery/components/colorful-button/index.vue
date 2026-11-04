<template>
  <view :class="['common-button', className]" @click="$emit('click')">
    {{ text }}
  </view>
</template>

<script setup lang="ts">
import './index.scss'
import { computed } from 'vue'
import { isAutoModel } from '../../constants'

defineOptions({ name: 'ColorfulButton' })

const props = defineProps<{ text?: string; activity?: any }>()

defineEmits<{ click: [] }>()

const className = computed(() => {
  const canAutoModel = isAutoModel(props.activity)
  const isTemp = props.activity && +props.activity.templateId === 0
  const result = canAutoModel || !isTemp ? 'colorful-button' : 'colorful-button-new'
  console.log('Vue ColorfulButton 样式选择:', {
    canAutoModel,
    isTemp,
    result,
    templateId: props.activity?.templateId
  })
  return result
})
</script>
