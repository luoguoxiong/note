<template>
  <view class="wechatwork-qrcode" v-show="!loading">
    <view class="qrcode-dialog" v-if="wechatQRCodeUrl">
      <view class="wechatwork-text">企业微信二维码</view>
      <image
        class="qrcode"
        :src="wechatQRCodeUrl"
        mode="aspectFit"
        @tap="handlePreviewImg"
      />
    </view>
    <view v-else class="empty-container">
      <image src="https://ic-img.ky-express.com/netc/20260522_75940_!!1779443667350_560_560.png" mode="aspectFit" />
      <text class="tip">商务还未开通企业微信，可电话联系销售</text>
    </view>
  </view>
</template>

<script setup lang="ts">
/**
 * 企业微信二维码页面
 *
 * 从 H5 项目 (netc-h5-modules) 迁移的企业微信二维码展示页
 * 功能：
 * - 显示企业微信二维码图片
 * - 支持长按/点击预览保存二维码
 * - 无二维码时显示空状态提示
 * - 支持通过员工号或直接传入图片URL两种方式获取二维码
 *
 * 转换要点：
 * - Options API → Vue3 Composition API (script setup)
 * - vue-router → Taro 路由系统
 * - this.$toast → showToast from @tarojs/taro
 * - this.$native.previewImage → Taro.previewImage
 */
import { ref, watch, onMounted } from 'vue'
import Taro, { getCurrentInstance } from '@tarojs/taro'
import { showToast } from '@tarojs/taro'
import { queryWechatQRCode, applyResultCallPhoneReportApi } from '@modules/user/apis/customerCode'
import { exp_page_customer_code_bind_other_company_sub } from '../report/index'

import './wechatwork-qrcode.scss'

const instance = getCurrentInstance()
const router = instance.router
const params = router?.params || {}

/** 企业微信二维码 URL */
const wechatQRCodeUrl = ref('')

/** 加载状态 */
const loading = ref(false)

/** 公司名称 */
const customerName = ref(decodeURIComponent(params.customerName) || '')

/** 员工号 */
const employeeNumber = ref(params.employeeNumber || '')

/**
 * 获取企业微信二维码URL
 */
const getWechatUrl = async () => {
  if (!employeeNumber.value) return

  loading.value = true
  showToast({ title: '加载中', icon: 'loading', duration: 2000 })

  try {
    const { data } = await queryWechatQRCode(employeeNumber.value)
    wechatQRCodeUrl.value = data?.wechatQRCodeUrl || ''
  } catch (error: any) {
    console.error('获取企业微信二维码失败:', error)
    showToast({ title: error.message || '获取二维码失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

/**
 * 预览二维码图片
 */
const handlePreviewImg = () => {
  if (!wechatQRCodeUrl.value) return

  Taro.previewImage({
    urls: [wechatQRCodeUrl.value],
    current: wechatQRCodeUrl.value,
    success: () => {
      console.log('预览成功')
    },
    fail: (err) => {
      console.error('预览失败:', err)
      showToast({ title: '预览失败', icon: 'none' })
    },
  })
}

/**
 * 上报跨声消息（企业微信联系）
 */
const handleApproveAssAccount = () => {
  applyResultCallPhoneReportApi({
    customerName: customerName.value,
  })
}

/**
 * 监听二维码URL变化，触发消息上报
 */
watch(
  () => wechatQRCodeUrl.value,
  (val) => {
    if (val && params.openKsNotice === 'true') {
      handleApproveAssAccount()
    }
  },
  { immediate: true }
)

/**
 * 页面初始化
 */
onMounted(() => {
  const imgUrl = params.imgUrl ? decodeURIComponent(params.imgUrl) : ''

  if (!imgUrl && employeeNumber.value) {
    // 有员工号时通过API获取二维码
    getWechatUrl()
  } else if (imgUrl) {
    // 直接使用传入的图片URL
    wechatQRCodeUrl.value = imgUrl
  }

  const workId = params.workId || ''
  // 页面曝光埋点
  exp_page_customer_code_bind_other_company_sub(workId || undefined, '')
})
</script>
