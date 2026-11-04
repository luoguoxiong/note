import { ref, computed, toRef } from 'vue'
import Taro from '@tarojs/taro'
import { useUserGlobalStore } from '@/store/user'
import { openURL } from '@/modules/webview/utils'
import type {
  ServiceType,
  RestrictResult,
  OnlineCustomerInfo,
  EstimationFee,
  SortOrder,
} from '../../../types'
import { CustomerStatus } from '../../../constants'

/** 服务方式限制标识 */
const RESTRICT_FLAG_DISABLED = '10'

/** 费用格式化相关路径常量 */
const AIR_CONTRABAND_URL = '/modules/order-build-sub-pages/pages/air-contraband/index?type=consignment'
const ONLINE_SERVICE_URL = '/modules/webview/pages/online-service/index'
const FEEDBACK_URL = '/netc-h5-tools-optimize/function-feedback/function-feedback.html#/feedback-home'

// ========== estimationFee 构造 ==========

function buildEstimationFee(item: ServiceType): EstimationFee {
  const waybillAmount = parseFloat(item.estimateFee) || 0
  const woodenFrameFee = parseFloat(item.addedValueDetail?.woodenFrameFee || '0') || 0

  return {
    waybillAmount,
    addedValueAmount: woodenFrameFee,
    totalAmount: parseFloat(item.estimateTotalFee) || 0,
    feeFormula: item.feeFormula || {},
    prompt: item.prompt || {},
    addedValueDetailTipList: woodenFrameFee > 0
      ? [{ sortId: 1, feeName: '木架费', feeTips: '', feeAmount: woodenFrameFee, type: 1 }]
      : [],
  }
}

type SortField = 'time' | 'fee' | null

interface UseServiceModeProps {
  result: ServiceType[]
  freightStatus: string
  restrictResult?: RestrictResult | null
  onlineCustomerInfo?: OnlineCustomerInfo | null
}

export function useServiceMode(props: UseServiceModeProps) {
  const userStore = useUserGlobalStore()
  const result = toRef(props, 'result')
  const freightStatus = toRef(props, 'freightStatus')
  const hasCustomerCode = computed(() => !!userStore.customerCode)

  const sortField = ref<SortField>(null)
  const sortOrder = ref<SortOrder>('desc')

  // ========== 权限判断 ==========

  const feePermission = computed(() =>
    [String(CustomerStatus.APPROVED), String(CustomerStatus.SHIPPED)].includes(freightStatus.value)
  )

  const showFeeSort = computed(
    () => feePermission.value && hasCustomerCode.value
  )

  // ========== 排序（互斥） ==========

  const sortTimeClass = computed(() => {
    if (sortField.value !== 'time') return ''
    return sortOrder.value === 'asc' ? 'ascending' : 'descending'
  })

  const sortFeeClass = computed(() => {
    if (sortField.value !== 'fee') return ''
    return sortOrder.value === 'asc' ? 'ascending' : 'descending'
  })

  const handleSortTime = () => {
    sortField.value = 'time'
    sortOrder.value = sortField.value === 'time' && sortOrder.value === 'asc' ? 'desc' : 'asc'
  }

  const handleSortFee = () => {
    sortField.value = 'fee'
    sortOrder.value = sortField.value === 'fee' && sortOrder.value === 'asc' ? 'desc' : 'asc'
  }

  const sortedList = computed(() => {
    const list = [...result.value]
    if (sortField.value === 'time') {
      return sortByTime(list, sortOrder.value)
    }
    if (sortField.value === 'fee') {
      return sortByFee(list, sortOrder.value)
    }
    return list
  })

  // ========== 费用格式化 ==========

  const formatFee = (fee: string): string => {
    if (!fee) return '--'
    const num = parseFloat(fee)
    if (isNaN(num)) return '--'
    return num.toFixed(2)
  }

  // ========== 交互 ==========

  const detailItem = ref<ServiceType | null>(null)

  const detailPopupProps = computed<{ estimationFee?: EstimationFee }>(() => {
    if (!detailItem.value) return {}
    return {
      estimationFee: buildEstimationFee(detailItem.value),
    }
  })

  const handleProhibited = () => {
    Taro.navigateTo({ url: AIR_CONTRABAND_URL })
  }

  const handleOnlineService = (message) => {
    Taro.navigateTo({ url: `${ONLINE_SERVICE_URL}?paramsNum=${message}&type=question` })
  }

  const handleFeedback = () => {
    openURL(FEEDBACK_URL, { needLogin: true })
  }

  return {
    sortField,
    sortOrder,
    sortTimeClass,
    sortFeeClass,
    feePermission,
    showFeeSort,
    sortedList,
    formatFee,
    hasCustomerCode,
    handleSortTime,
    handleSortFee,
    handleProhibited,
    handleOnlineService,
    handleFeedback,
    detailItem,
    detailPopupProps,
  }
}

// ========== 排序工具函数 ==========

function sortByTime(list: ServiceType[], order: SortOrder): ServiceType[] {
  return [...list].sort((a, b) => {
    const diff = new Date(a.estimateArriveTime).getTime() - new Date(b.estimateArriveTime).getTime()
    return order === 'asc' ? diff : -diff
  })
}

function sortByFee(list: ServiceType[], order: SortOrder): ServiceType[] {
  return [...list].sort((a, b) => {
    if (a.restrictFlag === RESTRICT_FLAG_DISABLED) return 1
    if (b.restrictFlag === RESTRICT_FLAG_DISABLED) return -1
    const aFee = parseFloat(a.estimateTotalFee)
    const bFee = parseFloat(b.estimateTotalFee)
    if (isNaN(bFee)) return -1
    if (isNaN(aFee)) return 1
    return order === 'asc' ? aFee - bFee : bFee - aFee
  })
}
