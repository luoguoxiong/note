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
            <rich-text class="customize_title" v-if="titleHtml" :nodes="titleHtml"></rich-text>
            <text v-else>
              {{ title }}
            </text>
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
        <component
          :is="getComponent"
          :style="getStyle"
          :key="scrollKey"
          :scrollWithAnimation="scrollWithAnimation"
          :scrollAnimationDuration="scrollAnimationDuration"
          :scroll-y="true"
          :scroll-top="scrollTop"
          @scroll="handlerScroll"
          enhanced
          :class="{ 'min-height': isMinHeight }"
          class="bottom-popup-scroll-view"
          id="bottom-popup-scroll-view"
        >
          <slot>
            <div v-for="item in 2" :key="item"></div>
          </slot>
        </component>
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
import Taro from '@tarojs/taro'
import { Popup } from '@kye-netc/kye-miniui'
import { computed, nextTick, onMounted } from 'vue'
import KyButton from '../../base/ky-button/index.vue'
import SvgIcon from '../svg-icon/index.vue'
import { isWechatEnv } from '@public/utils'
import { isH5FSEnv } from '@/public/utils'

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
  titleHtml?: string
  isMinHeight?: boolean
  scrollTop?: number
  scrollWithAnimation?: boolean
  scrollAnimationDuration?: string
  popupMaxHeight?: string
  // 是否启用scroll-view
  scrollViewEnable?: boolean
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
  scrollViewEnable: true,
})

const emit = defineEmits([
  'onClose',
  'onConfirm',
  'onClickTips',
  'onClickHeader',
  'getEstimationPopupIndex',
  'goBack',
  'open',
  'handlerScroll',
])

const getComponent = computed(() => {
  if (isH5FSEnv) return 'div'
  return props.scrollViewEnable ? 'scroll-view' : 'view'
})

const getStyle = computed(() => {
  let style: any = { maxHeight: props.popupMaxHeight }
  if (isH5FSEnv) {
    style.overflow = 'auto'
  }
  return style
})

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
}

const onOpen = () => {
  emit('open')
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
  emit('onClose')
  nextTick(() => {
    if (isWechatEnv) {
      Taro.hideKeyboard()
    }
  })
}

/**
 * 确定
 */
const onConfirm = () => {
  emit('onConfirm')
}

const hasSrcoll = async (eleStr: any) => {
  return new Promise((resolve) => {
    const query = Taro.createSelectorQuery()
    // 1. 获取 scroll-view 的固定高度 (clientHeight)
    query.select('#bottom-popup-scroll-view').boundingClientRect()
    // 2. 获取内部内容的总高度 (scrollHeight)
    query.select(eleStr).boundingClientRect()
    query.exec((res: any) => {
      const scrollViewRect = res[0]
      const contentRect = res[1]
      if (scrollViewRect && contentRect) {
        const hasScroll = contentRect.height > scrollViewRect.height
        if (hasScroll) {
          resolve(true)
        } else {
          resolve(false)
        }
      }
    })
  })
}

defineExpose({
  hasSrcoll,
})
</script>

<style lang="scss">
@import '../../../styles/index.scss';
@import './index.scss';
</style>
