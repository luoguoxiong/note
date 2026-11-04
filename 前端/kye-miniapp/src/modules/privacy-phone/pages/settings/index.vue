<template>
  <view class="protection-phone-config-page">
    <!-- 当前手机号 -->
    <view class="current-phone-section">
      <view class="section-title">当前手机号：</view>
      <view class="section-value" @click="showPlainPhone = !showPlainPhone">
        <view class="phone-text">{{ phoneDisplayFormatter(formattedPhone) }}</view>
        <image class="toggle-btn" :src="showPlainPhone ? showIcon : hideIcon" />
      </view>
    </view>

    <view>
      <ky-list style="height: 80vh" v-model:refreshing="refreshing" :isEmpty="true" disabledLoad @refresh="onRefresh">
        <!-- 寄件号码保护 -->
        <view class="protection-section-card">
          <view class="section-title">
            <image
              class="section-icon"
              src="https://ic-img.ky-express.com/netc/20251104_68085_!!1762248687097_64_64.png"
            />
            寄件号码保护：{{ detail?.privacyStatus ? '已开启' : '已关闭' }}
            <ky-switch
              class="section-title__switch"
              :model-value="+detail?.privacyStatus! === 1"
              @update:model-value="handleTogglePrivacyStatus"
            />
          </view>

          <view class="section-description">开启后，当他人寄件时填写当前手机号作为寄件号码，需通过短信验证。</view>
          <view class="section-extra" v-if="detail?.privacyStatus">
            <view class="section-extra__header">
              <view class="section-extra__label">
                绑定同客户编码手机号使用寄件
                <image
                  src="https://ic-img.ky-express.com/netc/20250707_22193_!!1751869775094_48_48.png"
                  class="section-extra__question"
                  mode="aspectFit"
                  @tap="showTips('如允许同客户编码下手机号使用您的手机号寄件，可设置“同意”')"
                />：
              </view>
              <text class="section-extra__bold">{{ +detail?.sameCompanyStatus! === 1 ? '同意' : '不同意' }}</text>
              <ky-switch
                size="normal"
                :model-value="+detail?.sameCompanyStatus! === 1"
                @update:model-value="handleToggleSameCompanyStatus"
                class="section-extra__switch"
              />
            </view>
          </view>
          <view class="section-extra" v-if="detail?.privacyStatus">
            <view class="section-extra__header">
              <view class="section-extra__label">
                白名单号码
                <image
                  src="https://ic-img.ky-express.com/netc/20250707_22193_!!1751869775094_48_48.png"
                  class="section-extra__question"
                  mode="aspectFit"
                  @tap="showTips('如允许部分人使用您的手机号寄件，可设置白名单号码')"
                />：
              </view>
              <text class="section-extra__bold">{{ detail?.whilteList?.length || 0 }}个</text>
              <view class="section-extra__right section-extra__link" @click="handleAddWhite">
                去添加
                <image
                  src="https://ic-img.ky-express.com/netc/20251105_75044_!!1762334207739_48_48.png"
                  mode="aspectFit"
                />
              </view>
            </view>

            <collapse-list v-if="detail?.whilteList?.length" :list="detail?.whilteList || []" />
          </view>
        </view>

        <view class="protection-section-card">
          <view class="section-title">
            <image
              class="section-icon"
              src="https://ic-img.ky-express.com/netc/20251104_50532_!!1762248687100_64_64.png"
            />
            收件黑名单号码
          </view>
          <view class="section-description">添加到黑名单内号码寄件时，不可将您的手机号填写为收件号码。</view>
          <view class="section-extra">
            <view class="section-extra__header">
              <view class="section-extra__label">黑名单号码： </view>
              <view class="section-extra__bold">{{ detail?.blackList?.length || 0 }}个</view>
              <view class="section-extra__right section-extra__link" @click="handleAddBlack">
                去添加
                <image
                  src="https://ic-img.ky-express.com/netc/20251105_75044_!!1762334207739_48_48.png"
                  mode="aspectFit"
                />
              </view>
            </view>
            <collapse-list v-if="detail?.blackList?.length" :list="detail?.blackList || []" />
          </view>
        </view>
      </ky-list>
    </view>
    <confirm-dialog v-model:show="state.showConfirmDialog" @next="handleConfirm" />
    <t-captcha ref="tCaptchaRef" v-if="!isWeapp" />
  </view>
