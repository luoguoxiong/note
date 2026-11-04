import type { RouteLocationRaw } from 'vue-router'
import { router } from '@/main'

export const locationRouter = (url: string) => {
  location.href = url
}

/**
 * Vue Router 跳转类型
 */
enum RouterActionType {
  PUSH = 'push',
  REPLACE = 'replace',
  BACK = 'back',
}

/**
 * Vue Router 参数
 */
interface VueRouterOptions {
  type: RouterActionType
  location?: RouteLocationRaw
  delta?: number
}

export const vueRouter = (data?: VueRouterOptions) => {
  if (!data) return

  const { type, location, delta = 1 } = data

  switch (type) {
    case RouterActionType.PUSH:
      if (!location) return
      router.push(location)
      break

    case RouterActionType.REPLACE:
      if (!location) return
      router.replace(location)
      break

    case RouterActionType.BACK:
      router.go(-delta)
      break

    default:
      console.warn(`[router] unsupported action: ${type}`)
  }
}
