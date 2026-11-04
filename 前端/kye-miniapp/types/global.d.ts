/* eslint-disable no-unused-vars */
/// <reference types="@tarojs/taro" />

declare module '*.png'
declare module '*.gif'
declare module '*.jpg'
declare module '*.jpeg'
declare module '*.svg'
declare module '*.css'
declare module '*.less'
declare module '*.scss'
declare module '*.sass'
declare module '*.styl'

declare namespace NodeJS {
  interface ProcessEnv {
    /** NODE 内置环境变量, 会影响到最终构建生成产物 */
    NODE_ENV: 'development' | 'production'
    /** 当前构建的平台 */
    TARO_ENV: 'weapp' | 'swan' | 'alipay' | 'h5' | 'rn' | 'tt' | 'qq' | 'jd' | 'harmony' | 'jdrn'
    /**
     * 当前构建的小程序 appid
     * @description 若不同环境有不同的小程序，可通过在 env 文件中配置环境变量`TARO_APP_ID`来方便快速切换 appid， 而不必手动去修改 dist/project.config.json 文件
     * @see https://taro-docs.jd.com/docs/next/env-mode-config#特殊环境变量-taro_app_id
     */
    TARO_APP_ID: string
    /* API环境变量 */
    TARO_APP_ENV: 'dev' | 'stg' | 'uat' | 'prod'
  }
}

declare namespace WechatMiniprogram {
  interface Wx {
    getPhoneMask(arg0: {
      success?: (result: { operatorType: number; phoneMask: string }) => void
      fail?: (err: { errCode: number; errMsg: string }) => void
    }): unknown

    miniapp: {
      chooseFile(arg0: { allowsMultipleSelection: boolean; success(res: any): void; fail(err: any): void }): unknown
      copyNativeFileToWx(arg0: { nativeFilePath: any; success(res: any): void; fail(e: any): void }): unknown
      getPrivacySetting(arg0: { success(res: any): void }): unknown
      closeApp(): unknown
      closeAppModule(): unknown
      loadNativePlugin(options: { pluginId: string; success?: (plugin: any) => void; fail?: (err: any) => void }): void
      openSaaAActionSheet(options: { success: (res: any) => void }): void
    }
  }
}

declare module '@tarojs/components' {
  export * from '@tarojs/components/types/index.vue3'
}

interface Window {
  VConsole: any
  fsDefaultLightApp: any
  __cityCodes__: any
  h5sdk: {
    /**
     * 注册错误回调
     * @param callback 错误回调函数
     */
    error: (callback: (err: any) => void) => void

    /**
     * SDK 准备完成回调
     * @param callback 准备完成后执行的函数
     */
    ready: (callback: () => void) => void

    /**
     * 其他 H5 SDK 方法（按需扩展）
     */
    [key: string]: any
  }
  tt: {
    requestAccess: (options: {
      appID: string
      scopeList: Array<string>
      success?: (res: any) => void
      fail?: (res: any) => void
    }) => void
    [key: string]: any
  }
}
declare const __non_webpack_require__: (path: string, callback: (data: any) => void) => void

// 主子应用环境变量
declare const APPLICATION_ENV: string
declare const APP_VERSION: string