</template>

<script lang="ts" setup>
import { computed, reactive, ref } from 'vue'
import { useUserInfo } from '@public/hooks'
import TCaptcha from '@/public/components/base/captcha/index.vue'
import Taro, { useDidShow } from '@tarojs/taro'
import ConfirmDialog from '../../components/confirm-dialog/index.vue'
import { api, WebUamClientPhonePrivacySendDetailOut } from '@/modules/privacy-phone/apis/index'
import { checkDeliveryPhone } from '@/modules/privacy-phone/pages/sms-code/helper'
import CollapseList from '@/modules/privacy-phone/components/collapse-list/index.vue'
import './index.scss'
import { getClickId, isWxAppEnv, isWxMiniApp, report_CLK_event, report_pv_event, report_wrapper } from '@/public/utils'
import { getPlatformSource, phoneDisplayFormatter } from '../../utils'
import { useAutoLogin } from '@/public/utils/user/useAutoLogin'
import { withCaptchaRequest } from '@/public/components/base/captcha/utils'
import { getToken } from '@/public/storage'
import { isAndroidAlipay } from '../../hooks/useState'

defineOptions({ name: 'PhoneProtectionPage' })

const isWeapp = isWxMiniApp && !isWxAppEnv

const hideIcon = 'https://ic-img.ky-express.com/netc/20251104_33759_!!1762248226621_96_96.png'
const showIcon = 'https://ic-img.ky-express.com/netc/20251104_46462_!!1762248222569_96_96.png'

const detail = ref<WebUamClientPhonePrivacySendDetailOut | null>()

const state = reactive({ showConfirmDialog: false })

const { userInfo } = useUserInfo()

const showPlainPhone = ref(false)
const tCaptchaRef = ref<InstanceType<typeof TCaptcha>>()

const formattedPhone = computed(() => {
  const phone = userInfo?.value.phone || ''
  if (showPlainPhone.value) {
    return phone
  }
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
})

const fetchDetail = async () => {
  detail.value = await api('web.uam.client.phonePrivacy.send.detail', {}).then((r) => r.data)
}

const handleAddWhite = report_wrapper(() => {
  Taro.navigateTo({ url: '/modules/privacy-phone/pages/white-list/index' })
}, ['clk_number_protection_button', 'CLK', { page_code: 'page_number_protection', button_name: '添加白名单' }])

const handleAddBlack = report_wrapper(() => {
  Taro.navigateTo({ url: '/modules/privacy-phone/pages/black-list/index' })
}, ['clk_number_protection_button', 'CLK', { page_code: 'page_number_protection', button_name: '添加黑名单' }])

const { autoLoginHook } = useAutoLogin()
useDidShow(async () => {
  if (!getToken()) await autoLoginHook({ needLogin: true })

  const hasLoading = !detail.value
  if (hasLoading) {
    Taro.showLoading({ title: '加载中...' })
  }
  await fetchDetail().finally(() => {
    hasLoading && Taro.hideLoading()
  })
  report_pv_event('page_number_protection', { pre_click_id: getClickId() })
})

