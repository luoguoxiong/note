<template>
  <div class="ky-radio-v2" :class="{ disabled: disabled }" @click="toogleClick">
    <div class="radio-content" :class="{ 'no-label': hideLabel, 'size-32': size === 32, 'size-36': size === 36 }">
      <SvgIcon v-show="isChecked" class="icon-radio radio-checked" name="radio-checked" />
      <SvgIcon v-show="!isChecked" class="icon-radio unchecked" name="radio-unchecked" />
    </div>
    <div v-if="!hideLabel" :class="{ 'is-checked': isChecked }" class="radio-text">
      <slot>{{ label }}</slot>
    </div>
  </div>
</template>
<script setup lang="ts">
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'

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
<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
