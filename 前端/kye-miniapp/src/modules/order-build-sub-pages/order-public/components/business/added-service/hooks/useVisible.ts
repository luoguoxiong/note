import { ref } from 'vue'

export type VisibleType = 'unfoldReceipt' | 'unfoldPackage' | 'popup' | 'unfoldGoodsControl' | ''

export const popupVisible = ref(false)

export const unfoldReceiptVisible = ref(false)

export const unfoldPackageVisible = ref(false)

export const detailPopupVisible = ref(false)

export const visibleType = ref<VisibleType>('')

export const useUnfoldReceiptVisible = () => {
  const setUnfoldReceiptVisible = (value: boolean) => {
    unfoldReceiptVisible.value = value
  }

  return { unfoldReceiptVisible, setUnfoldReceiptVisible }
}

export const useUnfoldPackageVisible = () => {
  const setUnfoldPackageVisible = (value: boolean) => {
    unfoldPackageVisible.value = value
  }

  return { unfoldPackageVisible, setUnfoldPackageVisible }
}

export const usePopupVisible = () => {
  const setPopupVisible = (value: boolean) => {
    popupVisible.value = value
  }

  return { popupVisible, setPopupVisible }
}

export const useDetailPopupVisible = () => {
  const setDetailPopupVisible = (value: boolean) => {
    detailPopupVisible.value = value
  }

  return { detailPopupVisible, setDetailPopupVisible }
}

export const useVisibleType = () => {
  const setVisibleType = (value: VisibleType) => {
    visibleType.value = value
  }

  return { visibleType, setVisibleType }
}
