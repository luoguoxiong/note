export default definePageConfig({
  navigationBarTitleText: '跨越速运',
  navigationStyle: 'custom',
  transparentTitle: 'always',
  backgroundColor: '#fff',
  titlePenetrate: 'YES',
  navigationBarTextStyle: 'black',
  enablePullDownRefresh: false,
  pullRefresh: true,
  renderer: 'webview',
  disableScroll: true,
  enableShareAppMessage: true,
  enableShareTimeline: true,
  usingComponents: {
    'my-player': 'plugin://myPlugin/player',
  },
})
