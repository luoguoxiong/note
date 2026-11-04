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
  // 单个校验
  const validateField = async (field: FieldKey): Promise<localCheckResult> => {
    const goodsTime = piniaStore.order.moduleFormData(ModuleType.货好时间)
    const validationMap: ValidationMap = {
      goodsTime: { value: (goodsTime?.goodsTime as string) || '', rules: validateRules.goodsTime },
      goodsTimeFlag: {
        value: (goodsTime?.goodsTimeFlag as string) || '',
        rules: validateRules?.goodsTimeFlag,
      },
    }
    const { value, rules } = validationMap[field]
    return localValidateField(`goodsTime.${field}`, value, rules)
  }

  // 多个校验
  const batchCheck = async (): Promise<localCheckResult[]> => {
    const validationPromises = [validateField('goodsTime'), validateField('goodsTimeFlag')]
    return Promise.all(validationPromises)
  }

  // 合并结果
  const validateCollection = async (): Promise<localCheckResult[]> => {
    // 如果是批量寄单条，不需要校验
    const orderPageType = piniaStore.root.getOrderPageType
    if (orderPageType === OrderPageType.批量寄单票) {
      return [{ key: 'goodsTime.goodsTime', passed: true, content: '' }]
    }
    const configData =
      piniaStore.globalData.dynamicConfig('goodsTime') ||
      piniaStore.schema.moduleConfigData(ModuleType['货好时间'], true)
    console.log('货好时间本地校验数据:', configData)
    // 如果隐藏了 || 不是必填项 则跳过校验
    if (!configData.visible || !configData.required) {
      return [{ key: 'goodsTime.goodsTime', passed: true, content: '' }]
    }
    const validateResult = await batchCheck()

    const result = validateResult[0].passed || validateResult[1].passed
    console.log('货好时间本地校验结果：passed：', result)
    return [
      {
        key: 'goodsTime.goodsTime',
        passed: result,
        content: `请选择${timeName.value}`,
        bubbleConfig: {
          placement: 'top-end',
        },
      },
    ]
  }

  const confirmValidateCollection = async () => {
    try {
      // 远程校验
      await remoteCheck('goodsTime.goodsTime')
      const goodsTime = piniaStore.order.moduleFormData(ModuleType.货好时间)
      // 发布事件
      emitName({
        goodsTime: goodsTime.goodsTime,
        goodsTimeFlag: goodsTime.goodsTimeFlag,
      })
    } catch (error) {
      console.log('error', error)
    }
  }

  return {
    validateField,
    batchCheck,
    confirmValidateCollection,
    validateCollection,
  }
}
