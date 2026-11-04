<template>
  <KDialog
    v-model="visible"
    class="ky-sms-code-dialog"
    width="416"
    :close-on-click-modal="false"
    cancel-text="取消"
    confirm-text="确定"
    title="短信验证"
    append-to-body
    @confirm="handleConfirm"
  >
    <k-form :model="formData" ref="formRef" @submit.prevent label-position="top">
      <k-form-item :label="getTitleTips" :error="error.smsCode">
        <SmsInput
          ref="inputRef"
          v-model="formData.smsCode"
          :errorState="error.state"
          @update:modelValue="error.smsCode = ''"
          @resetErrorState="handleResetErrorState"
        />
      </k-form-item>
      <div class="get-cms-btn">
        <span v-if="timer" class="is-count-down">{{ countdownCount }}s后重新获取</span>
        <span v-else class="get-cms" @click="handleGetSmsCode()">获取验证码</span>
      </div>
    </k-form>
  </KDialog>
</template>

<script setup lang="ts">
/**
 * 短信验证码弹窗
 * 来源: netc-pc-web/src/views/layout/switch-login-mobile/components/ky-sms-code/index.vue(命令式挂载 -> 组件内 v-model)
 * 仅被切换登录手机号场景使用(7天未登录 16004 短信验证分支)
 */