const handleTogglePrivacyStatus = async (enabled: boolean) => {
  report_CLK_event('clk_number_protection_button', {
    button_name: enabled ? '开启寄件号码保护' : '关闭寄件号码保护',
    page_code: 'page_number_protection',
  })
  if (enabled) {
    state.showConfirmDialog = true
    return
  }
  const { confirm } = await Taro.showModal({
    title: '确认关闭吗？',
    content: '关闭后，别人可使用当前手机号寄件，同时将删除所有“寄件白名单号码”',
    confirmText: '确定',
    cancelText: '取消',
    confirmColor: isAndroidAlipay.value ? '#fff' : '#8365F6',
    cancelColor: '#686B75',
    showCancel: true,
  })

  report_CLK_event('clk_number_protection_close_button', {
    page_code: 'page_number_protection',
    button_name: confirm ? '确认' : '取消',
  })
  if (!confirm) return
  await api('web.uam.client.phonePrivacy.send.switch.close', {
    source: getPlatformSource(),
    // @ts-ignore
    sameCompanyStatus: detail.value?.sameCompanyStatus,
    privacyStatus: 0,
  })
  fetchDetail()
  Taro.showToast({ title: '已关闭寄件号码保护', icon: 'none' })
}

const handleToggleSameCompanyStatus = async (enabled: boolean) => {
  report_CLK_event('clk_number_protection_button', {
    button_name: enabled ? '允许使用绑定同客户编码手机号寄件' : '不允许使用绑定同客户编码手机号寄件',
    page_code: 'page_number_protection',
  })

  const { confirm } = await Taro.showModal({
    title: enabled ? '确定开启？' : '确定关闭？',
    content: enabled
      ? '开启后，将同意绑定同客户编码的手机号，使用当前手机号寄件'
      : '关闭后，将不同意绑定同客户编码的手机号，使用当前手机号寄件',
    confirmText: '确定',
    cancelText: '取消',
    confirmColor: isAndroidAlipay.value ? '#fff' : '#8365F6',
    cancelColor: '#686B75',
    showCancel: true,
  })

  report_CLK_event(enabled ? 'clk_number_protection_allowed_button' : 'clk_number_protection_unallowed_button', {
    page_code: 'page_number_protection',
    button_name: confirm ? '确认' : '取消',
  })

  if (!confirm) return

  await api('web.uam.client.phonePrivacy.send.customerSwitch', {
    sameCompanyStatus: enabled ? 1 : 0,
    source: getPlatformSource(),
  })
  await fetchDetail()
  Taro.showToast({ title: enabled ? '开启成功' : '关闭成功', icon: 'none' })
}

const sendCode = async (safeVerifyId?: string) => {
  return await api('web.uam.client.sms.send', {
    phone: userInfo?.value.phone || '',
    type: 'switch',
    source: getPlatformSource(),
    // @ts-ignore
    safeVerifyId,
  })
}

const handleConfirm = async (allowSameCompany: boolean) => {
  // 微信小程序
  const isWeapp = isWxMiniApp && !isWxAppEnv

  let sendCodeStatus: number = 0
  if (!isWeapp) {
    sendCodeStatus = await withCaptchaRequest(sendCode, tCaptchaRef.value)()
      .then(() => 1)
      .catch((err) => {
        if (err.destroy) throw err
        return -1
      })
  }
  const smsCodeOrFail = await checkDeliveryPhone({
    phone: userInfo?.value.phone || '',
    type: 'switch',
    bizLoad: encodeURIComponent(JSON.stringify({ waybillKeylist: [] })),
    allowSameCompany: allowSameCompany ? 1 : 0,
    sendCodeStatus,
  })
  if (!smsCodeOrFail) {
    return
  }
  await fetchDetail()
  Taro.showToast({ title: '已开启寄件号码保护', icon: 'none', duration: 1200 })
}

const showTips = (content: string) => {
  Taro.showModal({
    title: '温馨提示',
    content,
    showCancel: false,
    confirmText: '我知道了',
    confirmColor: isAndroidAlipay.value ? '#fff' : '#8365F6',
  })
}

const refreshing = ref(false)
const onRefresh = () => {
  if (refreshing.value) return
  refreshing.value = true
  fetchDetail().finally(() => {
    refreshing.value = false
  })
}
</script>
