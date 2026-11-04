// 跳转路径映射
const routerPathMap = {
  '/sender-page': '/order-public/components/business/sender/page/address-page/index',
  '/address-book': '/order-public/components/business/address-book/page/index',

  '/order': '/pages/order/index',
  '/blank': '/pages/blank/index',
  '/order-batch': '/pages/order-batch/index',
  '/order-batch-waybill': '/pages/order-batch-waybill/index',
  '/order-preview': '/pages/order-preview/index',
  '/order-back': '/pages/order-back/index',
  '/receive-page': '/order-public/components/business/receive/page/address-page/index',
  '/order-success': '/pages/order-success/index',
  '/receipt-page': '/order-public/components/business/receipt/page/ky-receipt-page/index',

  // 打印的拆到子包了
  '/print': '/pages/print/index',
  '/teplatepng': '/pages/print/teplatepng/index',
  '/print-preview': '/pages/print/print-preview/index',
  '/print-records': '/pages/print-records/index',

  '/print-management': '/pages/print-management/index',
  '/print-batch': '/pages/print-batch/index',
  '/print-batch-filter': '/pages/print-batch-filter/index',

  '/product-info': '/order-public/components/business/product-info/page/product-info-page/index',
  '/added-service': '/order-public/components/business/added-service/page/added-service-page/index',
  '/map-position': '/order-public/components/business/map-position/page/index',
  '/iframe-coupon': '/order-public/components/business/coupon/page/iframe-coupon/index',
  '/template-view': '/order-public/components/business/template-view/index',
  '/receipt-resources': '/order-public/components/business/added-service/components/receipt-resources/index',
  '/goods-delivery-detail': '/order-public/components/business/product-info/components/goods-delivery-detail/index',
  '/address-book-sender': '/order-public/components/business/address-book/sender/index',
  '/address-book-receive': '/order-public/components/business/address-book/receive/index',
  '/address-batch-ocr': '/order-public/components/business/address-batch-ocr/index',
  '/pickup-information': '/order-public/components/business/pickup-information/page/index',
  '/dispatch-information': '/order-public/components/business/dispatch-information/page/index',
  '/custom-encode': '/order-public/components/business/ka-customer-map/page/custom-encode/index',
  '/notepad': '/order-public/components/business/ka-customer-map/page/notepad/index',
  '/pdf': '/pages/pdf/index',
  '/air-contraband': '/pages/air-contraband/index',
  '/batch-restrict/:pageType': '/pages/batch-restrict/index',
  '/batch-restrict-goodstime-limit': '/pages/batch-restrict-new/batch-restrict-goodstime-limit.vue',
  '/batch-restrict-limit': '/pages/batch-restrict-new/batch-restrict-limit.vue',
  '/batch-restrict-remind': '/pages/batch-restrict-new/batch-restrict-remind.vue',
  '/order-batch-success': '/pages/order-batch-success/index',
  '/batch-print': '/pages/order-batch-success/batch-print/index',
  '/history-size': '/order-public/components/business/product-info/components/history-size/index',
  '/select-size': '/order-public/components/business/product-info/components/select-size/index',
  '/add-my-size': '/order-public/components/business/product-info/components/add-my-size/index',
  '/order-service-introduction': '/pages/order-service-introduction/index',
  '/item-insured-new': '/pages/item-insured-new/index',
  '/order-encrypt-desc': '/pages/order-encrypt-desc/index',
  '/empty-page': '/pages/empty/index',
  '/update-goods-time': '/pages/update-goods-time/index',
  '/address-book-clear': '/order-public/components/business/address-book/clear-addr/index',
}

/**
 * 替换 URL 路径部分，保留查询参数
 * @param url 原始 URL（如 '/sender-page?orderId=123'）
 * @returns 替换后的完整 URL
 */
export const replaceRoute = (url: string): string => {
  // 匹配路径部分和查询参数
  const match = url.match(/^([^?]*)(\?.*)?$/)
  if (!match) return url

  const path = match[1] // 路径部分
  const query = match[2] || '' // 查询参数（包含 ?）

  // 查找映射路径，如果找不到则保持原路径
  const replacedPath = routerPathMap[path] || path
  return replacedPath + query
}
