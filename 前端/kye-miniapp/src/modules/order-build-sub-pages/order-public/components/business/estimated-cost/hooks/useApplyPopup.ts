import { ref, computed, watch } from 'vue'
import { showToast } from '@order-public-sub-public/hooks/useShowToast'
import { useStore } from '@order-public-sub-public/store'
import { getEstimatedCostPermission } from '@order-public-sub-public/apis/waybill/estimated-cost'
import { ModuleType, FeeAuthApplyStatus, OrderPageType } from '@order-public-sub-public/constants'
import { orderBatch, orderBatchWaybill } from './data'
import { EstimatedCostDimension } from '@order-public-sub-public/types'
import { estimatedCostItem } from '@order-public-sub-public/apis/types'
import umpOtherReport from '@order-public-sub-public/reportUmp/sceneReport/umpotherReport'
const piniaStore = useStore()

const getApplyDescStr = (status?: number) => {
  let str = ''
  switch (status) {
    case FeeAuthApplyStatus.申请查看:
      str = '点我申请'
      break
    case FeeAuthApplyStatus.申请中:
      str = '权限申请中'
      break
    case FeeAuthApplyStatus.申请失败:
      str = '申请失败'
      break
  }
  return str
}
const getFooterText = (status?: number) => {
  let str = '确定'
  switch (status) {
    case FeeAuthApplyStatus.申请中:
    case FeeAuthApplyStatus.申请失败:
      str = '我知道了'
      break
  }
  return str
}

/**
 * 这里只更新申请中状态
 * @param inputValue
 * @param orderPageType
 */
const updateEstimatedCost = (inputValue: string, orderPageType?: OrderPageType) => {
  const config = piniaStore.globalData.dynamicConfig('estimatedCost', '', orderPageType) as estimatedCostItem
  piniaStore.globalData.setDynamicConfigItem({
    configItem: {
      key: 'estimatedCost',
      value: {
        ...config,
        estimatedCostResponse: {
          ...config.estimatedCostResponse,
          status: FeeAuthApplyStatus.申请中,
          applyReason: inputValue,
          applyTime: getCurrentDate(),
        },
      } as estimatedCostItem,
    },
    orderPageType,
  })
}

const updateStore = (inputValue: string) => {
  if (orderBatch.value || orderBatchWaybill.value) {
    updateEstimatedCost(inputValue)
    if (orderBatchWaybill.value) {
      // 单调的需要同步到批量填单页
      updateEstimatedCost(inputValue, OrderPageType.批量寄)
    }
  } else {
    // 更新预估运费描述业务组件维度数据 // todo mutation替换
    piniaStore.schema.updateModuleDimensionByType({
      type: ModuleType['预估费用'],
      data: { status: FeeAuthApplyStatus.申请中, applyReason: inputValue, applyTime: getCurrentDate() },
    })
  }
}
// eslint-disable-next-line max-lines-per-function
export default function useApplyPopUp() {
  //预估运费业务数据
  const data = computed(() => {
    if (orderBatch.value || orderBatchWaybill.value) {
      // bug#448759 中途改权限也要同步显示
      return (piniaStore.globalData.dynamicConfig('estimatedCost') as estimatedCostItem)?.estimatedCostResponse
    } else {
      return piniaStore.schema.moduleDimensionData(ModuleType['预估费用'])
    }
  })
  const inputValue = ref('') //文本域输入值
  const modalShow = ref(false)
  const applyDesc = computed(() => {
    const str = getApplyDescStr(data.value?.status)
    return str
  })
  const footerText = computed(() => {
    return getFooterText(data.value?.status)
  })
  const textDisable = computed(() => (data.value?.status === FeeAuthApplyStatus.申请中 ? true : false))
  watch(
    () => data.value?.applyReason,
    () => {
      if (data.value?.applyReason) {
        inputValue.value = data.value?.applyReason
      }
    },
  )
  // eslint-disable-next-line max-lines-per-function
  const onConfirm = () => {
    if (data.value?.status === FeeAuthApplyStatus.申请查看) {
      if (!inputValue.value) {
        showToast('请输入申请原因')
        umpOtherReport(
          'OTHER',
          {
            eventCode: 'other_express_cost_application_confirm_v1',
            regionCode: 'fare',
          },
          {
            request_result: '失败',
            failure_reason: '申请理由不能为空',
            content: inputValue.value,
          },
        )
        return
      }
      getEstimatedCostPermission({
        authCodes: ['freightLookAuthFlag'],
        applyReason: inputValue.value,
        operationSource: '20', // 来源-移动端, 后端要求,暂时写死-
      })
        .then((res) => {
          if (res.code === 0) {
            updateStore(inputValue.value)
            showToast('提交成功，已为您通知审批人')
            umpOtherReport(
              'OTHER',
              {
                eventCode: 'other_express_cost_application_confirm_v1',
                regionCode: 'fare',
              },
              {
                request_result: '成功',
                failure_reason: '',
                content: inputValue.value,
              },
            )
            modalShow.value = false
          } else if (res.msg && res.code === 80000) {
            umpOtherReport(
              'OTHER',
              {
                eventCode: 'other_express_cost_application_confirm_v1',
                regionCode: 'fare',
              },
              {
                request_result: '失败',
                failure_reason: res.msg,
                content: inputValue.value,
              },
            )
            showToast(res.msg)
          }
        })
        .catch((err) => {
          console.log('error', err)
          if (err?.msg && err?.code === 80000) {
            showToast(err.msg)
          } else {
            showToast('申请失败，请重新提交')
          }
          umpOtherReport(
            'OTHER',
            {
              eventCode: 'other_express_cost_application_confirm_v1',
              regionCode: 'fare',
            },
            {
              request_result: '失败',
              failure_reason: err,
              content: inputValue.value,
            },
          )
          console.log('error')
          showToast('申请失败，请重新提交')
        })
    }
    modalShow.value = false
  }
  const onClose = () => {
    modalShow.value = false
  }
  const showApplyModal = () => {
    modalShow.value = true
  }
  const feeAuthApplyFailed = computed(() => {
    return data.value?.status === FeeAuthApplyStatus.申请失败
  })
  return {
    applyData: data,
    inputValue,
    modalShow,
    onClose,
    onConfirm,
    showApplyModal,
    applyDesc,
    footerText,
    textDisable,
    feeAuthApplyFailed,
  }
}

export const getCurrentDate = () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = ('0' + (date.getMonth() + 1)).slice(-2)
  const day = ('0' + date.getDate()).slice(-2)
  const formattedDate = year + '-' + month + '-' + day
  return formattedDate
}
