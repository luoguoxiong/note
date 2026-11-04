<template>
  <view class="phone-login-page">
    <LoginTab v-model="loginType"></LoginTab>
    <view class="login-form-wrap">
      <view class="input-wrap">
        <ky-input
          v-model="phone"
          label="手机号"
          placeholder="请输入手机号"
          placeholder-style="color: #ADB0B8 !important;"
          required
          maxlength="11"
          size="large"
          type="number"
          :isError="phoneIsError"
          :formatter="numberFormatter"
          @input="onPhoneInput"
          @blur="verifyPhoneNumber"
          :enableNative="false"
          :enableWxIOSFocusFit="true"
          clearable
        >
        </ky-input>
        <view class="error-msg" v-show="phoneIsError">{{ phoneErrorMessage }}</view>
      </view>
      <view class="input-wrap" v-if="loginType === LOGINTYPE.SMSLOGIN">
        <ky-input
          v-model="code"
          class="code-input"
          label="手机号"
          placeholder="请输入验证码"
          placeholder-style="color: #ADB0B8 !important;"
          required
          size="large"
          type="number"
          maxlength="6"
          :formatter="numberFormatter"
          :enableNative="false"
          :enableWxNative="isWxMiniApp"
          :enableWxIOSFocusFit="true"
          @input="codeChange"
          ref="codeInputRef"
          :shouldFocus="true"
          clearable
        >
          <template #right>
            <view class="sms-code" @click="handleGetVerCode" :class="{ disabled: smsValueDisabled }">{{ text }}</view>
          </template>
        </ky-input>
      </view>

      <view class="input-wrap" v-if="loginType === LOGINTYPE.PWDLOGIN">
        <ky-input
          v-model="password"
          placeholder="请输入密码"
          placeholder-style="color: #ADB0B8 !important;"
          size="large"
          :key="isOpen ? 'text' : 'password'"
          :type="isOpen ? 'text' : 'password'"
          :enableNative="false"
          :enableWxIOSFocusFit="true"
          :password="!isOpen"
          clearable
        >
          <template #right>
            <image
              @tap.stop="updateOpen"
              :src="
                isOpen
                  ? 'https://ic-img.ky-express.com/netc/20250610_5177039510_!!1749556065567_96_96.png'
                  : 'https://ic-img.ky-express.com/netc/20250610_76270395192_!!1749556068955_96_96.png'
              "
              class="eye"
              mode="aspectFit"
            >
            </image>
          </template>
        </ky-input>
      </view>

      <view class="login-tip" v-if="loginType === LOGINTYPE.SMSLOGIN">
        <image
          src="https://ic-img.ky-express.com/netc/20250609_21470395171_!!1749450487507_44_44.png"
          class="login-tip-icon"
        >
        </image>
        未注册用户登录成功后默认注册
      </view>

      <view class="pwd-login-tip" v-if="loginType === LOGINTYPE.PWDLOGIN">
        <view class="remember-pwd" @click="handleSwitchRememberPwd">
          <KyImage class="check-image" :name="checkBoxImage" />
          <text class="remember-text">记住密码</text>
        </view>
        <view class="forget-pwd" @click="toForgetPage">
          <text class="forget-text">忘记密码</text>
          <image class="forget-image" src="https://ic-img.ky-express.com/netc/20250611_39775_!!1749610314407_49_49.png">
          </image>
        </view>
      </view>
      <ky-button type="primary" @click="handleLogin" size="large">登录/注册</ky-button>
      <AgreeProtocol v-model="isCheck" ref="agreeProtocolRef" @confirm="loginContinueTodo"></AgreeProtocol>
      <Captcha ref="captchaRef" @getCode="getCode"></Captcha>
    </view>
  </view>
