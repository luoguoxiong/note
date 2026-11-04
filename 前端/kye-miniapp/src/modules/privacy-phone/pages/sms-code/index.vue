<template>
  <view class="check-delivery-phone">
    <view class="check-delivery-phone__description" v-if="params.type === 'switch'">
      开启寄件号码保护，需先获取验证码进行短信验证，验证码将发送到手机号
      <text class="description_bold">【{{ params.phone }}】</text>
      ，请查收后输入
    </view>

    <view class="check-delivery-phone__description" v-else>
      验证码已发送至尾号
      <text class="description_bold">【{{ params.phone.slice(-4) }}】</text>
      的手机，请查收后输入
    </view>

    <code-input
      v-model="state.smsCode"
      :error="codeError"
      @update:model-value="codeError = false"
      @complete="handleCheckCode"
      :remove-input-component="state.removeInputComponent"
      ref="codeInputRef"
    />
    <view
      :class="['check-delivery-phone__countdown', { 'check-delivery-phone__countdown--link': !isCounting }]"
      @click="handleSendCode"
    >
      {{ countdown.text }}
    </view>
    <t-captcha ref="tCaptchaRef" />
  </view>
</template>

<script lang="ts" setup>
import { useCountdown } from '@/public/hooks'
import Taro, { useDidShow, useRouter } from '@tarojs/taro'
import { onMounted, onUnmounted, reactive, ref } from 'vue'
import './index.scss'

import CodeInput from '@public/components/business/code-input/index.vue'
import TCaptcha from '@/public/components/base/captcha/index.vue'
import { CheckDeliveryPhoneParams, FAIL_LISTENER, SUCCESS_LISTENER } from './helper'
import { withCaptchaRequest } from '@/public/components/base/captcha/utils'
import { api } from '@/modules/privacy-phone/apis'
import { report_other_event } from '@/public/utils'
import { getPlatformSource } from '../../utils'

defineOptions({ name: 'ProtectionPhoneVerifyPage' })

const tCaptchaRef = ref<InstanceType<typeof TCaptcha>>()

const params = useRouter().params as unknown as CheckDeliveryPhoneParams

const state = reactive({ smsCode: '', removeInputComponent: false })
const codeInputRef = ref()

const sendCode = async (safeVerifyId?: string) => {
  return await api('web.uam.client.sms.send', {
    phone: params.phone,
    type: params.type,
    // @ts-ignore
    safeVerifyId,
  })
}

const sendCodeWithCaptcha = async () => {
  const res = await withCaptchaRequest(sendCode, tCaptchaRef.value!, {}, async () => {
    state.removeInputComponent = true
    // hack 输入框失焦
    await new Promise((resolve) => setTimeout(resolve, 800))
    state.removeInputComponent = false
  })()
  if (res.code === 0) {
    // 发送短信成功
    countdown.start()
    state.smsCode = ''
    Taro.showToast({ title: '验证码已发送到您手机号上，请注意查收', icon: 'none' })

    await new Promise((r) => setTimeout(r, 80))
    codeInputRef.value?.focus?.()
  }
}

const checkCode = async (safeVerifyId?: string) => {
  let bizLoad = JSON.stringify({ waybillKeylist: [] })
  try {
    bizLoad = params.bizLoad ? decodeURIComponent(params.bizLoad) : bizLoad
  } catch {
    // ignore
  }
  const res =
    params.type === 'switch'
      ? await api('web.uam.client.phonePrivacy.send.switchWithRisk', {
          privacyStatus: 1,
          sameCompanyStatus: Number(params.allowSameCompany) || 0,
          smsCode: state.smsCode,
          // @ts-ignore
          safeVerifyId,
          source: getPlatformSource(),
        })
      : await api('web.uam.client.phonePrivacy.sms.check', {
          phone: params.phone.replaceAll(/[^0-9]/g, ''),
          businessType: params.type,
          smsCode: state.smsCode,
          source: getPlatformSource(),
          bizLoad,
          // @ts-ignore
          safeVerifyId,
        })
  if (res.code === 0) {
    Taro.eventCenter.trigger(SUCCESS_LISTENER, state.smsCode)
    Taro.navigateBack()
  }
  return res
}

const checkCodeWithCaptcha = async () => {
  return await withCaptchaRequest(checkCode, tCaptchaRef.value!)()
}

onMounted(async () => {
  Taro.setNavigationBarTitle({ title: params.type !== 'switch' ? '短信验证' : '寄件号码保护验证' })

  const sendCodeStatus = Number(params.sendCodeStatus) || 0
  if (sendCodeStatus !== 0) {
    if (sendCodeStatus === 1) {
      countdown.start()
      Taro.showToast({ title: '验证码已发送到您手机号上，请注意查收', icon: 'none' })
    }
    await new Promise((r) => setTimeout(r, 80))
    codeInputRef.value?.focus?.()
  } else {
    sendCodeWithCaptcha()
  }
})

useDidShow(() => {
  Taro.setNavigationBarTitle({ title: params.type !== 'switch' ? '短信验证' : '寄件号码保护验证' })
})

const countdown = useCountdown()

const isCounting = countdown.isCounting

onUnmounted(() => {
  Taro.eventCenter.trigger(FAIL_LISTENER)
})

const codeError = ref(false)

const handleCheckCode = async () => {
  const resultOrErr = await checkCodeWithCaptcha().catch(async (e) => {
    codeError.value = true
    await new Promise((r) => setTimeout(r, 1200))
    state.smsCode = ''
    codeError.value = false
    return e
  })

  report_other_event('other_number_protection_sart_button', {
    page_code: 'page_number_protection',
    request_result: resultOrErr.code === 0 ? '成功' : '失败',
    failure_reason: resultOrErr.code === 0 ? '' : resultOrErr.msg || '未知错误',
  })
}

const handleSendCode = async () => {
  if (isCounting.value) return

  await sendCodeWithCaptcha()
  codeError.value = false
}
</script>
