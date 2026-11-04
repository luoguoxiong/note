export default definePageConfig({
  navigationBarTitleText: '分享信息编辑',
  enablePullDownRefresh: false,
  backgroundTextStyle: 'dark',
  navigationBarTextStyle: 'black',
  renderer: 'webview',
  usingComponents: {
    'image-cropper': './components/croppers/image-cropper/image-cropper',
  },
})
