import { ref } from 'vue'
// import { getAgreementDefaultSelect } from '@order-public-sub-public/apis/waybill/agreement'

import { ModuleType } from '@order-public-sub-public/constants'
import { setStorge } from '../utils'
import { getUserSettingInfoByKey } from '@order-public-sub-root-pages/order-single/hooks/useInit'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

export const defaultChecked = ref(false)
export const couponShowFlag = ref(true)

// 专门给initdata调用用的
export const getDefaultSelect = async (isBindCustomer = false) => {
  // const { data: isChecked } = await getAgreementDefaultSelect({ type: 0 })
  // 是否是切换绑定公司
  if (isBindCustomer) {
    defaultChecked.value = false
  }
  const isChecked = (await getUserSettingInfoByKey('waybillSelectFlag', isBindCustomer)) as boolean
  defaultChecked.value = isChecked

  setStorge('agreementCheck', isChecked)

  piniaStore.schema.updateModuleDimensionByType({
    type: ModuleType['预估费用'],
    data: {
      agreementCheck: isChecked,
    },
  })
}
