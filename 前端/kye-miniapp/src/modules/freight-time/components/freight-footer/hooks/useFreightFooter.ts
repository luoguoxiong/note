import { computed } from 'vue'
import Taro from '@tarojs/taro'
import { storeToRefs } from 'pinia'
import { useFreightTimeStore } from '../../../store/index'
import { useUserGlobalStore } from '@/store/user'
import { ApplicationCodeMap } from '@public/utils/application/constants'
import { useApplication } from '@/public/utils/application/useApplication'
import { CustomerStatus, FeeAuthApplyStatus, CouponReceiveSource, ChannelScene, FREIGHT_TO_ORDER_PARAMS } from '../../../constants'
import { preloadFreightTimeToOrder, saveFreightTimeOrderData } from '../../../api/index'
import { getPlatformSource } from '../../../utils'
import { getSendAddress, getReceiveAddress } from '../../../components/sendAndReceive/hooks/useState'
import type { FreightTimeOrderInfo } from '../../../types'
import { clk_freight_enterprise_v1 } from '@freight-time/report'

export function useFreightFooter() {
  const ftStore = useFreightTimeStore()
  const userStore = useUserGlobalStore()
  const { navigateApplicationWithCode } = useApplication()
  // 从 store 响应式读取，跟随 handleSearch 中 setBindCustomerStatus 的变化
  const { bindCustomerStatus } = storeToRefs(ftStore)
  const bindStatusNum = computed(() => +bindCustomerStatus.value)
  const hasCustomerCode = computed(() => !!userStore.customerCode)

  // ========== 状态计算 ==========
  // showFooter 已保证 getQueryResult.length > 0，此时 bindCustomerStatus 必然已由查询接口设置，
  // 因此各面板无需额外 hasStatus 守卫（对齐 netc-h5-order-old 的写法）

  const isNewCustomerWithAuth = computed(
    () => ftStore.getIsNewCustomer && !hasCustomerCode.value && ftStore.getResourceFlag
  )
  const isNewCustomerNoAuth = computed(
    () => ftStore.getIsNewCustomer && !hasCustomerCode.value && !ftStore.getResourceFlag
  )

  const showBindCodePanel = computed(
    () => !hasCustomerCode.value || bindStatusNum.value === CustomerStatus.REJECTED
  )
  const showApplyPanel = computed(
    () => bindStatusNum.value === CustomerStatus.PENDING
  )
  const showApplyingPanel = computed(
    () => bindStatusNum.value === CustomerStatus.APPLYING
  )
  const showSendPanel = computed(
    () => [CustomerStatus.APPROVED, CustomerStatus.SHIPPED].includes(bindStatusNum.value)
  )

  /** 权限申请状态：由 bindCustomerStatus 推导（申请失败需由 store/API 额外提供） */
  const feeAuthApplyStatus = computed(() => {
    if (bindStatusNum.value === CustomerStatus.APPLYING) return FeeAuthApplyStatus.申请中
    return FeeAuthApplyStatus.申请查看
  })

  // 对齐 netc-h5-order-old：result.length > 0 即查询有结果才展示 footer
  const showFooter = computed(
    () => ftStore.getQueryResult.length > 0
  )

  // ========== 按钮逻辑 ==========
  const handleBindCode = () => {
    const { areaCode, menuCode } = ApplicationCodeMap['绑码组件']
    navigateApplicationWithCode({
      areaCode,
      menuCode,
      queryParams: { express_type: '运费时效' },
    })
  }

  const handleContactBiz = () => {
    ftStore.setShowContactPopup(true)
  }

  const handleUnlockPrice = () => {
    clk_freight_enterprise_v1({ page_code: 'page_freight_query' })
    const { areaCode, menuCode } = ApplicationCodeMap['首页-申请专属商务']
    const queryParams: { express_type: string; receiveSource?: string; activityId?: string; couponCount?: string } = {
      express_type: '运费时效',
      backSence: 10
    }

    // 如果有留资优惠券，传入优惠券参数
    const authCoupon = ftStore.authCoupon
    if (authCoupon) {
      queryParams.receiveSource = CouponReceiveSource.新客留资送券
      queryParams.activityId = authCoupon.activityId
      queryParams.couponCount = authCoupon.couponCount
    }

    navigateApplicationWithCode({
      areaCode,
      menuCode,
      queryParams,
    })
  }

  /**
   * 去寄件：将运费时效页面的查询条件缓存到服务端，再跳转到下单页
   * 对齐 H5 handleJumpSend 逻辑：
   * 1. preloadFreightTimeToOrder → web.order.init.quickOrder.singlePageV2 (channelScene=10)
   * 2. saveFreightTimeOrderData → web.order.configOrder.costTimeLines.dataReport
   * 3. navigate → sourcePage=freightTime&sourceAction=toOrder
   *
   * 下单页 getChannelScene 检测 sourcePage=freightTime → 自动设 channelScene=10 → getConfig 回填数据
   *
   * 新逻辑：无论有无绑码，只要查询结果不为空即可去寄件；
   * 上报字段新增寄收件公司、联系人、手机号、固话
   */
  async function handleGoSend(): Promise<void> {
    if (ftStore.getGoSendLoading) return
    ftStore.setGoSendLoading(true)
    try {
      const source = getPlatformSource()
      const sendAddress = getSendAddress()
      const receiveAddress = getReceiveAddress()

      const orderInfo: FreightTimeOrderInfo = {
        sender: {
          ...sendAddress.value,
        },
        receive: {
          ...receiveAddress.value,
        },
        ...ftStore.goodsTime,
        productInfo: ftStore.productInfo,
        addedService: ftStore.addedService,
      }

      // 对齐 H5: Promise.all([onGetSinglePageV2(params), saveDataReport(reportParams)])
      await Promise.all([
        preloadFreightTimeToOrder({ source, channelScene: ChannelScene.运费时效 }),
        saveFreightTimeOrderData(orderInfo),
      ])
    } catch (error) {
      console.error('去寄件 - 缓存运费时效数据失败', error)
    } finally {
      ftStore.setGoSendLoading(false)
    }

    Taro.navigateTo({
      url: `/modules/order-build/pages/order/index?sourcePage=${FREIGHT_TO_ORDER_PARAMS.sourcePage}&sourceAction=${FREIGHT_TO_ORDER_PARAMS.sourceAction}`,
    })
  }

  return {
    bindCustomerStatus,
    isNewCustomerWithAuth,
    isNewCustomerNoAuth,
    showBindCodePanel,
    showApplyPanel,
    showApplyingPanel,
    showSendPanel,
    showFooter,
    feeAuthApplyStatus,
    handleBindCode,
    handleContactBiz,
    handleUnlockPrice,
    handleGoSend,
  }
}
