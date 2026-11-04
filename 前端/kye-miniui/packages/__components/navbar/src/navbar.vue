<template>
  <!-- 自定义导航栏 -->
  <view
    v-if="showNavBar"
    class="ky-navbar"
    :class="{ 'ky-navbar--border': border, 'ky-navbar--full': isFullTitle }"
    :style="{ height: barStatus.appHeaderHeight + 'px', zIndex: zIndex }"
  >
    <view
      class="ky-navbar__content"
      :style="{ paddingTop: barStatus.paddingTop + 'px', height: barStatus.appHeaderHeight + 'px' }"
    >
      <!-- 返回按钮 -->
      <view class="ky-navbar__left" @click="handleClickBack" :style="{ paddingLeft: barStatus.paddingLeft + 'px' }">
        <slot name="left">
          <img :class="['ky-navbar__back-icon', !showLeftIcon && 'ky-navbar__back-icon--hidden']" :src="backImg" />
          {{ leftText }}
        </slot>
      </view>
      <!-- title -->
      <view
        class="ky-navbar__title"
        @click="handleClickTitle"
        :style="{ paddingLeft: barStatus.textRight - (barStatus.paddingLeft + 22) + 'px' }"
      >
        <slot name="title">
          <ky-text type="title" size="1" overflow="ellipsis" :style="titleStyle">{{ title }}</ky-text>
        </slot>
      </view>
      <!-- 右侧按钮 -->
      <view class="ky-navbar__right" @click="handleClickRight" :style="{ paddingRight: barStatus.textRight + 'px' }">
        <slot name="right" v-if="$slots.right || rightText">
          {{ rightText }}
        </slot>
      </view>
    </view>
  </view>
  <!-- 自定义placeholder 占位 -->
  <view
    v-if="showNavBar && placeholder"
    class="ky-navbar__placeholder"
    :style="{ height: barStatus.appHeaderHeight + 'px' }"
  ></view>
</template>

<script setup lang="ts">
import './index.scss'
import Taro from '@tarojs/taro'
import { ref, onMounted, reactive, computed } from 'vue'
import { KyNavBarProps } from './types'
import { useNavbarStatus } from '@packages/__components/navbar/src/useNavbar/useNavbar'
import { envListMap } from '@packages/__components/navbar/src/constant'
import { callInterceptor } from '@packages/utils/src/interceptor'
import useEnvConfig from '@packages/utils/hooks/useEnvConfig'
// import useEnvConfig from '@packages/utils/hooks/useEnvConfig'

const props = withDefaults(defineProps<KyNavBarProps>(), {
  title: 'title',
  leftText: '',
  rightText: '',
  showPlatList: ['wx'],
  backPath: '',
  zIndex: 999,
  placeholder: true,
  leftArrow: true,
  border: false,
})

const emit = defineEmits(['click-title', 'click-left', 'click-right'])

console.log('props navbar', props)

// 默认返回按钮图片
const backImg = ref('https://ic-img.ky-express.com/netc/20250110_38321882345_!!1736478265786_80_80.png')

// 环境变量
const state = reactive({
  ENV: Taro.getEnv(),
  ENV_TYPE: Taro.ENV_TYPE,
})

// 是否展示nav
const showNavBar = ref(false)
// 左侧按钮(默认返回按钮，支付宝不展示)
const showLeftIcon = ref(props.leftArrow)

console.log('showLeftIcon', showLeftIcon.value)

const barStatus = useNavbarStatus(state.ENV)
// 是否微信app
const { isWxApp } = useEnvConfig()

// 标题自定义样式
const titleStyle = computed(() => {
  if (barStatus.value?.alipayTitleFontSize) {
    return {
      fontSize: barStatus.value.alipayTitleFontSize + 'px',
    }
  } else {
    return {}
  }
})

// app 端全屏title(无右侧)
const isFullTitle = computed(() => {
  return isWxApp && !props.rightText
})

// 初始化组件
const compInit = () => {
  // 存在自定义左侧图标
  if (props.leftArrowIcon) {
    backImg.value = props.leftArrowIcon
  }
  // const { isWxApp } = useEnvConfig()
  // 是否展示导航
  if (props.showPlatList?.includes(envListMap[state.ENV])) {
    showNavBar.value = true
  }
  // 定制逻辑：支付宝不展示自定义箭头按钮
  if (state.ENV === state.ENV_TYPE.ALIPAY) {
    showLeftIcon.value = false
  }
}

/* 点击标题事件 */
const handleClickTitle = (e: Event) => {
  console.log('handleClickTitle', e)
  emit('click-title', e)
}

const handleBack = () => {
  // 存在多个页面栈返回上一级
  if (Taro.getCurrentPages().length > 1) {
    Taro.navigateBack()
  } else {
    if (props.backPath) {
      Taro.reLaunch({
        url: props.backPath,
      })
    } else {
      Taro.switchTab({ url: '/layout/pages/home/index' })
    }
  }
}

/* 点击返回事件， 不支持支付宝 */
const handleClickBack = (e: Event) => {
  console.log('handleClickBack', e)
  emit('click-left', e)
  try {
    // 返回拦截
    callInterceptor(props.beforeBack, {
      args: [
        {
          e,
        },
      ],
      done: () => {
        handleBack()
      },
    })
  } catch (e) {
    console.log(e)
  }
}
/* 点击右侧按钮事件 */
const handleClickRight = (e) => {
  console.log('handleClickRight', e)
  emit('click-right', e)
}

onMounted(() => {
  compInit()
})
</script>