</template>
<script lang="ts" setup>
import './index.scss'
import LoginTab from '../login-tab/index.vue'
import { LOGINTYPE } from '../login-tab/index'
import { isH5FSEnv, isWxMiniApp, isPcFSEnv } from '@/public/utils'
import { clearUserCache } from '@/public/storage'
import './index.scss'
import { AgreeProtocol } from '../../../../components'
import { sendSmsCode, smsLogin, pwdLogin, debugGetAccessToken, appSmsLogin } from '@/modules/user/apis/login'
import { ThirdAuthorizedLoginData, CaptchaRes } from '@/modules/user/apis/login/types'
import { computed, onMounted, ref } from 'vue'
import { useCountdown } from '@/public/hooks'
import { isRealPhone } from '@/public/utils/regexp'
import Taro, { useRouter } from '@tarojs/taro'
import Captcha from '@/public/components/base/captcha/index.vue'
import { getAuthCode, isAliMiniApp } from '@public/utils'
import { loginSuccessBackDefault, loginSuccess } from '@modules/user/pages/login/service'
import { report_clk_logon_login_other_button, report_other_login_loginin } from '@modules/user/report/login'
import { useLoginPublicParmas, useForm } from './hooks'
import md5 from 'js-md5'
import { HttpResponse } from '@/public/utils/types/request'
import KyImage from '@/public/components/base/ky-image/index.vue'
import { openURL } from '@/modules/webview/utils'
import { getEnvConfig } from '@/public/config'
import { useLogin } from '../../hooks/login'
import { getLoginFromType, isWeixinAppSync } from '@/public/constants'

const loginType = ref(Taro.getStorageSync('LAST_LOGIN_TYPE') || LOGINTYPE.SMSLOGIN)

const env = getEnvConfig()

const numberFormatter = env.isPc ? (text: string) => text.replace(/\D/g, '') : undefined

// 当前操作场景值：0无, 1获取验证码 2 短信验证码登录  3 账密登录
const currenModel = ref(0)

const captchaCode = ref('')
const router = useRouter()
const codeInputRef = ref()
const { start, isCounting, text, stop } = useCountdown(60)

const {
  phone,
  code,
  isOpen,
  phoneIsError,
  phoneInputReal,
  updateOpen,
  password,
  verifyPhoneNumber,
  onPhoneInputHandler,
  checkBoxImage,
  setHistoryLoginForm,
  handleSwitchRememberPwd,
} = useForm()

const phoneErrorMessage = computed(() => (phone.value.length !== 11 ? '请输入11位的手机号' : '请输入正确的手机号'))

const publicParmas = useLoginPublicParmas()
const { quickLogin } = useLogin()

const isCheck = ref(false)

const agreeProtocolRef = ref()

const captchaRef = ref()
// 弹窗用户、隐私协议的场景，登录场景 | 忘记密码 (login | forgetPsd)
const dialogType = ref('login')

const loginBtnIsDisabled = computed(() => {
  const verifyFail = loginType.value === LOGINTYPE.SMSLOGIN ? code.value !== '' : password.value !== ''
  const verifyFail2 = loginType.value === LOGINTYPE.SMSLOGIN ? code.value.length !== 6 : password.value === ''
  return !(verifyFail && isRealPhone(phone.value)) || verifyFail2
})
/* */
const smsValueDisabled = computed(() => {
  return isCounting.value || !phoneInputReal.value
})

const toForgetPage = () => {
  report_clk_logon_login_other_button({
    page_name: '登录_登录页',
    event_name: '登录_登录页_页面按钮点击',
    button_name: '忘记密码',
  })
  dialogType.value = 'forgetPsd'
  if (!isCheck.value) {
    agreeProtocolRef.value.show()
  } else {
    openURL(
      `/password-manage.html#/forget?from=${6}&phone=${phone.value}&deviceCode=${publicParmas.deviceCode}&deviceType=${publicParmas.deviceType}`,
    )
  }
}

const handleGetVerCode = () => {
  dialogType.value = 'login'
  currenModel.value = 1
  if (!verifyPhoneNumber()) {
    if (!isCheck.value) {
      quickLoginMode.value = false
      agreeProtocolRef.value.show()
      setTimeout(() => {
        codeInputRefBlurFun()
      }, 1000)
      return
    }
    if (smsValueDisabled.value) {
      return
    }
    toSendSmsCode()
  }
}

const toSendSmsCode = async () => {
  if (!verifyPhoneNumber()) {
    const res = await sendSmsCode({
      phone: phone.value,
      captchaType: 7,
      from: getLoginFromType(),
    })
    if (res.code === 264587 && res.data.type === 4) {
      captchaRef.value?.showCaptcha({
        ...res.data,
        phone: phone.value,
      })
    } else {
      start()
      setTimeout(() => {
        Taro.showToast({ icon: 'none', title: '验证码已发送至您的手机，请注意查收' })
        codeInputRef.value?.focus() // 触发聚焦
      })
    }
    return
  }
}

const onPhoneInput = (value) => {
  phoneIsError.value = false
  onPhoneInputHandler(value)
  stop()
}

