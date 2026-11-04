import localValidateField from '@order-public-sub-public/validate/localValidateField'
import useEffect from '@order-public-sub-public/validate'

import { BranchSelfPickUp, BranchSelfPickUpConfig, localCheckResult } from '@order-public-sub-public/types'
import { CommonDynamicItem } from '@order-public-sub-public/apis/types'
import { ModuleType } from '@order-public-sub-public/constants'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()
type FieldKey = 'selfPickBranchId'
interface ValidationMap {
  [key: string]: {
    value: string
    rules: { rule: RegExp; errorMessage: string }[]
  }
}

const validateRules = {
  selfPickBranchId: [
    {
      rule: /^(?!null$|undefined$|^$).*$/,
      errorMessage: '请选择网点自提',
    },
  ],
}

const useValidate = () => {
  const { effectBubble, remoteCheck } = useEffect()
  const validateField = async (field: FieldKey): Promise<localCheckResult> => {
    const moduleConfig = piniaStore.schema.moduleConfigData(ModuleType['网点自提'])
    console.log('网点自提校验...', moduleConfig)
    // const visible = piniaStore.schema.moduleConfigData(ModuleType['网点自提'])?.visible
    const visible = piniaStore.globalData.dynamicConfig('branchSelfPickUp')?.visible
    const fieldsConfig = (moduleConfig as BranchSelfPickUpConfig)?.fieldsConfig || []

    let required = false
    const targetItem = fieldsConfig.find((item) => item.name === 'selfPickupBranch')
    if (targetItem) {
      required = targetItem.required || false
    } else {
      required = false
    }

    if (visible && required) {
      const validationMap: ValidationMap = {
        selfPickBranchId: {
          value: piniaStore.order.moduleFormData('BranchSelfPickUp')?.selfPickBranchId as string,
          rules: validateRules.selfPickBranchId,
        },
      }

      const { value, rules } = validationMap[field]
      return localValidateField(`branchSelfPickUp.${field}`, value, rules, {
        placement: 'top-end',
      })
    } else {
      return {
        key: 'branchSelfPickUp.selfPickBranchId',
        passed: true,
        content: '',
        bubbleConfig: {
          placement: 'top-end',
        },
      }
    }
  }

  const validateCollection = () => {
    const validatePromises = [validateField('selfPickBranchId')]
    return Promise.all(validatePromises)
  }

  const confirmValidateCollection = async () => {
    const result = await validateCollection()
    try {
      // 触发副作用
      await effectBubble(result)
      // 远程校验
      await remoteCheck('branchSelfPickUp.selfPickBranchId')
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
