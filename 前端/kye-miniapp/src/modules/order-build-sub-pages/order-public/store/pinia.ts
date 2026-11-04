import { defineStore } from 'pinia'
import { OrderPageType } from '@order-public-sub-public/constants'
import { UserInfo } from '@order-public-sub-public/types'
import { AxiosItem } from './types'

interface State {
  axiosItems: AxiosItem[]
  isTokenAlive: boolean
  orderPageType: OrderPageType
  currentWaybillNumber: string
  count: number
  userInfo: UserInfo
}

export const useOrderRootStore = defineStore('orderRoot', {
  state: (): State => ({
    axiosItems: [],
    isTokenAlive: true,
    orderPageType: OrderPageType.单票,
    currentWaybillNumber: '',
    count: 0,
    userInfo: {
      phone: '',
      nickName: '',
      name: '',
    },
  }),
  actions: {
    setTokenIsAlive(isAlive: boolean) {
      this.isTokenAlive = isAlive
    },
    addAxiosItem(item: AxiosItem) {
      this.axiosItems.push(item)
    },
    removeAxiosItem(uuid: string) {
      if (uuid) {
        const existIndex = this.axiosItems.findIndex((item) => item.uuid === uuid)
        if (existIndex !== -1) {
          this.axiosItems.splice(existIndex, 1)
        }
      }
    },
    setUserInfo(userInfo: UserInfo) {
      this.userInfo = { ...userInfo }
    },
    setOrderPageType(orderPageType: OrderPageType) {
      this.orderPageType = orderPageType
    },
    setCurrentWaybillNumber(waybillNumber: string) {
      this.currentWaybillNumber = waybillNumber
    },
  },
  getters: {
    getUserInfo: (state) => state.userInfo,
    getOrderPageType: (state) => state.orderPageType,
    getIsTokenAlive: (state) => state.isTokenAlive,
    getCurrentWaybillNumber: (state) => state.currentWaybillNumber,
  },
})
