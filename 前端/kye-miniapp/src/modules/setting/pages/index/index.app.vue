<template>
  <ky-container v-bind="pageOptions">
    <view class="setting-page">
      <view class="setting-page-header">
        <image class="logo" src="https://ic-img.ky-express.com/default/20251203_32126_!!1764745332786_296_296.png" />
        <view class="title">跨越速运 {{ miniAppVersionText }}</view>
      </view>
      <view v-if="isLogin" class="setting-page-item" @click="handleOpenAccountSetting">
        <view class="setting-page-item-text">账户与安全</view>
        <image :src="arrowImg" class="setting-page-item-arrow"></image>
      </view>
      <view class="setting-page-item" @click="handleAppUpdate">
        <view class="setting-page-item-text">检查更新</view>
        <view class="setting-page-item-value setting-page-item-value-app-version">
          <view class="setting-page-item-value-badge" v-if="hasNewVersion"></view>
          <view class="setting-page-item-value-version"> {{ MINI_APP_VERSION }} </view>
        </view>
        <image :src="arrowImg" class="setting-page-item-arrow"></image>
      </view>
      <!-- <view class="setting-page-item" @click="handleShareApp">
        <view class="setting-page-item-text">分享APP</view>
        <image :src="arrowImg" class="setting-page-item-arrow"></image>
      </view> -->
      <view class="setting-page-item" @click="handleOpenPolicy('code5', '用户协议')">
        <view class="setting-page-item-text">用户协议</view>
        <image :src="arrowImg" class="setting-page-item-arrow"></image>
      </view>
      <view class="setting-page-item" @click="handleAboutKYE">
        <view class="setting-page-item-text">关于跨越</view>
        <image :src="arrowImg" class="setting-page-item-arrow"></image>
      </view>
      <view class="setting-page-item" @click="handleOpenPolicy('code1', '隐私政策')">
        <view class="setting-page-item-text">隐私政策</view>
        <image :src="arrowImg" class="setting-page-item-arrow"></image>
      </view>
      <view class="setting-page-item" @click="handleOpenPolicy('code2', '隐私政策概要')">
        <view class="setting-page-item-text">隐私政策概要</view>
        <image :src="arrowImg" class="setting-page-item-arrow"></image>
      </view>
      <view class="setting-page-item" @click="handleOpenPolicy('code3', '第三方信息共享')">
        <view class="setting-page-item-text">第三方信息共享</view>
        <image :src="arrowImg" class="setting-page-item-arrow"></image>
      </view>
      <view class="setting-page-item" @click="handleOpenPolicy('code4', '个人信息清单')">
        <view class="setting-page-item-text">个人信息清单</view>
        <image :src="arrowImg" class="setting-page-item-arrow"></image>
      </view>
      <view class="setting-page-item" @click="handleAuthManagement">
        <view class="setting-page-item-text">权限管理</view>
        <image :src="arrowImg" class="setting-page-item-arrow"></image>
      </view>
      <view class="setting-page-item" @click="handleOpenPolicy('code6', '权限清单')">
        <view class="setting-page-item-text">权限清单</view>
        <image :src="arrowImg" class="setting-page-item-arrow"></image>
      </view>
      <view class="setting-page-item" @click="navigateTo({ url: '/modules/setting/pages/notify/index' })">
        <view class="setting-page-item-text">系统消息通知</view>
        <image :src="arrowImg" class="setting-page-item-arrow"></image>
      </view>
      <view class="setting-page-item" @click="handleOpenVersionIntro">
        <view class="setting-page-item-text">版本介绍</view>
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
      <view class="setting-page-item" @click="toAppLog" v-if="isUatAndApp">
        <view class="setting-page-item-text">App 上传日志</view>
        <image :src="arrowImg" class="setting-page-item-arrow"></image>
      </view>
      <template v-if="isLogin">
        <view class="setting-page-btn-group">
          <ky-button v-if="showSwitchPhoneBtn" type="primary" size="large" plain @click="changeLogin">
            切换登录手机号
          </ky-button>
          <ky-button v-if="whiteListUser" type="primary" size="large" plain @click="handleCustomerLogin">
            切换客户手机号
          </ky-button>
          <ky-button v-if="showBackSelfBtn" type="primary" size="large" plain @click="handleGoBack">
            返回自己的手机号
          </ky-button>
          <ky-button class="setting-page-loginout" size="large" @click="handleLogout">退出登录</ky-button>
        </view>
        <view
          v-if="!isProd"
          @tap.stop="copyText(deviceId)"
          style="
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            white-space: nowrap;
            padding: 12px 0;
            gap: 8px;
            color: #979797;
          "
        >
          <view>设备 ID</view>
          <view>{{ deviceId }}</view>
        </view>
        <view class="setting-page-account-cancel">
          <view class="setting-page-account-cancel-confirm" @click="logoff">注销账号</view>
          <text class="setting-page-account-cancel-desc">，注销后无法恢复，请谨慎操作</text>
        </view>
      </template>
    </view>
    <view class="setting-page-copyright">跨越速运集团有限公司版权所有Copyright ©️ 2007-2024</view>
    <white-list ref="whiteListRef" @onConfirm="handleConfirmWhite" @onCancel="handleCancelWhite"></white-list>
    <!-- 版本升级弹窗 -->
    <VersionManagePopup touchLocation="20" ref="versionPopupRef"></VersionManagePopup>
    <logout-dialog ref="logoutDialogRef" @confirm="handleLogoutConfirm"></logout-dialog>
    <EnvSelector
      v-model="xEnvId"
      v-model:show="showXenv"
      :envList="xEnvList"
      @change="setXenvId"
      v-if="showSelectItem"
    />
  </ky-container>
