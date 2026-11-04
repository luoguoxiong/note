import { subpackages } from './subpackages'

import { mainPages } from './mainpackages'

export default defineAppConfig({
  entryPagePath: 'layout/pages/home/index',
  pages: [
    // 'layout/pages/home/index',
    // 'layout/pages/mine/index',
    // 'layout/pages/waybill/index',
    // 'layout/pages/order/index',
    ...mainPages,
  ],
  subpackages: [
    {
      // 扫码链路
      root: 'modules/scan',
      pages: ['pages/home/index', 'pages/webview/index'],
    },
    {
      // 扫码转月结
      root: 'modules/monthly-settlement',
      pages: ['pages/monthly-qrcode/index'],
    },
    {
      // 用户信息
      root: 'modules/user',
      pages: [
        'pages/login/index',
        'pages/realname/home/index',
        'pages/realname/personal/index',
        'pages/realname/check/index',
        'pages/realname/qrcode-error/index',
        'pages/realname/enterprise/step-one/index',
        'pages/realname/enterprise/step-two/index',
        'pages/realname/finish/index',
        'pages/realname/view-verify-info/index',
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
      pages: ['pages/webview/index', 'pages/event-channel/index'],
    },
    {
      // 下单
      root: 'modules/order',
      pages: ['pages/order/index', 'pages/order-success/index', 'pages/webview/index'],
    },
    {
      // 支付
      root: 'modules/pay',
      pages: ['pages/alipay/index'],
    },
    {
      root: 'modules/setting',
      pages: ['pages/index/index', 'pages/account/index', 'pages/notify/index'],
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
      root: 'modules/native',
      pages: ['pages/previewImage/index', 'pages/test/index'],
    },
    {
      root: 'modules/order-build-sub-pages',
      pages: [
        'pages/receipt-page/ky-receipt-page/index',
        'pages/order-encrypt-desc/index',
        'pages/item-insured-new/index',
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
        'order-public/components/business/map-position/page/index',
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
      root: 'modules/privacy-phone',
      pages: ['pages/black-list/index', 'pages/white-list/index', 'pages/sms-code/index', 'pages/settings/index'],
    },
    // 工具原生化路由
    {
      root: 'modules/tools',
      pages: [
        'delivery-area/index',
        'message-center/home/index',
        'message-center/list/index',
        'message-center/detail/index',
        'about-company/index',
        'industry/index',
      ],
    },
    { root: 'packages/other', pages: ['qrcodeScan/index'] },
    // 运费时效
    {
      root: 'modules/freight-time',
      pages: ['pages/index/index', 'pages/adress/index', 'pages/guide/index'],
    },
    // 智慧名片
    // {
    //   root: 'packages/idcard',
    //   // 'home/index', 'edit/index', 'industry-solutions/index'
    //   pages: ['configStep/index', 'rich/index', 'industry-solutions/index'],
    // },
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

  renderer: 'skyline',
  lazyCodeLoading: 'requiredComponents',
  componentFramework: 'glass-easel',
  permission: {
    'scope.clipboard': {
      desc: '需要获取您的剪贴板权限，用于智能填写寄件人、收件人、联系电话及地址信息，方便您快捷下单',
    },
  },
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
      packages: ['modules/waybill-build', 'modules/order-build'],
    },
  },
  window: {
    transparentTitle: 'always', // 设置全局导航栏透明
    titlePenetrate: 'YES', // 允许内容穿透导航栏
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: '',
    navigationBarTextStyle: 'black',
    allowsBounceVertical: 'NO',
    // enableInPageRenderInput: 'YES', // iOS 系统支持focus自动唤起 - 影响@input事件
  },
  permission: {
    'scope.album': {
      desc: '用于扫码寄件、查单、上传图片、智能识别地址、身份证识别、ai识别图片服务，保存电子存根和电子回单服务',
    },
    'scope.camera': {
      desc: '用于扫码寄件、查单、上传图片、拍摄预览、拍摄图片、智能识别地址、身份证识别、ai识别图片服务',
    },
  },
})
