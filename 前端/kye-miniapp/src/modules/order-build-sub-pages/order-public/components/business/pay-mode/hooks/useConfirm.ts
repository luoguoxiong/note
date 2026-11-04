import { ModuleStyle, ModuleType } from '@order-public-sub-public/constants'
import { confirmData } from '../type'
import useEffect from '@order-public-sub-public/validate'
import useEmit from './useEmit'
import { performanceMark } from '@order-public-sub-public/utils/reportConfig'
import { ChangeKeys } from '@order-public-sub-public/types'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

export const submit = async (data: confirmData, backFunc: (isLoading?: string) => void, elementsChange?: string) => {
  performanceMark('payModeSubmitStart3')
  const dataParams = {
    payMode: data.payMode,
    paymentAccount: data.paymentAccount || '',
    paymentCustomerName: data.paymentCustomerName || '',
    paymentCustomerCode: data.paymentCustomerCode || '',
    authorizeStatus: data.authorizeStatus || 0,
    payAuthorizeConfirm: data.payAuthorizeConfirm,
  }

  // 副作用
  const { remoteCheck } = useEffect()
  try {
    performanceMark('payModeSubmitRequestStart4')
    // 远程校验
    await remoteCheck(
      elementsChange ? (elementsChange as ChangeKeys) : 'payMode',
      {
        payMode: dataParams,
      },
      ModuleStyle.弹窗,
    )

    performanceMark('payModeSubmitRequestEnd13')

    piniaStore.order.updateOrderByType({
      type: ModuleType['付款方式'],
      data: dataParams,
    })

    performanceMark('payModeSubmitRequestEndData14')
    useEmit().emitName(data.payMode)

    backFunc()
  } catch (error) {
    backFunc('loading')
    console.log('error', error)
  }
}

export const updatePayAuthorizeAction = (flag: string) => {
  piniaStore.order.updateOrderByType({
    type: ModuleType['付款方式'],
    data: {
      payAuthorizeConfirm: flag,
    },
  })
}
