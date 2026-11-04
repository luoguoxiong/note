<template>
  <AppSettingPage v-if="showAppSetting" />
  <ky-container v-else v-bind="pageOptions">
    <view class="setting-page">
      <view class="setting-page-item">
        <view class="setting-page-item-label">手机号</view>
        <view class="setting-page-item-value">{{ userPhone }}</view>
      </view>
      <view class="setting-page-item" v-if="isWxMiniApp || isH5Env" @click="handlePassWordSet">
        <view class="setting-page-item-text">登录密码</view>
        <view class="setting-page-item-value">{{ isSettingText }}</view>
        <image :src="arrowImg" class="setting-page-item-arrow"></image>
      </view>
      <view class="setting-page-item" @click="handleOpenPrivacyPolicy" v-if="!isWxMiniApp">
        <view class="setting-page-item-text">隐私政策</view>
        <image :src="arrowImg" class="setting-page-item-arrow"></image>
      </view>
      <view class="setting-page-item" @click="handlePhoneProtection" v-if="!isH5FSEnv">
        <view class="setting-page-item-text">号码保护</view>
        <view class="setting-page-item-value">去设置</view>
        <image :src="arrowImg" class="setting-page-item-arrow"></image>
      </view>
      <view
        class="setting-page-item"
        :class="{ 'setting-page-item--disabled': isLoggingOut }"
        @click="handleOneKeyLogoutClick"
      >
        <view class="setting-page-item-text">一键退登其他设备</view>
        <view class="setting-page-item-value">{{ logoutEntranceText }}</view>
        <image :src="arrowImg" class="setting-page-item-arrow"></image>
      </view>
      <view class="setting-page-item" @click="handleAboutKYE" v-if="!isH5FSEnv">
        <view class="setting-page-item-text">关于跨越</view>
        <image :src="arrowImg" class="setting-page-item-arrow"></image>
      </view>
      <view class="setting-page-item" @click="handleOpenPrivacyPolicy" v-if="isWxMiniApp">
        <view class="setting-page-item-text">隐私政策</view>
        <image :src="arrowImg" class="setting-page-item-arrow"></image>
      </view>

      <view class="setting-page-item" @click="handleOpenPolicy('code2', '隐私政策概要')" v-if="!isH5FSEnv">
        <view class="setting-page-item-text">隐私政策概要</view>
        <image :src="arrowImg" class="setting-page-item-arrow"></image>
      </view>
      <view class="setting-page-item" @click="handleOpenPolicy('code4', '个人信息清单')" v-if="!isH5FSEnv">
        <view class="setting-page-item-text">个人信息清单</view>
        <image :src="arrowImg" class="setting-page-item-arrow"></image>
      </view>
      <view class="setting-page-item" @click="handleOpenPolicy('code6', '权限清单')">
        <view class="setting-page-item-text">权限清单</view>
        <image :src="arrowImg" class="setting-page-item-arrow"></image>
      </view>
      <view class="setting-page-item" @click="handleOpenPolicy('code3', '第三方信息共享')" v-if="!isH5FSEnv">
        <view class="setting-page-item-text">第三方信息共享</view>
        <image :src="arrowImg" class="setting-page-item-arrow"></image>
      </view>

      <view class="setting-page-item" @click="toRedirct" v-if="isUatAndApp">
        <view class="setting-page-item-text">测试转发</view>
        <image :src="arrowImg" class="setting-page-item-arrow"></image>
      </view>
      <view class="setting-page-item" @click="toNative" v-if="isUatAndApp">
        <view class="setting-page-item-text">App 原生能力调试</view>
        <image :src="arrowImg" class="setting-page-item-arrow"></image>
      </view>
      <view class="setting-page-item" @click="toNativePlugin" v-if="isUatAndApp">
        <view class="setting-page-item-text">App 插件调试</view>
        <image :src="arrowImg" class="setting-page-item-arrow"></image>
      </view>
      <view class="setting-page-item" @click="openVitruList" v-if="showSelectItem">
        <view class="setting-page-item-text"
          >{{ xEnvId ? '切换' : '选择' }}泳道{{ xEnvId ? '-' : '' }}{{ xEnvId }}</view
        >
        <image :src="arrowImg" class="setting-page-item-arrow"></image>
      </view>
      <view class="setting-page-btn-group">
        <ky-button v-if="showSwitchPhoneBtn" type="primary" size="large" plain @click="changeLogin"
          >切换登录手机号</ky-button
        >
        <ky-button v-if="whiteListUser && !isAmapMiniApp" type="primary" size="large" plain @click="handleCustomerLogin"
          >切换客户手机号</ky-button
        >
        <ky-button v-if="showBackSelfBtn" type="primary" size="large" plain @click="handleGoBack"
          >返回自己的手机号</ky-button
        >
        <ky-button class="setting-page-loginout" size="large" @click="handleLogout">退出登录</ky-button>
      </view>
      <view class="setting-page-account-cancel" v-if="!isH5Env">
        <view class="setting-page-account-cancel-confirm" @click="logoff">注销账号</view>
        <text class="setting-page-account-cancel-desc">，注销后无法恢复，请谨慎操作</text>
      </view>
      <view class="version">
        <view class="version-content">版本号：V{{ shellVersion }}</view>
      </view>
    </view>
    <!--  切换客户手机号弹窗  -->
    <white-list ref="whiteListRef" @onConfirm="handleConfirmWhite" @onCancel="handleCancelWhite"></white-list>
    <EnvSelector
      v-model="xEnvId"
      v-model:show="showXenv"
      :envList="xEnvList"
      @change="setXenvId"
      v-if="showSelectItem"
    />
    <logout-dialog ref="logoutDialogRef" @confirm="handleLogoutConfirm"></logout-dialog>
    <sms-code-popup
      v-model:show="showSmsPopup"
      :tip="smsTip"
      :captcha-type="logoutCaptchaType"
      @next="handleSmsVerified"
      @resend="handleSmsResend"
    />
    <logout-success-dialog
      v-model:show="showSuccessDialog"
      @confirm="handleGoModifyPassword"
      @cancel="handleStayUnmodified"
    />
  </ky-container>