/**
 * 登录操作过程中，登录流程自动接着进行，
 * 1. 用户点击获取验证码，用户协议未同意，触发弹窗后，自动获取验证码
 * 2. 短信、密码登录，用户协议同意后接着自动登录
 * 3. 短信、密码，触发滑块校验回调后，自动登录
 * */
const loginContinueTodo = async () => {
  if (dialogType.value === 'forgetPsd') {
    openURL(
      `/password-manage.html#/forget?from=${6}&phone=${phone.value}&deviceCode=${publicParmas.deviceCode}&deviceType=${publicParmas.deviceType}`,
    )
    return
  }
  try {
    if (quickLoginMode.value) {
      Taro.showLoading({ title: '登录中...' })
      await quickLogin({ type: 'miniApp' }).finally(() => {
        Taro.hideLoading()
      })
      quickLoginMode.value = false
    } else if (currenModel.value === 1) {
      await toSendSmsCode()
    } else if (currenModel.value === 2) {
      await handleSmsLogin()
    } else if (currenModel.value === 3) {
      await handlePwdLogin()
    }
  } catch (error) {
    console.log(error)
    throw error
  }
}

const quickLoginMode = ref(false)
const ensureAgreeProtocolByQuickLogin = () => {
  if (!isCheck.value) {
    quickLoginMode.value = !!isWeixinAppSync()
    agreeProtocolRef.value.show()
    return
  }
  Taro.showLoading({ title: '登录中...', mask: true })
  quickLogin({ type: 'miniApp' }).finally(() => {
    Taro.hideLoading()
  })
}

defineExpose({
  ensureAgreeProtocolByQuickLogin: ensureAgreeProtocolByQuickLogin,
})

const getCode = async (code: string) => {
  if (!code) return
  try {
    captchaCode.value = code
    await loginContinueTodo()
    currenModel.value = 0
  } catch (error) {
    console.log(error)
    throw error
  }
}

const codeInputBlur = () => {
  // 获取第一个 class 为 "code-input" 的元素
  const firstCodeInput = document.querySelector<HTMLElement>('.code-input')

  if (firstCodeInput) {
    // 在其内部查找第一个 .weui-input 元素（限定为 HTMLInputElement）
    const firstWeuiInput = firstCodeInput.querySelector<HTMLInputElement>('.weui-input')

    if (firstWeuiInput && firstWeuiInput.blur) {
      firstWeuiInput.blur()
    }
  }
}
const isHandlingLogin = ref(false) // 🔒 防止重复提交

const codeInputRefBlurFun = () => {
  if (codeInputRef.value) {
    try {
      codeInputRef.value?.blur()
    } catch (e) {
      console.log(e)
    }
  }
  if (isH5FSEnv) {
    codeInputBlur()
  }
}
const codeChange = (value) => {
  console.log('codeChange', value)
  if (value.length === 6 && !isHandlingLogin.value) {
    isHandlingLogin.value = true
    if (codeInputRef.value) {
      try {
        codeInputRef.value?.blur()
      } catch (e) {
        console.log(e)
      }
    }
    if (isH5FSEnv) {
      codeInputBlur()
    }
    setTimeout(() => {
      if (isH5FSEnv) {
        codeInputBlur()
      }
      handleLogin()
    }, 0)
  }
}

const handleLogin = async () => {
  dialogType.value = 'login'
  if (isPcFSEnv) {
    clearUserCache()
  }
  report_clk_logon_login_other_button({
    page_name: '登录_登录页',
    event_name: '登录_登录页_页面按钮点击',
    button_name: '登录/注册',
  })

  // 解锁
  setTimeout(() => {
    isHandlingLogin.value = false
  }, 1000)

  // 校验不通过
  if (loginBtnIsDisabled.value) {
    vaildNotPassTip()
    return
  }
  if (!isCheck.value) {
    currenModel.value = loginType.value === LOGINTYPE.SMSLOGIN ? 2 : 3
    quickLoginMode.value = false
    agreeProtocolRef.value.show()
  } else {
    if (loginType.value === LOGINTYPE.SMSLOGIN) {
      await handleSmsLogin()
    } else {
      await handlePwdLogin()
    }
  }
}

// 当前校验不通过toast提示
const vaildNotPassTip = () => {
  let msg = ''
  if (!isRealPhone(phone.value)) {
    msg = '请输入11位手机号'
  } else if (loginType.value === LOGINTYPE.SMSLOGIN) {
    msg = '请输入6位验证码'
  } else {
    msg = '登录密码不能为空'
  }
  Taro.showToast({ icon: 'none', title: msg })
}

