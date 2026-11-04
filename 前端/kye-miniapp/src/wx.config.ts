import { subpackages } from './subpackages'

import { mainPages } from './mainpackages'

export default defineAppConfig({
  animation: {
    duration: 100,
    delay: 50,
  },
  entryPagePath: 'layout/pages/home/index',
  pages: [...mainPages],
  subpackages: [
    {
      root: 'pages',
      pages: ['index/index', 'mypage/index', 'entry/index', 'search/index'],
    },
    {
      // 扫码链路
      root: 'modules/scan',
      pages: ['pages/home/index', 'pages/webview/index'],
    },
    {
      // 用户信息
      root: 'modules/user',
      pages: [
        'pages/login/index',
        'pages/scanLogin/index',
        'pages/scanLogin/result',
        'pages/scanBindCode/index',
        'pages/changeLogin/index',
        'pages/user-setting/index',
        'pages/userEdit/index',
        'pages/bind-phone/index',
        'pages/change-phone/index',
        'pages/account-logoff/index',
        'pages/account-logoff-feedback/index',
        'pages/invite-poster/index',
        'pages/realname/home/index',
        'pages/realname/personal/index',
        'pages/realname/check/index',
        'pages/realname/qrcode-error/index',
        'pages/realname/finish/index',
        'pages/realname/enterprise/step-one/index',
        'pages/realname/enterprise/step-two/index',
        'pages/realname/view-verify-info/index',
        // 客户编码模块（统一入口）
        'pages/customer-code/index',
        'pages/customer-code/password-apply/index',
        'pages/customer-code/password-result/index',
        'pages/customer-code/apply/index',
        'pages/customer-code/apply-result/index',
        'pages/customer-code/apply-result/wechatwork-qrcode',
      ],
    },
    {
      // 查件
      root: 'modules/waybill',
      pages: [
        'pages/waybill-route/index',
        'pages/waybill-detail/index',
        'pages/order-route/index',
        'pages/webview/index',
      ],
    },
    {
      // 用户信息
      root: 'modules/webview',
      pages: ['pages/webview/index', 'pages/event-channel/index', 'pages/online-service/index'],
    },
    {
      // 下单
      root: 'modules/order',
      pages: ['pages/order/index', 'pages/order-success/index', 'pages/webview/index'],
    },
    {
      // 支付
      root: 'modules/pay',
      pages: ['pages/alipay/index', 'pages/wxpay/index'],
    },
    {
      root: 'modules/setting',
      pages: [
        'pages/index/index',
        'pages/account/index',
        'pages/notify/index',
        'pages/share/index',
        'pages/auth/index',
      ],
    },
    {
      root: 'modules/privacy-phone',
      pages: ['pages/black-list/index', 'pages/white-list/index', 'pages/sms-code/index', 'pages/settings/index'],
    },
    {
      // 富文本详情
      root: 'modules/rich',
      pages: ['pages/index/index'],
    },
    {
      // 富文本详情
      root: 'modules/cms-template',
      pages: ['pages/about-kye/index'],
    },
    {
      root: 'modules/search',
      pages: ['pages/search/index'],
    },
    {
      // 扫码转月结
      root: 'modules/monthly-settlement',
      pages: ['pages/monthly-qrcode/index'],
    },
    {
      root: 'modules/native',
      pages: [
        'pages/saveImageToPhotosAlbum/index',
        'pages/openMiniProgram/index',
        'pages/scanQRCode/index',
        'pages/openLocation/index',
        'pages/previewImage/index',
        'pages/share/index',
        'pages/base/index',
        'pages/test/index',
        'pages/appPay/alipay/index',
        'pages/appPay/wxpay/index',
        'pages/appPay/unifypay/index',
        'pages/updateApp/index',
      ],
    },
    {
      root: 'modules/app-plugin',
      pages: ['pages/test/index'],
    },
    {
      // CRM 营销
      root: 'modules/crm-marketing',
      pages: ['pages/points-center-subscribe/index'],
    },
    // 智慧名片
    {
      root: 'packages/idcard',
      pages: [
        'configStep/index',
        'rich/index',
        'industry-solutions/index',
        'home/index',
        'edit/index',
        'visitor/index',
      ],
    },
    {
      root: 'packages/message-subscription',
      pages: ['home/index'],
    },
    {
      root: 'packages/webview',
      pages: [
        'applet-sms',
        'applyAuth',
        'barcode',
        'message-center',
        'h5',
        'index',
        'openWebview',
        'minprogram-code',
        'scanQrCode',
        'onlineService',
        // 预存
        'depositFreight',
        'withdraw',
        'real-name-auth',
        'customerCode',
        'webview-custom-refresh',
        'freight-time',
        'modifyPrice',
        'waybill-detail',
        // 积分中心
        'integral-center',
        // 通用webview桥接-营销专用
        'market-page',
        // 营销活动小程序码页面
        'market-applet-code',
        'notice-driver-pickup',
        'webViewOrder',
      ],
    },
    {
      root: 'packages/mailing',
      pages: ['batch/index', 'single/index', 'scanFillSingle/index'],
    },
    {
      root: 'packages/waybill',
      pages: ['route/index'],
    },
    {
      root: 'packages/test',
      pages: ['index'],
    },
    {
      root: 'packages/customerCode',
      pages: ['customerCodeBind', 'customerCodeIntro', 'customerHome', 'customerView', 'nativeCustomer'],
    },
    {
      root: 'packages/payment',
      pages: ['payment-approve', 'payment-auth', 'payment-share'],
    },
    {
      root: 'packages/user',
      pages: ['accountCentral/index', 'qrcode/index', 'scanLogin/index', 'scanCodeNew/index', 'scanCode/index'],
    },
    {
      root: 'modules/order-build-sub-pages',
      pages: [
        'pages/receipt-page/ky-receipt-page/index',
        'pages/order-encrypt-desc/index', // 超包了
        'pages/print/index',
        'pages/print/teplatepng/index',
        'pages/print/print-preview/index',
        'pages/item-insured-new/index',
        'pages/print-records/index',
        'pages/questionnaire-fee/index',
        'pages/night-cost/index',
        'pages/empty/index',
        'pages/order-success/index',
        'pages/order-exhibition/index',
        'pages/share-send/invite-success/index',
        'pages/share-send/invited-success/index',
        'pages/share-send/invite-list/index',
        'pages/share-send/share/index',
        'pages/order-service-introduction/index',
        'order-public/components/business/added-service/components/receipt-resources/index',
        'order-public/components/business/map-position/page/index',
        'order-public/components/business/added-service/receipter-info/index',
        'order-public/components/business/address-book/clear-addr/index',
        'order-public/components/business/product-info/components/goods-type-files/index',
        'order-public/components/business/product-info/components/goods-delivery-detail/index',
        'order-public/components/business/address-book/share-page/index',
        'order-public/components/business/address-book/page/index',
        'order-public/components/business/address-book/sender/index',
        'order-public/components/business/address-book/receive/index',
        'pages/air-contraband/index',
        // 取货/派货资料页（从 order-build 迁入，减包子包体积）
        'order-public/components/business/pickup-information/page/index',
        'order-public/components/business/pickup-information/page-waybill/index',
        'order-public/components/business/dispatch-information/page/index',
        'order-public/components/business/product-info/components/select-size/index',
        'order-public/components/business/product-info/components/add-my-size/index',
        'order-public/components/business/ka-customer-map/page/notepad/index',
      ],
    },
    {
      // 支付页
      root: 'packages/pay',
      pages: [
        // h5跳转支付
        'h5/index',
        'paymentInvoice/index',
      ],
    },
    {
      root: 'packages/other',
      pages: [
        // CRM营销抽奖活动
        'marketingLottery/index',
        // 预存运费 - 他人代付页面
        'depositFreight/qrcode',
        // 积分授权页面
        'integralAuth/index',
        // 积分授权页面-new
        'integralAuthNew/index',
        // CRM满额福利
        'full-benefit/index',
        // 扫码跳转目标页
        'qrcodeJump/index',
        // 积分授权-协议页面-new
        'authAgreement/index',
        // 跳转其他小程序中转页
        'share/index',
        'scanSurvey/index',
        'changeFeedbackNew/index',
        'changeFeedback/index',
        'transfer-search/index',
        // 评价扫码
        'qrcode/index',
        'scanBindCode/index',
        // 扫码跳转
        'scanH5/index',
        // 二维码面单重新扫码
        'qrcodeScan/index',
        // 跳转腾讯电子签章中转页
        'crmEsig/index',
      ],
    },
    {
      root: 'packages/activity',
      pages: [
        // 活动扫码页-通用入口中转
        'activityEntry/index',
        // 大闸蟹
        'crab/index',
        // 预约中心
        'reservation/index',
        // 参与抽奖
        'festival/draw',
      ],
    },
    {
      root: 'packages/crm',
      pages: [
        // CRM 摇奖活动
        'lottery-new/index',
      ],
    },
    {
      // 全民拓客
      root: 'subpackages-expand-customer',
      pages: [
        // 主页 - 填写企业客户信息
        'pages/index/index',
        // 新客户成功页
        'pages/new/index',
        // 老客户成功页
        'pages/old/index',
      ],
    },
    {
      // 扫码公共中转页,公共webview
      root: 'subpackages',
      pages: ['common-page/webview-page/index', 'common-page/scan/index', 'temp/temp3'],
    },
    // 工具原生化路由
    {
      root: 'modules/tools',
      pages: [
        'sigin/index',
        'third-sigin/index',
        'delivery-area/index',
        'message-center/home/index',
        'message-center/list/index',
        'message-center/detail/index',
        'about-company/index',
        'industry/index',
      ],
    },
    // 运费时效
    {
      root: 'modules/freight-time',
      pages: ['pages/index/index', 'pages/adress/index', 'pages/guide/index'],
    },
    ...subpackages,
  ],
  tabBar: {
    list: [
      {
        iconPath: 'layout/assets/images/tabbar/menu_home.png',
        selectedIconPath: 'layout/assets/images/tabbar/menu_home_selected.png',
        pagePath: 'layout/pages/home/index',
        text: '首页',
      },
      {
        iconPath: 'layout/assets/images/tabbar/menu_order.png',
        selectedIconPath: 'layout/assets/images/tabbar/menu_order_selected.png',
        pagePath: 'layout/pages/order/index',
        text: '寄件',
      },
      {
        iconPath: 'layout/assets/images/tabbar/menu_search.png',
        selectedIconPath: 'layout/assets/images/tabbar/menu_search_selected.png',
        pagePath: 'layout/pages/waybill/index',
        text: '查件',
      },
      {
        iconPath: 'layout/assets/images/tabbar/menu_mine.png',
        selectedIconPath: 'layout/assets/images/tabbar/menu_mine_selected.png',
        pagePath: 'layout/pages/mine/index',
        text: '我的',
      },
    ],
    color: '#000000',
    selectedColor: '#8565F3',
    backgroundColor: '#fff',
    borderStyle: 'white',
  },

  renderer: 'webview',
  requiredPrivateInfos: [
    'getLocation', // 声明需要地理位置接口
    'chooseAddress', // 声明需要地理位置接口
  ],
  permission: {
    'scope.userLocation': {
      desc: '你的位置信息将用于小程序位置接口的效果展示',
    },
  },
  lazyCodeLoading: 'requiredComponents',
  componentFramework: 'glass-easel',
  rendererOptions: {
    skyline: {
      defaultDisplayBlock: true,
      enableScrollViewAutoSize: true,
      // defaultContentBox: true,
    },
  },
  preloadRule: {
    'layout/pages/home/index': {
      network: 'all',
      packages: ['modules/order-build'],
    },
    'layout/pages/order/index': {
      network: 'all',
      packages: ['modules/order-build'],
    },
    'layout/pages/waybill/index': {
      network: 'all',
      packages: ['modules/waybill-build'],
    },
  },
  window: {
    transparentTitle: 'always',
    titlePenetrate: 'YES',
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: '',
    navigationBarTextStyle: 'black',
    handleWebviewPreload: 'auto',
    backgroundColor: '#fff',
    backgroundColorContent: '#ffffffff',
  },
  plugins: {
    captcha: {
      version: '2.1.2',
      provider: 'wx1fe8d9a3cb067a75',
    },
    myPlugin: {
      version: '0.1.2',
      provider: 'wx116d0dd5e6a39ac7',
    },
  },
  usingComponents: {
    't-captcha': 'plugin://captcha/t-captcha', // 重复注册
    'custom-input': '/components/custom-input',
    'custom-login-btn': '/components/custom-login-btn',
    'custom-textarea': '/components/custom-textarea',
    // 'waybill-card-v2': '/components/custom-waybill-card', // 编译到小程序时的路径
  },
  miniApp: {
    useAuthorizePage: true,
  },
})
