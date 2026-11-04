/**
 * 风控验证码(局部化)
 * 来源: customer-code 引用的 @/components/ky-verify-code (netc-pc-web/src/components/ky-verify-code/index.js)
 *  - 滑块: 腾讯云 TencentCaptcha(与框架无关, 逻辑不变)
 *  - 数字图形验证码: Vue.extend 动态实例 -> Vue3 createApp 挂载 verify-code-dialog.vue
 *  - element-ui Message -> element-plus ElMessage
 * 注: 老基座 withToken 配置 -> riskVerify 接口 unToken 参数(config.unToken: true 时风控校验接口不携带 token)
 */
import { createApp } from 'vue'
import { ElMessage } from 'element-plus'
import { CaptchaAppId, VerifyDialogType } from '../consts'
import { riskVerifyUserCheck } from '../api'
import VerifyCodeDialog from '../components/verify-code-dialog.vue'

interface TCaptchaResult {
  ret: number
  ticket: string
  randstr: string
  errorCode?: number
  errorMessage?: string
}

interface TCaptchaInstance {
  show: () => void
}

declare global {
  interface Window {
    TencentCaptcha: new (
      appId: string,
      callback: (params: TCaptchaResult) => void,
      options?: Record<string, any>
    ) => TCaptchaInstance
  }
}

/** 数字图形验证码弹窗实例(Vue3 动态挂载) */
type DigitalCaptchaInstance = {
  showDialog: (payload?: any, config?: any) => Promise<any>
}

let digitalCaptchaApp: ReturnType<typeof createApp> | null = null
let digitalCaptchaInstance: DigitalCaptchaInstance | null = null

function install(): DigitalCaptchaInstance {
  let instance = digitalCaptchaInstance
  if (!instance) {
    const container = document.createElement('div')
    document.body.appendChild(container)
    digitalCaptchaApp = createApp(VerifyCodeDialog)
    instance = digitalCaptchaApp.mount(container) as unknown as DigitalCaptchaInstance
    digitalCaptchaInstance = instance
  }
  return instance
}

/** 滑块校验回调上下文 */
type TCaptchaContext = {
  /** 风控校验入参(ruleId/strategyCode 等) */
  payload: Record<string, any>
  /** showVerifyCodeDialog 配置(unToken: true 时风控校验接口不携带 token) */
  config: Record<string, any>
}

/**
 * 滑块校验成功回调
 */
async function verifyTCaptchaCallback(
  params: TCaptchaResult,
  resolve: (value: any) => void,
  { payload, config = {} }: TCaptchaContext
) {
  try {
    if (params.ret === 0) {
      const captchaVerifyParam = {
        ...payload,
        captchaInfo: {
          ticket: params.ticket,
          randStr: params.randstr,
        },
      }
      const res = await riskVerifyUserCheck(captchaVerifyParam, !!config.unToken)
      if (res.code === 0 && res.data) {
        resolve({ safeVerifyId: res.data.safeVerifyId })
      } else {
        resolve(false)
      }
    } else if (params.ret === 2) {
      // 关闭了滑块弹窗，处理后续关闭滑块埋点或者特殊场景处理回调时，预留可以通过判断!safeVerifyId
      resolve({ safeVerifyId: '' })
    } else {
      resolve(false)
    }
  } catch (e: any) {
    console.log(e)
    resolve(false)
    if (e?.msg) {
      ElMessage({ message: e.msg, type: 'error' })
    }
  }
}

/** 腾讯云验证码错误兜底(生成容灾票据) */
function verifyTCaptchaErrorCallback(
  payload: Record<string, any>,
  resolve: (value: any) => void,
  config: Record<string, any> = {}
) {
  const ticket = `terror_1001_${CaptchaAppId}_${Math.floor(new Date().getTime() / 1000)}`
  verifyTCaptchaCallback(
    {
      ret: 0,
      randstr: '@' + Math.random().toString(36).substr(2),
      ticket,
      errorCode: 1001,
      errorMessage: 'jsload_error',
    },
    resolve,
    { payload, config }
  )
}

// 全局变量，用于缓存正在执行的加载 Promise
let captchaScriptLoadingPromise: Promise<void> | null = null
let captchaScriptLoadedSuccessfully = false

/** 加载腾讯验证码脚本（幂等、防重） */
export const loadCaptchaScript = (): Promise<void> => {
  // 如果已经加载过（DOM 中存在），直接 resolve
  if (document.getElementById('kyTCaptcha') && captchaScriptLoadedSuccessfully) {
    return Promise.resolve()
  }

  // 如果已有加载任务正在进行，返回该 Promise
  if (captchaScriptLoadingPromise) {
    return captchaScriptLoadingPromise
  }

  // 启动新的加载任务
  captchaScriptLoadingPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://turing.captcha.qcloud.com/TJCaptcha.js'
    script.id = 'kyTCaptcha'

    script.onload = () => {
      captchaScriptLoadingPromise = null
      captchaScriptLoadedSuccessfully = true
      resolve()
    }

    script.onerror = () => {
      captchaScriptLoadingPromise = null
      captchaScriptLoadedSuccessfully = false
      reject(new Error('Failed to load TJCaptcha.js'))
    }

    document.body.appendChild(script)
  })

  return captchaScriptLoadingPromise
}

/**
 * 打开风控验证码弹窗
 * @param payload 风控校验入参(ruleId/strategyCode 等)
 * @param config { type: VerifyDialogType, unToken?: boolean } unToken: true 时风控校验接口不携带 token
 * @returns 成功 { safeVerifyId } / 取消 { safeVerifyId: '' } / 失败 false
 */
export async function showVerifyCodeDialog(payload: Record<string, any> = {}, config: Record<string, any> = {}) {
  if (!config.type) return false
  // 风控校验错误码，1-图形验证码，2-已锁定不需要弹窗图形验证，4-滑块
  const { SLIDE_BLOCK } = VerifyDialogType
  if (config.type === SLIDE_BLOCK) {
    // 创建一个 3 秒超时的 Promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('timeout'))
      }, 3000)
    })
    try {
      await Promise.race([loadCaptchaScript(), timeoutPromise])
    } catch (error) {
      console.log(error)
      ElMessage({ message: '因网络较差无法获取，请稍后重试', type: 'error' })
      return false
    }

    return new Promise((resolve) => {
      try {
        const TCaptchaRef = new window.TencentCaptcha(
          CaptchaAppId,
          (params) => verifyTCaptchaCallback(params, resolve, { payload, config }),
          { needFeedBack: false }
        )
        TCaptchaRef.show()
        config.callback && config.callback()
      } catch (e: any) {
        console.log(e)
        resolve(false)
        if (`${e}`.includes('window.TencentCaptcha is not a constructor')) {
          ElMessage({ message: '因网络较差无法获取，请稍后重试', type: 'error' })
          return
        }
        // 加载异常，调用验证码js加载错误处理函数
        verifyTCaptchaErrorCallback(payload, resolve, config)
      }
    })
  }
  const instance = install()
  return instance.showDialog(payload, config)
}
