import { checkAgreementCommon } from '@order-public-sub-public/apis/waybill/agreement'
import { debounce } from 'lodash-es'
import { localStorage } from '@order-public-sub-public/utils/storage'
import { ref } from 'vue'

export const selfPickAgreementShow = ref(false)

export const selfPickAgreement = ref(false)

// 设置自提风险勾选
export const setBranchCheck = (v: boolean) => {
  selfPickAgreement.value = v
  localStorage?.setItem(createCacheKey('', '123'), v ? '1' : '0')
}

export const showAgreement = () => {
  selfPickAgreementShow.value = true
  // hiddenOverAreaModal()
  // hiddenBranchModal()
}

export const hideAgreement = () => {
  selfPickAgreementShow.value = false
  // showOverAreaModal()
  // showBranchModal()
}

export const toggleAgreement = () => {
  selfPickAgreementShow.value = !selfPickAgreementShow.value
}

export const createCacheKey = (customCode: string, id: string) => {
  return 'agreement-' + `${customCode}-${id}`.toUpperCase().toUpperCase()
}

export const callCheckAgreementCommon = debounce((checked: boolean, mobileSource: number) => {
  checkAgreementCommon({
    agreementType: 3,
    status: checked ? 1 : 0,
    source: mobileSource,
  })
}, 300)
