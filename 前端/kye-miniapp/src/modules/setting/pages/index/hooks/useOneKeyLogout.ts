import { computed, ref } from 'vue'
import Taro from '@tarojs/taro'
import { loginFromType } from '@public/constants'
import { useApplication } from '@public/utils/application/useApplication'
import { useUserInfo } from '@public/hooks'
import { report_CLK_event, report_other_event } from '@public/utils/reportUtil'
import { useLoginPublicParmas } from '@modules/user/pages/login/components/phone-login/hooks'
import { SMS_CODE_TYPE } from '@modules/user/pages/changeLogin/constants'
import { oneKeyLogoutOtherDeviceApi } from '@modules/setting/apis'
import { getToken } from '@public/storage'

/* 短信验证码弹窗提示文案，{phone} 为手机尾号占位符 */
export const ONE_KEY_LOGOUT_SMS_TIP =
  '验证码已发送至尾号{phone}的手机，请查收后输入。验证通过后手机号其他登录设备均会退出登录，请确认后谨慎操作'

const LOGOUT_SUCCESS_TOAST = '已成功退登其他设备'
const LOGOUT_FAIL_TOAST = '退登失败，请稍后重试'
const LOGOUT_LOADING_TEXT = '退登中'
const LOGOUT_SUCCESS_EVENT = 'other_mine_logout_success_v1'
const SETTING_BUTTON_EVENT = 'clk_mine_setting_button'

/* 软键盘收起动画耗时，成功弹窗需等键盘完全收起后再弹出 */
const KEYBOARD_HIDE_DELAY = 500
const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

/* from → 埋点操作来源中文枚举（PRD 5.1.3⑥；weapp 口径对齐现网登录埋点 login.ts 的「跨越寄件小程序」） */
const LOGOUT_SOURCE_MAP: Record<string, string> = {
  2: '跨越速运APP',
  4: '跨越速运APP',
  6: '跨越寄件小程序',
  45: '跨越支付宝小程序',
  49: '跨越高德小程序',
  51: '跨越寄件飞书小程序',
  53: '跨越寄件飞书小程序',
}

export const useOneKeyLogoutSetting = () => {
  const { navigateApplicationWithName } = useApplication()
  const { userInfo } = useUserInfo()
  const loginPublicParams = useLoginPublicParmas()

  const showSmsPopup = ref(false)
  const showSuccessDialog = ref(false)
  /* 退登请求执行中：入口按钮置灰展示「退登中」 */
  const isLoggingOut = ref(false)

  const logoutLoadingText = LOGOUT_LOADING_TEXT
  const logoutEntranceText = computed(() => (isLoggingOut.value ? LOGOUT_LOADING_TEXT : '去退登'))

  const source = computed(() => LOGOUT_SOURCE_MAP[String(loginFromType)] || '跨越寄件小程序')

  const reportClick = (buttonName: string) => {
    report_CLK_event(SETTING_BUTTON_EVENT, {
      page_code: 'page_mine_seting',
      pageName: '设置页',
      button_name: buttonName,
    })
  }

  /* 点击「去退登」入口 */
  const handleOneKeyLogoutClick = () => {
    if (isLoggingOut.value) return
    reportClick('去退登')
    showSmsPopup.value = true
  }

  /* 验证码弹窗内点击「获取验证码」重新发送 */
  const handleSmsResend = () => {
    reportClick('获取验证码')
  }

  /* 短信验证码校验通过（SmsCodePopup next 回调），执行退登 */
  const handleSmsVerified = async () => {
    showSmsPopup.value = false
    /* 记录弹窗关闭时刻，成功弹窗至少等软键盘收起后再展示 */
    const popupClosedAt = Date.now()
    isLoggingOut.value = true
    try {
      const res = await oneKeyLogoutOtherDeviceApi({
        from: Number(loginFromType),
        deviceType: loginPublicParams?.deviceType,
        accessToken: getToken(),
      })
      reportLogoutResult(true)
      /* 0=未设置登录密码（吐司），1=已设置（成功弹窗） */
      if (Number(res?.data?.passwordStatus) === 1) {
        const elapsed = Date.now() - popupClosedAt
        if (elapsed < KEYBOARD_HIDE_DELAY) await wait(KEYBOARD_HIDE_DELAY - elapsed)
        showSuccessDialog.value = true
      } else {
        Taro.showToast({ icon: 'none', title: LOGOUT_SUCCESS_TOAST, duration: 2000 })
      }
    } catch (e) {
      const reason = (e as { msg?: string; message?: string })?.msg || (e as Error)?.message || LOGOUT_FAIL_TOAST
      Taro.showToast({ icon: 'none', title: reason })
      reportLogoutResult(false, reason)
    } finally {
      isLoggingOut.value = false
    }
  }

  const reportLogoutResult = (isSuccess: boolean, failureReason = '') => {
    report_other_event(LOGOUT_SUCCESS_EVENT, {
      page_code: 'page_mine_seting',
      source: source.value,
      request_result: isSuccess ? '成功' : '失败',
      failure_reason: failureReason,
    })
  }

  /* 成功弹窗【去修改】：跳转修改密码 H5 轻应用（与 useLoginPassword.goUpdatePasswordH5Page 同口径） */
  const handleGoModifyPassword = () => {
    reportClick('去修改')
    const { deviceCode, deviceType } = loginPublicParams || {}
    navigateApplicationWithName({
      name: '用户-密码修改',
      queryParams: {
        deviceCode,
        deviceType,
        registerFlag: userInfo.value?.newRegisterFlag,
        from: loginFromType,
      },
    })
  }

  /* 成功弹窗【暂不修改】：仅关闭弹窗 */
  const handleStayUnmodified = () => {
    reportClick('暂不修改')
  }

  return {
    logoutCaptchaType: SMS_CODE_TYPE.ONE_KEY_LOGOUT_OTHER_DEVICE,
    smsTip: ONE_KEY_LOGOUT_SMS_TIP,
    showSmsPopup,
    showSuccessDialog,
    isLoggingOut,
    logoutLoadingText,
    logoutEntranceText,
    handleOneKeyLogoutClick,
    handleSmsResend,
    handleSmsVerified,
    handleGoModifyPassword,
    handleStayUnmodified,
  }
}
