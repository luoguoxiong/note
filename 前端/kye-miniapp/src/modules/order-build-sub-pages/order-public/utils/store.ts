import { schema, waybillInfo } from '@order-public-sub-public/configs'
import { DEFAULT_GLOBAL_DATA, DEFAULT_EXTEND_DATA } from '@order-public-sub-public/configs/store'
import { OrderPageType } from '@order-public-sub-public/constants'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

import { cloneDeep } from 'lodash-es'

/**
 * @todo 临时方法，需要区分批量公共部分场景和其他单票场景
 * @description 初始化store
 * @param orderPageType
 */
export const initStore = (orderPageType: OrderPageType) => {
  piniaStore.order.updateOrder({ data: cloneDeep(waybillInfo), orderPageType, reset: true })
  piniaStore.schema.updateSchema({ staticConfig: { configId: '', schema: cloneDeep(schema) }, orderPageType })
  piniaStore.globalData.setGlobalData({ data: cloneDeep(DEFAULT_GLOBAL_DATA), orderPageType })
  piniaStore.extend.setExtendData({ data: cloneDeep(DEFAULT_EXTEND_DATA), orderPageType })
}

/**
 * @description 初始化单票场景store、单票、返程单、批量单条
 * @param orderPageType
 */
export const initSingleStore = (orderPageType: OrderPageType) => {
  console.log('初始化单票场景store', orderPageType)
}

/**
 * @description 初始化批量场景store、批量公共部分
 */
export const initBatchStore = (orderPageType: OrderPageType) => {
  console.log('初始化批量场景store', orderPageType)
}
