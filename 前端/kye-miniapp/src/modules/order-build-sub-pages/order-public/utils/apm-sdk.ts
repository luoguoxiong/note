import md5 from 'js-md5'
// import { init, setUserConfig, captureException } from '@umengfe/apm'
// import { isProd } from '@order-public-sub-public/utils/env'
// import { initParams } from '@umengfe/apm/preview/src/config'

class Apm {
  // 2024/03/14初始化改为异步初始化，不再使用@umengfe/apm
  /*  initApm() {
    // 注：app不走云控配置，此处处理自定义上报ID在APP端不上报的问题（临时方案）
    window.UAPM_JSBridge = null
    window.UAPM_JSB_CONFIG = null

    const _PID = {
      PROD: '7ybj9lsm0swmxw8lb86vkmvn',
      UAT: 'd7ydioifahs8c3nks0gaqvrs',
    }

  //   const _DSN = {
  //     PROD: 'https://quickaplus-api.ky-tech.com.cn',
  //     UAT: 'https://quickaplus-api-uat.ky-tech.com.cn:1443',
  //   }

  //   const params = {
  //     pid: isProd ? _PID.PROD : _PID.UAT,
  //     dsn: isProd ? _DSN.PROD : _DSN.UAT,
  //     pageFilter: { mode: 'ignore', rules: [] },
  //     blankConfig: {
  //       blank_target: '#app', // 白屏检查目标元素
  //       blank_timeout: 3000, // 白屏检查时机，页面加载后多久检查白屏，单位毫秒
  //     },
  //   }

    init(params as unknown as initParams)
    console.log('初始化apm--完成', params)
  }*/

  // 自定义上报用户ID
  setUserId(phone: string) {
    const puid = md5(`${phone}netc`)
    console.log('userId===>', puid)
    // setUserConfig({ puid })
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // _apm && _apm('set', 'puid', puid)
  }

  // 错误上报
  reportError(error: Error) {
    // captureException && captureException(error)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // _apm && _apm('captureException', error)
  }
}

export default new Apm()
