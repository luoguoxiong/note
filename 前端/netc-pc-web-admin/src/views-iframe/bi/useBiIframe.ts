/**
 * BI 报表 iframe 接入（来源: netc-pc-web/src/views/micro-views/bi/*.vue + bi/mixins）
 * 通过 IframeBridge(Postmate) 挂载 web-netc-user 子应用
 */
import { ref, watch, onMounted, onUnmounted, getCurrentInstance } from 'vue'
import { useRoute } from 'vue-router'
import IframeBridge from '@/utils/iframeBridge'
import * as EventActions from '@/utils/iframeBridge/constants'
import EE from '@/utils/eventemitter'
import { useLightAppStore } from '@/stores/lightapp'
import { usePcWebClientStore } from '@/stores/pc-web/client'
import { getPhone, getUserData } from '@/stores/pc-web/deps/storage'
import { useIframeMixin } from '../mixins'

const DESTROY_IFRAME_EXPRESS = 'DESTROY_IFRAME_EXPRESS'
const ROUTER_CHANGE = 'ROUTER_CHANGE'

export interface UseBiIframeOptions {
  /**
   * 传入路由 name 后开启「路由激活/离开通知」：路由进出该页面时通过 IframeBridge
   * 通知子应用页面显示/隐藏（对齐老项目 smart-screen.vue notifyRouteState 逻辑）。
   * 老项目仅智慧大屏有此逻辑，故做成可选能力
   */
  routerName?: string
}

