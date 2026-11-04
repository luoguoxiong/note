/**
 * @Desc: native.config
 * @Date: 2025/9/10
 */
const pages = [
  'pages/demo/index',
  'pages/list/index',
  'pages/preview/index',
  'pages/virtual-list/index',
  'pages/h5-preview/index',
]

export default defineAppConfig({
  entryPagePath: 'pages/list/index',
  pages: pages,
  subpackages: [
    {
      root: 'modules/container',
      pages: ['pages/navbar/index', 'pages/navbar-detail/index', 'pages/container-detail/index', 'pages/picker/index'],
    },
    {
      root: 'modules/demo',
      pages: ['popover/index', 'popup/index', 'dialog/index', 'tab/index', 'cropper-image/index'],
    },
  ],
  renderer: 'skyline',
  lazyCodeLoading: 'requiredComponents',
  componentFramework: 'glass-easel',
  rendererOptions: {
    skyline: {
      defaultDisplayBlock: true,
      // defaultContentBox: true,
    },
  },
  window: {
    allowsBounceVertical: 'NO',
    pullRefresh: false,
    transparentTitle: 'always', // 设置全局导航栏透明
    titlePenetrate: 'YES', // 允许内容穿透导航栏
    // enableInPageRenderInput: 'YES', // iOS 系统支持focus自动唤起
  },
  // 这里放微信端独有的 usingComponents
  ...(process.env.TARO_ENV === 'weapp'
    ? {
        usingComponents: {
          'custom-input': '/components/custom-input',
          'custom-textarea': '/components/custom-textarea',
        },
      }
    : {}),
})
