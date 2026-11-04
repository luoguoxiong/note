import { computed, ref } from 'vue'
import { useUserInfo } from '@/public/hooks'
import { useLoad } from '@tarojs/taro'
import { useAutoLogin } from '@public/utils/user/useAutoLogin'
import { getToken } from '@/public/storage'

export function useMatch() {
  const { autoLoginHook } = useAutoLogin()
  useLoad((params) => {
    const { phone } = params
    setExpectValue(phone || '')

    if (!getToken() && Boolean(params.needLogin) && params.needLogin !== 'false') {
      autoLoginHook({ needLogin: true })
    }
  })

  const { userInfo } = useUserInfo()

  // 期望手机号
  const expectValue = ref('')

  // 是否已同意不匹配提示
  const forceAgree = ref(false)

  // 手机号是否不匹配
  const isMismatch = computed(() => {
    return expectValue.value && userInfo.value?.phone !== expectValue.value
  })

  // 不匹配提示消息
  const misMatchMessage = computed(() => {
    // 中间 4 位加密
    const maskPhone = expectValue.value.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
    return `与申请提现${maskPhone}不一致，请重新在小程序登录，或者返回 APP 选择其他提现方式`
  })

  // 处理不匹配确认
  const handleMisMatchOk = () => {
    // forceAgree.value = true
    console.info('返回APP')
  }

  // 处理不匹配取消
  const handleMisMatchCancel = () => {
    forceAgree.value = true
  }

  // 设置期望的手机号
  const setExpectValue = (phone: string) => {
    expectValue.value = phone
  }

  return {
    expectValue,
    forceAgree,
    isMismatch,
    misMatchMessage,
    handleMisMatchOk,
    handleMisMatchCancel,
    setExpectValue,
  }
}
