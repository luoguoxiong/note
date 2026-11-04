export default definePageConfig({
  navigationBarTitleText: '组件预览',
  transparentTitle: 'none',
  navigationStyle: process.env.TARO_ENV === 'h5'? 'custom':"default",
  renderer: "webview",
})
