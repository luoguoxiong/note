import { uuid } from '@/public/utils'
import { isRealPhone } from '@/public/utils/regexp'
import Taro from '@tarojs/taro'
// import dayjs from 'dayjs'
import { computed, ref } from 'vue'
import { isWeixinAppSync } from '@public/config'
import { getDeviceType } from '@/modules/user/utils/device'

export const useLoginPublicParmas = () => {
  function getSmsDeviceId() {
    let result = Taro.getStorageSync('sms-device-id')
    if (!result) {
      result = uuid()
      Taro.setStorageSync('sms-device-id', result)
    }
    return result
  }

  // const getDeviceType = () => {
  //   const systemInfo = Taro.getSystemInfoSync()
  //   let deviceType = `${systemInfo.brand} ${systemInfo.model}`
  //   if (systemInfo.model.includes('iPhone')) {
  //     deviceType = systemInfo.model
  //   }
  //   if (systemInfo.platform === 'windows' || systemInfo.platform === 'mac') {
  //     deviceType = Taro.getStorageSync('pc_miniprogram_device_type')
  //     if (!deviceType) {
  //       deviceType = formatPcDeviceStamp()
  //       Taro.setStorageSync('pc_miniprogram_device_type', deviceType)
  //     }
  //   }
  //   return deviceType
  // }

  // const formatPcDeviceStamp = () => {
  //   const date = new Date()
  //   const yearAndDate = dayjs(date).format('YYYYMMDD')
  //   const timestamp = String(date.getTime()).slice(-8)
  //   return `WECHAT-${yearAndDate}${timestamp}`
  // }

  const deviceCode = getSmsDeviceId()
  const deviceId = Taro.getStorageSync('app_device_id') || ''


  const deviceType = getDeviceType()

  // 微信app匹配
  const isWeixinApp = isWeixinAppSync()
  if (isWeixinApp) {
    const systemVersion = '18.5'
    const hostVersion = '7.88.0'
    return { deviceType, deviceCode, deviceId, systemVersion, version: hostVersion }
  } else {
    return { deviceType, deviceCode, deviceId }
  }
}

export const useForm = () => {
  const phone = ref(Taro.getStorageSync('login-history-phone') || '') // 手机号码

  const password = ref(Taro.getStorageSync('login-history-password') || '') // 密码

  const code = ref('') // 验证码

  const phoneIsError = ref(false)

  const phoneInputReal = computed(() => isRealPhone(phone.value))

  const isOpen = ref(false) // 是否可见

  const updateOpen = () => {
    isOpen.value = !isOpen.value
  }

  const setHistoryLoginForm = (pwdLogin = false) => {
    if (isRememberPwd.value && pwdLogin) {
      Taro.setStorageSync('login-history-phone', phone.value)
      Taro.setStorageSync('login-history-password', password.value)
    } else {
      Taro.setStorageSync('login-history-phone', phone.value)
      Taro.setStorageSync('login-history-password', '')
    }
  }

  const verifyPhoneNumber = () => {
    phoneIsError.value = !isRealPhone(phone.value)
    return phoneIsError.value
  }

  const verifyRealPhone = () => {
    return isRealPhone(phone.value)
  }

  const isRememberPwd = ref(Taro.getStorageSync('login-history-password') || false)

  const checkImageList = {
    checked1: 'user/checked-1.png',
    checked0: 'user/checked-0.png',
  }

  const checkBoxImage = computed(() => {
    return isRememberPwd.value ? checkImageList['checked1'] : checkImageList['checked0']
  })

  /* 切换选中事件 */
  const handleSwitchRememberPwd = () => {
    isRememberPwd.value = !isRememberPwd.value
  }

  const onPhoneInputHandler = (value) => {
    console.log('onPhoneInputHandler', value, phone.value, phoneInputReal.value)
  }

  return {
    isOpen,
    updateOpen,
    password,
    phone,
    code,
    phoneIsError,
    phoneInputReal,
    setHistoryLoginForm,
    verifyPhoneNumber,
    onPhoneInputHandler,
    checkBoxImage,
    isRememberPwd,
    handleSwitchRememberPwd,
  }
}
