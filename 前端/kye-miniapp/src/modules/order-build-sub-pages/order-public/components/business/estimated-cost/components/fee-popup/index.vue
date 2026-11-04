<template>
  <!-- 遮罩层 -->
  <view
    v-if="show"
    class="estimated-cost-popup-mask"
    :class="{ 'estimated-cost-popup-mask-show': show }"
    @touchmove.stop.prevent="stopPreventFunc"
    @tap.stop="handleMaskClick"
    :style="maskStyle"
  />
  <!-- 弹框内容 -->
  <view
    v-if="show"
    class="estimated-cost-popup-container"
    @touchmove.stop.prevent="stopPreventFunc"
    :style="containerStyle"
    :class="{
      'estimated-cost-popup-container-show': show,
      'estimated-cost-popup-container-bottom': position === 'bottom',
      'estimated-cost-popup-container-center': position === 'center',
    }"
  >
    <div v-if="showTitle" class="estimated-cost-popup-header" @click.stop="onClickHeader">
      <div class="estimated-cost-popup-content">
        <slot name="header">
          <div class="estimated-cost-popup-content__title">
            <SvgIcon class="back-icon" name="title-back" v-if="showBackIcon" />
            {{ title }}
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
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'

export default defineComponent({
  name: 'Popup',
  components: {
    SvgIcon,
  },
  props: {
    // 是否显示弹框
    modelValue: {
      type: Boolean,
      default: false,
    },
    // 弹框位置
    position: {
      type: String,
      default: 'bottom', // 'bottom' | 'center' | 'top'
      validator: (value: string) => ['bottom', 'center', 'top'].includes(value),
    },
    // 点击遮罩层是否可以关闭
    maskClosable: {
      type: Boolean,
      default: true,
    },
    // 动画持续时间
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
  },
  emits: ['update:modelValue', 'close', 'onClickTips', 'onClickHeader', 'goBack', 'onClose'],
  //   const emit = defineEmits([
  //   'onClose',
  //   'onConfirm',
  //   'onClickTips',
  //   'onClickHeader',
  //   'getEstimationPopupIndex',
  //   'goBack',
  //   'beforeRouteClose',
  // ])
  setup(props, { emit }) {
    const show = ref(props.modelValue)

    // 监听props变化
    watch(
      () => props.modelValue,
      (val) => {
        show.value = val
      },
    )

    // 遮罩层点击事件
    const handleMaskClick = () => {
      if (props.maskClosable) {
        onClose()
      }
    }

    // 关闭弹框
    const onClose = () => {
      show.value = false
      emit('update:modelValue', false)
      emit('onClose')
    }
    const faultTolerant = 0
    const maskStyle = computed(() => {
      if (props.levelTwo) {
        return `zIndex: ${props.zIndex}`
      }
      const h = props.footerSectionHeight + faultTolerant + 'px'
      const str = `height: calc(100vh - ${h} - env(safe-area-inset-bottom, 20px)); zIndex: ${props.zIndex}`
      console.log('containerStyle', str)
      return str
    })
    const containerStyle = computed(() => {
      if (props.levelTwo) {
        return `zIndex: ${props.zIndex + 1}`
      }
      const h = props.footerSectionHeight + faultTolerant + 'px'
      const str = `bottom: calc(${h} + env(safe-area-inset-bottom, 20px)); zIndex: ${props.zIndex + 1}`
      console.log('containerStyle', str)
      return str
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
     * 阻止事件冒泡
     */
    const stopPreventFunc = (e: Event) => {
      e.stopPropagation()
      e.preventDefault()
    }
    return {
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
// height: calc(100vh - 128px - env(safe-area-inset-bottom, 20px));

// bottom: calc(128px + env(safe-area-inset-bottom, 20px));
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
