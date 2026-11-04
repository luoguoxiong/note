<template>
  <view class="loginContainer">
    <view class="login-header">
      <view class="login-header-top">
        <KyImage mode="aspectFit" class="login-header-logo" name="user/kye-logo.png" />
      </view>
      <text class="login-header-text">跨越寄件</text>
    </view>
    <view class="login-form">
      <button
        class="login-form-button"
        :class="{ disabled: loginLoading }"
        @tap="handleTap"
        :open-type="openType"
        :disabled="loginLoading"
        scope="phoneNumber"
        @getphonenumber="onGetPhoneNumber"
        @error="onError"
      >
        <image v-if="loginLoading" src="./login-btn-loading.png" class="icon-loading"></image>
        <view>一键登录</view>
      </button>
      <AgreeProtocol
        ref="agreeProtocolRef"
        is-quicky-login
        v-model="isChecked"
        :disabled="loginLoading"
        :isWeixinApp="isWeixinApp"
        @getPhone="onPrivacyAgree"
        @error="onError"
        @confirm="onPrivacyConfirm"
      ></AgreeProtocol>
    </view>
  </view>
</template>

<script setup lang="ts">
import Taro from '@tarojs/taro'
import KyImage from '@public/components/base/ky-image/index.vue'
import useLoginLoading from '@modules/user/pages/login/hooks/useLoginLoading'
import { computed, ref } from 'vue'
import { AgreeProtocol } from '@/modules/user/components'
import { checkNetworkTypeToast, report_CLK_event, isWxMiniApp, isAliMiniApp, isAmapMiniApp } from '@public/utils'
import { USER_ERRORS } from '@modules/user/constants'
import { isWeixinAppSync } from '@public/config'
import { useLogin } from '../../hooks/login'
import './index.scss'

defineOptions({ name: 'QuickLoginPage' })
const isWeixinApp = isWeixinAppSync()

// 是否勾选协议
const isChecked = ref(false)
const agreeProtocolRef = ref()

/* 登录按钮触发接口前loading timeout */
const { startLoginLoading, clearLoginLoadingTimeout, loginLoading, clearLoginLoading } = useLoginLoading()
const { quickLogin } = useLogin()

const openType = computed(() => {
  if (!isChecked.value) return ''
  if (isWeixinApp || isAmapMiniApp) {
    return ''
  }
  return isWxMiniApp ? 'getPhoneNumber' : isAliMiniApp ? 'getAuthorize' : ''
})

// 支付宝用户信息授权回调
const onGetPhoneNumber = async (e: any) => {
  if (!isChecked.value) {
    return
  }
  await checkNetworkTypeToast()
  let { encryptedData, iv, errMsg, code, errno, sign } = e.detail
  // [20000:系统繁忙，40001:缺少加密配置,40002：加密异常,40003:无授权关系]
  if (!encryptedData) {
    clearLoginLoading()
    Taro.showToast({ title: USER_ERRORS.GET_PHONE_NUMBER, icon: 'none' })
    return
  }
  clearLoginLoadingTimeout()
  quickLogin({
    type: isAliMiniApp ? 'alipay' : 'miniprogram',
    params: { encryptedData, iv, errMsg, code, errno, sign },
  })
}

/* 授权失败错误 */
const onError = (e) => {
  clearLoginLoading()
  clearLoginLoadingTimeout()
}

/* 一键登录事件 */
const handleTap = async () => {
  await checkNetworkTypeToast()

  if (!isChecked.value) {
    agreeProtocolRef.value.show()
    return
  }
  startLoginLoading()

  report_CLK_event('clk_logon_login_other_button', { button_name: '一键登录', page_code: 'page_logon_login' })
  report_CLK_event('clk_one_click_login_button_v1', {
    button_name: '登录_点击一键登录按钮',
    page_code: 'page_logon_login_v1',
  }) // 新增
  // 微信app-一键登录

  if (!isChecked.value) return

  if (isWeixinApp) {
    quickLogin({ type: 'miniApp' })
  }
  if (isAmapMiniApp) {
    quickLogin({ type: 'amap' })
  }
}

/* 同意并登录获取用加密信息 */
const onPrivacyAgree = async ({ encryptedData, iv, errMsg, code, errno, sign }) => {
  clearLoginLoadingTimeout()
  await checkNetworkTypeToast()

  if (isAmapMiniApp) {
    quickLogin({ type: 'amap' })
  } else {
    quickLogin({
      type: Taro.getEnv() === Taro.ENV_TYPE.WEAPP ? 'miniprogram' : 'alipay',
      params: { encryptedData, iv, errMsg, code, errno, sign },
    })
  }
}

/* 同意并登录confirm */
const onPrivacyConfirm = () => {
  // 微信app-一键登录
  if (isWeixinApp && isChecked.value) {
    quickLogin({ type: 'miniApp' })
  } else if (isAmapMiniApp && isChecked.value) {
    quickLogin({ type: 'amap' })
  }
}
</script>
