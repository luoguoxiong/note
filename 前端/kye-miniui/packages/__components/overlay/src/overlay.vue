<template>
  <KyTransition
    name="overlay"
    :customerClass="['kye-overlay']"
    :customerStyle="{ zIndex }"
    catchtouchmove="true"
    :duration="duration"
    :show="show"
    :hideNode="hideNode"
  >
    <view class="kye-overlay-body" @click.stop="handleClick" :catchMove="catchMove">
      <slot></slot>
    </view>
  </KyTransition>
</template>

<script lang="ts" setup>
import KyTransition from '@ky-miniui-lib/transition'
import { OverlayProps } from './types'
import './index.scss'

const props = withDefaults(defineProps<OverlayProps>(), {
  duration: 300,
  closeOnClickOverlay: true,
  zIndex: 10,
  hideNode: true,
  catchMove: true,
})

/**
 * 定义组件的 emits 类型
 */
const emit = defineEmits<{
  (e: 'update:show', value: boolean): void
  (e: 'clickOverlay'): void
}>()

/**
 * 处理遮罩点击事件
 * 当 `closeOnClickOverlay` 为 true 时，关闭遮罩
 * 同时触发 `clickOverlay` 事件
 */
const handleClick = (): void => {
  if (props.closeOnClickOverlay) {
    emit('update:show', false)
    emit('clickOverlay')
  }
}
</script>
