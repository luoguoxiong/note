<template>
  <ky-container class="bind-phone" v-bind="pageOptions">
    <view class="bind-phone__header">
      <view class="bind-phone__header-text">
        {{ pageOptions.navBarOptions.title }}
      </view>
    </view>

    <view class="bind-phone__content">
      <view>
        <view class="bind-phone__content-form">
          <ky-input type="tel" :maxlength="11" v-model="model.phone" placeholder="请输入手机号码"></ky-input>
          <ky-input
            type="digit"
            ref="smsCodeInputRef"
            @input="codeChange"
            :maxlength="6"
            v-model="model.smsCode"
            :enableWxNative="isWxMiniApp"
            :shouldFocus="true"
            placeholder="请输入验证码"
          >
            <template #right>
              <view
                :class="['bind-phone__content-link', { 'bind-phone__content-link--disabled': sendCodeDisabled }]"
                @tap="handleSendSMSCode"
              >
                {{ text }}
              </view>
            </template>
          </ky-input>
        </view>
        <view class="bind-phone__content-register">
          <image src="https://ic-img.ky-express.com/netc/20250809_48664_!!1754702495572_22_22.png" />
          未注册用户绑定成功后默认注册
        </view>
        <!-- <ky-button @tap="handleWechatBind" :disabled="submitDisabled" type="primary" class="bind-phone__button"
          >绑定</ky-button
        > -->
        <ky-button @tap="handleWechatBind" type="primary" class="bind-phone__button"
          >绑定</ky-button
        >
      </view>
    </view>
    <Captcha ref="captchaRef" />
  </ky-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Captcha from '@public/components/base/captcha/index.vue'
import { isWxMiniApp } from '@/public/utils'
import { reactive, ref, onMounted } from 'vue'
import { useLoginPublicParmas } from '@modules/user/pages/login/components/phone-login/hooks'
import Taro, { useRouter } from '@tarojs/taro'
import { api } from '../bind-phone/api'
import { getEnvConfig } from '@/public/config'
import { useLogin } from '../login/hooks/login'
import { ThirdAuthorizedLoginData } from '../../apis/login/types'
import './index.scss'
import { useCountdown } from '@/public/hooks'
import { withCaptchaRequest } from '@/public/components/base/captcha/utils'
import { reportBindPhoneUv, reporMineSettingBindClick, reportMineSettingBindOther } from '../../report/phone.ts'
import { encryptPhone } from '../../utils/cryptoJs'

defineOptions({ name: 'bind-phone' })

const router = useRouter()

const captchaRef = ref()

const pageOptions = ref({ navBarOptions: { showPlatList: ['wx'], title: '绑定手机号码' } })

const { successHandler, successNavigateBack } = useLogin()

const { deviceType, deviceCode, systemVersion, version } = useLoginPublicParmas()

const countdown = useCountdown()
const model = reactive({ phone: router.params.phone || '', smsCode: '' })
const text = computed(() => (countdown.isCounting.value ? countdown.text.value : '获取验证码'))

const errors = reactive({ phone: '', smsCode: '' })

const smsCodeInputRef = ref()
const codeChange = (value) => {
  console.log(value)
  if (value.length === 6) {
    if (smsCodeInputRef.value) {
      console.log('codeChange', smsCodeInputRef.value.blur)
      try {
        smsCodeInputRef.value?.blur()
      } catch (e) {
        console.log(e)
      }
    }
    setTimeout(() => {
      handleWechatBind()
    }, 0)
  }
}

// 表单校验不通过提示
const vaildTip = computed(() => {
  let msg = ''
  const phone = model.phone
  if (!phone || phone.length !== 11 || !(/^1[3456789]\d{9}$/.test(phone))) {
    msg = '请输入11位手机号'
  } else {
    msg = '请输入6位验证码'
  }
  return msg
})
const handleWechatBind = async () => {
  if (submitDisabled.value) {
    return Taro.showToast({ icon: 'none', title: vaildTip.value })
  }
  try {
    reporMineSettingBindClick('绑定')
    const env = await getEnvConfig()
    const bindRequest = () => {
      return api('web.login.weChat.authorizedLoginByRisk', {
        deviceId: Taro.getStorageSync('app_device_id') || '',
        wxCode: router.params.wxCode!,
        authorizedType: 3,
        from: env.from,
        phone: model.phone,
        smsCode: model.smsCode,
        deviceCode,
        version,
        deviceType,
        systemVersion,
      })
    }
    const { code, data } = await withCaptchaRequest(bindRequest, captchaRef.value, { phone: model.phone })()
    console.log('handleWechatBind', code, data)
    if (code === 0) {
      successHandler(data as unknown as ThirdAuthorizedLoginData)
      successNavigateBack(data as unknown as ThirdAuthorizedLoginData)
      reportMineSettingBindOther('成功')
    } else {
      model.smsCode = ''
      setTimeout(() => {
        smsCodeInputRef.value?.focus()
      }, 300)
    }
  } catch (e) {
    model.smsCode = ''
    setTimeout(() => {
      smsCodeInputRef.value?.focus()
    }, 300)
  }
}

const submitDisabled = computed(() => {
  return model.phone.length !== 11 || model.smsCode.length !== 6 || !(/^1[3456789]\d{9}$/.test(model.phone))
})

const sendCodeDisabled = computed(() => {
  return model.phone.length !== 11 || countdown.isCounting.value
})

const handleSendSMSCode = async () => {
  if (sendCodeDisabled.value) return

  const env = getEnvConfig()

  const sendSMSCodeRequest = async () => {
    const phoneCipher = await encryptPhone(model.phone)
    const res = await api('web.login.verification.sendSmsCode', {
      phone: model.phone,
      captchaType: 7,
      from: env.from,
      deviceCode,
      // @ts-ignore
      riskFlag: 10,
      // @ts-ignore
      deviceType,
      phoneCipher,
    })
    if (res.data.msg) {
      Taro.showToast({ title: res.data.msg!, icon: 'none' })
    }
    return res
  }

  await withCaptchaRequest(sendSMSCodeRequest, captchaRef.value, { phone: model.phone })()

  countdown.start()
  setTimeout(() => {
    smsCodeInputRef.value?.focus()
  }, 300)
}

onMounted(() => reportBindPhoneUv())
</script>
