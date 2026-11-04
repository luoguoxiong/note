export default definePageConfig({
  navigationBarTitleText: '我的',
  transparentTitle: 'always',
  navigationStyle: 'custom',
  // @ts-ignore
  navigationBarFrontColor: 'black',
  navigationBarTextStyle: 'black',
  allowsBounceVertical: 'YES',
  renderer: 'webview',
  componentFramework: 'glass-easel',
  enablePullDownRefresh: false,
  pullRefresh: true,
  disableScroll: true,
})
