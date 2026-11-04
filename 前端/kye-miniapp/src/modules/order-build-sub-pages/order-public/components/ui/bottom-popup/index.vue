<template>
  <Popup
    v-bind="$attrs"
    round
    catchMove
    position="bottom"
    class="bottom-popup"
    :safe-area-inset-bottom="safeAreaInsetBottom"
    :class="[customClass]"
    :style="{ ...customStyle, height: '100%', maxHeight: '100%' }"
    @click-overlay="onClose"
    :lazy-render="false"
    @open="onOpen"
  >
    <!-- 标题 -->
    <div v-if="showTitle" class="header" @click.stop="onClickHeader">
      <div class="content">
        <slot name="header">
          <div class="content__title">
            <SvgIcon class="back-icon" name="title-back" v-if="showBackIcon" />
            {{ title }}
          </div>
          <slot name="tips">
            <div v-if="showTips" class="content__tip" @click.stop="onClickTips">
              <SvgIcon class="content__tip__icon font-level3" :name="tipIcon" />
              <span class="content__tip__text">{{ tipText }}</span>
            </div>
          </slot>
        </slot>
      </div>

      <div class="close" @click.stop="onClose">
        <SvgIcon class="close-icon" name="close-icon-padding"></SvgIcon>
      </div>
    </div>
    <!-- 内容 -->
    <div class="container">
      <div
        :class="{ container__body: true, 'no-padding': noPadding, 'min-height': isMinHeight }"
        :style="{ maxHeight: popupMaxHeight }"
      >
        <!-- scroll-view 层级问题增加该插槽 -->
        <slot name="scroll-front"></slot>
        <scroll-view
          :style="{ maxHeight: popupMaxHeight }"
          :key="scrollKey"
          :scrollWithAnimation="scrollWithAnimation"
          :scrollAnimationDuration="scrollAnimationDuration"
          :scroll-y="true"
          :scroll-top="scrollTop"
          :enhanced="!showScrollbar"
          :show-scrollbar="showScrollbar"
          @scroll="handlerScroll"
          class="bottom-popup-scroll-view"
        >
          <slot>
            <div v-for="item in 2" :key="item"></div>
          </slot>
        </scroll-view>
        <!-- scroll-view 层级问题增加该插槽 -->
        <slot name="scroll-after"></slot>
      </div>
    </div>
    <!-- 底部 -->
    <div v-if="showFooter" class="footer" id="isElementShow">
      <div class="footer__body">
        <slot name="footer">
          <KyButton
            type="primary"
            :text="(footerText || '') + (loading || '') || '确认'"
            :loading-text="footerText || '确认'"
            :disabled="buttonDisabled"
            :loading="loading"
            @click.stop="onConfirm"
          />
        </slot>
      </div>
    </div>
  </Popup>
</template>

<script setup lang="ts">
import { Popup } from '@kye-netc/kye-miniui'
// 组件
import { nextTick, onMounted, useAttrs } from 'vue'
import KyButton from '@order-public-sub-public/components/base/ky-button/index.vue'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'

import { isOrderPreviewRoute } from '@order-public-sub-public/utils/route'
import { onBeforeRouteLeave } from '@order-public-sub-public/vue-router/index'
import { useGlobalPopover } from '@order-global-package-order-sub/components/business/popover-effect/hooks/useUpdate'

interface PropsType {
  title?: string
  showTitleLeft?: boolean
  titleLeftIcon?: string
  showTips?: boolean
  tipIcon?: string
  tipText?: string
  showFooter?: boolean
  customClass?: string
  customStyle?: Record<string, string>
  noPadding?: boolean
  // 挂载的节点
  teleport?: string
  showTitle?: boolean
  buttonDisabled?: boolean
  footerText?: string
  loading?: boolean
  safeAreaInsetBottom?: boolean
  // 显示标题返回icon
  showBackIcon?: boolean
  isMinHeight?: boolean
  scrollTop?: number
  scrollWithAnimation?: boolean
  scrollAnimationDuration?: string
  popupMaxHeight?: string
  // 是否显示滚动条
  showScrollbar?: boolean
}

const scrollKey = `__scrollKey__${new Date().getTime()}`

const props = withDefaults(defineProps<PropsType>(), {
  showTitle: true,
  title: '标题',
  titleLeftIcon: 'left-arrow',
  showTitleLeft: false,
  showTips: false,
  tipIcon: 'tips',
  tipText: '',
  showFooter: true,
  noPadding: false,
  buttonDisabled: false,
  safeAreaInsetBottom: true,
  showBackIcon: false,
  popupMaxHeight: '65vh',
  showScrollbar: true,
})

const emit = defineEmits([
  'onClose',
  'onConfirm',
  'onClickTips',
  'onClickHeader',
  'getEstimationPopupIndex',
  'goBack',
  'beforeRouteClose',
  'open',
  'handlerScroll',
])

const attrs = useAttrs()
const { removeValidateSinge } = useGlobalPopover()

const getEstimationPopupIndex = () => {
  nextTick(() => {
    // 用于预估运费弹窗
    if (!props.customClass || props.customClass !== 'estimation-get-zindex') return false
    const estimationDom = document.querySelectorAll('.' + props.customClass)
    if (estimationDom) {
      let zIndex = 0
      estimationDom.forEach((item: any) => {
        const itemZIndex = (item as any).style.zIndex || 0
        zIndex = itemZIndex > zIndex ? itemZIndex : zIndex
      })
      console.log('zIndex', zIndex)
      emit('getEstimationPopupIndex', zIndex || '')
    }
  })
}

const handlerScroll = (e: any) => {
  emit('handlerScroll', e)
  removeValidateSinge()
}

const onOpen = () => {
  emit('open')
  removeValidateSinge()
}

onMounted(() => {
  getEstimationPopupIndex()
})

/**
 * 点击头部
 */
const onClickHeader = () => {
  emit('onClickHeader')
  if (props.showBackIcon) {
    emit('goBack')
  }
}

/**
 * 点击tips事件
 */
const onClickTips = () => {
  emit('onClickTips')
}

/**
 * 关闭
 */
const onClose = () => {
  removeValidateSinge()
  emit('onClose')
}

/**
 * 确定
 */
const onConfirm = () => {
  emit('onConfirm')
  isOrderPreviewRoute() && onClose()
}

/**
 * 触发退出的时候把已开启的弹框关闭掉
 */
onBeforeRouteLeave(async (_to, _from, next) => {
  if (attrs.show && _to.name === 'order-batch') {
    emit('onClose')
    emit('beforeRouteClose') // 处理部分无法关闭的弹框
  }

  next()
})
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
