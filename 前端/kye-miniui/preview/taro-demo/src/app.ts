import DemoUiLib from '@ky-miniui-lib/ky-miniui-lib'
import { createApp } from 'vue'
import './app.scss'
import { enableTouchPolyfill } from './utils/polyfill/touchPolyfill'
// import apm_help from '@/public/utils/apm'
// import { setGlobalDataPlugin } from '@tarojs/taro'
// import packageConfig from '../package.json'
// import aPlus, { aplusTraceId, updateAppletOpenIdByCode } from '@/public/utils/aplusConfig'

if (process.env.TARO_ENV === 'h5') {
  enableTouchPolyfill()
}
const App = createApp({
  onShow() {
    console.log('App onShow.')
    // updateAppletOpenIdByCode()
    // apm初始化
    // apm_help.init()
  },
  // 入口组件不需要实现 render 方法，即使实现了也会被 taro 所覆盖
})
App.use(DemoUiLib)

/* getApp() 全局变量 */
// App.use(setGlobalDataPlugin, {
//   globalData: {
//     shellVersion: packageConfig.version,
//     isShowingLogoutModal: false,
//   },
//   aplus: aPlus,
//   aplusUserData: {},
//   aplusTraceId,
// })

export default App
