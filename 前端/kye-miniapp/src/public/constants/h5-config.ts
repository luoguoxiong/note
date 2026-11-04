import { getEnvConfig } from '@/public/constants'
const base_url = process.env.TARO_APP_HTTP_URL

const { isProd } = getEnvConfig()

const h5_url = isProd ? 'https://m.ky-express.com' : 'http://m-uat.ky-express.com'
const wx_gzh_url = isProd ? 'https://mp.ky-express.com' : 'http://wbdltest.ky-tech.com.cn'
const invoice_url = isProd ? 'https://invoice-manager.ky-express.com' : 'https://invoice-manager-dev.ky-express.com'
const kuasheng_url = isProd ? 'https://ic-h5.kye-erp.com' : 'http://erp-kuasheng-h5-uat.kye-erp.com'

// crm优惠券url
const coupon_url = () => {
  return isProd ? 'https://crm-h5.ky-express.com' : 'https://crm-h5-uat.ky-express.com'
}
// 下单查件页面
const BaseOrderURL = base_url + '/h5-offline/netc-h5-order-offline/#'

// 高德地图key
export const amapKey = 'b47f80f9f63a963898ba61a454293ff5'

export const urlLists = {
  refund: {
    name: '功能反馈',
    url: `${base_url}/function-feedback.html#/feedback-home`,
  },
  refundActivity: {
    name: '功能反馈',
    url: `${base_url}/netc-h5-tools-optimize/function-feedback/function-feedback.html#/proposed-activity`,
  },
  feedback: {
    name: '反馈建议',
    url: `${h5_url}/feedback.html#/`,
  },
  coupon: {
    name: '优惠券',
    url: `${base_url}/coupon-list.html#/valid`,
  },
  couponNew: {
    name: '优惠券',
    // url: `${base_url}/coupon-list-new.html#/valid`
    url: `${coupon_url()}/crm-marketing-coupons/my-coupon/home.html#/valid`,
  },
  kefu: {
    name: '跨越速运客服中心',
    url: `${kuasheng_url}/ccms-jd-mobile/`,
  },

  hotline: {
    name: '总裁信箱',
    url: `${wx_gzh_url}/webapp/hotline` + '&type=hotline&loginNeed=true',
  },
  invoice: {
    name: '在线开票',
    url: `${invoice_url}/m/`,
  },
  prescription: {
    name: '运费时效',
    url: `${base_url}/freight-prescription.html#/`,
  },
  miniSarch: {
    name: '查件',
    url: `${base_url}/mini-search.html#/`,
  },
  realNameAuth: {
    name: '实名认证',
    url: `${base_url}/real-name-auth.html#/`,
  },
  applyAuth: {
    name: '付款授权',
    url: `${base_url}/auth-management.html#/`,
  },
  bonus: {
    name: '奖励金',
    url: `${base_url}/bonus.html#/bonus-home/`,
  },
  barcode: {
    name: '寄件码',
    url: `${BaseOrderURL}/barcode`,
  },
  evaluation: {
    name: '评价',
    url: `${BaseOrderURL}/evaluation`,
  },
  order: {
    name: '单票',
    url: `${BaseOrderURL}/single-order`,
  },
  // batchOrder: {
  //     name: '批量寄',
  //     url: `${BaseOrderURL}/batch-order`
  // },
  orderSuccess: {
    name: '下单成功页',
    url: `${BaseOrderURL}/order-success`,
  },
  waybillSearch: {
    name: '查件',
    url: `${BaseOrderURL}/waybill-search`,
  },
  orderRoute: {
    name: '订单路由',
    url: `${BaseOrderURL}/order-route`,
  },
  searchResult: {
    name: '搜索',
    url: `${BaseOrderURL}/search-result`,
  },
  waybillRoute: {
    name: '运单路由',
    url: `${BaseOrderURL}/waybill-route`,
  },
  waybillDetail: {
    name: '运单详情',
    url: `${BaseOrderURL}/waybill-detail`,
  },
  questionnaire: {
    name: '调查问卷',
    url: `${base_url}/h5/survey/`,
  },
  addressBook: {
    name: '地址簿',
    url: `${BaseOrderURL}/order-address-book`,
  },
  internationAddressBook: {
    name: '国际件地址簿',
    url: `${BaseOrderURL}/internation-address-book`,
  },
  sendAddress: {
    name: '寄件地址修改新增',
    url: `${BaseOrderURL}/internation-address-book/send-address-operate`,
  },
  receiveAddress: {
    name: '寄件地址修改新增',
    url: `${BaseOrderURL}/internation-address-book/receive-address-operate`,
  },
  internationWaybillNoDetail: {
    name: '国际件运单详情',
    url: `${BaseOrderURL}/international-detail`,
  },
  customerCodeIntro: {
    name: '客户绑码介绍页',
    url: `${base_url}/customer-code.html#/intro`,
  },
  customerCodeHome: {
    name: '客户绑码首页',
    url: `${base_url}/customer-code.html#/home`,
  },
  customerCodeBind: {
    name: '客户绑码首页',
    url: `${base_url}/customer-code.html#/bind`,
  },

  changeFeedbcak: {
    name: '变更反馈',
    url: `${base_url}/change-feedback.html#/home`,
  },
  preferenceSetting: {
    name: '偏好设置',
    url: `${BaseOrderURL}/preference-setting`,
  },
  noticeDriverPickup: {
    name: '待通知取货',
    url: `${BaseOrderURL}/notice-driver-pickup`,
  },
  // 新版付款授权
  paymentAuth: {
    name: '付款授权',
    url: `${base_url}/payment-authorization.html#/`,
  },
  transferPage: {
    name: '中转解析页',
    url: `${base_url}/transfer-page.html`,
  },
  bindPhone: {
    name: '微信绑定手机号',
    url: `${base_url}/bind-phone.html`,
  },
  scanBindCode: {
    name: '绑定客户编码',
    url: `${base_url}/bind-customer-code-result.html`,
  },
}

export default urlLists
