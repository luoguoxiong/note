<!-- eslint-disable vue/no-parsing-error -->
<template>
  <root-portal :enable="enable">
    <view :class="['ky-popup-simple-box', { 'ky-popup-simple-box-show': show } ]" @click.stop="onOverlayClick">
      <KyTransition
        :name="`popup-${position}`"
        :customerClass="contentCls"
        :show="show"
        :hideNode="hideNode"
        :duration="duration"
        :customerStyle="{
          zIndex: zIndex,
        }"
      >
        <view
          class="ky-popup-simple-body"
          @click="
            (e) => {
              e.stopPropagation()
            }
          "
          :style="contentStyle"
        >
          <slot></slot>
        </view>
      </KyTransition>
    </view>
  </root-portal>
</template>

<script lang="ts" setup>
import { watch, computed, withDefaults } from 'vue'
import Overlay from '@ky-miniui-lib/overlay'
import KyTransition from '@ky-miniui-lib/transition'
import { PopupProps, PopupPosition } from './types'
import './index.scss'

const props = withDefaults(defineProps<PopupProps>(), {
  enable: true,
  show: false,
  hideNode: true,
  duration: 300,
  contentClass: '',
  contentStyle: () => ({}),
  position: 'center' as PopupPosition, // 明确类型
  closeOnClickOverlay: true,
  zIndex: 100,
  safeAreaInsetTop: false,
  safeAreaInsetBottom: false,
  round: true,
})

const emit = defineEmits(['update:show', 'open', 'close', 'clickOverlay'])

const contentCls = computed(() =>
  [
    'ky-popup-simple-content',
    props.round && 'round',
    props.position,
    props.safeAreaInsetBottom && 'safe-area-inset-bottom',
    props.safeAreaInsetTop && 'safe-area-inset-top',
    props.contentClass,
  ].filter(Boolean),
)

const onOverlayClick = () => {
  console.log('onOverlayClick>>>>>')
  if (!props.closeOnClickOverlay) return
  emit('update:show', false)
  emit('clickOverlay')
}

watch(
  () => props.show,
  (visible) => {
    emit(visible ? 'open' : 'close')
  },
)
</script>
