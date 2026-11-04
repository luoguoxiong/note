<template>
  <view>
    <page-loading v-if="loading" />
    <!-- 绑定微信小程序 只允许 微信小程序 -->
    <view
      class="scanLoginContainer"
      v-else-if="payload.pageType === SCAN_PAGE_TYPE.BIND && (!isWxMiniApp || isWxAppEnv || isQwEnv)"
    >
      <view class="scanLoginContent">
        <view class="scanComponent">
          <image
            class="scan-status"
            src="https://ic-img.ky-express.com/netc/20221102_56921882357_!!1667376681130_680_506.png"
          />
          <text class="text">请使用微信扫一扫二维码</text>
        </view>
      </view>
    </view>
    <page-webview
      :src="webviewURL"
      v-else-if="
        payload && payload.pageType === SCAN_PAGE_TYPE.BIND && qrStatus !== SCAN_CODE_STATUS.QR_EXPIRED && webviewURL
      "
    />

    <view class="scanLoginContainer" v-else>
      <view v-if="!loading && !webviewURL" class="scanLoginContent">
        <view class="scanComponent">
          <image
            class="scan-status"
            src="https://ic-img.ky-express.com/netc/20221102_56921882357_!!1667376681130_680_506.png"
          />
          <text class="text">{{ scanStatusText?.title }}</text>
          <view v-if="scanStatusText?.desc" class="scan-status-desc">{{ scanStatusText?.desc }}</view>
        </view>
        <view class="scanLoginFooter">
          <button v-if="qrStatus === SCAN_CODE_STATUS.QR_DEFAULT" class="kye-button" @click="handleSubmit">
            确认登录
          </button>
          <button
            v-if="payload.pageType === SCAN_PAGE_TYPE.LOGIN"
            class="kye-button kye-button-plain"
            @click="handleCancel"
          >
            取消登录
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import Taro, { useDidShow, useRouter } from '@tarojs/taro'
import { useUserInfo } from '@/public/hooks'
import { getAuthCode, getQueryObject } from '@/public/utils'
import { computed, onMounted, ref } from 'vue'
import { SCAN_PAGE_TYPE, SCAN_CODE_STATUS } from '@/modules/user/constants/index'
import { getQRCodeStatus, operationQrCode } from '@/public/apis/user'
import { getBindCodeWebviewURL, QRCodeParams } from './utils/index'
import { isAliMiniApp, isAmapMiniApp } from '@/public/utils'
import { getDeviceType } from '../../utils/device'
import {
  reportScanLoginUv,
  report_EXP_logon_scan_qr_code,
  reporLoginClick,
  reportLoginOther
} from '../../report/scanLogin'
import { WebLoginQrCodeOperationQrCodeOut } from '@/public/apis/user/types'
import { useAutoLogin } from '@/public/utils/user/useAutoLogin'
import { unwrap } from './utils/index'

import PageWebview from './components/page-webview.vue'
import PageLoading from './components/page-loading.vue'
import { isWxMiniApp, isWxAppEnv, isQwEnv } from '@/public/utils'
import { isWeixinAppSync } from '@/public/config'
import { useCommonDataHook } from '@/public/storage/hooks/useCommonHook'
const { onTokenChange } = useCommonDataHook()
defineOptions({ name: 'ScanLogin' })

const STATUS_TEXT_MAPPING = {
  [SCAN_CODE_STATUS.QR_DEFAULT]: { title: '跨越速运账号电脑端登录确认', desc: '' },
  [SCAN_CODE_STATUS.QR_EXPIRED]: { title: '二维码已失效', desc: '请在客户端点击刷新二维码后重新扫码' },
}

Taro.getApp().scanCodeFirstFlag = true

const getDefaultBindInfo = () => {
  return {
    appletLoginFlag: 0,
    appletLoginPhone: '',
    bindLoginPhone: '',
    bindFlag: 0,
    subscribe: 0,
  }
}

const loading = ref(true)
const qrStatus = ref<number>(SCAN_CODE_STATUS.QR_DEFAULT)
const qrCodeBindInfo = ref<WebLoginQrCodeOperationQrCodeOut>(getDefaultBindInfo())
const router = useRouter()

const autoLogin = useAutoLogin()

