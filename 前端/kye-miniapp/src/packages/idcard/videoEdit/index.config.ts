export default definePageConfig({
  navigationBarTitleText: '个人介绍',
  enablePullDownRefresh: false,
  backgroundTextStyle: 'dark',
  navigationBarTextStyle: 'black',
  renderer: 'webview',
  usingComponents: {
    'my-player': 'plugin://myPlugin/player',
  },
})
