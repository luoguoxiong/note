<template>
  <div class="ky-radio-v2" :class="{ disabled: disabled }" @click="toogleClick">
    <div class="radio-content" :class="{ 'no-label': hideLabel, 'size-32': size === 32, 'size-36': size === 36 }">
      <image v-show="isChecked" class="icon-radio radio-checked" src="https://ic-img.ky-express.com/netc/20260525_22385_!!1779683004175_32_32.svg+xml" />
      <image v-show="!isChecked" class="icon-radio unchecked" src="https://ic-img.ky-express.com/netc/20260525_21538_!!1779683014388_32_32.svg+xml" />
    </div>
    <div v-if="!hideLabel" :class="{ 'is-checked': isChecked }" class="radio-text">
      <slot>{{ label }}</slot>
    </div>
  </div>
</template>
<script setup lang="ts">
import './index.scss'
const props = defineProps<{
  disabled?: boolean
  label?: string
  isChecked: boolean
  size?: number
  hideLabel?: boolean
}>()
const emit = defineEmits(['change'])

const toogleClick = () => {
  if (!props.disabled) {
    emit('change', !props.isChecked)
  }
}
</script>
