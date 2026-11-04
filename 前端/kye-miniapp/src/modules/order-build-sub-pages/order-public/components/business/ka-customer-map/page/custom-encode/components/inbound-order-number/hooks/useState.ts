import { ref } from 'vue'

const productCode = ref('')

export const useInboundOrderNumber = () => {
  const setInboundOrderNumber = (value: string) => {
    productCode.value = value
  }
  return {
    productCode,
    setInboundOrderNumber,
  }
}
