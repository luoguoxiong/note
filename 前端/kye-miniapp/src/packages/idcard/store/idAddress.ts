/**
 * @Desc: idAddressStore
 * @Date: 2025/8/13
 */
import { analysis, getMultiLevelSubList } from '@/packages/idcard/api/index'
import type { getMultiLevelSubListAPITypes, quickAnalysisAddressAPITypes } from '@/packages/idcard/api/types'
import { defineStore } from 'pinia'

export const useIdAddressStore = defineStore('idAddress', {
  state: () => ({}),

  actions: {
    /**
     * 地址解析
     */
    async analysis(text: string) {
      return analysis({
        data: [text],
      } as quickAnalysisAddressAPITypes.QuickAnalysisAddressRequest).then(({ data }) => {
        if (data && data.length) {
          let address = data[0]
          return {
            province: address.province,
            city: address.city,
            county: address.district,
            detailedAddress: address.detailedAddress,
            contactPeople: address.name,
            phone: address.phoneNumber,
            telPhone: address.telNumber,
            interceptList: address.interceptList || [],
          }
        }
      })
    },

    /** 获取多级子列表 */
    async getMultiLevelSubList(params: getMultiLevelSubListAPITypes.AddressGetMultiLevelSubListRequest) {
      return getMultiLevelSubList(params)
    },
  },
})
