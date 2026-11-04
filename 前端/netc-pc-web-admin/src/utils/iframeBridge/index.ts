/**
 * @Desc: IframeBridge - iframe 通信桥接层
 * 用于管理 iframe 子应用的生命周期及与子应用的双向通信
 */
import Postmate from './build/postmate.es'
import * as EventActions from './constants'
import native from '@/utils/native'
import { getUserData, getToken, getCustomerList, getRealName } from './business'
import { isEmpty } from 'lodash-es'
import { getQueryObject, objectToUrlParams } from '@/utils/index'
import EE from '@/utils/eventemitter'
import { handleActionPageApi } from './actionPageApi'
import { ElMessage } from 'element-plus'
import { handleLogOutConfirm, userLogOut } from './interaction'
import { setToken } from '@/utils/auth'
import { usePcWebRootStore } from '@/stores/pc-web/root'
import { usePcWebThemeStore } from '@/stores/pc-web/theme'
import { usePcWebOrderConfigStore } from '@/stores/pc-web/orderConfig'
import { storeBridge } from '@/stores/pc-web/storeBridge'

// 通信原生能力方法重复调用处理(多个iframe实例订阅了同一个)
let callbackNameCurrent: string | null
// 通信原生能力重复数据回掉记录
let payloadCurrent: any

/**
 * 剥离 Vue 响应式 Proxy，转为可结构化克隆的普通对象
 * (postMessage 无法克隆 Proxy，直接传响应式数据会抛 DataCloneError)
 */
const toPlainData = <T>(data: T): T =>
  data === null || data === undefined ? data : (JSON.parse(JSON.stringify(data)) as T)

/** Iframe 加载参数 */
export interface IframeLoadParams {
  vm?: any
  container?: HTMLElement
  url: string
  model?: Record<string, any>
  name?: string
  classListArray?: string[]
  menuCode?: string
}

export default class IframeBridge {
  childIframe: any = null
  IframeName = `iframe-name-${Date.now()}`
  loadIframeStatus = 0
  loadParams: IframeLoadParams = {} as IframeLoadParams

  constructor() {
    this.loadParams = {} as IframeLoadParams
  }

  /**
   * 挂载iframe
   * @param params - 加载配置
   */
  loadIframe(params: IframeLoadParams) {
    const { vm, container = document.body, url, model = {}, name = this.IframeName, classListArray = [] } = params
    this.loadParams = params
    const commonModel = this.getCommonModel()
    const modelParams = {
      ...model,
      ...commonModel,
    }

    const goModel = toPlainData(modelParams)
    const handshake = new Postmate({
      container,
      url,
      model: goModel,
      name,
      classListArray,
    })

    return new Promise((resolve, reject) => {
      ;(handshake as any)
        .then((child: any) => {
          this.childIframe = child
          this._commonAttributeInit()
          if (vm) {
            this._bindEvents(vm)
          }
          // 路由变化监听
          EE.on('ROUTER_CHANGE', (event: any) => {
            this.routeChange(event)
          })
          resolve(child)
        })
        .catch((err: Error) => {
          console.error(err)
          reject(err)
        })
    })
  }

  /** 公共model数据 */
  getCommonModel() {
    // 主题配置
    const themeInfo = usePcWebThemeStore().themeInfo || {}
    return {
      commonModel: {
        ...themeInfo,
      },
    }
  }

  /**
   * 路由变化时触发
   * @param route - 路由对象
   */
  routeChange(route: {
    path: string
    fullPath: string
    params: any
    query: any
    name: string
    hasPathTabOpen?: boolean
  }) {
    const { path, fullPath, params, query, name } = route
    const childIframe = this.childIframe
    childIframe &&
      childIframe.call(EventActions.EVENT_TYPE_GET_GENERAL_DATA, {
        callbackName: EventActions.ON_ROUTE_CHANGE,
        hasPathTabOpen: route.hasPathTabOpen,
        data: toPlainData({
          path,
          fullPath,
          params,
          query,
          name,
        }),
      })
  }

  /** 销毁iframe */
  destroyIframe() {
    if (this.childIframe !== null) {
      this.childIframe.destroy()
      this.childIframe = null
    } else {
      // 异常场景，未连接childIframe还不存在
      if (this.loadParams?.container) {
        const iframe = this.loadParams.container.querySelector('iframe')
        iframe?.remove()
      }
    }
  }

  /**
   * 获取Iframe暴露的模型数据
   * @param key - 模型key
   */
  getModel(key: string) {
    if (this.childIframe !== null) {
      return this.childIframe.get(key)
    }
  }