</template>
<script lang="ts" setup>
import { arrowImg } from './config'
import { openURL } from '@modules/webview/utils'
import { onLogOutModal } from '@modules/user/pages/login/service'
import Taro, { useDidShow, navigateTo } from '@tarojs/taro'
import { computed, ref } from 'vue'
import { report_CLK_event } from '@public/utils/reportUtil'
import { useUserInfo } from '@public/hooks'
import { useLoginSetting } from '@modules/setting/pages/index/hooks/useLoginSetting'
import WhiteList from './components/white-list/index.vue'
import LogoutDialog from './components/logout-dialog/index.vue'
import { usePingPong } from '@public/utils/socket/usePingPong'
import { getEnvConfig } from '@/public/config'
import { urlContact } from '@/public/utils'
import { MINI_APP_VERSION, getMiniAppVersion } from '@/public/constants'
import VersionManagePopup from '@public/components/business/version-manage-popup/index.vue'
import { clearUserCache, getToken } from '@/public/storage'
import { copyText } from '@/public/utils/copy'
import './index.scss'
const { xEnvId, xEnvList, openVitruList, showXenv, setXenvId, showSelectItem } = useXenvId()
import EnvSelector from './components/env-selector/index.vue'
import { useXenvId } from '@/public/appxenv'
import { AppPlugin } from '@/public/appPlugins'

const pageOptions = ref({
  navBarOptions: { showPlatList: ['wx'], title: '' },
})

defineOptions({
  name: 'AppSetting',
})

const deviceId = ref('')

AppPlugin.getDeviceId().then((res) => {
  deviceId.value = res
})

const isProd = getEnvConfig().isProd

const whiteListRef = ref<InstanceType<typeof WhiteList> | null>(null)
const logoutDialogRef = ref<InstanceType<typeof LogoutDialog> | null>(null)
const versionPopupRef = ref() // 升级弹窗ref
const hasNewVersion = ref(false) // 升级弹窗角标
const miniAppVersion = ref(getMiniAppVersion())

const { userInfo } = useUserInfo()
const isLogin = computed(() => !!userInfo.value?.phone)
// 资源包版本文案
const miniAppVersionText = computed(() => {
  return miniAppVersion.value ? `(${miniAppVersion.value})` : `(${MINI_APP_VERSION})`
})

const {
  handleChangeLogin,
  showSwitchPhoneBtn,
  showBackSelfBtn,
  whiteListUser,
  handleCancelWhite,
  handleConfirmWhite,
  handleGoBack,
  goAccountCancellationH5Page,
} = useLoginSetting()

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

const handleOpenAccountSetting = () => {
  Taro.navigateTo({
    url: '/modules/setting/pages/account/index',
  })
}

// const handleShareApp = () => {
//   Taro.navigateTo({
//     url: '/modules/setting/pages/share/index',
//   })
// }

const handleOpenPolicy = (code: string, name: string) => {
  openURL(`${urlContact('/article.html', getLinkConfig(code))}`, { needLogin: false })
  report_CLK_event('clk_mine_setting_button', {
    page_code: 'page_mine_seting',
    pageName: '设置页',
    button_name: name,
  })
  if (name !== '用户协议') {
    reportClickEvent(name)
  }
}

const handleOpenVersionIntro = () => {
  openURL('/version-introduction.html#/home?token=' + getToken())
}

const handleLogoutConfirm = async () => {
  clearUserCache()
  Taro.switchTab({ url: '/layout/pages/mine/index' })
}

const handleAuthManagement = () => {
  Taro.navigateTo({
    url: '/modules/setting/pages/auth/index',
  })
}

const handleLogout = async () => {
  logoutDialogRef.value?.open()
  reportClickEvent('退出登录')
  // onLogOutModal(() => {
  //   clearUserCache()
  //   Taro.switchTab({ url: '/layout/pages/mine/index' })
  // })
  // report_CLK_event('clk_mine_setting_button', {
  //   page_code: 'page_mine_seting',
  //   pageName: '设置页',
  //   button_name: '退出登录',
  // })
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
/* 上传app日志 */
const toAppLog = () => {
  if (wx?.miniapp?.openSaaAActionSheet) {
    wx.miniapp.openSaaAActionSheet({
      success: (res) => {
        console.log('openSaaAActionSheet success:', res)
      },
    })
  }
}

/**
 * 页面-初始化版本更新检测
 * @returns {Promise<void>}
 */
const versionPopInit = async () => {
  hasNewVersion.value = false
  // 版本升级信息获取
  await versionPopupRef.value.getData()
  // 更新版本角标
  if (versionPopupRef.value?.checkHasNewAppVersion()) {
    hasNewVersion.value = true
  }
}

/* 唤起app升级 */
const handleAppUpdate = () => {
  if (versionPopupRef.value?.showUpdate) {
    versionPopupRef.value?.showUpdate()
  }
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

// 关于跨越
const handleAboutKYE = () => {
  openURL('/about-kye.html#/home')
  reportClickEvent('关于跨越')
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
  const { isApp, isProd } = getEnvConfig()
  isUatAndApp.value = isApp && !isProd
  versionPopInit()
})
</script>
