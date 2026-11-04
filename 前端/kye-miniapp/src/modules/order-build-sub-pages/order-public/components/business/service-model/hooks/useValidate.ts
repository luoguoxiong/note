import validateRules from '../config/validateRules'
import localValidateField from '@order-public-sub-public/validate/localValidateField'
import { localCheckResult, popoverConfigType, ServiceModeType } from '@order-public-sub-public/types'
import { computed } from 'vue'
import { ModuleType } from '@order-public-sub-public/constants'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

interface ValidationMap {
  [key: string]: {
    value: string
    rules: { rule: RegExp; errorMessage: string }[]
    bubbleConfig: popoverConfigType
  }
}

type FieldKey = 'serviceMode'

const useValidate = () => {
  const serviceMode = computed(() => {
    const { serviceMode } = piniaStore.order.moduleFormData(ModuleType['服务方式']) || {}
    return serviceMode || ''
  })
  // 单个校验
  const validateField = async (field: FieldKey): Promise<localCheckResult> => {
    const validationMap: ValidationMap = {
      serviceMode: {
        value: serviceMode.value,
        rules: validateRules.serviceMode,
        bubbleConfig: {
          placement: 'top-end',
        },
      },
    }

    const { value, rules, bubbleConfig } = validationMap[field]
    return localValidateField(`serviceMode.${field}`, value, rules, bubbleConfig)
  }

  // 多个校验（对外）
  const validateCollection = async (): Promise<localCheckResult[]> => {
    const fieldNames: FieldKey[] = ['serviceMode']
    const validationPromises = fieldNames.map((fieldName) => validateField(fieldName))
    return Promise.all(validationPromises)
  }

  return {
    validateField,
    validateCollection,
  }
}

export default useValidate
