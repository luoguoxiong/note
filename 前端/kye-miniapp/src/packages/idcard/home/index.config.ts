export default definePageConfig({
  navigationBarTitleText: '智慧名片',
  enablePullDownRefresh: false,
  backgroundTextStyle: 'dark',
  navigationBarTextStyle: 'black',
  renderer: 'webview',
  enableShareAppMessage: true, // 显式启用
  usingComponents: {
    'my-player': 'plugin://myPlugin/player',
  },
  disableScroll: true,
})