onMounted(() => {
  // setTimeout(() => {
  //   codeInputRef.value?.focus()
  // }, 1000)
})

const handleLoginAfter = (res: HttpResponse<ThirdAuthorizedLoginData & CaptchaRes>) => {
  if (res.code === 264587 && res.data.type === 4) {
    captchaRef.value?.showCaptcha({
      ...res.data,
      phone: phone.value,
    })
    return
  } else if (res.code !== 0) {
    Taro.showToast({ icon: 'none', title: res.msg || '登录失败，请稍后再试' })
    return
  }

  loginSuccess(res.data)
  const delta = Taro.getCurrentInstance()?.router?.params?.delta
  loginSuccessBackDefault({ delta }, router, res?.data.newRegisterFlag || 0)
  // 登录成功，上报埋点
  report_other_login_loginin({ login_type: currenModel.value === 2 ? '短信登录' : '密码登录', request_result: '成功' })
}

const handleSmsLogin = async () => {
  try {
    Taro.showLoading({ mask: true, title: '登录中...' })
    const { from, isApp } = getEnvConfig()
    // const phone = '13823725404'
    const phoneValue = phone.value
    const parmas = isApp
      ? {
          riskFlag: 10,
          wxCode: '',
          phone: phoneValue,
          smsCode: code.value,
          safeVerifyId: captchaCode.value,
          ...publicParmas,
          from,
        }
      : {
          wxCode: await getAuthCode(),
          phone: phoneValue,
          smsCode: code.value,
          safeVerifyId: captchaCode.value,
          from,
          ...publicParmas,
        }
    // TODO 仅用于调试 - isAliMiniApp
    if (isAliMiniApp) {
      const res = await debugGetAccessToken(parmas)
      setHistoryLoginForm()
      currenModel.value = 2
      handleLoginAfter({
        ...res,
        data: {
          ecasToken: res.data,
          phone: phoneValue,
        },
      })
    } else {
      const res = isApp ? await appSmsLogin(parmas) : await smsLogin(parmas)
      setHistoryLoginForm()
      currenModel.value = 2
      handleLoginAfter(res)
    }
    Taro.setStorage({ key: 'LAST_LOGIN_TYPE', data: LOGINTYPE.SMSLOGIN })
    Taro.setStorage({ key: 'LAST_LOGIN_PAGE_TYPE', data: 'phone' })
  } catch (error) {
    code.value = ''
    codeInputRef.value?.focus()
    report_other_login_loginin({
      login_type: '短信登录',
      request_result: '失败',
      failure_reason: error,
    })
    Taro.showToast({ icon: 'none', title: error, duration: 1000 })
    throw error
  } finally {
    setTimeout(() => {
      Taro.hideLoading()
    }, 1000)
  }
}

const handlePwdLogin = async () => {
  try {
    Taro.showLoading({ mask: true, title: '登录中...' })
    const { from, isApp } = getEnvConfig()
    // const phone = '13823725404'
    const phoneValue = phone.value
    const parmas = isApp
      ? {
          wxCode: '',
          phone: phoneValue,
          password: md5.md5(password.value).toUpperCase(),
          safeVerifyId: captchaCode.value,
          needCheckNewDevice: true,
          version: 'v62600000',
          from,
          ...publicParmas,
        }
      : {
          phone: phoneValue,
          password: md5.md5(password.value).toUpperCase(),
          wxCode: await getAuthCode(),
          safeVerifyId: captchaCode.value,
          needCheckNewDevice: true,
          from,
          ...publicParmas,
        }
    const res = await pwdLogin(parmas)
    setHistoryLoginForm(true)
    currenModel.value = 3
    handleLoginAfter(res)
    Taro.setStorage({ key: 'LAST_LOGIN_TYPE', data: LOGINTYPE.PWDLOGIN })
    Taro.setStorage({ key: 'LAST_LOGIN_PAGE_TYPE', data: 'phone' })
  } catch (error) {
    report_other_login_loginin({
      login_type: '密码登录',
      request_result: '失败',
      failure_reason: error,
    })
    Taro.showToast({ icon: 'none', title: error, duration: 1000 })
    throw error
  } finally {
    setTimeout(() => {
      Taro.hideLoading()
    }, 1000)
  }
}
</script>
