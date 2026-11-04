import localValidateField from '@order-public-sub-public/validate/localValidateField'
import useEffect from '@order-public-sub-public/validate'

import { OverAreaDelivery, localCheckResult } from '@order-public-sub-public/types'
import { ModuleType } from '@order-public-sub-public/constants'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

type FieldKey = 'deliveryMode'
interface ValidationMap {
  [key: string]: {
    value: string
    rules: { rule: RegExp; errorMessage: string }[]
  }
}

const validateRules = {
  deliveryMode: [
    {
      // rule: notEmpty,
      rule: /^(?!null$|undefined$|^$).*$/,
      errorMessage: '请选择收货方式',
    },
  ],
}

const useValidate = () => {
  const { effectBubble, remoteCheck } = useEffect()

  const validateField = async (field: FieldKey): Promise<localCheckResult> => {
    const visible = piniaStore.globalData.dynamicConfig('overAreaDelivery')?.visible
    if (!visible) {
      return {
        key: 'overAreaDelivery.deliveryMode',
        passed: true,
        content: '',
        bubbleConfig: {
          placement: 'top-end',
        },
      }
    } else {
      const validationMap: ValidationMap = {
        deliveryMode: {
          value: piniaStore.order.moduleFormData(ModuleType.超区派送)?.deliveryMode as string,
          rules: validateRules.deliveryMode,
        },
      }

      const { value, rules } = validationMap[field]
      const result = await localValidateField(`overAreaDelivery.${field}`, value, rules, {
        placement: 'top-end',
      })

      console.log('validateField', result, value, rules)

      return localValidateField(`overAreaDelivery.${field}`, value, rules, {
        placement: 'top-end',
      })
    }
  }

  const validateCollection = () => {
    const validatePromises = [validateField('deliveryMode')]
    return Promise.all(validatePromises)
  }

  const confirmValidateCollection = async () => {
    const result = await validateCollection()
    try {
      // 触发副作用
      await effectBubble(result)
      // 远程校验
      await remoteCheck('overAreaDelivery.deliveryMode')
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
