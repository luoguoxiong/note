/** 非tab路由新老路由映射 */
export const simpleRouteMap: Record<string, string> = {
  '/packages/user/scanLogin/index': '/modules/user/pages/scanLogin/index',
  '/packages/other/scanBindCode/index': '/modules/user/pages/scanBindCode/index',
  '/packages/user/scanLogin/page-result': '/modules/user/pages/scanLogin/result',
  '/subpackages/common-page/scan/index': '/modules/scan/pages/home/index',
  '/subpackages/common-page/webview-page/index': '/modules/scan/pages/webview/index',
  '/subpackages/temp/temp3': '/subpackages/temp/temp3',
  '/packages/mailing/single/index': '/modules/order-build/pages/order/index',
  '/packages/webview/waybill-detail': '/modules/waybill-build/pages/waybill-detail/index',
  '/packages/waybill/route/index': '/modules/waybill-build/pages/waybill-route/index',
  '/packages/other/qrcodeJump/index': '/packages/other/qrcodeJump/index',
  '/packages/user/scanCode/index': '/packages/user/scanCode/index',
  '/packages/user/scanCodeNew/index': '/packages/user/scanCodeNew/index',
}

// {
//   // 查件
//   root: 'modules/waybill',
//   pages: [
//     'pages/waybill-route/index',
//     'pages/waybill-detail/index',
//     'pages/order-route/index',
//     'pages/webview/index',
//   ],
// },

/** tab路由新老路由映射 */
export const tabRouterMap = {
  '/layout/pages/home/index': '/pages/index/index',
  '/layout/pages/mine/index': '/pages/entry/index',
  '/layout/pages/search/index': '/pages/search/index',
  '/layout/pages/order/index': '/pages/mypage/index',
}

// 需要跳转特殊路由，比如跳转到空页面（扫码下线）
export const specialJumpList = {
  '#/empty-page': '/modules/order-build-sub-pages/pages/empty/index',
}

export const scanOldUrlMap = {
  '/order-config': '/modules/order-build/pages/order/index',
  '/waybill-route': '/modules/waybill-build/pages/waybill-route/index',
  '/waybill-detail': '/modules/waybill-build/pages/waybill-detail/index',
}

export const filterOldUrlMap = ['price-adjustment-review']
