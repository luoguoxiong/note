import { GoodsTime, localCheckResult, Module } from '@order-public-sub-public/types'
import { ModuleType, OrderPageType } from '@order-public-sub-public/constants'
import { timeName } from '@order-public-sub-public/components/business/goods-time/hooks/returnWaybill'
import localValidateField from '@order-public-sub-public/validate/localValidateField'
import validateRules from '../config/validateRules'
import useEmit from './useEmit'
import useEffect from '@order-public-sub-public/validate'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

interface ValidationMap {
  [key: string]: {
    value: string
    rules: { rule: RegExp; errorMessage: string }[]
  }
}

type FieldKey = 'goodsTime' | 'goodsTimeFlag'

export const useValidate = () => {
  const { emitName } = useEmit()
  const { remoteCheck } = useEffect()

  // 验证单个字段
  const validateSingleField = async (field: FieldKey): Promise<localCheckResult> => {
    const goodsTimeData = piniaStore.order.moduleFormData(ModuleType.货好时间)
    const validationDetails: ValidationMap = {
      goodsTime: { value: goodsTimeData?.goodsTime || '', rules: validateRules.goodsTime },
      goodsTimeFlag: { value: (goodsTimeData?.goodsTimeFlag as string) || '', rules: validateRules.goodsTimeFlag },
    }
    const { value, rules } = validationDetails[field]
    return localValidateField(`goodsTime.${field}`, value, rules)
  }

  // 批量验证
  const batchValidation = async (): Promise<localCheckResult[]> =>
    Promise.all([validateSingleField('goodsTime'), validateSingleField('goodsTimeFlag')])

  // 综合验证
  const compositeValidation = async (): Promise<localCheckResult[]> => {
    if (piniaStore.root.getOrderPageType === OrderPageType.批量寄单票) {
      return [{ key: 'goodsTime.goodsTime', passed: true, content: '' }]
    }
    const configData =
      piniaStore.globalData.dynamicConfig('goodsTime') ||
      piniaStore.schema.moduleConfigData(ModuleType['货好时间'], true)
    console.log('货好时间本地校验数据:', configData)

    if (!configData.visible || !configData.required) {
      return [{ key: 'goodsTime.goodsTime', passed: true, content: '' }]
    }

    const results = await batchValidation()
    const passed = results.every((result) => result.passed)
    console.log('货好时间本地校验结果：passed：', passed)

    return [
      {
        key: 'goodsTime.goodsTime',
        passed,
        content: `请选择${timeName.value}`,
        bubbleConfig: { placement: 'top-end' },
      },
    ]
  }

  const confirmCompositeValidation = async () => {
    try {
      await remoteCheck('goodsTime.goodsTime')
      const goodsTime = piniaStore.order.moduleFormData(ModuleType.货好时间)
      emitName({
        goodsTime: goodsTime.goodsTime,
        goodsTimeFlag: goodsTime.goodsTimeFlag,
      })
    } catch (error) {
      console.error('远程校验失败:', error)
    }
  }

  return {
    validateField: validateSingleField,
    batchCheck: batchValidation,
    confirmValidateCollection: confirmCompositeValidation,
    validateCollection: compositeValidation,
  }
}
