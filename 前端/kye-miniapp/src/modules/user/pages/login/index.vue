<template>
  <ky-container v-bind="pageOptions">
    <div class="login-page__content">
      <PhoneOneClickLogin
        v-if="loginType === 'self'"
        ref="pageRef"
        @updateType="handleUpdateLoginType"
      ></PhoneOneClickLogin>
      <QuickLogin v-if="loginType === 'quick'" class="login-page__box"></QuickLogin>
      <PhoneLogin v-if="loginType === 'phone'" ref="pageRef" class="login-page__box"></PhoneLogin>
      <OtherLogin
        :modelValue="loginType"
        @update:modelValue="handleUpdateLoginType"
        v-if="isWxMiniApp || isH5FSEnv"
      ></OtherLogin>
      <!--      <OtherLogin v-model="loginType"></OtherLogin>-->
    </div>
  </ky-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import QuickLogin from './components/quick-login/index.vue'
import OtherLogin from './components/other-login/index.vue'
import PhoneLogin from './components/phone-login/index.vue'
import PhoneOneClickLogin from './components/phone-one-click/index.vue'
import Taro, { useLoad, useUnload } from '@tarojs/taro'
import { clearUserCache } from '@/public/storage'
import { usePhoneMask } from '@/public/hooks/usePhoneMask'
import { reportLoginUv, report_EXP_page_logon_login } from '@modules/user/report/login'
import kyeNavigate from '@/public/utils/native/navigate'
import { isWxMiniApp, isH5FSEnv, isPcFSEnv } from '@public/utils'
import { isWeixinAppSync } from '@/public/config'
import { useCustomerCodeEventBus, CC_EVENTS } from '@modules/user/pages/customer-code/hooks/useCustomerCodeEventBus'
import './index.scss'

const { phoneMask } = usePhoneMask()
// 区分端默认登录类型
const loginTypeDefault = computed(() => {
  console.log(phoneMask.value, '000000phoneMask.value00000')
  const selectOnePhone = phoneMask?.value?.phoneMask ? Taro.getStorageSync('LAST_LOGIN_PAGE_TYPE') || 'self' : 'phone'

  // 飞书
  if (isH5FSEnv) {
    return selectOnePhone
  }

  return isWeixinAppSync() ? selectOnePhone : 'quick'
})
// 登录类型
const loginType = ref<'phone' | 'quick' | 'self'>(loginTypeDefault.value)
const pageRef = ref<InstanceType<typeof PhoneLogin> | null>(null)

defineOptions({ name: 'UserLogin' })

const pageOptions = ref({
  navBarOptions: {
    showPlatList: ['wx', 'alipay'],
    title: '',
    // 轻应用 不登录返回，默认回到首页
    beforeBack: async () => {
      const pages = Taro.getCurrentPages()
      const current = pages[pages.length - 2]

      const loginRedirects = ['modules/user/pages/changeLogin/index', 'modules/webview/pages/webview/index']

      if (loginRedirects.some((path) => current.route?.includes(path))) {
        Taro.switchTab({ url: '/layout/pages/home/index' })
        return Promise.resolve(false)
      }

      return Promise.resolve(true)
    },
  },
})

const { emit: emitCcEvent } = useCustomerCodeEventBus()

useLoad(() => {
  reportLoginUv()
  if (!isPcFSEnv) {
    clearUserCache()
  }
  report_EXP_page_logon_login()
  // 进入登录页即关闭绑码弹窗（覆盖所有进入路径，不依赖 openLoginPage 触发）
  emitCcEvent(CC_EVENTS.CLOSE_POPUP)
})

/* 页面卸载逻辑 */
useUnload(() => {
  // 销毁登录成功临时回调
  kyeNavigate.clearLoginBackFn()
})

const handleUpdateLoginType = (value: 'phone' | 'quick' | 'self') => {
  console.log(value, '有没有触发这个方法')
  if (isWeixinAppSync() && value === 'quick') {
    // 多端应用同意协议后直接登录
    pageRef.value?.ensureAgreeProtocolByQuickLogin()
    return
  }
  loginType.value = value
}
</script>