</template>
<script lang="ts" setup>
import './index.scss'
import { arrowImg } from './config'
import { openURL } from '@modules/webview/utils'
// import { onLogOutModal } from '@modules/user/pages/login/service'
import Taro, { useDidShow } from '@tarojs/taro'
import { computed, ref } from 'vue'
import { report_CLK_event, report_wrapper } from '@public/utils/reportUtil'
import { shellVersion } from '@public/constants'
import { useUserInfo } from '@public/hooks'
import { useLoginSetting } from '@modules/setting/pages/index/hooks/useLoginSetting'
import WhiteList from './components/white-list/index.vue'
import LogoutDialog from './components/logout-dialog/index.vue'
import LogoutSuccessDialog from './components/logout-success-dialog/index.vue'
import SmsCodePopup from '@modules/user/components/sms-code-popup/index.vue'
import { usePingPong } from '@public/utils/socket/usePingPong'
import { getEnvConfig, isWeixinAppSync } from '@/public/config'
import { isAmapMiniApp, isH5Env, isH5FSEnv, isWxMiniApp, urlContact } from '@/public/utils'
import AppSettingPage from './index.app.vue'
import { clearUserCache } from '@/public/storage'
import { useXenvId } from '@/public/appxenv'
import EnvSelector from './components/env-selector/index.vue'
const pageOptions = ref({
  navBarOptions: {
    showPlatList: ['wx'],
    title: '',
  },
})

defineOptions({ name: 'SettingPage' })

const whiteListRef = ref<InstanceType<typeof WhiteList> | null>(null)
const logoutDialogRef = ref<InstanceType<typeof LogoutDialog> | null>(null)
const showAppSetting = computed(() => isWeixinAppSync())

const { xEnvId, xEnvList, openVitruList, showXenv, setXenvId, showSelectItem } = useXenvId()

const { userInfo } = useUserInfo()
const {
  handleChangeLogin,
  isSettingPassword,
  isSettingText,
  showSwitchPhoneBtn,
  showBackSelfBtn,
  goUpdatePasswordH5Page,
  goSettingPasswordH5Page,
  whiteListUser,
  handleCancelWhite,
  handleConfirmWhite,
  handleGoBack,
  goAccountCancellationH5Page,
  showSmsPopup,
  showSuccessDialog,
  isLoggingOut,
  logoutCaptchaType,
  smsTip,
  logoutEntranceText,
  handleOneKeyLogoutClick,
  handleSmsResend,
  handleSmsVerified,
  handleGoModifyPassword,
  handleStayUnmodified,
} = useLoginSetting()

const userPhone = computed(() => {
  return userInfo?.value?.phone
})

