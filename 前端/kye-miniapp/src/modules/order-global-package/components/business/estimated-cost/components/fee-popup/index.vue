<template>
  <!-- 遮罩层 -->
   <root-portal v-if="show">
     <view
        class="estimated-cost-popup-mask"
        :class="{ 'estimated-cost-popup-mask-show': show }"
        @tap.stop="handleMaskClick"
        :catch-move="true"
        :style="maskStyle"
      />
      <!-- 弹框内容 -->
      <view
        v-if="show"
        class="estimated-cost-popup-container"
        :style="[containerStyle]"
        :class="[
          {
            'estimated-cost-popup-container-show': show,
            'estimated-cost-popup-container-bottom': position === 'bottom',
            'estimated-cost-popup-container-center': position === 'center' && !isH5FSEnv,
            'estimated-cost-popup-container-center-h5': position === 'center' && isH5FSEnv,
          },
          customClass,
        ]"
        v-bind="$attrs"
      >
        <div v-if="showTitle" class="estimated-cost-popup-header" @click.stop="onClickHeader" :catch-move="true">
          <div class="estimated-cost-popup-content">
            <slot name="header">
              <div class="estimated-cost-popup-content__title">
                <SvgIcon class="back-icon" name="title-back" v-if="showBackIcon" />
                <rich-text class="customize_title" v-if="titleHtml" :nodes="titleHtml"></rich-text>
                <text v-else>
                  {{ title }}
                </text>
              </div>
              <slot name="tips">
                <div v-if="showTips" class="estimated-cost-popup-content__tip" @click.stop="onClickTips">
                  <SvgIcon class="estimated-cost-popup-content__tip__icon font-level3" :name="tipIcon" />
                  <span class="estimated-cost-popup-content__tip__text">{{ tipText }}</span>
                </div>
              </slot>
            </slot>
          </div>

          <div class="close" @click.stop="onClose">
            <SvgIcon class="close-icon" name="close-icon-padding"></SvgIcon>
          </div>
        </div>
        <slot></slot>
      </view>
   </root-portal>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue'
import SvgIcon from '../../../../ui/svg-icon/index.vue'
import { isH5FSEnv } from '@public/utils'
// 内联 isH5FSEnv 判断（来自 @/public/utils，非 @order-public）
// const isH5FSEnv = typeof window !== 'undefined' && /miniProgram/i.test(navigator.userAgent) === false && typeof Taro === 'undefined'

export default defineComponent({
  name: 'Popup',
  inheritAttrs: false,
  components: {
    SvgIcon,
  },
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    position: {
      type: String,
      default: 'bottom',
      validator: (value: string) => ['bottom', 'center', 'top'].includes(value),
    },
    maskClosable: {
      type: Boolean,
      default: true,
    },
    duration: {
      type: Number,
      default: 300,
    },
    footerSectionHeight: {
      type: Number,
      default: 64,
    },
    zIndex: {
      type: Number,
      default: 80,
    },
    levelTwo: {
      type: Boolean,
      default: false,
    },
    showBackIcon: {
      type: Boolean,
      default: false,
    },
    showTitle: {
      type: Boolean,
      default: true,
    },
    showTips: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
    },
    tipIcon: {
      type: String,
    },
    tipText: {
      type: String,
    },
    titleHtml: {
      type: String,
    },
    customClass: {
      type: String,
      default: '',
    },
  },
  emits: ['update:modelValue', 'close', 'onClickTips', 'onClickHeader', 'goBack', 'onClose'],
  setup(props, { emit }) {
    const show = ref(props.modelValue)

    watch(
      () => props.modelValue,
      (val) => {
        show.value = val
      },
    )

    const handleMaskClick = () => {
      if (props.maskClosable) {
        onClose()
      }
    }

    const onClose = () => {
      show.value = false
      emit('update:modelValue', false)
      emit('onClose')
    }
    const faultTolerant = 0
    const maskStyle = computed(() => {
      if (props.levelTwo) {
        return `z-index: ${props.zIndex}`
      }
      const h = props.footerSectionHeight + faultTolerant + 'px'
      const str = `height: calc(100vh - ${h} - env(safe-area-inset-bottom, 20px)); z-index: ${props.zIndex}`
      return str
    })
    const containerStyle = computed(() => {
      if (props.levelTwo) {
        return `z-index: ${props.zIndex + 1}`
      }
      const h = props.footerSectionHeight + faultTolerant + 'px'
      const str = `bottom: calc(${h} + env(safe-area-inset-bottom, 20px)); z-index: ${props.zIndex + 1}`
      return str
    })
    const onClickHeader = () => {
      emit('onClickHeader')
      if (props.showBackIcon) {
        emit('goBack')
      }
    }
    const onClickTips = () => {
      emit('onClickTips')
    }
    const stopPreventFunc = (e: Event) => {
      e.stopPropagation()
      e.preventDefault()
    }
    return {
      isH5FSEnv,
      show,
      handleMaskClick,
      onClose,
      maskStyle,
      containerStyle,
      onClickHeader,
      onClickTips,
      stopPreventFunc,
    }
  },
})
</script>

<style lang="scss">
@import '../../../../../styles/index.scss';
@import './index.scss';
</style>
