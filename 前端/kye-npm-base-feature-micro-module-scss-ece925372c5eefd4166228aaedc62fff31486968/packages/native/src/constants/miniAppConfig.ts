/**
 * @Desc: miniAppPage
 * @Date: 2025/7/14
 */
/* 通用小程序-页面新配置 */
export const miniAppPages = {
  homePage: '/layout/pages/home/index',
  search: '/layout/pages/waybill/index',
  orderPage: '/layout/pages/order/index',
  minePage: '/layout/pages/mine/index',
  login: '/modules/user/pages/login/index',
  order: '/modules/order-build/pages/order/index',
  openWebview: '/modules/webview/pages/webview/index',
  waybillRoute: '/modules/waybill-build/pages/waybill-route/index',
  waybillDetail: '/modules/waybill-build/pages/waybill-detail/index',
  orderRoute: '/modules/waybill-build/pages/waybill-route/index', // 订单路由-与运单路由保持一致
  barcode: '',
  evaluation: '',
  searchResult: '',
  onlineService: '/packages/webview/onlineService',
  payAuth: '/modules/webview/pages/webview/index?menuCode=M5006', // 公共webview-打开菜单-付款授权
  payAuthRecord: '',
  effectiveOptimize: '',
  customerCode: '/modules/webview/pages/webview/index?menuCode=M5812', // 公共webview-打开菜单-打开新绑码组件
  customerCodeIntro: '',
  realNameAuth: '/modules/webview/pages/webview/index?menuCode=M5003', // 公共webview-打开菜单-打开实名认证
  questionnaire: '',
  orderSuccess: '/modules/order-build/pages/order-success/index', // 公共webview-打开菜单-打开下单成功页
  batchOrder: '',
  prepaidFreight: '',
  defaultSetting:
    'modules/order-build/order-public/components/business/template-view/index', // 寄件模版
}

/* 寄件小程序-旧配置*/
export const miniWechatOldPages = {
  order: '/packages/mailing/single/index', // 寄件页
  search: '/pages/search/index', // 查件tab
  openWebview: '/packages/webview/openWebview', // 公共webview
  homePage: '/pages/index/index', // 首页
  orderPage: '/pages/entry/index', // 寄件一级页面
  minePage: '/pages/mypage/index', // 我的页面
  orderRoute: '/packages/webview/order-route', // 订单路由
  waybillRoute: 'packages/waybill/route', // 运单路由
}

// 一级页面
export const LevelPageList = ['minePage', 'homePage', 'orderPage', 'search']
// 查询状态列表(旧版本小程序)
// export const SearchStatusList = ['searchTab20', 'searchTab30', 'searchTab40']

export const checkWhiteList = [
  'scanQRCode',
  'navigateTo',
  'navigateBack',
  'share',
  'previewImage',
  'login',
  'chooseImage',
  'refreshSearch',
  'checkApi',
  'openLocation',
  'getLocation',
  'openWebview',
]

export type MiniAppPages = keyof typeof miniAppPages

/* 获取多端应用页面 */
export const getMiniAppUrl = (page: MiniAppPages) => {
  if (!page) {
    return ''
  }
  return miniAppPages[page]
}

/**
 * 提取路径部分（不含 query）
 * @param url 完整URL
 */
const getPathWithoutQuery = (url: string): string => {
  return url.split('?')[0]
}

/**
 * 检测url是否为旧小程序页面
 * @param url
 * @param oldPages
 * @returns {any}
 */
export const checkOldMiniUrl = (
  url: string,
  oldPages = miniWechatOldPages,
): any => {
  if (!url) return false
  const path = getPathWithoutQuery(url)
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return Object.values(oldPages).includes(path)
}

/**
 * 转换老的路径为新路径
 * @param url 原始路径，如 /packages/webview/openWebview?aa=1
 * @param oldPages
 * @param newPages
 * @returns 新路径，如 /modules/webview/pages/webview/index?aa=1，如果未命中旧配置，则返回原始路径
 */
export const convertToNewMiniAppPage = (
  url: string,
  oldPages = miniWechatOldPages,
  newPages = miniAppPages,
): string => {
  const oldToNewMap: Record<string, string> = {}

  // 创建旧路径到新路径的映射
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  Object.entries(oldPages).forEach(([key, oldPath]: [string, string]) => {
    const newPath = newPages[key as keyof typeof newPages]
    if (oldPath && newPath) {
      oldToNewMap[oldPath] = newPath
    }
  })

  // 匹配是否以某个旧路径开头
  for (const oldPath in oldToNewMap) {
    if (url.startsWith(oldPath)) {
      const suffix = url.slice(oldPath.length) // 取 ? 或其他参数部分
      return oldToNewMap[oldPath] + suffix
    }
  }

  return url
}

/* 匹配是否为旧url,是则转换url  */
export const convertToNewMiniAppUrl = (url: string) => {
  let result = url
  if (url && checkOldMiniUrl(url)) {
    result = convertToNewMiniAppPage(url)
  }
  return result
}
