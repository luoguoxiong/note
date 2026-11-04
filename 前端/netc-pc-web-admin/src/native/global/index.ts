import { useGlobalStore } from '@/stores/global'

export const getToken = () => {
  return window.sessionStorage.getItem('Token')
}

export const getGlobalData = async () => {
  return await useGlobalStore().getGlobalData()
}

export const updateUserInfo = () => {
  useGlobalStore().updateUserInfo()
}

export const updateCustomerInfo = () => {
  useGlobalStore().updateCustomerInfo()
}

export const updateRealNameInfo = () => {
  useGlobalStore().updateRealNameInfo()
}

export const updateToken = () => {
  // todo更新token
}
