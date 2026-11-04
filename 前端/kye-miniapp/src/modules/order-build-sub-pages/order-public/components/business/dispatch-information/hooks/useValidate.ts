import validateRules from '../config/validateRules'
import localValidateField from '@order-public-sub-public/validate/localValidateField'
import { DispatchInformationConfig, DispatchInformationDimension, localCheckResult } from '@order-public-sub-public/types'
import { computed } from 'vue'

import { ModuleType } from '@order-public-sub-public/constants'
import { filterAllSpace } from '@order-public-sub-public/utils/pattern'
import { ValidationMap } from '@order-public-sub-public/components/business/pickup-information/types/types'
import { formDataType } from '@order-public-sub-public/components/business/dispatch-information/types/types'
import { isEmptyText } from '@order-public-sub-public/utils'
// import { isOrderPage } from '@order-public-sub-public/validate/utils'
import { isOrderPage } from '@order-public-sub-public/validate/utils'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()
export type FieldKey = 'deliveryData'

const useValidate = () => {
  //表单数据
  const storeFormData = computed(() => piniaStore.order.moduleFormData(ModuleType['派货资料']))
  //派货资料数量
  const uploadNum = computed(
    () => piniaStore.schema.moduleDimensionData(ModuleType['派货资料'])?.uploadNum,
  )

  //获取校验规则，区分必填和默认
  const getRule = (value: string) => {
    //获取配置
    const config =
      piniaStore.schema.moduleConfigData(ModuleType['派货资料'])?.fieldsConfig || []
    const item = config.find((i) => {
      return i.name === value
    })
    return item?.required ? 'required' : 'normal'
  }
  // 单个校验
  const validateField = async (field: FieldKey, formData: any): Promise<localCheckResult> => {
    formData = Object.assign({}, storeFormData.value, formData)
    const validationMap: ValidationMap = {
      deliveryData: {
        // formData[field]为空时 使用store， 否则使用formData数据
        value: isEmptyText(formData[field]) || formData[field] === 0 ? uploadNum.value : formData[field],
        rules: {
          normal: uploadNum.value ? validateRules.deliveryData : [],
          required: validateRules.deliveryData,
        },
        bubbleConfig: {
          placement: isOrderPage() ? 'top-end' : 'top-start',
        },
      },
    }
    const { rules, bubbleConfig } = validationMap[field]
    let { value } = validationMap[field]
    if (typeof value === 'string') {
      value = value.toString().replace(filterAllSpace, '')
    }
    return localValidateField(`dispatchInformation.${field}`, value, rules[getRule(field)], bubbleConfig)
  }

  // 多个校验（对外）
  const validateCollection = async (formData?: formDataType): Promise<localCheckResult[]> => {
    const fieldNames: FieldKey[] = ['deliveryData']
    const validationPromises = fieldNames.map((fieldName) => validateField(fieldName, formData))
    return Promise.all(validationPromises)
  }

  return {
    validateField,
    validateCollection,
  }
}

export default useValidate
