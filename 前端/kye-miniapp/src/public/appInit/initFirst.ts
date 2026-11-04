import '@public/utils/aplusConfig'
import KyeMiniUi from '@kye-netc/kye-miniui'
import { getPlateForm, isH5Env, isH5Pc, report_CLK_event } from '@/public/utils'
import { MINI_APP_VERSION } from '@/public/constants'
import { reportHomePagePerfence } from '@/layout/report/home'
import '@/public/socket'
import { ensureSubscribeOnce } from '@/public/storage/hooks/useCommonHook'
import { socket } from '@/public/socket'
import { initTraceSystem } from '@public/utils/report/reportPerformance'

// 全局Stroage通信注册
ensureSubscribeOnce()

// 组件库设置配置信息
KyeMiniUi.miniuiConfig.setConfig({
  isH5Pc: isH5Pc,
  H5PcWidth: 375,
})

// 首页性能埋点初始化
reportHomePagePerfence.setReportStart()
//全局性能埋点串联
initTraceSystem()
// websocket绑定app生命周期
socket.bindAppLifeCycle()

// 启动埋点
report_CLK_event('clk_open_miniprogram_v1', {
  isMiniApp: 1,
  appVersion: MINI_APP_VERSION,
  platform: getPlateForm(),
})

/* #ifdef H5 */

if (isH5Env && process.env.TARO_APP_ENV !== 'prod') {
  import('@/public/utils/loadResource').then(async ({ ResourceLoader }) => {
    await ResourceLoader.load([
      {
        type: 'js',
        url: 'https://unpkg.com/vconsole/dist/vconsole.min.js',
      },
    ])
    new window.VConsole()
  })
}

/* #endif */
