<template>
  <ky-container v-bind="pageOptions" class="account-setting">
    <view class="setting-page">
      <view class="setting-page-item">
        <view class="setting-page-item-label">手机号</view>
        <view class="setting-page-item-value">{{ userPhone }}</view>
      </view>
      <view v-if="!isAmapMiniApp && !isAliMiniApp" class="setting-page-item" @click="handlePassWordSet">
        <view class="setting-page-item-text">登录密码</view>
        <view class="setting-page-item-value">{{ isSettingText }}</view>
        <image
          src="https://ic-img.ky-express.com/netc/20250118_81970395190_!!1737164979551_56_56.png"
          class="setting-page-item-arrow"
        ></image>
      </view>
      <view class="setting-page-item" @click="handlePhoneProtection">
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
    </view>
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
import { computed, ref } from 'vue'
import { report_CLK_event } from '@public/utils/reportUtil'
import { useUserInfo } from '@public/hooks'
import { useLoginSetting } from '@modules/setting/pages/index/hooks/useLoginSetting'
import '../index/index.scss'
import './index.scss'
import { isAliMiniApp, isAmapMiniApp } from '@/public/utils'
import Taro from '@tarojs/taro'
import { arrowImg } from '../index/config'
import SmsCodePopup from '@modules/user/components/sms-code-popup/index.vue'
import LogoutSuccessDialog from '../index/components/logout-success-dialog/index.vue'

defineOptions({
  name: 'AccountSetting',
})

const pageOptions = ref({
  navBarOptions: { showPlatList: ['wx'], title: '账户与安全' },
})

const { userInfo } = useUserInfo()
const {
  isSettingPassword,
  isSettingText,
  goUpdatePasswordH5Page,
  goSettingPasswordH5Page,
  whiteListUser,
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

/* 密码设置 */
const handlePassWordSet = () => {
  if (isSettingPassword.value === 1) {
    goUpdatePasswordH5Page()
  } else {
    goSettingPasswordH5Page()
  }
  report_CLK_event('clk_mine_seting_account_button', {
    page_code: 'page_mine_seting',
    page_name: 'page_mine_seting_account',
    pageName: '设置页',
    button_name: isSettingText.value,
  })
}

/* 号码保护 */
const handlePhoneProtection = () => {
  Taro.navigateTo({
    url: '/modules/privacy-phone/pages/settings/index',
  })
}
</script>