const decodeParams = () => {
  const qrCodePayload = router.params.q || '' // ?qrCodeToken=xxx&expireTime=xxx&pageType=10
  const qrCodeLink = decodeURIComponent(qrCodePayload)
  return getQueryObject(qrCodeLink) as QRCodeParams
}

const { userInfo } = useUserInfo()

const payload = decodeParams()

const webviewURL = computed(() => getBindCodeWebviewURL(qrCodeBindInfo.value, payload))

const scanStatusText = computed(() => STATUS_TEXT_MAPPING[qrStatus.value])

const toResultPage = (result: { pageType: number | string; subscribe?: number | string }) => {
  const qs = `?pageType=${result.pageType}&subscribe=${result.subscribe}&deviceType=${getDeviceType()}&from=6`
  return Taro.redirectTo({
    url: `/modules/user/pages/scanLogin/result` + qs,
  })
}

useDidShow(async () => {
  Taro.onAppHide(() => {
    Taro.getApp().scanCodeFirstFlag = true
  })
  /**
   * 触达路径
   * 1. 未登录状态下扫码登录
   * 2. 跳转登录页
   * 3. 取消登录
   * 4. 返回该页面 -> 直接返回首页
   * 👇
   */
  if (!Taro.getApp().scanCodeFirstFlag && payload.pageType === SCAN_PAGE_TYPE.LOGIN && !userInfo.value.phone) {
    Taro.switchTab({ url: '/layout/pages/home/index' })
  } else {
    Taro.getApp().scanCodeFirstFlag = false
  }
})

onMounted(() => init())

onTokenChange(() => {
  setTimeout(() => {
    init()
  }, 300);
})

const init = async () => {
  try {
    loading.value = true
    if (payload.pageType === SCAN_PAGE_TYPE.LOGIN && !userInfo.value.phone) {
      loading.value = true
      await autoLogin.autoLoginHook({ needLogin: true })
      return
    }
    if (payload.pageType === '20' && !userInfo.value.phone) {
      loading.value = true
      await autoLogin.autoLoginHook({ needLogin: true })
      return
    }
    reportScanLoginUv()
    await handleScanCodeStatus()
    await handleOperation(SCAN_CODE_STATUS.QR_SCANNED, false)
    Taro.nextTick(() => {
      if (!webviewURL.value) {
        report_EXP_logon_scan_qr_code()
      }
      loading.value = false
    })
  } catch (e) {
    console.error('scan login code error', e)
    loading.value = false
  }
}

/**
 * 操作二维码
 * @param status <1 扫码确认 2 确认授权,7确认绑定 >
 */
const handleOperation = async (status: number, toast = true) => {
  try {
    // 确认授权-加载提示
    if (status === SCAN_CODE_STATUS.QR_AUTHORIZED) {
      Taro.showLoading({ mask: true, title: '加载中...' })
    }
    const apiParams = {
      qrCodeToken: payload.qrCodeToken,
      qrCodeStatus: status,
      scanSource: 1, // 1 微信扫码 2 APP扫码
      wxCode: isAliMiniApp || isAmapMiniApp ? '' : await getAuthCode(),
    }
    // 小程序微信code，微信小程序未登陆时传入（扫码绑定场景）
    if (!userInfo.value.phone || payload.pageType === '20') {
      await autoLogin.autoLoginHook({ needLogin: true })
      apiParams['wxCode'] = await getAuthCode()
    }
    const data = await unwrap(operationQrCode(apiParams, { hideToast: !toast }))
    qrCodeBindInfo.value = data || {}
    const { bindFlag, subscribe, appletLoginPhone, bindLoginPhone } = qrCodeBindInfo.value
    // <扫码确认-直接绑定成功 不存在手机号> 跳转结果页
    if (
      status === SCAN_CODE_STATUS.QR_SCANNED &&
      payload.pageType === SCAN_PAGE_TYPE.BIND &&
      bindFlag === 1 &&
      !appletLoginPhone &&
      !bindLoginPhone
    ) {
      toResultPage({ pageType: payload.pageType, subscribe })
      return true
    }
    // 存在绑定手机号，渲染webview绑定页1
    Taro.hideLoading()
    return data
  } catch (e) {
    // 扫码绑定场景pageType20 - 匹配用户信息失效<直接进入>
    if (
      e &&
      [100201, 60010].includes(e.code) &&
      payload.pageType === SCAN_PAGE_TYPE.BIND &&
      status === SCAN_CODE_STATUS.QR_SCANNED
    ) {
      toResultPage({ pageType: payload.pageType, subscribe: 1 })
      return false
    }
    Taro.hideLoading()
    qrCodeBindInfo.value = getDefaultBindInfo()
    if (status === SCAN_CODE_STATUS.QR_AUTHORIZED && e.msg !== '二维码已过期') {
      Taro.showToast({ icon: 'none', title: e.msg || '网络错误' })
    }
    if (e && (e.code === 10109 || e.msg === '二维码已被使用')) {
      qrStatus.value = SCAN_CODE_STATUS.QR_EXPIRED
    }
    return false
  }
}

