<template>
  <view class="sign-in-page">
    <!-- 加载 -->
    <view class="loading" v-if="state.status === statusMap.loading">
      <view class="loading-content">
        <image class="loading-img" src="../assets/cart.png" />
        <view class="loading-text">努力加载中…</view>
      </view>
    </view>

    <!-- 展示二维码 -->
    <view class="content" v-else-if="state.status === statusMap.ok">
      <view class="content-bg">
        <view class="content-qrcode">
          <image class="qrcode-img" v-if="state.imgsrc" :src="state.imgsrc" @load="resetCountdown" @error="loadFail" />
        </view>
        <view class="content-desc">二维码有效期为 {{ OVER_TIME }}s，超时将自动刷新</view>
      </view>
    </view>

    <!-- 内部员工 -->
    <view class="employer" v-else-if="state.status === statusMap.internal">
      <image
        class="employer-img"
        src="https://ic-img.ky-express.com/netc/20230327_18951621435_!!1679881351057_560_560.png"
      />
      <view class="employer-title">内部员工限制提示</view>
      <view class="employer-desc">抱歉，内部员工不可使用该功能～</view>
      <view class="employer-btn" @click="goBack">返回</view>
    </view>

    <!-- 加载失败 -->
    <NetworkError v-else @refresh="fetchQrcode" />
  </view>
</template>

<script lang="ts" setup>
import './index.scss'
import Taro, { useDidShow } from '@tarojs/taro'
import { ref, onMounted, onUnmounted } from 'vue'
import { useLogin } from '@/public/hooks'
import { getLocationValueWithAuth } from '@/public/getLocaltion'
import { uuid } from '@/public/utils'
import { report_EXP_event, report_other_event, report_pv_event } from '@/public/utils/reportUtil'
import NetworkError from '@/public/components/base/network-error/index.vue'
import { getSignData } from '../apis'

// ======================== 常量 ========================
const OVER_TIME = 5 // 秒

const statusMap = {
  ok: 'ok',
  fail: 'fail',
  internal: 'internal',
  loading: 'loading',
} as const

type Status = (typeof statusMap)[keyof typeof statusMap]

const eventCode = {
  show: 'facetoface_show',
  loginStatus: 'facetoface_login_status',
  beforeRequest: 'facetoface_request',
  afterRequest: 'facetoface_result',
}

// ======================== 响应式 ========================
const state = ref<{
  status: Status
  imgsrc: string
}>({
  status: statusMap.loading,
  imgsrc: '',
})

const timer = ref<ReturnType<typeof setTimeout> | null>(null)
const retryTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const workId = ref('')

const { isLogin } = useLogin()

const clearTimer = (t: typeof timer | typeof retryTimer) => {
  if (t.value) {
    clearTimeout(t.value)
    t.value = null
  }
}

const reportBefore = () =>
  report_other_event(eventCode.beforeRequest, {
    workId: workId.value,
    performanceNow: Date.now(),
  })

const reportAfter = (success: boolean, traceId?: string) =>
  report_other_event(eventCode.afterRequest, {
    workId: workId.value,
    performanceNow: Date.now(),
    is_success: success ? '是' : '否',
    traceId,
  })

// ======================== 核心请求 ========================
const getQrcodeInfo = async () => {
  try {
    const location = await getLocationValueWithAuth().catch(() => null)
    reportBefore()

    const res = await getSignData(location?.lat && location.lng ? { address: location } : {})
    const { code, data, traceId } = res

    reportAfter(code === 0, traceId)

    return code === 0 && data ? data : null
  } catch {
    retryTimer.value = setTimeout(fetchQrcode, OVER_TIME * 1000)
    return null
  }
}

// ======================== 统一处理结果 ========================
const handleQrcodeResult = (data: any) => {
  if (!data) {
    state.value.status = statusMap.fail
    return
  }

  const { isInternalStaff, img } = data

  if (isInternalStaff === 2) {
    state.value.status = statusMap.internal
    return
  }

  state.value.status = statusMap.ok
  state.value.imgsrc = `data:image/png;base64,${img}`
}

// ======================== 刷新二维码 ========================
const fetchQrcode = async () => {
  const data = await getQrcodeInfo()
  handleQrcodeResult(data)
}

// ======================== 倒计时 ========================
const resetCountdown = () => {
  clearTimer(timer)
  timer.value = setTimeout(fetchQrcode, OVER_TIME * 1000)
}

const loadFail = () => {
  clearTimer(timer)
  state.value.status = statusMap.fail
}

// ======================== 首次加载 ========================
const fetchTask = async () => {
  workId.value = uuid()

  report_other_event(eventCode.loginStatus, {
    workId: workId.value,
    performanceNow: Date.now(),
    is_login: isLogin ? '是' : '否',
  })

  const data = await getQrcodeInfo()

  if (!data) {
    state.value.status = statusMap.fail
    return
  }

  report_other_event(eventCode.show, {
    workId: workId.value,
    performanceNow: Date.now(),
  })

  handleQrcodeResult(data)
}

// ======================== 网络变化 ========================
const updateNetwork = (res: Taro.onNetworkStatusChange.CallbackResult) => {
  if (res.isConnected) {
    fetchQrcode()
  } else {
    state.value.status = statusMap.fail
  }
}

// ======================== 生命周期 ========================
useDidShow(() => {
  report_pv_event('page_facetoface_qrcode_v1')
  fetchTask()
})

onMounted(() => {
  Taro.onNetworkStatusChange(updateNetwork)
})

onUnmounted(() => {
  clearTimer(timer)
  clearTimer(retryTimer)
  Taro.offNetworkStatusChange(updateNetwork)
})

const goBack = () => Taro.navigateBack()
</script>