  /** 客户端内走原生刷新，浏览器内退回location刷新（对齐老仓库 envSdk.routerReload） */
  private _routerReload() {
    if (native.isClientMode()) {
      native.reload()
    } else {
      window.location.reload()
    }
  }

  /** iframe 增加attribute公共参数 */
  private _commonAttributeInit() {
    const childIframe = this.childIframe
    childIframe.frame.allowFullscreen = true
  }

  /**
   * 绑定约定的事件
   */
  private _bindEvents(vm: any) {
    const childIframe = this.childIframe
    if (childIframe === null) {
      return console.error('bindEvents error')
    }

    this._handleGeneralDataEvents(childIframe)
    this._handleInteractionEvents(childIframe, vm)
    this._handlePlatformEvents(childIframe)
    this._handleUtilsEvents(childIframe)
  }

  /**
   * 处理通用数据的事件
   */
  private _handleGeneralDataEvents(childIframe: any) {
    const _this = this
    childIframe.on(EventActions.EVENT_TYPE_GET_GENERAL_DATA, async (eventInfo: any) => {
      const { actionType, callbackName, data, frameName } = eventInfo
      // 忽略非parent-child 匹配的消息
      if (frameName && _this.IframeName !== frameName) {
        return
      }

      let payload: any = null
      switch (actionType) {
        case EventActions.ACTIONS_GET_USER_INFO: {
          // 优先取 store 缓存(旧 vm.$store.state.userInfo, 对应 Pinia pcWebRoot)
          const rootStore = usePcWebRootStore()
          if (!isEmpty(rootStore.userInfo)) {
            payload = rootStore.userInfo
          } else {
            payload = await getUserData()
          }
          break
        }
        case EventActions.ACTIONS_GET_TOKEN:
          payload = getToken()
          break
        case EventActions.ACTIONS_CUSTOMER_CODE: {
          // 优先取 store 缓存(对齐老项目 vm.$store.state.customerList, 新项目对应 pinia pcWebRoot)
          const rootStore = usePcWebRootStore()
          if (!isEmpty(rootStore.customerList)) {
            payload = rootStore.customerList
          } else {
            payload = await getCustomerList()
          }
          break
        }
        case EventActions.ACTIONS_REALNAME_INFO: {
          // 优先取 store 缓存(对齐老项目 vm.$store.state.realNameInfo, 新项目对应 pinia pcWebRoot)
          const rootStore = usePcWebRootStore()
          if (!isEmpty(rootStore.realNameInfo)) {
            payload = rootStore.realNameInfo
          } else {
            payload = await getRealName()
          }
          break
        }
        case EventActions.ACTIONS_GET_LOCATION_HREF:
          payload = location.href
          break
        case EventActions.ACTION_BROWSER_RELOAD:
          if (data?.isEnvReload) {
            const { needQuerySave } = getQueryObject()
            if (needQuerySave === 'false') {
              window.location.replace(window.location.href.split('?')[0])
            }
            this._routerReload()
          } else {
            window.location.reload()
          }
          break
        // 触发store action 通知
        case EventActions.ACTION_STORE_ACTION:
          if (data?.key) {
            storeBridge.dispatch(data.key, data.value)
          }
          break
        // 触发store mutation 通知
        case EventActions.ACTION_STORE_MUTATION:
          if (data?.key) {
            storeBridge.commit(data.key, data.value)
          }
          break
        // 触发querySelector dom,仅支持返回boolean值
        case EventActions.ACTIONS_QUERY_SELECTOR:
          if (data) {
            payload = !!document.querySelector(data)
          }
          break
        case EventActions.ACTIONS_QUERY_SELECTOR_ALL:
          if (data) {
            payload = !!document.querySelectorAll(data)
          }
          break
        case EventActions.ACTION_CHANGE_TOKEN:
          if (data) {
            // 子应用通知父容器更新token（如手机号重新登录场景），对齐老仓库 useLogin().loginSucess
            const token = data?.ecasToken?.accessToken || data?.token
            if (token) {
              sessionStorage.clear()
              setToken(token)
              window.location.reload()
            }
          }
          break
        case EventActions.ACTION_GET_STORE_DATA:
          payload = storeBridge.state[data]
          break
        default:
          payload = {}
      }
      // 拿到数据后通知Iframe
      childIframe.call(EventActions.EVENT_TYPE_GET_GENERAL_DATA, {
        actionType,
        callbackName,
        data: toPlainData(payload),
      })
    })
  }

