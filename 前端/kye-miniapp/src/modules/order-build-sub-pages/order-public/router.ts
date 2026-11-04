// src/router/index.ts
import Taro from '@tarojs/taro'

type RouteGuard = (to: string, from: string, next: () => void) => void
type AfterHook = (to: string, from: string) => void

class TaroRouter {
  private historyStack: string[] = []
  private beforeEachGuard: RouteGuard | null = null
  private afterEachHook: AfterHook | null = null
  // TODO 这里先不报错吧,后续看下怎么接
  currentRoute = {
    value: {
      name: '',
      query: {},
      meta: {},
      path: '',
    },
  }

  constructor() {
    // 初始化时加入当前页面
    const pages = Taro.getCurrentPages()
    if (pages.length > 0) {
      const initialRoute = `/${pages[pages.length - 1].route}`
      this.historyStack.push(initialRoute)
    }
  }

  private get currentPage(): string {
    return this.historyStack[this.historyStack.length - 1] || ''
  }

  private updateHistory(newPath: string): void {
    this.historyStack.push(newPath)
  }

  public push(path: string, query?: Record<string, any>): void {
    const url = this.buildUrl(path, query)

    const to = url
    const from = this.currentPage

    if (this.beforeEachGuard) {
      this.beforeEachGuard(to, from, () => {
        Taro.navigateTo({
          url,
          success: () => {
            this.updateHistory(path)
            if (this.afterEachHook) {
              this.afterEachHook(to, from)
            }
          },
        })
      })
    } else {
      Taro.navigateTo({
        url,
        success: () => {
          this.updateHistory(path)
          if (this.afterEachHook) {
            this.afterEachHook(to, from)
          }
        },
      })
    }
  }

  public replace(path: string, query?: Record<string, any>): void {
    const url = this.buildUrl(path, query)

    const to = url
    const from = this.currentPage

    if (this.beforeEachGuard) {
      this.beforeEachGuard(to, from, () => {
        Taro.redirectTo({
          url,
          success: () => {
            this.historyStack.pop()
            this.updateHistory(path)
            if (this.afterEachHook) {
              this.afterEachHook(to, from)
            }
          },
        })
      })
    } else {
      Taro.redirectTo({
        url,
        success: () => {
          this.historyStack.pop()
          this.updateHistory(path)
          if (this.afterEachHook) {
            this.afterEachHook(to, from)
          }
        },
      })
    }
  }

  public back(delta = 1): void {
    const from = this.currentPage
    Taro.navigateBack({
      delta,
      success: () => {
        for (let i = 0; i < delta; i++) {
          this.historyStack.pop()
        }
        const to = this.currentPage
        if (this.afterEachHook) {
          this.afterEachHook(to, from)
        }
      },
    })
  }

  public go(step: number): void {
    const currentIndex = this.historyStack.length - 1
    const targetIndex = currentIndex + step
    if (targetIndex >= 0 && targetIndex < this.historyStack.length) {
      const delta = currentIndex - targetIndex
      this.back(delta)
    } else {
      console.warn('超出历史栈范围')
    }
  }

  public beforeEach(guard: RouteGuard): void {
    this.beforeEachGuard = guard
  }

  public afterEach(hook: AfterHook): void {
    this.afterEachHook = hook
  }

  private buildUrl(path: string, query?: Record<string, any>): string {
    let url = path
    if (query) {
      const queryString =
        query &&
        Object.entries(query)
          .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
          .join('&')
      url += `?${queryString}`
    }
    return url
  }
}

const router = new TaroRouter()

export default router
