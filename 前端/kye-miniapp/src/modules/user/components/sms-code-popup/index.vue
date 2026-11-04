<template>
  <ky-popup
    round
    catchMove
    position="bottom"
    class="sms-code-popup"
    :show="show"
    :lazy-render="false"
    :enable="false"
    @click-overlay="emits('update:show', false)"
  >
    <view class="sms-code-popup__header">
      {{ title }}
      <image
        class="sms-code-popup__header-close"
        src="https://ic-img.ky-express.com/netc/20250731_84451_!!1753952732865_64_64.png"
        @tap="emits('update:show', false)"
      />
    </view>
    <view class="sms-code-popup__body">
      <view class="extra-help">
        <template v-for="(segment, index) in tipSegments" :key="index">
          <text v-if="index > 0" style="font-weight: 500">{{ userInfo?.phone?.slice(-4) }}</text>
          <text>{{ segment }}</text>
        </template>
      </view>
      <code-input ref="codeInputRef" v-model="state.smsCode" :error="state.error" :auto-focus="false" @complete="debounceCheckSmsCode" />
      <view class="extra-bottom">
        <view @tap="handleSendCode" :class="{ ['resend']: !isCounting }">{{ countdownText }}</view>
      </view>
    </view>
  </ky-popup>
  <TCaptcha ref="tCaptchaRef" />
</template>

<script lang="ts" setup>
import { useCountdown, useUserInfo } from '@/public/hooks'
import { debounce } from 'lodash-es'
import { useLoginPublicParmas } from '../../pages/login/components/phone-login/hooks'
import CodeInput from '../code-input/index.vue'
import './index.scss'
import { loginFromType } from '@/public/constants'
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { api, WebLoginVerificationCheckSmsCodeIn, WebLoginVerificationSendSmsCodeIn } from '../../apis/account-logoff'
import Taro from '@tarojs/taro'
import TCaptcha from '@/public/components/base/captcha/index.vue'
import { withCaptchaRequest } from '@/public/components/base/captcha/utils'
import { encryptPhone } from '../../utils/cryptoJs'

defineOptions({ name: 'SmsCodePopup' })

const tCaptchaRef = ref<InstanceType<typeof TCaptcha>>()
const codeInputRef = ref<InstanceType<typeof CodeInput>>()

const props = defineProps({
  title: { type: String, default: '短信验证码' },
  /** 提示文案，{phone} 为手机尾号占位符 */
  tip: { type: String, default: '验证码将发送到您手机尾号{phone}， 确认是您本人操作' },
  modelValue: { type: String, default: '' },
  error: { type: Boolean, default: false },
  show: { type: Boolean, default: false },
  captchaType: { type: Number },
})

const emits = defineEmits(['update:show', 'next', 'resend'])

const TIP_PHONE_PLACEHOLDER = '{phone}'

const { deviceCode } = useLoginPublicParmas()
const { userInfo } = useUserInfo()

const tipSegments = computed(() => props.tip.split(TIP_PHONE_PLACEHOLDER))

const state = reactive({
  smsCode: '',
  error: false,
})

const countdown = useCountdown()
const isCounting = countdown.isCounting
const countdownText = countdown.text

function getParams() {
  return {
    /* 验证码类型：7-登陆 8-忘记密码 9-重置密码 11-用户注销 .... */
    captchaType: props.captchaType,
    /* 登录手机号 */
    phone: userInfo.value.phone,
    /* 来源-原生通过URL传过来 */
    from: loginFromType, // 小程序为6，默认值
    // 设备码
    deviceCode: deviceCode,
  }
}

/* 获取短信验证码 */
async function getSMSCode() {
  state.smsCode = ''

  const sendSMSCodeRequest = async (safeVerifyId?: string) => {
    const params = { ...getParams(), safeVerifyId }
    params.phoneCipher = await encryptPhone(params.phone)
    return api('web.login.verification.sendSmsCode', params as WebLoginVerificationSendSmsCodeIn)
  }

  const res = await withCaptchaRequest(sendSMSCodeRequest, tCaptchaRef.value)()

  if (res.code === 0) {
    // 发送短信成功
    countdown.start()
    Taro.showToast({ icon: 'none', title: '验证码已发送至您的手机，请注意查收' })
    // 主动聚焦拉起软键盘（延迟等待弹窗动画结束，weapp 端动画期间设置 focus 属性偶发不生效）
    setTimeout(() => {
      codeInputRef.value?.focus()
    }, 300)
  }
}

onBeforeUnmount(() => {
  clearTimeout(timeout.value)
})

const timeout = ref()
const durationErrorToast = (duration = 1000) => {
  Taro.showToast({ icon: 'none', title: '验证码错误，请重新输入' })
  clearTimeout(timeout.value)
  state.error = true

  setTimeout(() => {
    state.smsCode = ''
    state.error = false
  }, duration)
}

const isChecking = ref(false)

async function handleCheckSmsCode() {
  if (isChecking.value) return

  const checkSMSCodeRequest = async (safeVerifyId?: string) => {
    return await api('web.login.verification.checkSmsCode', {
      ...getParams(),
      smsCode: state.smsCode,
      safeVerifyId,
    } as WebLoginVerificationCheckSmsCodeIn)
  }

  isChecking.value = true
  const res = await withCaptchaRequest(checkSMSCodeRequest, tCaptchaRef.value)().finally(() => {
    isChecking.value = false
  })

  if (res.code === 0) {
    emits('next')
    clearTimeout(timeout.value)
  } else {
    durationErrorToast()
  }
}

const debounceCheckSmsCode = debounce(handleCheckSmsCode, 800, { trailing: true })

async function handleSendCode() {
  if (countdown.isCounting.value) return
  /* 手动点击重发（区别于弹窗打开时的自动发送），供业务侧上报埋点 */
  emits('resend')
  getSMSCode()
}

watch(
  () => props.show,
  () => {
    if (!props.show) return
    state.smsCode = ''
    getSMSCode()
  },
  { immediate: true },
)
</script>