// 确认授权登录登录
const handleSubmit = () => {
  reporLoginClick('确认登录')
  handleOperation(SCAN_CODE_STATUS.QR_AUTHORIZED).then((data) => {
    if (!data) {
      qrStatus.value = SCAN_CODE_STATUS.QR_EXPIRED
      return
    }
    // 扫码确认-直接绑定成功
    if (data === true) return

    const { subscribe } = data || {}
    if (isWeixinAppSync()) {
      Taro.switchTab({ url: '/layout/pages/home/index' })
      Taro.showToast({ icon: 'none', title: '登录成功' })
    } else if (isWxMiniApp) {
      toResultPage({ pageType: payload.pageType, subscribe })
    } else {
      Taro.showToast({ icon: 'none', title: '登录成功' })
      Taro.switchTab({ url: '/layout/pages/home/index' })
    }
    reportLoginOther('成功')
  })
}

// 取消登录
const handleCancel = async () => {
  reporLoginClick('取消登录')
  try {
    Taro.showLoading({ mask: true, title: '加载中...' })
    const operationParams = {
      qrCodeToken: payload.qrCodeToken,
      qrCodeStatus: SCAN_CODE_STATUS.QR_CANCELLED, // <1 扫码确认 2 确认授权,取消登录,7确认绑定 >
      scanSource: 1, // 1微信扫码 2 APP扫码
    }
    await operationQrCode(operationParams)
    Taro.hideLoading()
    Taro.switchTab({ url: '/layout/pages/home/index' })
    reportLoginOther('失败')
  } catch (err) {
    Taro.hideLoading()
    Taro.switchTab({ url: '/layout/pages/home/index' })
    reportLoginOther('失败')
  }
}

// 获取二维码状态
const handleScanCodeStatus = async () => {
  return new Promise(async (resolve) => {
    try {
      let resp = await getQRCodeStatus({
        qrCodeToken: payload.qrCodeToken,
      })
      qrStatus.value = Number(resp.data.qrCodeStatus)
      Taro.setStorageSync('sameScan', qrStatus.value === 0 ? true : false)
      resolve(true)
    } catch (e) {
      resolve(false)
    }
  })
}
</script>

<style lang="scss">
$theme-color: #8365f6;

page {
  background-color: #ffffff !important;
}

.scanLoginContainer {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100vh;
}

.scanLoginContent {
  text-align: center;
  margin: 252px auto 0;
  .scan-status {
    width: 340px;
    height: 253px;
    margin: 0 auto 90px;
    display: block;
  }
  .text {
    font-weight: bold;
    color: #03050d;
    font-size: 36px;
  }
  .scan-status-desc {
    font-size: 28px;
    color: #666666;
    margin-top: 12px;
  }
}

.scanLoginFooter {
  position: absolute;
  bottom: 80px;
  left: 0;
  right: 0;
  margin: auto;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  .kye-button + .kye-button {
    margin-top: 15px;
  }
}

.kye-button {
  width: 546px;
  height: 80px;
  background: linear-gradient(138deg, #ac97ff 3%, #8365f6 98%);
  border-radius: 10px;
  color: #ffffff;
  font-size: 30px;
  line-height: 80px;
  cursor: pointer;
  border: none;
  &::after {
    border: none;
  }
  &.kye-button-plain {
    color: $theme-color;
    background: transparent;
  }
}
</style>
