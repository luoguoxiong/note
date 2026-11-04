import { KaCustomerMap, localCheckResult, KaCustomerMapDimension } from '@order-public-sub-public/types'
import { ModuleType } from '@order-public-sub-public/constants'
import useEffect from '@order-public-sub-public/validate'
import { computed } from 'vue'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

/**
 * @description: 判断 如果运单信息是否 有全部的必填自定义编码
 * @return {*}
 */
const isRequiredList = () => {
  const kaCustomerMapOrderData = piniaStore.order.moduleFormData(ModuleType['自定义编码'])
  const kaCustomerMapData = piniaStore.schema.moduleDimensionData(ModuleType['自定义编码'])?.rows
  if (kaCustomerMapOrderData?.length > 0 && kaCustomerMapData.length) {
    // 需要必填的kyField列表
    const isRequiredList = kaCustomerMapData?.filter((item) => item.requiredStatus)?.map((item) => item.kyField) || []
    const mapOrderData = kaCustomerMapOrderData.map((item) => item.kyField) || []
    if (isRequiredList.length) {
      // 运单信息中没有 全部必填的自定义编码
      return isRequiredList.every((item) => mapOrderData.includes(item))
    }
  }
  return true
}
export const useValidate = () => {
  const { effectBubble, remoteCheck } = useEffect()
  // 本地校验规则，KaCustomerMap长度不为空
  const validateField = () => {
    const kaCustomerMapData = computed(() => {
      return piniaStore.schema.moduleDimensionData(ModuleType['自定义编码'])
    })
    const isVisible = computed(() => {
      return kaCustomerMapData?.value?.rows?.length || false
    })
    const isRequired = computed(() => {
      return piniaStore.extend.kaCustomerMapStatus
    })
    // 如果不显示 || 非必填 直接校验通过
    if (!isVisible.value || !isRequired.value) {
      return true
    }
    const kaCustomerMapOrderData = piniaStore.order.moduleFormData(ModuleType['自定义编码'])
    if (!isRequiredList()) {
      return false
    }
    return kaCustomerMapOrderData?.length >= 1
  }

  const validateCollection = async (): Promise<localCheckResult[]> => {
    const checkStatus = validateField()
    if (checkStatus) {
      return [
        {
          key: 'kaCustomerMap.customerFieldValue',
          passed: true,
          content: '',
          bubbleConfig: {
            placement: 'top-end',
          },
        },
      ]
    } else {
      return [
        {
          key: 'kaCustomerMap.customerFieldValue',
          passed: false,
          content: '请填写自定义编码',
          bubbleConfig: {
            placement: 'top-end',
          },
        },
      ]
    }
  }

  const confirmValidate = async () => {
    const [result] = await validateCollection()
    result.bubbleConfig = {
      offset: [300, 0],
    }
    try {
      // 触发副作用
      await effectBubble([result])
      // 远程校验
      await remoteCheck('kaCustomerMap')
    } catch (error) {
      console.log('error', error)
    }
  }

  return {
    confirmValidate,
    validateField,
    validateCollection,
  }
}