export function useBiIframe(
  menuCode: string,
  buildExtraParams?: () => Record<string, unknown>,
  options?: UseBiIframeOptions
) {
  const route = useRoute()
  const { proxy } = getCurrentInstance()!
  const lightAppStore = useLightAppStore()
  const clientStore = usePcWebClientStore()
  const { initIframeUrl, splicingEnvId } = useIframeMixin()

  const expressRef = ref<HTMLDivElement>()
  const pageUrl = ref('')

  let iframeBridgeInstance: IframeBridge | null = null

  /** 构建带业务参数的完整 url（token/phone/customer_id/company_name/权限等） */
  const initPageUrl = () => {
    let url = lightAppStore.microMenuRouteUrl(menuCode)
    const customerInfo = getUserData().customerInfo || {}
    url = initIframeUrl(
      url,
      {
        phone: getPhone() || '',
        customer_id: customerInfo.id,
        company_name: customerInfo.customerShortName,
        ...route.query,
        ...buildExtraParams?.(),
      },
      { ...route.params }
    )
    return url
  }

  /**
   * 通知子应用容器尺寸变化（对齐老项目 analytics-data.vue
   * contentWindow.postMessage({ type: 'resize' })，keep-alive 激活/路由变化时触发）
   */
  const sendResize = () => {
    const frame = (iframeBridgeInstance?.childIframe as { frame?: HTMLIFrameElement } | null)?.frame
    frame?.contentWindow?.postMessage({ type: 'resize' }, '*')
  }

  // 重置iframe
  /**
   * 重建 iframe(销毁后延迟重建)
   * @param newUrl 完整 url; 缺省时使用 pageUrl(已由 initPageUrl 拼好参数)
   */
  const reloadIframe = (newUrl?: string) => {
    const iframeUrl = newUrl || pageUrl.value
    destroyIframe()
    setTimeout(() => {
      initIframe(iframeUrl, true)
    }, 500)
  }

  /**
   * 初始化iframe
   * @param fullUrl
   * @param isFullUrl 是否是完整url,无需拼接(用于刷新)
   */
  const initIframe = (fullUrl: string, isFullUrl = false) => {
    if (!fullUrl) {
      // 诊断: url 为空多为 lightAppStore.microMenuRouteUrl 未取到(菜单未就绪/缺 loadAddress|routePath)
      console.warn(`[bi-iframe] initIframe 中止: url 为空, menuCode=${menuCode}`)
      return
    }
    if (iframeBridgeInstance !== null) {
      // 诊断: 疑似重复初始化(iframe 未销毁即再次 init)
      console.warn('[bi-iframe] initIframe 中止: 已存在未销毁的 IframeBridge 实例', { menuCode })
      return
    }
    iframeBridgeInstance = new IframeBridge()
    const goUrl = isFullUrl ? fullUrl : initIframeUrl(fullUrl, { ...route.query }, { ...route.params })
    // ⚠️ container 必须取当前组件自己的容器(expressRef): 多个 BI 页面并存时
    // document.querySelector('.page--bi-index') 会命中 DOM 里第一个(可能是其他页面的隐藏容器),
    // 导致 iframe 插错容器 -> 当前页面白屏(2026-11 BI 切换白屏事故根因)
    if (!expressRef.value) {
      console.warn(`[bi-iframe] expressRef 未绑定(检查页面是否解构 expressRef), 中止挂载, menuCode=${menuCode}`)
      return
    }
    const params = {
      vm: proxy,
      container: expressRef.value,
      url: splicingEnvId(goUrl),
      classListArray: ['wh-full'],
    }
    return iframeBridgeInstance
      .loadIframe(params)
      .then(() => {
        // 诊断: 握手完成标记(与"容器内无 iframe/iframe 白屏"现象区分)
        console.log('[bi-iframe] 握手完成', { menuCode, url: splicingEnvId(goUrl) })
        EE.once(DESTROY_IFRAME_EXPRESS, () => {
          destroyIframe()
        })
        // 推送当前路由参数
        EE.emit(ROUTER_CHANGE, route)
      })
      .catch((e) => {
        console.error('[bi-iframe] iframe 加载失败(握手异常)', { menuCode }, e)
      })
  }

  const destroyIframe = () => {
    if (iframeBridgeInstance !== null) {
      iframeBridgeInstance.destroyIframe()
      iframeBridgeInstance = null
    }
  }

  /**
   * 通过 IframeBridge(Postmate) 通知子应用页面显示/隐藏
   * （对齐老项目 smart-screen.vue notifyRouteState：EVENT_TYPE_GET_GENERAL_DATA
   *   + callbackName=ON_ROUTE_ACTIVE/ON_ROUTE_LEAVE，携带 to/from 路由快照）
   */
  const notifyRouteState = (isActive: boolean, to: typeof route, from: typeof route | undefined) => {
    const child = iframeBridgeInstance?.childIframe
    if (!child) return
    child.call(EventActions.EVENT_TYPE_GET_GENERAL_DATA, {
      callbackName: isActive ? EventActions.ON_ROUTE_ACTIVE : EventActions.ON_ROUTE_LEAVE,
      data: {
        to: { path: to?.path, query: to?.query, params: to?.params },
        from: { path: from?.path, fullPath: from?.fullPath },
      },
    })
  }

  // 路由进出当前页面时通知子应用（routerName 未配置时不启用，对齐老项目仅智慧大屏开启）
  if (options?.routerName) {
    // 前一路由快照（route 是响应式对象，浅拷贝出普通对象供通知时读取 path/query/params/fullPath）
    let prevRoute: typeof route = { ...route }
    watch(
      () => route.fullPath,
      () => {
        const from = prevRoute
        prevRoute = { ...route }
        if (route.name === options.routerName) {
          notifyRouteState(true, route, from)
        } else if (from?.name === options.routerName) {
          notifyRouteState(false, route, from)
        }
      }
    )
  }

  onMounted(async () => {
    await lightAppStore.init()
    pageUrl.value = initPageUrl()
    // pageUrl 已由 initPageUrl 拼好业务参数, 作为完整 url 使用, 避免二次追加 timestamp
    initIframe(pageUrl.value, true)
  })

  onUnmounted(() => {
    destroyIframe()
  })

  return {
    clientStore,
    expressRef,
    pageUrl,
    initPageUrl,
    reloadIframe,
    initIframe,
    destroyIframe,
    sendResize,
  }
}
