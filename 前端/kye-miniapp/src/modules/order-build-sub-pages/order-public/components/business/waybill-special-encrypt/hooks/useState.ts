import {
  waybillSpecialEncryptType,
  waybillSpecialEncryptRules,
  popupContentVisible,
  popupFieldVisible,
  syncEncryptSetting,
  isEncryptEdit,
} from './state'
import { WaybillSpecialEncryptRule } from '@order-public-sub-public/types'

export const useWaybillSpecialEncryptType = () => {
  const setWaybillSpecialEncryptType = (value: string | boolean) => {
    waybillSpecialEncryptType.value = value
  }

  return { waybillSpecialEncryptType, setWaybillSpecialEncryptType }
}

export const useWaybillSpecialEncryptRules = () => {
  const setWaybillSpecialEncryptRules = (value: WaybillSpecialEncryptRule[]) => {
    waybillSpecialEncryptRules.value = value
  }

  return { waybillSpecialEncryptRules, setWaybillSpecialEncryptRules }
}

export const usePopupContentVisible = () => {
  const setPopupContentVisible = (value: boolean) => {
    popupContentVisible.value = value
  }

  return { popupContentVisible, setPopupContentVisible }
}

export const usePopupFieldVisible = () => {
  const setPopupFieldVisible = (value: boolean) => {
    popupFieldVisible.value = value
  }

  return { popupFieldVisible, setPopupFieldVisible }
}

export const useSyncEncryptSetting = () => {
  const setSyncEncryptSetting = (value: boolean) => {
    syncEncryptSetting.value = value
  }

  return { syncEncryptSetting, setSyncEncryptSetting }
}

export const useIsEncryptEdit = () => {
  const setIsEncryptEdit = (value: boolean) => {
    isEncryptEdit.value = value
  }

  return { isEncryptEdit, setIsEncryptEdit }
}