const toRedirct = () => {
  Taro.navigateTo({
    url: '/packages/test/index',
  })
}

const getLinkConfig = (code: string) => {
  const { isProd } = getEnvConfig()
  const prefix = isProd ? 'KY_250623' : 'KY_250616'
  const pageCode = isProd ? 'KY01_0001' : 'KY35_0001'
  const articleMap = {
    code1: `${prefix}0002`, // 隐私政策
    code2: `${prefix}0003`, // 隐私政策概要
    code3: `${prefix}0004`, // 第三方信息共享
    code4: `${prefix}0005`, // 个人信息清单
    code5: `${prefix}0001`, // 用户协议
    code6: 'KY_2604170001', // 权限清单
  }
  return {
    id: pageCode,
    code: articleMap[code],
  }
}

const handleOpenPrivacyPolicy = () => {
  openURL(`${urlContact('/article.html', getLinkConfig('code1'))}`, { needLogin: true })
  report_CLK_event('clk_mine_setting_button', {
    page_code: 'page_mine_seting',
    pageName: '设置页',
    button_name: '隐私政策',
  })
  reportClickEvent('隐私政策')
}

const handleOpenPolicy = (code: string, name: string) => {
  openURL(`${urlContact('/article.html', getLinkConfig(code))}`, { needLogin: false })
  report_CLK_event('clk_mine_setting_button', {
    page_code: 'page_mine_seting',
    pageName: '设置页',
    button_name: name,
  })
  reportClickEvent(name)
}

/* 密码设置 */
const handlePassWordSet = () => {
  if (isSettingPassword.value === 1) {
    goUpdatePasswordH5Page()
  } else {
    // isSettingPassword.value === 0
    goSettingPasswordH5Page()
  }
  report_CLK_event('clk_mine_seting_account_button', {
    page_code: 'page_mine_seting',
    page_name: 'page_mine_seting_account',
    pageName: '设置页',
    button_name: isSettingText.value,
  })
  reportClickEvent('登录密码')
}

// 切换登录手机号
const changeLogin = () => {
  handleChangeLogin()
  reportClickEvent('切换登录手机号')
}

// 注销
const logoff = () => {
  goAccountCancellationH5Page()
  reportClickEvent('注销')
}

const handleLogoutConfirm = async () => {
  Taro.switchTab({ url: '/layout/pages/mine/index' })
  clearUserCache()
}

const handleLogout = async () => {
  reportClickEvent('退出登录')
  logoutDialogRef.value?.open()
  // onLogOutModal(async () => {
  //   Taro.switchTab({ url: '/layout/pages/mine/index' })
  //   clearUserCache()
  // })
  // report_CLK_event('clk_mine_setting_button', {
  //   page_code: 'page_mine_seting',
  //   pageName: '设置页',
  //   button_name: '退出登录',
  // })
}

/* 号码保护 */
const handlePhoneProtection = report_wrapper(() => {
  Taro.navigateTo({
    url: '/modules/privacy-phone/pages/settings/index',
  })
  reportClickEvent('号码保护')
}, ['clk_mine_setting_button', 'CLK', { page_code: 'page_mine_seting', button_name: '号码保护' }])

// 关于跨越
const handleAboutKYE = () => {
  openURL('/about-kye.html#/home')
  reportClickEvent('关于跨越')
}

/* 打开切换客户手机号弹窗 */
const handleCustomerLogin = () => {
  whiteListRef.value?.openDialog()
}

const isUatAndApp = ref(false)

const toNative = () => {
  Taro.navigateTo({
    url: '/modules/native/pages/test/index',
  })
}

const toNativePlugin = () => {
  Taro.navigateTo({
    url: '/modules/app-plugin/pages/test/index',
  })
}

const reportClickEvent = (buttonName: string) => {
  report_CLK_event('clk_home_set_button_v1', {
    region_code: 'set_up',
    region_name: '设置页',
    page_code: 'page_home_set',
    page_name: '移动端新版设置页',
    event_code: 'clk_home_set_button_v1',
    event_name: '移动端设置页_各入口_点击',
    button_name: buttonName,
  })
}

useDidShow(() => {
  const { isProd } = getEnvConfig()
  isUatAndApp.value = !isProd
  // 强制开启心跳,跳回该页面后，重启心跳
  if (isH5Env) {
    Taro.setNavigationBarTitle({
      title: '设置',
    })
  }
})
</script>
