<template>
  <view class="ky-empty">
    <view class="ky-empty__wrap" :style="style">
      <slot name="image"><img v-if="src" :src="src" class="ky-empty__image" /></slot>
    </view>

    <slot name="description">
      <view class="ky-empty__description"> {{ descriptionText }}</view>
    </slot>
    <slot></slot>
  </view>
</template>

<script setup lang="ts">
import './index.scss'
import { computed } from 'vue'
import { EmptyProps, EmptyType } from './types'
import { pxCheck } from '@packages/utils/src/common'
import { defaultStatus } from '@packages/__components/empty/src/constant'

const props = withDefaults(defineProps<EmptyProps>(), {
  type: 'error',
  imageSize: '',
  description: '',
})

const src = computed(() =>
  /^https?:\/\/|^\/\//.test(props.type) ? props.type : defaultStatus[props.type as EmptyType],
)

const style = computed(() => {
  if (props.imageSize) {
    return {
      width: pxCheck(props.imageSize),
      height: pxCheck(props.imageSize),
    }
  }
  return {}
})

const descriptionText = computed(() => props.description)
</script>

<style lang="scss"></style>
