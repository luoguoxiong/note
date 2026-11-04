import { OrderPageType } from '@order-public-sub-public/constants'

/**
 * @description 是否单票场景
 */
export const isSingleOrderPage = (type?: OrderPageType) => {
  return type && [OrderPageType.预览, OrderPageType.单票, OrderPageType.返程单, OrderPageType.批量寄单票].includes(type)
}

/**
 * @description 是否单票场景
 */
export const isSingleOrderScene = (type?: OrderPageType) => {
  return type && [OrderPageType.预览, OrderPageType.单票, OrderPageType.返程单].includes(type)
}

/**
 * @description 是否批量场景
 * @param type
 * @returns
 */
export const isBatchOrderPageType = (type: OrderPageType) => {
  return type && [OrderPageType.批量寄, OrderPageType.批量寄单票].includes(type)
}

/**
 * @description 获取store持久化的存储key值
 * @returns
 */
export const getKeyByPersistedState = () => {
  let key = 'order-config'
  try {
    const urlObj = new URL(window.location.href)
    const path = urlObj.hash?.split('?')[0]
    if (path?.indexOf(OrderPageType.批量寄) > -1) {
      //只区分单票和批量
      key = 'batch-order-config'
    }
  } catch (e) {
    console.log(e) //不用抛错
  }
  return key
}
