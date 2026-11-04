// eslint-disable-next-line no-undef
export default definePageConfig({
  navigationBarTitleText: '',
  // 微信：自定义导航（由 ky-container 内置 ky-navbar 渲染）
  navigationStyle: 'custom',
  // 支付宝：标题栏全透明 + 点击穿透，标题由 ky-navbar 渲染，避免双标题
  transparentTitle: 'always',
  titlePenetrate: 'YES',
  // @ts-ignore 支付宝原生导航返回键前景色（透明标题栏下保证可见）
  navigationBarFrontColor: 'black',
  navigationBarTextStyle: 'black',
  backgroundColor: '#f7f8fa',
  enablePullDownRefresh: false,
  renderer: 'webview',
})
