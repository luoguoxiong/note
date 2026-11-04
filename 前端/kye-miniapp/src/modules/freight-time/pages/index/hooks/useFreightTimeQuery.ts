import Taro from '@tarojs/taro'
import { useFreightTimeStore } from '../../../store'
import { getQueryServiceTime } from '../../../api'
import type { QueryServiceTimeParams, CaptchaParam, CheckResultItem } from '../../../types'
import { GoodsTimeFlag } from '../../../types'
import TCaptcha from '@/public/components/base/captcha/index.vue'
import { HttpCode } from '@/public/utils/request/constants'
import { getSendAddress, getReceiveAddress, resetAdressData } from '../../../components/sendAndReceive/hooks/useState'
import { reset as packageServiceReset } from '../../../components/pacakge-service/useState'
import { openValidateKey } from '../../../components/product-name/useGoodsTypeValidate'
import { CouponReceiveSource } from '../../../constants'
import {
  closeValidateKey as closeActualWeightValidateKey,
  useActualWeightValidate,
} from '../../../components/product-spec-weight/useActualWeightValidate'
import { closeValidateKey as closeGoodsTypeValidateKey } from '../../../components/product-name/useGoodsTypeValidate'
import { setLinkContentVisible } from '@freight-time/components/product-name/useState'
import { other_freight_query_v1 } from '@freight-time/report'

/** handleSearch 返回类型 */
interface UseFreightTimeQueryReturn {
  handleSearch: (captchaRef?: InstanceType<typeof TCaptcha>, captchaVerifyParam?: CaptchaParam) => Promise<void>
  handleReset: () => void
  onCaptchaGetCode: (safeVerifyId: string, captchaParam: CaptchaParam) => void
  onCaptchaClose: () => void
}

/**
 * 运费时效查询 hook
 * @param onQueryDone - 查询结果更新后回调（页面滚动定位等）
 */
