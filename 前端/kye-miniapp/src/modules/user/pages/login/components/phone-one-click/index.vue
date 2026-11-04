<template>
  <view class="phone-one-click">
    <view class="login-header">
      <view class="login-header-top">
        <KyImage mode="aspectFit" class="login-header-logo" name="user/kye-logo.png" />
      </view>
      <text class="login-header-text">{{ phoneMask?.phoneMask }}</text>
    </view>
    <view class="login-form">
      <custom-login-btn :loginLoading="loginLoading" @login="phoneClick" @load="loginLoading = true">
      </custom-login-btn>

      <AgreeProtocol
        ref="agreeProtocolRef"
        v-model="isChecked"
        :isSelfPhoneLogin="currentLoginType === 1"
        :isQuickyLogin="currentLoginType === 2"
        :disabled="loginLoading"
        :extraLinks="extraLinks"
        :isWeixinApp="isWeixinApp"
        @confirm="confirmLogin"
      >
      </AgreeProtocol>
    </view>
  </view>
</template>

<script setup lang="ts">
import Taro from '@tarojs/taro'
import KyImage from '@public/components/base/ky-image/index.vue'

import { AgreeProtocol } from '@/modules/user/components'
import { usePhoneMask } from '@/public/hooks/usePhoneMask'
import { computed, ref } from 'vue'
import { useLogin } from '../../hooks/login'
import { getLoginFromType, isWeixinAppSync } from '@/public/constants'
import { report_clk_logon_login_other_button } from '@modules/user/report/login'
import './index.scss'
import { appPushReLoginMsgPush } from '@/public/utils/appPush'

defineOptions({ name: 'PhoneOneClickLogin' })
const emits = defineEmits(['updateType'])
const isWeixinApp = isWeixinAppSync()

const { phoneMask, setPhoneMask } = usePhoneMask()
const { quickLogin, selfPhoneLogin } = useLogin()
// 是否勾选协议
const isChecked = ref(false)
const agreeProtocolRef = ref()

const loginLoading = ref(false)
const wxData = ref({}) // 微信返回的数据
const wxCode = ref('') // 微信code

const quickLoginMode = ref(false)
const currentLoginType = ref(1) // 当前点击登录类型 1-本机号登录 | 2-微信登录

const extraLinkMaps = {
  1: { name: '《中国移动认证服务条款》', url: 'https://wap.cmpassport.com/resources/html/contract.html' },
  2: {
    name: '《中国联调认证服务条款》',
    url: 'https://opencloud.wostore.cn/authz/resource/html/disclaimer.html?fromsdk=true',
  },
  3: {
    name: '《中国电信认证服务条款》',
    url: 'https://e.189.cn/sdk/agreement/show.do?order=2&type=main&appKey=&hidetop=true&returnUrl=',
  },
}
// 协议链接
const extraLinks = computed(() => (phoneMask.value.operatorType ? [extraLinkMaps[phoneMask.value.operatorType]] : []))

const handlePhoneOneClickLogin = () => {
  // Taro.showToast({ title: res.code || res.errMsg, icon: 'none' })
  // console.log(res, 'xiaochengxubbianji')
  Taro.showLoading({ title: '登录中...', mask: true })
  selfPhoneLogin(wxCode.value)
    .catch(() => {
      Taro.showModal({
        title: '温馨提示',
        content: '一键登录失败，请您尝试手机号登录',
        confirmText: '我知道了',
        showCancel: false,
      }).then(() => {
        emits('updateType', 'phone')
      })
    })
    .finally(() => {
      wxCode.value = '' // 重置
      Taro.hideLoading()
    })
  setPhoneMask(true)
  appPushReLoginMsgPush()
}

// 获取wxcode
const phoneClick = (res) => {
  report_clk_logon_login_other_button({
    page_name: '登录_登录页',
    event_name: '登录_登录页_页面按钮点击',
    button_name: '本机号码一键登录',
  })
  currentLoginType.value = 1
  const detail = res.mpEvent.detail
  if (detail.code || !wxCode.value) {
    wxData.value = { ...detail }
    wxCode.value = detail.code
    console.log(res, detail, '接收到code')
  }
  console.log(res, detail, 'xianzaijcode')
  // Taro.showToast({ title: detail.code || detail.errMsg, icon: 'none' })
  loginLoading.value = false
  if (!isChecked.value) {
    agreeProtocolRef.value.show()
    return
  }
  handlePhoneOneClickLogin() // 登录
}

const ensureAgreeProtocolByQuickLogin = () => {
  currentLoginType.value = 2
  if (!isChecked.value) {
    quickLoginMode.value = !!isWeixinAppSync()
    agreeProtocolRef.value.show()
    return
  }
  Taro.showLoading({ title: '登录中...', mask: true })
  quickLogin({ type: 'miniApp' }).finally(() => {
    Taro.hideLoading()
  })
}

const confirmLogin = () => {
  if (currentLoginType.value === 1) {
    handlePhoneOneClickLogin()
  }
  if (currentLoginType.value === 2) {
    ensureAgreeProtocolByQuickLogin()
  }
}

defineExpose({
  ensureAgreeProtocolByQuickLogin: ensureAgreeProtocolByQuickLogin,
})
</script>
