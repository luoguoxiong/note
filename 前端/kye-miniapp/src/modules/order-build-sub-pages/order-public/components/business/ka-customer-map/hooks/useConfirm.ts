import { ModuleStyle, ModuleType, YesOrNoString } from '@order-public-sub-public/constants'
import { kaCustomerMapItem, localCheckResult } from '@order-public-sub-public/types'
import useEffect from '@order-public-sub-public/validate'
import { loading } from '@order-public-sub-public/components/business/ka-customer-map/page/custom-encode/hooks/status'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()
import { useProductCodeValidate } from '@order-public-sub-public/components/business/ka-customer-map/page/custom-encode/components/inbound-order-number/hooks/useValidate'
import umpOtherReport from '@order-public-sub-public/reportUmp/sceneReport/umpotherReport'
/**
 * @description 拓展类型
 */
export enum KaFieldType {
  'tag' = 1,
}
/**
 * @description PO编码
 */
export enum KaFieldPoType {
  'PO' = '50',
}

const { productCodeValidate } = useProductCodeValidate()

const checkHandel = (item: kaCustomerMapItem) => {
  if (!item.requiredStatus) {
    return true
  } else {
    if (item.customerFieldValue?.trim()) {
      return true
    } else {
      return false
    }
  }
}

// 校验编码数据
const validateCollection = async (): Promise<localCheckResult[]> => {
  const data = piniaStore.extend.kaCustomerMap
  const defData: localCheckResult[] = []
  const validationPromises = data.reduce((pev, cur) => {
    const isPassed = checkHandel(cur)
    const filedName = cur.customerFieldName ? cur.customerFieldName : '自定义编码'
    const content = cur?.isSelectFlag === KaFieldType.tag ? `请选择${filedName}` : `请输入${filedName}`
    pev.push({
      key: `kaCustomerMap.customerFieldValue.${cur.kyField}`,
      passed: isPassed,
      content: content,
      bubbleConfig: {
        placement: cur?.isSelectFlag === KaFieldType.tag ? 'bottom-start' : 'bottom-start',
        offset: cur?.isSelectFlag === KaFieldType.tag ? [0, 10] : [15, 10],
      },
    })
    if (cur?.kaTypeFlag === YesOrNoString.YES && cur?.kyField === '220') {
      pev.push(productCodeValidate())
    }
    return pev
  }, defData)
  return Promise.all(validationPromises)
}

/**
 * 确认逻辑
 *  校验结果
 *      校验成功--存储数据，调用回调
 *      校验失败--气泡提示，阻断存储及回调
 * @param backFunc 确认成功后的回调
 */
export const submit = async (backFunc: () => void) => {
  loading.value = true

  const { effectBubble, remoteCheck } = useEffect()
  const result = await validateCollection()
  const noPassedList = result.filter((item) => item.passed === false)
  try {
    await effectBubble(result)
  } catch (error) {
    console.log('error', error)
    loading.value = false
  }

  if (noPassedList.length) {
    return
  }

  const kaCustomerMap = piniaStore.extend.kaCustomerMap

  const defaultSubData: Array<kaCustomerMapItem> = []
  const submitData = kaCustomerMap.reduce((per, cur: kaCustomerMapItem) => {
    per.push({
      customerFieldName: cur.customerFieldName,
      customerFieldValue: cur.customerFieldValue,
      kyField: cur.kyField,
      editable: cur.editable || false,
    })
    return per
  }, defaultSubData)

  try {
    await remoteCheck('kaCustomerMap', { kaCustomerMap }, ModuleStyle.跳转)
  } catch (error) {
    console.log('error', error)
    loading.value = false
    return
  }

  piniaStore.order.updateOrderByType({ type: ModuleType['自定义编码'], data: submitData })

  umpOtherReport(
    'OTHER',
    { eventCode: 'other_express_single_custom_encoding_v1' },
    { customize: submitData.map((v) => v.customerFieldValue).join(','), request_result: '成功', failure_reason: '' },
  )
  backFunc()
}
