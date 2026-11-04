import { app } from '@/main'
import { ExtendedRouteRecordRaw, RawRouteComponent } from '@/router/types'
import { Any } from '@/types'
import EE from '@/utils/eventemitter'
import { computed, nextTick, onBeforeMount, onUnmounted, reactive, toRefs, watch } from 'vue'
import { RouteLocationNormalizedLoaded, useRouter } from 'vue-router'

interface IfranmeComponentIn {
  name: string
  path: string
  /** 是否渲染过 */
  hasOpen: boolean
  /** keepAlive(meta.keepAlive)：关闭 tab 不销毁组件，仅隐藏(display:none)，再次打开时恢复显示 */
  keepAlive: boolean
  /** tab 是否已关闭（仅 keepAlive 组件使用：关闭后组件保留在渲染列表，由渲染处 v-show 隐藏） */
  closed: boolean
  /** 是否展示预加载页面 */
  isShow: boolean
  component: RawRouteComponent
}

interface LazyIframeConfig {
  name: string
  path: string
  keepAlive: boolean
  iframeComponent: RawRouteComponent
}

interface UseInitState {
  hasOpenComponentsArr: IfranmeComponentIn[]
}
/**
 * useRoutePrefetch 用于管理 iframe 组件的加载策略。
 * - preload: true  → 预加载：直达该路由立即挂载；其余等首屏就绪(window load)+浏览器空闲后再挂载，自动保持存活
 * - preload: false → 组件仅在对应路由激活时才加载（懒加载）
 * - keepAlive: true（meta.keepAlive）→ 关闭 tab 时不销毁组件，仅隐藏(display:none)，再次打开时恢复显示
 * - 非 keepAlive 组件一旦被访问（打开 tab）即保持存活，关闭 tab 时才销毁，与路由 keepAlive 配置无关
 * @returns { UseInitState } 预加载组件状态。
 */

/** 路由变化事件(对齐老项目 consts/global ROUTER_CHANGE，iframeBridge 监听后推送给子应用) */
const ROUTER_CHANGE = 'ROUTER_CHANGE'
/** 强制刷新指定 iframe 页签(对齐老项目 SWITCH_IFRAME_ROUTER_REFRESH) */
export const SWITCH_IFRAME_ROUTER_REFRESH = 'SWITCH_IFRAME_ROUTER_REFRESH'

