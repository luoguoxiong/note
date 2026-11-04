<template>
  <view class="other-login-wrap" v-show="hasOtherLoginMode">
    <view class="other-login-content">
      <view class="other-login-title">
        <text class="title-line"></text>
        <view class="title">其他方式登录</view>
        <text class="title-line"></text>
      </view>

      <!-- <Image :src="loginInfo.image" class="logo" @tap="toOtherLogin" />

      <view class="login-type">{{ loginInfo.text }}</view> -->
      <view class="other-login-list">
        <view class="item" v-show="showWxLogin">
          <image :src="isWxImg" class="logo" @tap="toLogin('quick')" />
          <view class="login-type">{{ isApp ? '微信登录' : '一键登录' }}</view>
        </view>
        <view :class="['item', isApp && showWxLogin && 'ml-48']" v-show="modelValue !== 'phone'">
          <image
            src="https://ic-img.ky-express.com/netc/20250609_42070395161_!!1749434764452_168_168.png"
            class="logo"
            @tap="toLogin('phone')"
          />
          <view class="login-type">手机号登录</view>
        </view>
        <view :class="['item', isApp && showWxLogin && 'ml-48']" v-show="isShowAppOneLogin">
          <image
            src="https://ic-img.ky-express.com/kye-miniapp/user/kye-logo.png"
            class="logo"
            @tap="toLogin('self')"
          />
          <view class="login-type">一键登录</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Image } from '@tarojs/components'
import './index.scss'
import { isWeixinAppSync } from '@/public/config'
import { usePhoneMask } from '@/public/hooks/usePhoneMask'
import { isH5FSEnv, isPcFSEnv, isWxAppIosEnv } from '@public/utils'
import { ensureWechatInstalled } from '@modules/user/pages/login/hooks/login'
import { report_clk_logon_login_other_button } from '@modules/user/report/login'

const { phoneMask } = usePhoneMask()
const props = defineProps<{
  modelValue: 'phone' | 'quick' | 'self'
}>()

const emits = defineEmits<{
  // eslint-disable-next-line no-unused-vars
  (e: 'update:modelValue', value: 'phone' | 'quick' | 'self'): void
}>()

const isApp = ref(isWeixinAppSync())
/* 微信app登录是否展示 */
const showAppWechatLogin = ref(false)

const isWxImg = computed(() => {
  return isApp.value
    ? 'https://ic-img.ky-express.com/netc/20250813_85588_!!1755056281565_168_168.png'
    : 'https://ic-img.ky-express.com/netc/20250609_7897039519_!!1749434735235_176_176.png'
})

const isShowAppOneLogin = computed(() => {
  return isApp.value && phoneMask?.value?.phoneMask && props.modelValue !== 'self'
})

const toOtherLogin = () => {
  console.log('toOtherLogin', props.modelValue === 'phone' ? 'quick' : 'phone')
  emits('update:modelValue', props.modelValue === 'phone' ? 'quick' : 'phone')
}

const toLogin = (value) => {
  if (value === 'quick') {
    report_clk_logon_login_other_button({ button_name: isApp.value ? '微信登录' : '一键登录' })
  }
  console.log('toOtherLogin-value', value)
  emits('update:modelValue', value)
}

const loginInfo = computed(() => {
  const isApp = isWeixinAppSync()
  const map = {
    slef: {
      image: 'https://ic-img.ky-express.com/netc/20250609_42070395161_!!1749434764452_168_168.png',
      text: '手机号登录',
    },
    quick: {
      image: 'https://ic-img.ky-express.com/netc/20250609_42070395161_!!1749434764452_168_168.png',
      text: '手机号登录',
    },
    phone: {
      image: isApp
        ? 'https://ic-img.ky-express.com/netc/20250813_85588_!!1755056281565_168_168.png'
        : 'https://ic-img.ky-express.com/netc/20250609_7897039519_!!1749434735235_176_176.png',
      text: isApp ? '微信登录' : '一键登录',
    },
  }
  return map[props.modelValue]
})

/* 展示微信登录 */
const showWxLogin = computed(() => {
  return props.modelValue !== 'quick' && showAppWechatLogin.value
})

/* 存在其他方式登录 */
const hasOtherLoginMode = computed(() => {
  if (isH5FSEnv || isPcFSEnv) {
    return false
  }
  if (!isWxAppIosEnv) {
    return true
  }
  return (
    (props.modelValue !== 'quick' && showAppWechatLogin.value) ||
    props.modelValue !== 'phone' ||
    isShowAppOneLogin.value
  )
})

/**
 * 检测是否展示微信登录
 * 场景：ios端-未安装微信,不展示入口 (影响审核)
 * @returns {Promise<void>}
 */
const checkShowWechatLogin = async () => {
  let result = false
  if (!isWxAppIosEnv) {
    result = true
  } else {
    const hasWechatInstall = await ensureWechatInstalled()
    if (hasWechatInstall) {
      result = true
    }
  }
  showAppWechatLogin.value = result
}

onMounted(() => {
  checkShowWechatLogin()
})
</script>
