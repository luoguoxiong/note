import { localCheckResult, Module, PayModeDimension, PayModeType } from '@order-public-sub-public/types'
import { PayMethod } from '@order-public-sub-public/types/moduleDimension'
import localValidateField from '@order-public-sub-public/validate/localValidateField'
import { ModuleType, OrderPageType, PayMode } from '@order-public-sub-public/constants'
import validateRules from '../config/validateRules'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

interface ValidationMap {
  [key: string]: {
    value: string
    rules: { rule: RegExp; errorMessage: string }[]
  }
}

type FieldKey = 'payMode'
const useValidate = () => {
  // 单个校验
  const validateField = async (field: FieldKey): Promise<localCheckResult> => {
    const payMethodList = piniaStore.schema.moduleDimensionData(ModuleType['付款方式'])?.payMethodList
    let isVisiable = false
    if (payMethodList?.length) {
      const visibleData = payMethodList.filter((item: PayMethod) => item.visible === true)
      if (visibleData.length) {
        isVisiable = true
      }
    }
    if (!isVisiable) {
      return {
        key: `payMode.${field}`,
        passed: true,
        content: '',
      }
    }

    const payMode = piniaStore.order.moduleFormData(ModuleType.付款方式)

    // 如果是第三方付需要校验账号
    if (payMode.payMode === PayMode.第三方付) {
      if (!payMode.paymentCustomerCode && !payMode.paymentAccount) {
        return {
          key: `payMode.${field}`,
          passed: false,
          content: '请填写付款账号',
          bubbleConfig: {
            placement: 'top-end',
          },
        }
      }
    }
    const validationMap: ValidationMap = {
      payMode: {
        value: payMode.payMode || ('' as string),
        rules: validateRules.payMode,
      },
    }

    const { value, rules } = validationMap[field]
    const checkResult = await localValidateField(`payMode.${field}`, value, rules)
    return Object.assign(checkResult, {
      bubbleConfig: {
        placement: 'top-end',
      },
    })
  }

  const validateCollection = async (): Promise<localCheckResult[]> => {
    const orderPageType = piniaStore.root.getOrderPageType

    if (orderPageType !== OrderPageType.批量寄) {
      const configData = piniaStore.schema.moduleConfigData(ModuleType['付款方式'], true)
      // 如果隐藏了 || 不是必填项 则跳过校验
      if (!configData.visible || !configData.required) {
        return [
          {
            key: 'payMode.payMode',
            passed: true,
            content: '',
          },
        ]
      }
      const fieldNames: FieldKey[] = ['payMode']
      const validationPromises = fieldNames.map((fieldName) => validateField(fieldName))
      return Promise.all(validationPromises)
    } else {
      return Promise.all([])
    }
  }

  return {
    validateField,
    validateCollection,
  }
}
export default useValidate
