// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck
import validateRules from '../config/validateRules'
import localValidateField from '@order-public-sub-public/validate/localValidateField'
import { localCheckResult, PickupInformationConfig, PickupInformationDimension } from '@order-public-sub-public/types'
import { computed } from 'vue'

import { ModuleType } from '@order-public-sub-public/constants'
import { filterAllSpace } from '@order-public-sub-public/utils/pattern'
import { FieldKey, formDataType, ValidationMap } from '@order-public-sub-public/components/business/pickup-information/types/types'
import { isOrderPage } from '@order-public-sub-public/validate/utils'
import { isEmptyText } from '@order-public-sub-public/utils'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

const valueMap = {
  picker: 'person',
  pickerMobile: 'mobile',
  pickerPhone: 'telephone',
  pickeData: 'pickup',
  cargoImg: 'cargoImg',
}
/* eslint-disable */
const useValidate = () => {
  //校验的数据
  const storeFormData = computed(() => piniaStore.order.moduleFormData(ModuleType['取货资料']))
  //图片数量
  const uploadNum = computed(() => piniaStore.schema.moduleDimensionData(ModuleType['取货资料'])?.uploadNum)

  const cargoImgUploadNum = computed(
    () => piniaStore.schema.moduleDimensionData(ModuleType['取货资料'])?.cargoImgUploadNum,
  )

  //获取校验规则
  const getRule = (value: string) => {
    //获取配置
    const config = piniaStore.schema.moduleConfigData(ModuleType['取货资料'])?.fieldsConfig || []
    //和erp配置名对应
    const item = config.find((i) => {
      return valueMap[i.name] === value
    })
    return item?.required ? 'required' : 'normal'
  }
  // 单个校验
  const validateField = async (field: FieldKey, formData: any = storeFormData.value): Promise<localCheckResult> => {
    formData = Object.assign({}, storeFormData, formData)
    const validationMap: ValidationMap = {
      mobile: {
        value: formData[field],
        rules: {
          required: validateRules.mobile,
          normal: formData[field] ? validateRules.mobile : [],
        },
        bubbleConfig: {
          placement: isOrderPage() ? 'top-end' : 'top-start',
        },
      },
      telephone: {
        value: formData[field],
        rules: {
          normal: formData[field] ? validateRules.telephone : [],
          required: validateRules.telephone,
        },
        bubbleConfig: {
          placement: isOrderPage() ? 'top-end' : 'top-start',
        },
      },
      person: {
        value: formData[field],
        rules: {
          normal: formData[field] ? validateRules.person : [],
          required: validateRules.person,
        },
        bubbleConfig: {
          placement: isOrderPage() ? 'top-end' : 'top-start',
        },
      },
      pickup: {
        // formData[field]为空时 使用store， 否则使用formData数据
        value: isEmptyText(formData[field]) ? uploadNum.value : formData[field],
        rules: {
          normal: formData[field] ? validateRules.pickup : [],
          required: validateRules.pickup,
        },
        bubbleConfig: {
          placement: isOrderPage() ? 'top-end' : 'top-start',
        },
      },
      cargoImg: {
        // formData[field]为空时 使用store， 否则使用formData数据
        value: isEmptyText(formData[field]) ? cargoImgUploadNum.value : formData[field],
        rules: {
          normal: formData[field] ? validateRules.cargoImg : [],
          required: validateRules.cargoImg,
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
    console.log(
      validationMap,
      cargoImgUploadNum.value,
      formData[field],
      'formData[field]formData[field]',
      storeFormData,
    )
    return localValidateField(`pickupInformation.${field}`, value, rules[getRule(field)], bubbleConfig)
  }

  // 多个校验（对外）
  const validateCollection = async (formData?: formDataType): Promise<localCheckResult[]> => {
    const fieldNames: FieldKey[] = ['person', 'mobile', 'telephone', 'pickup', 'cargoImg']
    const validationPromises = fieldNames.map((fieldName) => validateField(fieldName, formData))
    return Promise.all(validationPromises)
  }

  return {
    validateField,
    validateCollection,
  }
}

export default useValidate