export function useFreightTimeQuery(onQueryDone?: () => void): UseFreightTimeQueryReturn {
  const store = useFreightTimeStore()
  const sendAddress = getSendAddress()
  const receiveAddress = getReceiveAddress()
  /** 验证码回调 resolve 函数 */
  let captchaResolve: ((value: CaptchaParam | null) => void) | null = null

  const buildServiceTimeParams = (): QueryServiceTimeParams => {
    const productInfo = store.getProductInfo
    const goodsTime = store.getGoodsTime
    const addedService = store.getAddedService
    return {
      sender: {
        ...sendAddress.value,
      },
      receive: {
        ...receiveAddress.value,
      },
      goodsTime: {
        goodsTime: goodsTime.goodsTime,
        goodsTimeFlag: goodsTime.goodsTimeFlag,
      },
      productInfo: {
        goodsType: productInfo.goodsType || '',
        actualWeight: productInfo.actualWeight || 0,
        volumeSize: productInfo.volumeSize || 0,
        preWaybillGoodsSizeList: productInfo.preWaybillGoodsSizeList || [],
      },
      addedService: {
        woodenFrame: addedService.woodenFrame || undefined,
      },
    }
  }

  const createSearchRequest = (captchaVerifyParam?: CaptchaParam) => {
    const orderInfo = buildServiceTimeParams()
    const coupon = store.serviceFeeCoupon
    return getQueryServiceTime({
      orderInfo,
      waybillSource: 'wechatApplet',
      captchaVerifyParam,
      activityId: coupon?.activityId,
      receiveSource: coupon?.receiveSource,
    })
  }

  /**
   * 弹出验证码，返回 Promise
   * 与 netc-h5-order-old 的 showVerifyCodeDialog 逻辑一致：
   * - 验证通过返回 { ticket, randStr }
   * - 用户关闭返回 null
   */
  const showCaptchaDialog = (captchaRef: InstanceType<typeof TCaptcha>) => {
    return new Promise<CaptchaParam | null>((resolve) => {
      captchaResolve = resolve
      captchaRef.showCaptcha({} as any)
    })
  }

  /**
   * 验证码通过回调 - 供 index.vue 的 @getCode 绑定
   * 与 netc-h5-order-old 的 verifyTCaptchaCallback 逻辑一致：
   * - safeVerifyId 有效时返回 captchaParam
   * - 否则返回 null
   */
  const onCaptchaGetCode = (safeVerifyId: string, captchaParam: CaptchaParam) => {
    if (safeVerifyId && captchaResolve) {
      captchaResolve(captchaParam)
      captchaResolve = null
    } else {
      captchaResolve?.(null)
      captchaResolve = null
    }
  }

  /**
   * 验证码关闭回调 - 供 index.vue 的 @handleClose 绑定
   * 与 netc-h5-order-old 的用户关闭验证码逻辑一致：静默返回 null
   */
  const onCaptchaClose = () => {
    captchaResolve?.(null)
    captchaResolve = null
  }

  /**
   * 管控数据提示（对齐 netc-h5-order-old showCheckResult）
   * H5 版用 document.querySelector + MessageBox.create 做 DOM 锚点气泡，
   * 小程序端无 DOM 选择器和 MessageBox 组件，当前仅做兜底 Toast。
   * TODO: 锚定气泡逻辑 — 将 checkResultList 传给 ServiceMode，按 key 在对应列表项旁内联展示
   */
  const showCheckResult = (checkResult: CheckResultItem | null) => {
    const checkResultFnMap: Record<string, (content: string) => void> = {
      'productInfo.goodsType': openValidateKey,
    }
    if (!checkResult) return
    const { content, key } = checkResult
    const handler = checkResultFnMap[key]
    // 航空违禁品会在列表直接显示，不弹 toast
    if (!content || content.includes('航空违禁品')) return
    if (handler) {
      handler(content)
    } else {
      Taro.showToast({ title: content, icon: 'none', duration: 3000 })
    }
  }

  /**
   * 查询运费时效
   * 验证码逻辑与 netc-h5-order-old 完全一致：
   * 1. 校验寄收地址 → 发起查询请求（首次 captchaVerifyParam 为空）
   * 2. 若接口返回验证码状态码 → 弹出验证码获取 CaptchaParam
   * 3. 用户关闭验证码则静默返回
   * 4. 验证通过则携带 captchaVerifyParam 递归调用自身
   *
   * @param captchaRef - 验证码组件实例
   * @param captchaVerifyParam - 验证码参数（递归调用时传入）
   */
  async function handleSearch(
    captchaRef?: InstanceType<typeof TCaptcha>,
    captchaVerifyParam?: CaptchaParam,
  ): Promise<void> {
    // 关闭托寄物联想框
    setLinkContentVisible(false)
    
    if (!sendAddress.value.fullAddress) {
      Taro.showToast({ title: '请填写寄件地址', icon: 'none', duration: 2000 })
      return
    }
    if (!receiveAddress.value.fullAddress) {
      Taro.showToast({ title: '请填写收件地址', icon: 'none', duration: 2000 })
      return
    }

    // 重量校验
    if (!useActualWeightValidate()) {
      return
    }

    store.setQueryLoading(true)
    try {
      const { data, code } = await createSearchRequest(captchaVerifyParam)

      // 需要弹验证码弹窗（与 netc-h5-order-old 的 code === 395005 逻辑一致）
      if (code === HttpCode.FREIGHTTIMECAPTCHA) {
        if (!captchaRef) return
        const captchaInfo = await showCaptchaDialog(captchaRef)
        // 用户关闭验证码，静默返回
        if (!captchaInfo) return
        // 验证码通过，携带 captchaVerifyParam 重新发起请求
        handleSearch(captchaRef, captchaInfo)
        return
      }

      if (data) {
        store.setQueryResult(data.serviceModeResponse?.serviceTypes || [])
        store.setBindCustomerStatus(data.bindCustomerStatus || '')
        store.setRestrictResult(data.restrictResult || null)
        store.setOnlineCustomerInfo(data.timeLimitConstResponse?.onlineCustomerInfo || null)
        store.setSendCouponResult(data.sendCouponResult || {})
        store.setCheckResultList(data.checkResultList || [])
        // 清除运费时效优惠券角标
        if (!store.getShowSearchBtnBadge) {
          store.setCouponList(
            store.getCouponList.filter((item) => item.receiveSource !== CouponReceiveSource.新客查询时效送券),
          )
        }
        store.setShowSearchBtnBadge(false)
        // 查询结果更新完毕，通知页面做后续处理（如滚动定位）
        onQueryDone?.()
        // 管控数据提示（对齐 netc-h5-order-old showCheckResult，小程序端简化为 Toast）
        showCheckResult(data.checkResultList?.[0] || null)
        store.setHasSearched(true)
      }
    } catch (error) {
      store.setHasSearched(true)
      store.setQueryResult([])
      store.setBindCustomerStatus('')
      store.setRestrictResult(null)
      store.setOnlineCustomerInfo(null)
      store.setSendCouponResult({})
      store.setCheckResultList([])
    } finally {
      other_freight_query_v1({
        page_code: 'page_freight_query',
        sender_address: sendAddress.value.fullAddress || '',
        receive_address: receiveAddress.value.fullAddress || '',
        goods_time: store.getGoodsTime.goodsTimeFlag === GoodsTimeFlag.NOW ? '现在货好' : (store.getGoodsTime.goodsTime || ''),
        fill_goodsname: store.getProductInfo.goodsType || '',
        number_weight: store.getProductInfo.actualWeight || '',
        number_volume: store.getProductInfo.volumeSize || '',
        number_size: (store.getProductInfo.preWaybillGoodsSizeList || []).map((item) => `${item.length}, ${item.width}, ${item.height}, ${item.count}`).join(';'),
        packaging_services: store.getAddedService.woodenFrame || '',
      })
      store.setQueryLoading(false)
    }
  }

  const handleReset = () => {
    store.reset()
    // 清除托寄物校验气泡
    closeGoodsTypeValidateKey()
    // 关闭托寄物联想框
    setLinkContentVisible(false)
    // 清除重量校验气泡
    closeActualWeightValidateKey()
    // 清除重量校验气泡
    closeActualWeightValidateKey()
    // 清除包装服务的值
    packageServiceReset()
    // 清空地址信息
    resetAdressData()
  }

  return {
    handleSearch,
    handleReset,
    onCaptchaGetCode,
    onCaptchaClose,
  }
}
