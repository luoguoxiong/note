import localValidateField from '@order-public-sub-public/validate/localValidateField'
import useEffect from '@order-public-sub-public/validate'
import { Module, WaybillRemark, localCheckResult } from '@order-public-sub-public/types'
import { ModuleType, OrderPageType } from '@order-public-sub-public/constants'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

type FieldKey = 'waybillRemark'
interface ValidationMap {
  [key: string]: {
    value: string
    rules: { rule: RegExp; errorMessage: string }[]
  }
}

const validateRules = {
  waybillRemark: [
    {
      rule: /(?:^|\n)(?!\s*$)(?!null$)(?!undefined$).+?(?:\n|$)/,
      errorMessage: '请填写运单备注',
    },
  ],
}

const useValidate = () => {
  const { effectBubble, remoteCheck } = useEffect()

  const validateField = async (field: FieldKey): Promise<localCheckResult> => {
    const waybillRemark = piniaStore.order.moduleFormData(ModuleType.运单备注)
    const config = piniaStore.schema.moduleConfigData(ModuleType.运单备注, true)
    const required = config.required
    console.log('remark required', required)
    if (required) {
      const validationMap: ValidationMap = {
        waybillRemark: {
          value: waybillRemark?.waybillRemark as unknown as string,
          rules: validateRules.waybillRemark,
        },
      }

      const { value, rules } = validationMap[field]
      const result = await localValidateField(`waybillRemark`, value, rules, {
        placement: 'top-end',
      })

      console.log('validateField', result, value, rules)

      return localValidateField(`waybillRemark`, value, rules, {
        placement: 'top-end',
      })
    } else {
      return {
        key: 'waybillRemark',
        passed: true,
        content: '',
        bubbleConfig: {
          placement: 'top-end',
        },
      }
    }
  }

  const validateCollection = () => {
    const orderPageType = piniaStore.root.getOrderPageType
    if (orderPageType !== OrderPageType.批量寄) {
      const validatePromises = [validateField('waybillRemark')]
      return Promise.all(validatePromises)
    } else {
      return Promise.all([])
    }
  }

  const confirmValidateCollection = async () => {
    const result = await validateCollection()
    try {
      // 触发副作用
      await effectBubble(result)
      // 远程校验
      await remoteCheck('waybillRemark')
    } catch (error) {
      console.log('error', error)
    }
  }

  return {
    validateField,
    validateCollection,
    confirmValidateCollection,
  }
}

export { useValidate }