import { computed, ref, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { KDialog, KForm, KFormItem } from '@netc-design-pc/ui'
import { generateBrowserUuid } from '@/stores/pc-web/deps/misc'
import { showVerifyCodeDialog } from '@/views/home/module/module-customer-code/utils/verify-code'
import { sendSmsCodeApi, checkSmsCodeApi } from '../api'
import { CAPTCHA_TYPE, ErrorResultCode, VerifyDialogType } from '../constants'
import { useUserStore } from '@/stores/user'
import SmsInput from './sms-input.vue'

defineOptions({ name: 'KySmsCode' })

const DEFAULT_COUNTDOWN = 60

interface SmsCodePayload {
  title?: string
  phone?: string
  captchaType?: number
  unToken?: boolean
  callback?: () => void
  [key: string]: any
}

const userStore = useUserStore()

const title = ref('')
const phone = ref('')
const timer = ref<ReturnType<typeof setInterval> | null>(null)
const callback = ref<(() => void) | null>(null)
const visible = ref(false)
const captchaType = ref<number | undefined>()
const countdownCount = ref(DEFAULT_COUNTDOWN)
const hasSendSmsCode = ref(false)
const payload = ref<SmsCodePayload>({})
const checkLock = ref(false)
const formData = ref({
  smsCode: '',
})
const error = ref({
  smsCode: '',
  state: false,
})

const formRef = ref()
const inputRef = ref()

/** 手机号(优先使用入参, 兜底当前登录手机号) */
const calcPhone = computed(() => phone.value || userStore.user?.phone || '')
/** 手机号后4位 */
const phoneLastNumber = computed(() => (calcPhone.value ? calcPhone.value.slice(7, 11) : ''))
const getTitleTips = computed(() => {
  if (title.value) return title.value
  if (phoneLastNumber.value) return `验证码将发送到您手机尾号${phoneLastNumber.value}，确认是您本人操作`
  return '验证码将发送到您手机，确认是您本人操作'
})

watch(visible, (val) => {
  formData.value.smsCode = ''
  error.value.state = false
  error.value.smsCode = ''
  // 每次都要重置一遍提交标识
  if (val) {
    handleGetSmsCode()
    handleFocus()
  } else {
    handleReset()
  }
})

/** 打开弹窗 */
const showDialog = (data: SmsCodePayload = {}) => {
  visible.value = true
  title.value = data.title || ''
  phone.value = data.phone || ''
  captchaType.value = data.captchaType
  callback.value = data.callback || null
  payload.value = data
}

const getParams = (): Record<string, any> => {
  const params: Record<string, any> = {
    /* 验证码类型：7-登陆 8-忘记密码 9-重置密码 11-用户注销 .... */
    captchaType: captchaType.value,
    /* 登录手机号 */
    phone: calcPhone.value,
    /* 来源：7-客户端 */
    from: 7,
  }
  if (captchaType.value === CAPTCHA_TYPE.SWITCH_LOGIN_MOBILE) {
    params.deviceCode = generateBrowserUuid()
  }
  return params
}

/** 获取短信验证码 */
const handleGetSmsCode = async (safeVerifyId?: string) => {
  try {
    formData.value.smsCode = ''
    error.value.smsCode = ''
    error.value.state = false
    const params = getParams()
    if (safeVerifyId) params.safeVerifyId = safeVerifyId
    const res = await sendSmsCodeApi(params)
    if (res.code === 0) {
      // 发送短信成功开始倒计时
      startCountdown()
      setTimeout(() => {
        ElMessage.info('验证码已发送至您的手机，请注意查收')
      }, 200)
    }
  } catch (e: any) {
    console.log(e, ':>>> e')
    if (e?.code === ErrorResultCode.VERIFY_CODE) {
      // 触发风控校验
      hasSendSmsCode.value = true
      const data = e.data || {}
      // 风控校验错误码，1-图形验证码，2-已锁定不需要弹窗图形验证，4-滑块
      if (data?.type === VerifyDialogType.HAS_LOCKED) {
        if (data?.msg) ElMessage.warning(data?.msg)
      } else {
        const verifyResult = await showVerifyCodeDialog(
          {
            ruleId: data?.ruleId,
            strategyCode: data?.strategyCode,
            phone: calcPhone.value,
          },
          { type: data?.type, unToken: true }
        )
        if (verifyResult?.safeVerifyId) {
          if (hasSendSmsCode.value) {
            handleGetSmsCode(verifyResult?.safeVerifyId)
          } else {
            handleCheckSmsCode(verifyResult?.safeVerifyId)
          }
        }
      }
    } else {
      if (e?.msg) {
        if (e.code === ErrorResultCode.FREQUENCY_TOO_FAST) {
          ElMessage.warning(e?.msg)
        } else {
          ElMessage.error(e?.msg)
          handleFail(e?.msg)
        }
      }
    }
  }
}

/** 校验短信验证码 */
const handleCheckSmsCode = async (safeVerifyId?: string) => {
  try {
    if (checkLock.value) return
    checkLock.value = true
    const params: Record<string, any> = {
      ...getParams(),
      smsCode: formData.value.smsCode, // 验证码
    }
    if (safeVerifyId) params.safeVerifyId = safeVerifyId
    const res = await checkSmsCodeApi(params)
    delayResetLock()
    if (res.code === 0) {
      // 校验短信成功
      if (typeof callback.value === 'function') callback.value()
      visible.value = false
    }
  } catch (e: any) {
    console.log(e, ':>>> e')
    delayResetLock()
    if (e?.code === ErrorResultCode.VERIFY_CODE) {
      // 触发风控校验
      hasSendSmsCode.value = false
      const data = e.data || {}
      // 风控校验错误码，1-图形验证码，2-已锁定不需要弹窗图形验证，4-滑块
      if (data?.type === VerifyDialogType.HAS_LOCKED) {
        handleFail(data?.msg)
        if (data?.msg) ElMessage.warning(data?.msg)
      } else {
        const verifyResult = await showVerifyCodeDialog(
          {
            ruleId: data?.ruleId,
            strategyCode: data?.strategyCode,
            phone: calcPhone.value,
          },
          { type: data?.type, unToken: true }
        )
        if (verifyResult?.safeVerifyId) {
          handleCheckSmsCode(verifyResult?.safeVerifyId)
        }
      }
    } else {
      handleFail(e?.msg)
      if (e?.msg) ElMessage.error(e?.msg)
    }
  }
}

const delayResetLock = (time = 1500) => {
  setTimeout(() => {
    checkLock.value = false
  }, time)
}

const handleFocus = () => {
  nextTick(() => {
    inputRef.value?.focus?.()
  })
}

/** 重置 */
const handleReset = () => {
  if (timer.value) clearInterval(timer.value)
  timer.value = null
  countdownCount.value = DEFAULT_COUNTDOWN
}

/** 确定按钮点击事件 */
const handleConfirm = () => {
  handleCheckSmsCode()
}

const handleFail = (msg?: string) => {
  formData.value.smsCode = ''
  setTimeout(() => {
    error.value.state = true
    error.value.smsCode = msg || '验证码错误，请重新输入'
    handleFocus()
  }, 100)
}

const handleResetErrorState = () => {
  error.value.state = false
}

/** 短信倒计时 */
const startCountdown = () => {
  timer.value = setInterval(() => {
    if (countdownCount.value > 1) {
      countdownCount.value -= 1
    } else {
      handleReset()
    }
  }, 1000)
}

defineExpose({
  showDialog,
})
</script>

<style lang="scss" scoped></style>
