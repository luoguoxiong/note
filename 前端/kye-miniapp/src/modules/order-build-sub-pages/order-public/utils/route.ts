import { OrderPageType } from '@order-public-sub-public/constants'
import router from '@order-public-sub-public/router'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

/**
 * 判断当前路由是否是 order-preview 路由
 * @returns boolean
 */
export function isOrderPreviewRoute() {
  const currentRoute = router.currentRoute.value
  return currentRoute.name === 'order-preview'
}

// 未加载路由时, 通过简单判断是否是预览页面路径
export const isPreviewPath = () => {
  return window?.location?.hash?.includes('order-preview')
}

export function isOrderBatchWaybill() {
  const currentRoute = piniaStore.root.getOrderPageType
  return currentRoute === OrderPageType.批量寄单票
}

/**
 * @description 返程单路由
 */
export function isOrderBackRoute() {
  const currentRoute = piniaStore.root.getOrderPageType
  return currentRoute === 'order-back' || currentRoute === OrderPageType.批量寄单票
}

// 是否是生产环境预览路由，通过路由参数判断
// xxx.com/#/order-preview?versionId=5930&configId=1833&channel=40&textCode=&generateCode=preview
export function isProdPreviewRoute() {
  const query = router.currentRoute.value.query
  if (Object.keys(query).includes('generateCode') && isOrderPreviewRoute()) return true
  return false
}

export const excludeProdPreview = ['web.order.configOrder.initConfig', 'web.order.configOrder.initCheck']
