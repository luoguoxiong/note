import Taro, { useDidShow } from '@tarojs/taro'
import { onMounted, onUnmounted, ref } from 'vue'
import { isWxAppEnv } from '../utils'
import { promisify } from '../utils/taroApiPromises'
import { report_other_event } from '../utils/reportUtil'

let defaultMask = { phoneMask: '', operatorType: 0 }
let isFistTime = true
const phoneMask = ref<{ operatorType: number; phoneMask: string }>({ ...defaultMask })

export async function setDefaultPhoneMask() {
  if (!isWxAppEnv) return
  try {
    const getPhoneMask = promisify<{ operatorType: number; phoneMask: string }, {}>(wx!.getPhoneMask!)
    const res = await getPhoneMask({})
    defaultMask = { ...res }
    console.log(defaultMask, '获取掩码成功')
  } catch (err) {
    console.log(err, '获取掩码失败')
    defaultMask = { operatorType: 0, phoneMask: '' }
    report_other_event('other_login_get_phone', {
      page_code: 'page_logon_login',
      eventCode: 'other_login_get_phone',
      fail_result: err,
    })
  }
}

export function usePhoneMask() {
  const setPhoneMask = async (_isUpdate = false) => {
    // 第一次请求获取微信掩码 或者 需要更新获取
    if (isFistTime || _isUpdate) {
      await setDefaultPhoneMask()
      phoneMask.value = { ...defaultMask }
      isFistTime = false
    }
  }

  onMounted(() => {
    // 监听网络
    Taro.onNetworkStatusChange(() => setPhoneMask(false))
  })

  onUnmounted(() => {
    // 关闭监听网络
    Taro.offNetworkStatusChange(() => setPhoneMask(false))
  })

  useDidShow(() => setPhoneMask(false))

  return {
    phoneMask,
    setPhoneMask,
  }
}