  /**
   * 处理业务交互事件
   */
  private _handleInteractionEvents(childIframe: any, vm: any) {
    const _this = this
    childIframe.on(EventActions.EVENT_TYPE_INTERACTION, (eventInfo: any) => {
      console.log(eventInfo, 'eventInfo ============== 处理业务交互事件')
      const { actionType, data = {}, frameName } = eventInfo
      const { url, type, params = {} } = data
      // 忽略非parent-child 匹配的消息
      if (frameName && _this.IframeName !== frameName) {
        return
      }

      const paramsStr = objectToUrlParams(params)
      const queryParams = paramsStr ? `?${paramsStr}` : ''

      switch (actionType) {
        case EventActions.ACTIONS_LOCATION_ROUTER:
          if (type === 'location') {
            window.location.href = window.location.origin + url + queryParams
          } else if (vm) {
            vm.$router.push({ path: url, query: params })
          }
          break
        case EventActions.ACTIONS_LOCATION_ROUTER_V2: {
          const { type: routerType } = data || {}
          if (vm) {
            switch (routerType) {
              case 'push':
                vm.$router.push({ ...data })
                break
              case 'replace':
                vm.$router.replace({ ...data })
                break
              case 'back':
                vm.$router.back()
                break
            }
          }
          break
        }
        case EventActions.ACTIONS_SWITCH_MODAL:
          usePcWebOrderConfigStore().updateOrderConfigModal(data)
          break
        // 页面配置交互
        case EventActions.ACTIONS_PAGE_API_CALL:
          handleActionPageApi(data)
          break
        case EventActions.ACTIONS_$MESSAGE_SEND:
          ElMessage({ ...data })
          break
        // 手机号重新登录弹窗唤起
        case EventActions.ACTION_HANDLE_LOGOUT_CONFIRM:
          if (data?.type === 'confirm') {
            handleLogOutConfirm({ ...data })
          } else if (data.type === 'default') {
            userLogOut()
          }
          break
        case EventActions.ACTION_BROWSER_RELOAD:
          if (data.isEnvReload) {
            const { needQuerySave } = getQueryObject()
            if (needQuerySave === 'false') {
              window.location.replace(window.location.href.split('?')[0])
            }
            this._routerReload()
          } else {
            window.location.reload()
          }
          break
        case EventActions.ACTION_LOCATION_CHANGE:
          if (url) {
            window.location.replace(`${window.location.origin}${window.location.pathname}#/${url}`)
            if (data.isReload) {
              setTimeout(() => {
                window.location.reload()
              }, 300)
            }
          }
          break
        case EventActions.ACTION_LOCATION_REPLACE_QUERY:
          const { needQuerySave } = getQueryObject()
          if (needQuerySave === 'false') {
            window.location.replace(window.location.href.split('?')[0])
          }
          break
        default:
        // payload = {};
      }
    })
  }

  /**
   * 处理客户端平台能力事件
   */
  private _handlePlatformEvents(childIframe: any) {
    const _this = this
    childIframe.on(EventActions.EVENT_TYPE_PLATFORM, async (eventInfo: any) => {
      const { actionType, callbackName, data, frameName } = eventInfo
      const { method = '', params = {} } = data || {}
      // 忽略非parent-child 匹配的消息
      if (frameName && _this.IframeName !== frameName) {
        return
      }

      let payload: any = null
      switch (actionType) {
        case EventActions.ACTIONS_IS_CLIENT_MODE:
          payload = native.isClientMode()
          break
        case EventActions.ACTIONS_CLIENT_API_CALL:
          if (native[method as keyof typeof native] && typeof native[method as keyof typeof native] === 'function') {
            // 存在id一致场景(重复调用处理)
            if (callbackNameCurrent === callbackName) {
              if (payloadCurrent) {
                payload = payloadCurrent
              } else {
                return Promise.resolve('repeat')
              }
            } else {
              callbackNameCurrent = callbackName
              if (data.args && data.args.length > 0) {
                console.log('data.args', callbackName, data.args)
                payload = await (native[method as keyof typeof native] as Function)(...data.args)
              } else {
                payload = await (native[method as keyof typeof native] as Function)(params)
              }
              payloadCurrent = payload
              callbackNameCurrent = null
            }
          }
          break
        default:
          payload = null
      }
      // 拿到数据后通知Iframe
      childIframe.call(EventActions.EVENT_TYPE_PLATFORM, {
        actionType,
        callbackName,
        data: toPlainData(payload),
      })
    })
  }

  /**
   * 处理公共辅助能力事件
   */
  private _handleUtilsEvents(childIframe: any) {
    childIframe.on(EventActions.EVENT_TYPE_COMMON_UTILS, () => {
      // 预留扩展
    })
  }
}
