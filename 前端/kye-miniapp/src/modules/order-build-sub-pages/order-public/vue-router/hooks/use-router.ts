import Taro from '@tarojs/taro'
import { replaceRoute } from './use-router-map'

type RouteLocation = {
  path: string
  query?: Record<string, any>
}

const subPackagesPath = [
  '/pages/print/index',
  '/pages/print/teplatepng/index',
  '/pages/print/print-preview/index',
  '/pages/print-records/index',
  '/pages/order-service-introduction/index',
  '/pages/empty/index',
  '/pages/order-success/index',
  '/order-public/components/business/map-position/page/index',
  '/order-public/components/business/product-info/components/select-size/index',
  '/order-public/components/business/product-info/components/add-my-size/index',
  // 取货/派货资料页挪到子包
  '/order-public/components/business/pickup-information/page/index',
  '/order-public/components/business/pickup-information/page-waybill/index',
  '/order-public/components/business/dispatch-information/page/index',
]

class TaroVueRouter {
  // 路由历史栈
  private historyStack: string[] = []

  // beforeRouteLeave 钩子
  private beforeLeaveGuard: ((from: RouteLocation, to: RouteLocation) => boolean) | null = null

  get currentHistory() {
    return [...this.historyStack]
  }

  // 注册 beforeRouteLeave 钩子
  beforeEach(guard: (from: RouteLocation, to: RouteLocation) => boolean) {
    this.beforeLeaveGuard = guard
  }

  push(path: string | Record<string, any>, query: Record<string, any> = {}) {
    const toPath = this.resolvePath(path, query)
    const fromPath = this.currentRoute()

    if (!this.canNavigate(fromPath, toPath)) return

    const fullUrl = this.processAndPush(toPath)
    Taro.navigateTo({ url: fullUrl })
  }

  replace(path: string, query: Record<string, any> = {}) {
    const toPath = this.resolvePath(path, query)
    const fromPath = this.currentRoute()

    if (!this.canNavigate(fromPath, toPath)) return

    const fullUrl = this.processAndReplace(toPath)
    Taro.redirectTo({ url: fullUrl })
  }

  back(delta = 1) {
    // if (delta <= 0 || this.historyStack.length <= delta) return

    // const fromPath = this.currentRoute()
    // const toPath = this.historyStack[this.historyStack.length - delta - 1]

    // if (!this.canNavigate(fromPath, toPath)) return
    // debugger
    // this.historyStack.splice(-delta, delta)
    Taro.navigateBack({ delta })
  }

  reLaunch(path: string, query: Record<string, any> = {}) {
    const toPath = this.resolvePath(path, query)
    const fromPath = this.currentRoute()

    if (!this.canNavigate(fromPath, toPath)) return

    this.clearHistory()
    const fullUrl = this.buildFullPath(toPath.path, toPath.query)
    Taro.reLaunch({ url: fullUrl })
  }

  switchTab(path: string) {
    const toPath = this.resolvePath(path)
    const fromPath = this.currentRoute()

    if (!this.canNavigate(fromPath, toPath)) return

    Taro.switchTab({ url: this.buildFullPath(toPath.path, toPath.query) })
  }

  // 解析路径和查询参数为统一格式
  private resolvePath(path: string | Record<string, any>, query: Record<string, any> = {}): RouteLocation {
    let curPath = path
    let curQuery = query
    if (typeof path === 'object' && (path.path || path.query)) {
      curPath = path?.path || `${path?.name ? `/${path?.name}` : ''}`
      curQuery = path?.query || {}
    }

    const ualStr = replaceRoute(curPath as string)
    return {
      path: ualStr,
      query: curQuery,
    }
  }

  // 构建完整 URL
  private buildFullPath(path: string, query: Record<string, any>): string {
    const url = this.buildUrl(path, query)
    let urlPrefix = ''
    if (subPackagesPath.includes(path)) {
      urlPrefix = '/modules/order-build-sub-pages'
    } else if (!urlPrefix && Taro.getApp().config?.pages.includes('layout/pages/home/index')) {
      urlPrefix = '/modules/order-build'
    }
    return `${urlPrefix}${url}`
  }

  // push 操作：添加到栈顶
  private processAndPush(route: RouteLocation) {
    const fullUrl = this.buildFullPath(route.path, route.query)
    this.historyStack.push(fullUrl)
    return fullUrl
  }

  // replace 操作：替换栈顶路径
  private processAndReplace(route: RouteLocation) {
    const fullUrl = this.buildFullPath(route.path, route.query)
    if (this.historyStack.length > 0) {
      this.historyStack.splice(-1, 1, fullUrl)
    } else {
      this.historyStack.push(fullUrl)
    }
    return fullUrl
  }

  // 获取当前路由
  private currentRoute(): RouteLocation {
    const lastPath = this.historyStack.length > 0 ? this.historyStack[this.historyStack.length - 1] : ''
    try {
      const [pathPart, queryPart] = lastPath.split('?')
      const query: Record<string, any> = {}

      if (queryPart) {
        for (const pair of queryPart.split('&')) {
          const [k, v] = pair.split('=')
          query[k] = decodeURIComponent(v || '')
        }
      }

      return { path: pathPart, query }
    } catch {
      return { path: lastPath }
    }
  }

  // 清空路由栈
  private clearHistory() {
    this.historyStack = []
  }

  // 跳转前判断是否允许导航
  private canNavigate(from: RouteLocation, to: RouteLocation): boolean {
    if (this.beforeLeaveGuard) {
      return this.beforeLeaveGuard(from, to)
    }
    return true
  }

  // 原 buildUrl 方法保持不变
  private buildUrl(path: string, query: Record<string, any>): string {
    let url = path
    const queryString =
      query &&
      Object.entries(query)
        .filter(([_, v]) => v !== undefined && v !== null)
        .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
        .join('&')

    if (queryString) {
      url += `?${queryString}`
    }

    return url
  }
}

const router = new TaroVueRouter()

export function useRouter(): TaroVueRouter {
  return router
}
