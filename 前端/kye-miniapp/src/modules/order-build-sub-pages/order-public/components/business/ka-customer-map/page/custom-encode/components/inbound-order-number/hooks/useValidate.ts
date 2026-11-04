import { productCodeValidateType } from '@order-public-sub-public/components/business/ka-customer-map/page/custom-encode/components/inbound-order-number/type'
import { useInboundOrderNumber } from '@order-public-sub-public/components/business/ka-customer-map/page/custom-encode/components/inbound-order-number/hooks/useState'

export const useProductCodeValidate = () => {
  //唯品会入库号的校验
  const productCodeValidate = (value?: string, params?: productCodeValidateType) => {
    const { productCode } = useInboundOrderNumber()
    value = value || productCode.value
    const { fieldName = 'kaCustomerMap.customerFieldValue.220' } = params || {}
    const validateResult = {
      content: '请输入正确唯品会入库号',
      passed: /^\d{10}-\d{4}$/.test(value),
      key: fieldName,
      bubbleConfig: { offset: [0, 6] as [number, number] },
    }
    if (!value) {
      validateResult.passed = true
    }
    return validateResult
  }

  return {
    productCodeValidate,
  }
}
