import { ref } from 'vue'
import { OrderConsumer } from '@order-public-sub-public/types'
import { ModuleType } from '@order-public-sub-public/constants'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

export const visible = ref<boolean>(false)
export const phone = ref<string>('')
export const roleName = ref<string>('')
export const customerCode = ref<string>('')
export const useContactBusiness = () => {
  const openContactBusiness = (contactPhone?: string, title?: string) => {
    setTimeout(() => {
      visible.value = true
      phone.value = contactPhone || ''
      roleName.value = title || '商务'
      customerCode.value = piniaStore.schema.moduleDimensionData(ModuleType['下单公司'])?.customerCode || ''
    }, 100)
  }
  return {
    openContactBusiness,
    visible,
    phone,
    roleName,
    customerCode,
  }
}
