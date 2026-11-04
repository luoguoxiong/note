import { defineStore } from 'pinia'
import { waybillInfo } from '@order-public-sub-public/configs/initData'
import { cloneDeep } from 'lodash-es'
import { GetEstimateFeeByTaskIdResponse } from '@order-public-sub-public/apis/waybill/estimated-cost'
import { uncapitalLize } from '@order-public-sub-public/utils/string'
import { capitalize } from 'lodash-es'
import { ModuleType, OrderPageType } from '@order-public-sub-public/constants'
import { ModuleFormType, OrderState } from '../../types'
import { BatchOrderInfo, CommonProcessWaybillInfo, WaybillInfoList } from '@order-public-sub-public/apis/types'
import { OrderInfo, ModuleDimension, RestrictData, GoodsInfo } from '@order-public-sub-public/types'
import { useOrderRootStore } from '../../pinia'

export const useOrderStore = defineStore('order', {
  state: (): OrderState => ({
    [OrderPageType.单票]: cloneDeep(waybillInfo),
    [OrderPageType.预览]: {} as OrderInfo,
    [OrderPageType.批量寄单票]: {} as OrderInfo,
    [OrderPageType.批量寄]: {} as BatchOrderInfo,
    [OrderPageType.返程单]: {} as OrderInfo,
  }),

  getters: {
    orderState: (state): OrderInfo | BatchOrderInfo => {
      const rootState = useOrderRootStore()
      return state[rootState.getOrderPageType]
    },

    orderStateByType: (state) => (type: OrderPageType) => {
      return state[type]
    },

    waybillNumber: (state): string => {
      const rootState = useOrderRootStore()
      return (state[rootState.getOrderPageType] as OrderInfo).waybillNumber
    },

    moduleFormData: (state) => {
      return (type: ModuleFormType | ModuleType, waybillNumber?: string, orderPageType?: OrderPageType) => {
        const rootState = useOrderRootStore()
        const uncapitalLizeType = uncapitalLize(type) as ModuleFormType
        return state[orderPageType || rootState.getOrderPageType][uncapitalLizeType as ModuleFormType]
      }
    },

    auditFormData: (state): Record<string, any> => {
      const rootState = useOrderRootStore()
      const orderPageType = rootState.getOrderPageType
      if (orderPageType === OrderPageType.单票) {
        const { auditState, approvalDescribe, authPersonName, auditId, authPersonPhone, showLinkButton, waybillState } =
          state[orderPageType]
        return {
          auditState,
          approvalDescribe,
          authPersonName,
          auditId,
          authPersonPhone,
          showLinkButton,
          waybillState,
        }
      } else {
        return {}
      }
    },

    waybillId: (state): number | undefined | string => {
      const rootState = useOrderRootStore()
      return (state[rootState.getOrderPageType] as OrderInfo).waybillId
    },

    batchWaybillInfoList: (state): WaybillInfoList[] => {
      const rootState = useOrderRootStore()
      const orderPageType = rootState.getOrderPageType
      if (orderPageType === OrderPageType.批量寄单票) {
        return state[OrderPageType.批量寄].waybillInfoList
      }
      return (state[orderPageType] as BatchOrderInfo).waybillInfoList
    },

    batchCommonWaybillInfo: (state): OrderInfo => {
      const rootState = useOrderRootStore()
      const orderPageType = rootState.getOrderPageType
      return (state[orderPageType] as BatchOrderInfo).commonWaybillInfo.waybillInfo
    },

    batchCommonWaybill: (state): CommonProcessWaybillInfo => {
      const rootState = useOrderRootStore()
      const orderPageType = rootState.getOrderPageType
      return (state[orderPageType] as BatchOrderInfo).commonWaybillInfo
    },

    orderWaybillInfo: (state) => (waybillNumber?: string) => {
      const rootState = useOrderRootStore()
      let orderWaybillNumber = rootState.currentWaybillNumber
      const batchWaybillInfoList = state[OrderPageType.批量寄].waybillInfoList
      if (waybillNumber) {
        orderWaybillNumber = waybillNumber
      }
      return (
        batchWaybillInfoList.find((item) => item.waybillInfo.waybillNumber === orderWaybillNumber) ||
        ({} as WaybillInfoList)
      )
    },

    bulkCargoInfo: (state): any[] | null => {
      return state[OrderPageType.批量寄].bulkCargoInfoList || null
    },
  },

  actions: {
    /**
     * @description 全量更新提交表单数据 (原 updateOrder action)
     */
    updateOrder(payload: {
      waybillNumber?: string
      data: OrderInfo | BatchOrderInfo
      reset?: boolean
      orderPageType?: OrderPageType
    }) {
      const rootState = useOrderRootStore()
      const { orderPageType = rootState.getOrderPageType, reset = false } = payload
      // --- 内联 RESET_ORDER 逻辑, 移除了批量寄判断逻辑 ---
      if (reset === true) {
        const { data } = payload
        if (orderPageType !== OrderPageType.批量寄) {
          this[orderPageType] = data
        } else {
          this[orderPageType] = {
            commonWaybillInfo: {
              waybillInfo: data as OrderInfo,
              unifiedInfoSwitcher: false,
            } as CommonProcessWaybillInfo,
            waybillInfoList: [],
          }
        }
        return
      }

      // --- 删除了原有批量寄逻辑 ---
      const { data } = payload
      for (const key in data) {
        if (Reflect.has(this[orderPageType], key)) {
          let currentData = data[key as keyof OrderInfo]
          if (capitalize(key) === ModuleType['收方信息']) {
            currentData = Object.assign({}, Reflect.get(this[orderPageType], key), currentData)
          }
          Reflect.set(this[orderPageType], key, currentData)
        }
      }
    },

    /**
     * @description 提交store更新的action (原 updateOrderByType action)
     */
    updateOrderByType(payload: {
      type: ModuleFormType
      waybillNumber?: string
      data: Partial<OrderInfo>
      orderPageType?: OrderPageType
    }) {
      const rootState = useOrderRootStore()
      const { orderPageType = rootState.getOrderPageType } = payload
      const { type, data } = payload
      const uncapitalLizeType = uncapitalLize(type) as ModuleFormType

      if (
        orderPageType === OrderPageType.单票 ||
        orderPageType === OrderPageType.预览 ||
        orderPageType === OrderPageType.返程单
      ) {
        // --- 内联 UPDATE_ORDER_BY_TYPE 逻辑, 删除批量逻辑 ---
        const dataToUpdate = Array.isArray(data)
          ? data
          : Object.assign({}, Reflect.get(this[orderPageType], uncapitalLizeType), data)
        Reflect.set(this[orderPageType], uncapitalLizeType, dataToUpdate)
      }
    },

    /**
     * @description 更新管控 (原 updateOrderRestrictByNumber action)
     */
    updateOrderRestrictByNumber(payload: {
      data: Partial<RestrictData>
      orderPageType?: OrderPageType
      waybillNumber?: string
    }) {
      const rootState = useOrderRootStore()
      const {
        orderPageType = rootState.getOrderPageType,
        waybillNumber = rootState.currentWaybillNumber,
        data,
      } = payload
      // --- 内联 UPDATE_BATCH_RESTRICT_BY_NUMBER 逻辑 ---
      const currentWaybillInfo = (this[orderPageType] as BatchOrderInfo).waybillInfoList.find(
        (item) => item.waybillNumber === waybillNumber,
      )
      for (const key in data) {
        if (Reflect.has(currentWaybillInfo?.restrictData as RestrictData, key)) {
          const currentData = data[key as keyof RestrictData]
          Reflect.set(currentWaybillInfo?.restrictData as RestrictData, key, currentData)
        }
      }
    },

    /**
     * @description 设置本次寄件信息统一 (原 setUnifiedInfoSwitcher action)
     */
    setUnifiedInfoSwitcher(payload: { data: boolean }) {
      // --- 内联 SET_UNIFIED_INFO_SWITCHER 逻辑 ---
      this['order-batch'].commonWaybillInfo.unifiedInfoSwitcher = payload.data
    },

    /**
     * @description 保存批量寄单票运单数据 (原 setBatchWaybillInfoList action)
     */
    setBatchWaybillInfoList(payload: { waybillInfoList: WaybillInfoList[]; orderPageType?: OrderPageType }) {
      const rootState = useOrderRootStore()
      const { orderPageType = rootState.getOrderPageType, waybillInfoList } = payload
      // --- 内联 SET_BATCH_WAYBILL_INFO_LIST 逻辑 ---
      ;(this[orderPageType] as BatchOrderInfo).waybillInfoList = waybillInfoList
    },

    /**
     * @description 保存批量组件数据 (原 setBatchModuleDimension action)
     */
    setBatchModuleDimension(payload: { data: ModuleDimension; orderPageType?: OrderPageType }) {
      const rootState = useOrderRootStore()
      const { orderPageType = rootState.getOrderPageType, data } = payload
      // --- 内联 SET_BATCH_MODULE_DIMENSION 逻辑 ---
      ;(this[orderPageType] as BatchOrderInfo).batchModuleDimension = data
    },

    couponUpdateClearOrderCouponCode(payload: { data: GetEstimateFeeByTaskIdResponse; orderPageType?: OrderPageType }) {
      const { data } = payload
      const waybillNumber = [] as string[]
      data?.couponList?.forEach((item) => {
        if (item.couponTips || item.showTextStatus !== 10) {
          waybillNumber.push(item.waybillNumber)
        }
      })
      if (waybillNumber.length === 0) return

      if (this['order-batch']?.waybillInfoList?.length) {
        for (const waybill of this['order-batch'].waybillInfoList) {
          if (waybillNumber.includes(waybill.waybillInfo.waybillNumber)) {
            if (waybill?.waybillInfo?.coupon?.couponCode) {
              Reflect.set(waybill.waybillInfo, 'coupon', {
                ...waybill?.waybillInfo?.coupon,
                couponCode: '',
              })
            }
          }
        }
      }
    },

    updateBatchBulkCargoInfo(payload: { flag: string; clear?: boolean }) {
      const { flag, clear = false } = payload
      // --- 内联 SET_BATCH_BULK_CARGO_INFO 逻辑 ---
      if (clear) {
        this[OrderPageType.批量寄].bulkCargoInfoList = null
        return
      }
      const sender = this[OrderPageType.批量寄].commonWaybillInfo.waybillInfo.sender
      const pickupAddress = `${sender.province}${sender.city}${sender.county}${sender.detailAddress}`
      this[OrderPageType.批量寄].bulkCargoInfoList = [
        {
          bulkCargoFlag: flag,
          pickupAddress,
        },
      ]
    },

    // 修改批量的货物信息中的历史标签数据
    updateProductInfo(payload: { goodsInfoList: GoodsInfo[] }) {
      // --- 内联 SET_BATCH_PRODUCT_INFO 逻辑 ---
      const batchWaybillInfoList = this[OrderPageType.批量寄].waybillInfoList ?? []
      for (const waybillInfoItem of batchWaybillInfoList) {
        if (waybillInfoItem.moduleDimension.productInfo) {
          waybillInfoItem.moduleDimension.productInfo.goodsInfoList = payload.goodsInfoList ?? []
        }
      }
    },
  },
})
