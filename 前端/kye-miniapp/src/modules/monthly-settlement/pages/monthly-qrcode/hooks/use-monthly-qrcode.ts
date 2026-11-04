import { ref } from 'vue'
import Taro, { useDidHide, useDidShow } from '@tarojs/taro'
import { isEmployee } from '@/public/apis/user'
import { useUserInfo } from '@/public/hooks'
import { formatTime } from '@/public/utils'
import { getMonthlyQrcode } from '../apis'
import { MonthlyQrcodeStatus } from '../apis/types'

type ViewState = 'loading' | 'qrcode' | 'cardError' | 'pageError'
/** 卡片内缺省：联系商务（状态异常/非月结） | 无权限（无按钮） | 生成失败（底部刷新重试） */
export type CardErrorKind = 'contact' | 'noPermission' | 'qrFail'
/** 整页缺省：内部员工（返回） | 无网络（重新加载） | 服务器异常（重新加载） */
export type PageErrorKind = 'internalStaff' | 'noNetwork' | 'serverError'

const isNoNetwork = () =>
  new Promise<boolean>((resolve) => {
    Taro.getNetworkType({
      // 微信无网返回 'none'，支付宝返回 'NOTREACHABLE'
      success: (res) => resolve(res.networkType === 'none' || (res.networkType as string) === 'NOTREACHABLE'),
      fail: () => resolve(false),
    })
  })

export const useMonthlyQrcode = () => {
  const { userInfo } = useUserInfo()
  const viewState = ref<ViewState>('loading')
  const qrCodeUrl = ref('')
  const validityText = ref('')
  /** 刷新中（正常态下二维码区域局部 loading） */
  const refreshing = ref(false)
  const cardErrorKind = ref<CardErrorKind>('qrFail')
  const pageErrorKind = ref<PageErrorKind>('serverError')
  /** 后端返回的异常文案 */
  const errMsg = ref('')

  /** 当前二维码过期时刻（接口 expirationDate，毫秒时间戳；缺失时为 0 视为已过期） */
  let expiresAt = 0
  let timer: number | null = null
  /** 内部员工身份每次进入页面只校验一次，放行后不再重复调用 */
  let staffChecked = false
  /** 页面隐藏中：在途请求成功也不再武装定时器，回到页面时由 useDidShow 按剩余时间重排 */
  let hidden = false

  const clearTimer = () => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }

  const scheduleRefresh = (delay: number) => {
    clearTimer()
    // 小程序环境 setTimeout 返回 number，Node 类型定义干扰需断言
    timer = setTimeout(() => {
      fetchQrcode()
    }, delay) as unknown as number
  }

  const showCardError = (kind: CardErrorKind, msg?: string) => {
    cardErrorKind.value = kind
    errMsg.value = msg || ''
    viewState.value = 'cardError'
  }

  const showPageError = (kind: PageErrorKind) => {
    pageErrorKind.value = kind
    viewState.value = 'pageError'
  }

  const fetchQrcode = async () => {
    // 并发守卫：定时器回调与手动刷新共走此处，防止在途请求被重复发起（后者覆盖前者有效期）
    if (refreshing.value) return
    refreshing.value = true
    clearTimer()
    try {
      // 内部员工不可使用：getQRCode 不返回该状态，单独调 web.customer.isEmployee 判断
      if (!staffChecked) {
        const staffRes = await isEmployee({ phone: userInfo.value.phone })
        if (staffRes?.data?.isEmployee) {
          showPageError('internalStaff')
          return
        }
        staffChecked = true
      }
      const res = await getMonthlyQrcode()
      const data = res?.data
      const status = Number(data?.status)
      switch (status) {
        case MonthlyQrcodeStatus.Success: {
          qrCodeUrl.value = data?.qrCodeUrl || ''
          // 有效期展示与到期时刻均以接口返回为准（ADR 0001），展示精确到分钟
          validityText.value = `${formatTime(data?.generationDate, 'YYYY-MM-DD HH:mm')} 至 ${formatTime(data?.expirationDate, 'YYYY-MM-DD HH:mm')}`
          expiresAt = Number(data?.expirationDate) || 0
          viewState.value = 'qrcode'
          // 页面隐藏时在途请求的成功回调：不武装定时器，避免隐藏期间无限轮询；expirationDate 缺失（0）不自动刷新
          const remaining = expiresAt - Date.now()
          if (!hidden && remaining > 0) {
            scheduleRefresh(remaining)
          }
          break
        }
        case MonthlyQrcodeStatus.CustomerAbnormal:
        case MonthlyQrcodeStatus.NotMonthlySettlement:
          showCardError('contact', data?.statusDesc)
          break
        case MonthlyQrcodeStatus.NoPermission:
          showCardError('noPermission', data?.statusDesc)
          break
        default:
          // 5=二维码获取失败，及未知状态兜底
          showCardError('qrFail', data?.statusDesc)
          break
      }
    } catch (error) {
      // 请求层失败（业务 code 非 0 / 弱网 / 无网）：区分无网与服务器异常
      const noNet = await isNoNetwork()
      showPageError(noNet ? 'noNetwork' : 'serverError')
    } finally {
      refreshing.value = false
    }
  }

  /** 手动刷新 / 重新加载 / 首次进入 统一入口（并发守卫在 fetchQrcode 内） */
  const refresh = () => fetchQrcode()

  useDidShow(() => {
    hidden = false
    // 停留期间过期：回到页面立即重新生成；未过期但定时器被清（页面曾隐藏）则按剩余时间重排
    if (viewState.value !== 'qrcode') return
    const remaining = expiresAt - Date.now()
    // expirationDate 缺失/已过期：回到页面立即重新生成；未过期但定时器被清（页面曾隐藏）则按剩余时间重排
    if (remaining <= 0) {
      refresh()
    } else if (!timer) {
      scheduleRefresh(remaining)
    }
  })

  useDidHide(() => {
    hidden = true
    clearTimer()
  })

  return {
    viewState,
    qrCodeUrl,
    validityText,
    refreshing,
    cardErrorKind,
    pageErrorKind,
    errMsg,
    refresh,
    clearTimer,
  }
}
