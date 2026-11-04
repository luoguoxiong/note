import { getAgreementDefaultSelect } from '@order-public-sub-public/apis/waybill/agreement'
import { ref } from 'vue'

// 是否勾选协议不在提醒
export const isPaymentAgreementSelected = ref<boolean | null>(null)

// 协议内容
const agreementContent = ref('')

// 设置协议内容
export const useAgreementContent = () => {
  const setAgreementContent = (val: string) => {
    agreementContent.value = val
  }

  return { agreementContent, setAgreementContent }
}

// 设置是否勾选
export const useAgreementSelected = () => {
  const setAgreementSelected = (value: boolean) => {
    isPaymentAgreementSelected.value = value
  }

  return { isPaymentAgreementSelected, setAgreementSelected }
}

// 获取默认勾选状态
export const getDefaultSelect = async () => {
  const { setAgreementSelected } = useAgreementSelected()
  console.log('isPaymentAgreementSelected.value', isPaymentAgreementSelected.value)
  if (isPaymentAgreementSelected.value === null) {
    const { data } = await getAgreementDefaultSelect({ type: 5 })
    console.log('isPaymentAgreementSelected.value222', data)
    setAgreementSelected(data)
  }
}