export function useRoutePrefetch() {
  const { options, currentRoute } = useRouter()

  const state = reactive<UseInitState>({
    hasOpenComponentsArr: [],
  })

  // 存储懒加载（非预加载）的 iframe 路由配置
  const lazyIframeRoutes: LazyIframeConfig[] = []

  // 所有 iframe 路由的 path（静态 + 动态，用于 Tabs 排除内部页面重复 tab）
  const iframePaths: string[] = []

  // 待延迟挂载的预加载路由 path（首屏就绪且浏览器空闲后再挂 iframe，见 schedulePreloadMount）
  const pendingPreloadPaths: string[] = []
  // 预加载调度句柄（布局卸载时清理，防止登出后空闲回调再挂载 iframe）
  let preloadIdleId: number | null = null
  let preloadTimerId: number | null = null
  let removeLoadListener: (() => void) | null = null

  // 实际渲染的组件列表（hasOpen 为 false 的组件不渲染，用于强制刷新场景）
  const renderComponentsArr = computed(() => state.hasOpenComponentsArr.filter((item) => item.hasOpen))

  const init = () => {
    const routes = options.routes.find((r) => r.path === '/admin') as ExtendedRouteRecordRaw
    const adminRouters = routes.children || []

    const iframeArr = adminRouters.filter((item: ExtendedRouteRecordRaw) => item.iframeComponent)

    iframeArr.forEach((item: ExtendedRouteRecordRaw) => {
      const { name: routerName, path } = item
      const name = routerName || path?.replace('/', '')
      const meta = item?.meta || {}

      if (path) iframePaths.push(`${path}`)

      // 所有 iframe 路由均登记到注册表，关闭 tab 后再次激活路由时可重新加载组件
      lazyIframeRoutes.push({
        name: name as string,
        path: `${item.path}`,
        keepAlive: meta.keepAlive === true,
        iframeComponent: item.iframeComponent as RawRouteComponent,
      })

      if (meta.preload === true) {
        // 预加载：立即注册全局组件并登记，自动保持存活
        app.component(name as Any, item.iframeComponent as Any)
        const isDirectEnter = currentRoute.value.path === item.path
        state.hasOpenComponentsArr.push({
          name: name as string,
          path: `${item.path}`,
          // 直达该路由时立即挂载；其余延迟到首屏就绪+空闲再挂（schedulePreloadMount），
          // 避免子应用整包下载/JS 执行抢占主应用首屏关键路径造成卡顿
          hasOpen: isDirectEnter,
          keepAlive: meta.keepAlive === true,
          closed: false,
          isShow: false,
          component: item.iframeComponent as RawRouteComponent,
        })
        if (!isDirectEnter) pendingPreloadPaths.push(`${item.path}`)
      }
    })

    // 预加载项收集完成，调度延迟挂载
    schedulePreloadMount()
  }

  /**
   * 预加载延迟挂载（优化首屏卡顿）：
   * iframe 与主应用同源共享渲染进程，v-show/display:none 不会阻止其加载，
   * 预加载项若在布局挂载瞬间渲染，子应用整包下载 + JS 执行会与主应用首屏
   * 关键路径（菜单/首页接口、渲染）抢占网络与主线程，造成首屏卡顿。
   * 故等主应用首屏资源就绪（window load）且主线程空闲后再挂载：
   * requestIdleCallback（timeout 5s 兜底），不支持的环境降级 setTimeout。
   * 用户提前进入对应路由时 reopenIframePage 会先行置 hasOpen，此处跳过即可。
   */
  const mountPendingPreloads = () => {
    preloadIdleId = null
    preloadTimerId = null
    pendingPreloadPaths.forEach((path) => {
      // find 经 reactive 数组读取返回代理，置 hasOpen 才能触发 renderComponentsArr 更新
      const target = state.hasOpenComponentsArr.find((item) => item.path === path)
      if (target && !target.hasOpen) {
        target.hasOpen = true
      }
    })
    pendingPreloadPaths.length = 0
  }

  // 取消未触发的预加载调度（布局卸载场景）
  const cancelPendingPreloads = () => {
    if (preloadIdleId !== null && typeof cancelIdleCallback === 'function') {
      cancelIdleCallback(preloadIdleId)
    }
    preloadIdleId = null
    if (preloadTimerId !== null) {
      clearTimeout(preloadTimerId)
    }
    preloadTimerId = null
    removeLoadListener?.()
    removeLoadListener = null
    pendingPreloadPaths.length = 0
  }

  const schedulePreloadMount = () => {
    if (!pendingPreloadPaths.length) return
    const startIdle = () => {
      if (typeof requestIdleCallback === 'function') {
        preloadIdleId = requestIdleCallback(mountPendingPreloads, { timeout: 5000 })
      } else {
        preloadTimerId = window.setTimeout(mountPendingPreloads, 3000)
      }
    }
    if (document.readyState === 'complete') {
      startIdle()
    } else {
      const onLoad = () => startIdle()
      window.addEventListener('load', onLoad, { once: true })
      removeLoadListener = () => window.removeEventListener('load', onLoad)
    }
  }

  // 加载懒加载 iframe 组件
  const loadLazyIframe = (route: RouteLocationNormalizedLoaded) => {
    const routePath = route.path
    const matchedRoute = lazyIframeRoutes.find(
      (item) => item.path === routePath || route.matched.some((r) => r.path === item.path)
    )
    if (!matchedRoute) return

    const { name } = matchedRoute

    // 避免重复加载
    const alreadyLoaded = state.hasOpenComponentsArr.some((item) => item.path === routePath)
    if (!alreadyLoaded) {
      app.component(name, matchedRoute.iframeComponent)
      state.hasOpenComponentsArr.push({
        name,
        // 动态路由（如 /admin/iframe/:url）存实际路径，保证 admin 渲染时 v-show 匹配
        path: routePath,
        hasOpen: true,
        keepAlive: matchedRoute.keepAlive,
        closed: false,
        isShow: false,
        component: matchedRoute.iframeComponent,
      })
    }
  }

  /**
   * 当前路由对应的 iframe 组件是否已打开
   * （对齐老项目 tabUtils.hasPathTabOpen 语义：子应用据此判断是否首次打开）
   */
  const checkHasPathTabOpen = (path: string) => {
    return state.hasOpenComponentsArr.some((item) => item.path === path && item.hasOpen && !item.closed)
  }

  // 路由激活时重置 hasOpen / closed（对齐老项目 admin.vue isOpenIframePage，配合 SWITCH_IFRAME_ROUTER_REFRESH 刷新链路）
  const reopenIframePage = (path: string) => {
    const target = state.hasOpenComponentsArr.find((item) => item.path === path)
    if (!target) return
    // keepAlive 组件关闭 tab 后仅隐藏，重新激活路由即恢复显示
    target.closed = false
    if (!target.hasOpen) {
      target.hasOpen = true
    }
  }

  // 关闭指定 iframe 组件：普通组件从渲染列表移除（销毁）；
  // keepAlive 组件仅标记 closed（组件保留挂载，由 admin 渲染处 v-show 隐藏，display:none）
  const closeIframe = (path: string) => {
    const index = state.hasOpenComponentsArr.findIndex((item) => item.path === path)
    if (index > -1) {
      const item = state.hasOpenComponentsArr[index]
      if (item.keepAlive) {
        item.closed = true
      } else {
        state.hasOpenComponentsArr.splice(index, 1)
      }
    }
  }

  /**
   * 强制刷新指定 iframe 页签：置为未打开，下次路由激活时重新渲染组件（重建 iframe）
   * （对齐老项目 admin.vue hasOpenComponentClose，消费 EE 事件 SWITCH_IFRAME_ROUTER_REFRESH）
   */
  const onSwitchIframeRouterRefresh = (tab: { name?: string }) => {
    if (!tab?.name) return
    const comp = state.hasOpenComponentsArr.find((c) => c.name === tab.name)
    if (comp) {
      comp.hasOpen = false
    }
  }

  /** 跳转方是否要求强制刷新该 iframe 子应用页(老基座 query.microForceUpdate=10 协议) */
  const isForceUpdateRoute = (route: RouteLocationNormalizedLoaded) => route.query.microForceUpdate === '10'

  /**
   * 强制重建指定 iframe 页(老基座 microForceUpdate=10 语义)：
   * 先置未打开(渲染列表移除 → 组件卸载), 下一轮渲染再置回(新建 iframe → 子应用整页重载,
   * 按当前路由 query 重新初始化, 如读 pageTab 定位页签)。
   * 场景: 目标页已打开时, 只改 query 不会让子应用重新挂载, 而子应用只在 mounted 读 query
   */
  const rebuildIframePage = (path: string) => {
    const comp = state.hasOpenComponentsArr.find((c) => c.path === path)
    // 未登记过(首次进入)无需重建, 正常加载即可
    if (!comp) return
    comp.closed = false
    comp.hasOpen = false
    void nextTick(() => {
      comp.hasOpen = true
    })
  }

  // 同步执行初始化，确保子组件（Tabs）挂载前即可获取 iframe 路由信息
  init()

  onBeforeMount(() => {
    // 如果当前路由本身就是懒加载 iframe，立即加载
    loadLazyIframe(currentRoute.value)
    // 监听强制刷新 iframe 页签事件（来源: 运单查询页 order-utils/query.vue）
    EE.on(SWITCH_IFRAME_ROUTER_REFRESH, onSwitchIframeRouterRefresh)
  })

  onUnmounted(() => {
    EE.off(SWITCH_IFRAME_ROUTER_REFRESH, onSwitchIframeRouterRefresh)
    // 清理预加载延迟挂载调度，防止布局卸载（登出）后空闲回调再挂 iframe
    cancelPendingPreloads()
  })

  // 监听路由变化，动态加载懒加载 iframe 组件 + 推送路由变化给 iframe 子应用
  // 对齐老项目 admin.vue watch 整个 $route 对象: query 变化(如重复点击绑码按钮带新 timestamp)也触发,
  // 否则停留在 iframe 页时仅 query 变化不会广播 ROUTER_CHANGE, 子应用收不到路由更新
  watch(
    () => currentRoute.value,
    () => {
      loadLazyIframe(currentRoute.value)
      reopenIframePage(currentRoute.value.path)
      // microForceUpdate=10: 跳转方要求强制刷新该 iframe 子应用页(老基座协议)。
      // 先置未打开(对齐老基座 hasOpenComponentClose, 同时让下方广播的 hasPathTabOpen 为 false),
      // 下一轮渲染再置回, 组件卸载重建 → 子应用整页重载并按 query(如 pageTab)重新初始化
      if (isForceUpdateRoute(currentRoute.value)) {
        rebuildIframePage(currentRoute.value.path)
      }
      try {
        // 路由变化广播(对齐老项目 admin.vue watch $route)，iframeBridge 监听后通过
        // ON_ROUTE_CHANGE 回调推送 {path, fullPath, params, query, name, hasPathTabOpen} 给子应用
        EE.emit(ROUTER_CHANGE, {
          ...currentRoute.value,
          hasPathTabOpen: checkHasPathTabOpen(currentRoute.value.path),
        })
      } catch (e) {
        console.log(e, ':>> ROUTER_CHANGE emit error')
      }
    }
  )

  return {
    ...toRefs(state),
    renderComponentsArr,
    closeIframe,
    iframePaths,
  }
}
