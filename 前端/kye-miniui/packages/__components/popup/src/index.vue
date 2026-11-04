<template>
  <root-portal :enable="enable">
    <Overlay
      :show="show"
      :duration="duration"
      :hideNode="hideNode"
      :closeOnClickOverlay="closeOnClickOverlay"
      @clickOverlay="onOverlayClick"
      :zIndex="zIndex"
      v-bind="$attrs"
    >
      <KyTransition
        :name="`popup-${position}`"
        :customerClass="contentCls"
        :show="show"
        :hideNode="hideNode"
        :duration="duration"
        :customerStyle="{
          ...pcH5style,
          zIndex: zIndex,
          bottom: position === 'bottom' && offsetBottom ? `calc(${offsetBottom}px + env(safe-area-inset-bottom ))` : '',
        }"
      >
        <view
          class="ky-popup-body"
          @click="
            (e) => {
              e.stopPropagation()
            }
          "
          :style="contentStyle"
          :catchMove="!!$attrs.catchMove"
        >
          <slot></slot>
        </view>
      </KyTransition>
    </Overlay>
  </root-portal>
</template>

<script lang="ts" setup>
import { watch, computed, withDefaults, onMounted, onBeforeUnmount, ref } from 'vue'
import Overlay from '@ky-miniui-lib/overlay'
import KyTransition from '@ky-miniui-lib/transition'
import { miniuiConfig } from '@ky-miniui-lib/utils'
import { PopupProps, PopupPosition } from './types'
import './index.scss'
import Taro from '@tarojs/taro'

const { isH5Pc, H5PcWidth } = miniuiConfig.config

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
  offsetBottom: 0,
})

const emit = defineEmits(['update:show', 'open', 'close', 'clickOverlay'])

const isH5PcAndBottomPosition = computed(() => isH5Pc && props.position === 'bottom')

const contentCls = computed(() =>
  [
    'ky-popup-content',
    props.round && 'round',
    props.position,
    props.safeAreaInsetBottom && 'safe-area-inset-bottom',
    props.safeAreaInsetTop && 'safe-area-inset-top',
    props.contentClass,
    isH5PcAndBottomPosition.value && 'ky-popup-bottom-pc',
  ].filter(Boolean),
)

const windowWidth = ref(0)

const updateWidth = () => {
  windowWidth.value = window.innerWidth
}

onMounted(() => {
  if (isH5Pc) {
    updateWidth()
    window.addEventListener('resize', updateWidth)
  }
})

onBeforeUnmount(() => {
  if (isH5Pc) {
    window.removeEventListener('resize', updateWidth)
  }
})

const pcH5style = computed(() => {
  if (isH5PcAndBottomPosition.value) {
    return {
      width: `${H5PcWidth}px`,
      left: `${(windowWidth.value - H5PcWidth) / 2}px`,
    }
  }

  return {}
})

const onOverlayClick = () => {
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
