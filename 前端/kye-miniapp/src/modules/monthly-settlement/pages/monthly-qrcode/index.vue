<!--
  扫码转月结（需求 #570652）
  出示月结二维码给跨越司机扫码完成转月结确认。
  契约（docs/adr/0001）：内部员工由 web.customer.isEmployee 单独拦截；其余状态由 getQRCode 的 data.status 驱动，
  异常文案展示 data.statusDesc。
-->
<template>
  <ky-container v-bind="pageOptions" class="monthly-qrcode">
    <!-- 首次加载 -->
    <view v-if="viewState === 'loading'" class="monthly-qrcode__loading">
      <ky-loading>加载中</ky-loading>
    </view>

    <!-- 整页缺省：内部员工 / 无网络 / 服务器异常 -->
    <view v-else-if="viewState === 'pageError'" class="monthly-qrcode__page-error">
      <qr-empty-state
        :icon="pageErrorView.icon"
        :title="pageErrorView.title"
        :desc="pageErrorView.desc"
        :button-text="pageErrorView.buttonText"
        @action="onPageErrorAction"
      />
    </view>

    <!-- 卡片态：正常二维码 / 卡片内缺省 -->
    <template v-else>
      <view class="monthly-qrcode__body">
        <image class="monthly-qrcode__bg-decor" :src="BG_HEADER_IMG" mode="scaleToFill" />
        <image class="monthly-qrcode__header-img" :src="HEADER_MONTHLY_IMG" mode="scaleToFill" />
        <view class="monthly-qrcode__qr-card">
          <!-- 刷新中：卡片内容整体替换为加载态（设计稿 31:9565） -->
          <view v-if="refreshing" class="monthly-qrcode__card-loading">
            <ky-loading>加载中</ky-loading>
          </view>
          <template v-else-if="viewState === 'qrcode'">
            <view class="monthly-qrcode__headline">请提供给跨越司机</view>
            <view class="monthly-qrcode__qr-frame">
              <ky-image class="monthly-qrcode__qr-image" :src="qrCodeUrl" mode="aspectFit" />
            </view>
            <view class="monthly-qrcode__validity">
              <view class="monthly-qrcode__validity-label">二维码有效期</view>
              <view class="monthly-qrcode__validity-value">{{ validityText }}</view>
            </view>
          </template>
          <qr-empty-state
            v-else
            :icon="cardErrorView.icon"
            :desc="cardErrorView.desc"
            :button-text="cardErrorView.buttonText"
            @action="onCardErrorAction"
          />
        </view>

        <!-- 刷新：sticky 吸底，文档流末尾、滚动时吸附视口底部盖在最上层 -->
        <view class="refresh-bar">
          <view class="refresh-bar__btn" @tap="onRefresh">
            <view class="refresh-bar__circle">
              <image class="refresh-bar__icon" :src="ICON_REFRESH_IMG" mode="aspectFit" />
            </view>
            <text class="refresh-bar__text">刷新</text>
          </view>
        </view>
      </view>
    </template>

    <!-- 联系商务弹窗 -->
    <ContactBusiness v-model:show="showContact" :phone="userInfo?.phone || ''" />
  </ky-container>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
import Taro, { useReady } from '@tarojs/taro'
import ContactBusiness from '@/public/components/business/contact-business/index.vue'
import { useUserInfo } from '@/public/hooks'
import QrEmptyState from './components/qr-empty-state/index.vue'
import { useMonthlyQrcode } from './hooks/use-monthly-qrcode'
import type { CardErrorKind } from './hooks/use-monthly-qrcode'
import {
  BG_HEADER_IMG,
  HEADER_MONTHLY_IMG,
  ICON_REFRESH_IMG,
  EMPTY_NO_QRCODE_IMG,
  EMPTY_NO_PERMISSION_IMG,
  EMPTY_INTERNAL_STAFF_IMG,
} from './constants/images'
import KyImage from '@/public/components/base/ky-image/index.vue'

const { viewState, qrCodeUrl, validityText, refreshing, cardErrorKind, pageErrorKind, errMsg, refresh, clearTimer } =
  useMonthlyQrcode()

const { userInfo } = useUserInfo()

// ky-container：微信/支付宝均渲染自定义导航标题，支付宝端返回键由原生标题栏提供（ky-navbar 在支付宝自动隐藏自定义箭头）
const pageOptions = ref({
  navBarOptions: { showPlatList: ['wx', 'alipay'], title: '扫码转月结' },
  // 双端禁用 scroll-view：refresh-bar 依赖 position:sticky 吸底，scroll-view 内 sticky 不生效；
  // 关闭后内容走 .ky-container__content（overflow-y:auto），sticky 相对该容器吸附
  scrollOptions: { scrollViewPlatList: [] },
})

const OFFLINE_BASE64 = ref('')
const ERROR_BASE64 = ref('')

import('./offline-base64').then((res) => {
  OFFLINE_BASE64.value = res.base64
  ERROR_BASE64.value = res.errorBase64
})

const showContact = ref(false)

/** 卡片内缺省配置：联系商务（状态异常/非月结） | 无权限（无按钮） | 生成失败（底部刷新重试） */
const CARD_ERROR_VIEW: Record<CardErrorKind, { icon: string; buttonText: string; fallbackDesc: string }> = {
  contact: { icon: EMPTY_NO_QRCODE_IMG, buttonText: '联系商务', fallbackDesc: '' },
  noPermission: { icon: EMPTY_NO_PERMISSION_IMG, buttonText: '', fallbackDesc: '' },
  qrFail: { icon: EMPTY_NO_QRCODE_IMG, buttonText: '', fallbackDesc: '二维码生成失败，请重新加载' },
}

const cardErrorView = computed(() => ({
  icon: CARD_ERROR_VIEW[cardErrorKind.value].icon,
  buttonText: CARD_ERROR_VIEW[cardErrorKind.value].buttonText,
  desc: errMsg.value || CARD_ERROR_VIEW[cardErrorKind.value].fallbackDesc,
}))

/** 整页缺省配置：内部员工（返回） | 无网络 / 服务器异常（重新加载） */
const PAGE_ERROR_VIEW = computed(() => ({
  internalStaff: {
    icon: EMPTY_INTERNAL_STAFF_IMG,
    title: '内部员工限制提示',
    desc: '抱歉，内部员工不可使用该功能～',
    buttonText: '返回',
  },
  noNetwork: {
    icon: OFFLINE_BASE64.value,
    title: '',
    desc: '网络错误，请检查网络后重新加载',
    buttonText: '重新加载',
  },
  serverError: {
    icon: ERROR_BASE64.value,
    title: '',
    desc: '服务器开小差了，请重新加载',
    buttonText: '重新加载',
  },
}))

const pageErrorView = computed(() => PAGE_ERROR_VIEW.value[pageErrorKind.value])

const onPageErrorAction = () => {
  if (pageErrorKind.value === 'internalStaff') {
    Taro.navigateBack()
    return
  }
  viewState.value = 'loading'
  refresh()
}

const onCardErrorAction = () => {
  if (cardErrorKind.value === 'contact') {
    showContact.value = true
  }
}

const onRefresh = () => {
  if (viewState.value !== 'qrcode') {
    viewState.value = 'loading'
  }
  refresh()
}

useReady(() => {
  refresh()
})

onUnmounted(() => {
  clearTimer()
})
</script>

<style lang="scss">
@import './index.scss';
</style>
